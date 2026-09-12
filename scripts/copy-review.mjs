#!/usr/bin/env node

import { lstatSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { assertNoSymlinkPath } from './lib/safe-paths.mjs'

const MAX_BYTES = 5 * 1024 * 1024
const MAX_BLOCKS = 2000
const RAW_TEXT = new Set(['script', 'style', 'textarea'])
const BLOCKS = new Set(['address', 'article', 'aside', 'blockquote', 'button', 'dd', 'details', 'dialog', 'div', 'dt', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'label', 'li', 'main', 'nav', 'p', 'pre', 'section', 'summary', 'td', 'th'])
const SUPPRESSED = new Set(['datalist', 'head', 'input', 'option', 'script', 'select', 'style', 'template', 'textarea', 'title'])

function fail(message) { console.error(`Error: ${message}`); process.exit(2) }

function usage() {
  console.log(`Usage: node scripts/copy-review.mjs --before=FILE --after=FILE [--json]

Compare visible prose and flag changes that require human review. No files are modified.`)
}

function parseArgs(args) {
  const options = { before: null, after: null, json: false, help: false }
  const seen = new Set()
  for (const argument of args) {
    let key
    let value
    if (argument === '--help' || argument === '-h') key = 'help'
    else if (argument === '--json') key = 'json'
    else if (argument.startsWith('--before=')) { key = 'before'; value = argument.slice(9) }
    else if (argument.startsWith('--after=')) { key = 'after'; value = argument.slice(8) }
    else fail(`unknown option or positional argument '${argument}'`)
    if (seen.has(key)) fail(`option '--${key}' may be supplied only once`)
    seen.add(key)
    if ((key === 'before' || key === 'after') && !value) fail(`--${key} requires a value`)
    options[key] = value ?? true
  }
  if (options.help) {
    if (args.length !== 1) fail('--help cannot be combined with other options')
    return options
  }
  if (!options.before || !options.after) fail('--before=FILE and --after=FILE are required')
  return options
}

function checkedFile(value, label) {
  let file
  try { file = assertNoSymlinkPath(resolve(value), label) } catch (error) { fail(error.message) }
  let stat
  try { stat = lstatSync(file) } catch { fail(`${label} does not exist: ${file}`) }
  if (!stat.isFile() || stat.isSymbolicLink()) fail(`${label} is not a regular non-symbolic file: ${file}`)
  if (stat.size > MAX_BYTES) fail(`${label} exceeds ${MAX_BYTES} bytes: ${file}`)
  return file
}

function tagEnd(html, start) {
  let quote = null
  for (let index = start + 1; index < html.length; index++) {
    const character = html[index]
    if (quote) { if (character === quote) quote = null }
    else if (character === '"' || character === "'") quote = character
    else if (character === '>') return index
  }
  return -1
}

function attributes(source) {
  const result = new Map()
  let index = 0
  while (index < source.length) {
    while (/[\s/]/.test(source[index] ?? '')) index++
    const start = index
    while (index < source.length && !/[\s=/>]/.test(source[index])) index++
    const name = source.slice(start, index).toLowerCase()
    if (!name) { index++; continue }
    while (/\s/.test(source[index] ?? '')) index++
    let value = null
    if (source[index] === '=') {
      index++
      while (/\s/.test(source[index] ?? '')) index++
      const quote = source[index] === '"' || source[index] === "'" ? source[index++] : null
      const valueStart = index
      if (quote) while (index < source.length && source[index] !== quote) index++
      else while (index < source.length && !/[\s>]/.test(source[index])) index++
      value = source.slice(valueStart, index)
      if (quote && source[index] === quote) index++
    }
    if (!result.has(name)) result.set(name, value)
  }
  return result
}

function decode(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"', nbsp: ' ', mdash: '—', ndash: '–' }
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi, (source, decimal, hexadecimal, name) => {
    if (name) return named[name.toLowerCase()] ?? source
    const point = Number.parseInt(decimal ?? hexadecimal, decimal ? 10 : 16)
    return Number.isInteger(point) && point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point) : '\ufffd'
  })
}

function normalize(value) { return decode(value).replace(/\s+/g, ' ').trim() }

function htmlBlocks(html) {
  const blocks = []
  const stack = []
  let buffer = ''
  let blockLine = 1
  let index = 0
  let line = 1
  const suppressed = () => stack.some((entry) => entry.suppressed)
  const flush = () => {
    const text = normalize(buffer)
    if (text) blocks.push({ line: blockLine, text })
    buffer = ''
  }
  const advance = (end) => { line += (html.slice(index, end).match(/\n/g) ?? []).length; index = end }
  while (index < html.length) {
    if (html.startsWith('<!--', index)) {
      const close = html.indexOf('-->', index + 4)
      advance(close < 0 ? html.length : close + 3)
      continue
    }
    if (html[index] !== '<') {
      const next = html.indexOf('<', index)
      const end = next < 0 ? html.length : next
      if (!suppressed()) {
        if (!buffer) blockLine = line
        buffer += html.slice(index, end)
      }
      advance(end)
      continue
    }
    const end = tagEnd(html, index)
    if (end < 0) { advance(html.length); continue }
    const source = html.slice(index + 1, end).trim()
    const match = source.match(/^(\/)?\s*([a-z][\w:-]*)\b([\s\S]*)$/i)
    advance(end + 1)
    if (!match) continue
    const closing = Boolean(match[1])
    const name = match[2].toLowerCase()
    if (closing) {
      if (BLOCKS.has(name) && !suppressed()) flush()
      const position = stack.map((entry) => entry.name).lastIndexOf(name)
      if (position >= 0) stack.splice(position)
      continue
    }
    const attrs = attributes(match[3])
    const style = (attrs.get('style') ?? '').replace(/\s+/g, '').toLowerCase()
    const hide = SUPPRESSED.has(name) || attrs.has('hidden') || attrs.has('inert') || (attrs.get('aria-hidden') ?? '').toLowerCase() === 'true' || /(?:^|;)display:none(?:;|$)/.test(style)
    if (BLOCKS.has(name) && !suppressed()) flush()
    if ((name === 'br' || name === 'hr') && !suppressed()) buffer += ' '
    stack.push({ name, suppressed: hide })
    if (RAW_TEXT.has(name)) {
      const closePattern = new RegExp(`<\\/\\s*${name}\\s*>`, 'ig')
      closePattern.lastIndex = index
      const close = closePattern.exec(html)
      advance(close ? closePattern.lastIndex : html.length)
      stack.pop()
    }
    if (/^(?:area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/.test(name) || /\/\s*$/.test(match[3])) stack.pop()
  }
  flush()
  return blocks
}

function plainBlocks(text) {
  const blocks = []
  let buffer = []
  let start = 1
  const flush = () => { const value = normalize(buffer.join(' ')); if (value) blocks.push({ line: start, text: value }); buffer = [] }
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) flush()
    else { if (!buffer.length) start = index + 1; buffer.push(line) }
  })
  flush()
  return blocks
}

function visibleBlocks(file) {
  const raw = readFileSync(file, 'utf8')
  return /\.html?$/i.test(file) ? htmlBlocks(raw) : plainBlocks(raw)
}

function changedBlocks(before, after) {
  const rows = before.length + 1
  const columns = after.length + 1
  const lcs = Array.from({ length: rows }, () => new Uint32Array(columns))
  for (let left = before.length - 1; left >= 0; left--) for (let right = after.length - 1; right >= 0; right--) {
    lcs[left][right] = before[left].text === after[right].text ? lcs[left + 1][right + 1] + 1 : Math.max(lcs[left + 1][right], lcs[left][right + 1])
  }
  const changes = []
  let left = 0
  let right = 0
  const removed = []
  const added = []
  const flush = () => {
    const count = Math.max(removed.length, added.length)
    for (let index = 0; index < count; index++) {
      const oldBlock = removed[index] ?? null
      const newBlock = added[index] ?? null
      changes.push({ type: oldBlock && newBlock ? 'changed' : oldBlock ? 'removed' : 'added', before: oldBlock, after: newBlock })
    }
    removed.length = 0; added.length = 0
  }
  while (left < before.length || right < after.length) {
    if (left < before.length && right < after.length && before[left].text === after[right].text) { flush(); left++; right++ }
    else if (right < after.length && (left === before.length || lcs[left][right + 1] >= lcs[left + 1][right])) added.push(after[right++])
    else removed.push(before[left++])
  }
  flush()
  return changes
}

function factTokens(text) {
  const definitions = [
    ['url', /\bhttps?:\/\/[^\s<>"']+/gi],
    ['price', /(?:[$€£¥]\s?\d[\d,.]*(?:\.\d+)?|\b\d[\d,.]*(?:\.\d+)?\s?(?:USD|EUR|GBP|AUD|CAD|SGD)\b)/gi],
    ['date', /\b(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)\b/gi],
    ['quotation', /[“”]([^“”]+)[“”]|"([^"\n]+)"|[‘’]([^‘’]+)[‘’]|'([^'\n]+)'/g],
    ['qualifier', /\b(?:approximately|about|around|estimated|generally|typically|usually|may|might|can|could|up to|at least|at most|from|starting at|subject to)\b/gi],
    ['number', /\b\d+(?:[,.]\d+)*(?:%|x)?\b/gi],
  ]
  const tokens = []
  for (const [kind, pattern] of definitions) for (const match of text.matchAll(pattern)) tokens.push({ kind, value: match[0], key: normalize(match[0]).toLocaleLowerCase() })
  return tokens
}

function removedFacts(beforeText, afterText) {
  const remaining = new Map()
  for (const token of factTokens(afterText)) remaining.set(`${token.kind}:${token.key}`, (remaining.get(`${token.kind}:${token.key}`) ?? 0) + 1)
  return factTokens(beforeText).filter((token) => {
    const key = `${token.kind}:${token.key}`
    const count = remaining.get(key) ?? 0
    if (!count) return true
    remaining.set(key, count - 1)
    return false
  }).map(({ kind, value }) => ({ kind, value }))
}

function printHuman(report) {
  console.log(`Copy review: ${report.status}; ${report.changedBlocks.length} changed block(s), ${report.removedFactTokens.length} removed fact-sensitive token(s).`)
  for (const change of report.changedBlocks) console.log(`[${change.type.toUpperCase()}] before:${change.before?.line ?? '-'} after:${change.after?.line ?? '-'}`)
  for (const token of report.removedFactTokens) console.log(`[REVIEW ${token.kind.toUpperCase()}] removed: ${token.value}`)
  console.log(report.advisory)
}

const options = parseArgs(process.argv.slice(2))
if (options.help) { usage(); process.exit(0) }
const beforeFile = checkedFile(options.before, 'Before file')
const afterFile = checkedFile(options.after, 'After file')
const beforeBlocks = visibleBlocks(beforeFile)
const afterBlocks = visibleBlocks(afterFile)
if (beforeBlocks.length > MAX_BLOCKS || afterBlocks.length > MAX_BLOCKS) fail(`visible prose exceeds the ${MAX_BLOCKS}-block comparison limit`)
const changes = changedBlocks(beforeBlocks, afterBlocks)
const removedFactTokens = removedFacts(beforeBlocks.map((block) => block.text).join('\n'), afterBlocks.map((block) => block.text).join('\n'))
const reviewRequired = changes.length > 0
const report = {
  status: reviewRequired ? 'review_required' : 'no_visible_change_detected',
  before: beforeFile,
  after: afterFile,
  changedBlocks: changes,
  removedFactTokens,
  advisory: reviewRequired
    ? 'Advisory only: a human must review the changed prose and verify every factual claim.'
    : 'No visible prose change was detected. This does not establish factual or semantic equivalence.',
}
if (options.json) console.log(JSON.stringify(report, null, 2)); else printHuman(report)
process.exit(reviewRequired ? 1 : 0)
