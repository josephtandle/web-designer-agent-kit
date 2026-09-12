#!/usr/bin/env node

import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { assertNoSymlinkPath } from './lib/safe-paths.mjs'

const MAX_FILES = 5000
const MAX_HTML_FILES = 500
const MAX_HTML_BYTES = 2 * 1024 * 1024
const MAX_TREE_BYTES = 50 * 1024 * 1024
const RAW_TEXT = new Set(['script', 'style', 'textarea'])
const EXTERNAL_SCHEMES = /^(?:https?:|mailto:|tel:|sms:|data:|blob:|javascript:)/i
const LOCAL_ORIGIN = 'https://local-launch-check.invalid'
const scriptDirectory = dirname(fileURLToPath(import.meta.url))

function fail(message) { console.error(`Error: ${message}`); process.exit(2) }

function usage() {
  console.log(`Usage: node scripts/launch-check.mjs --dir=SITE [--json]

Read-only local launch inspection. The command does not follow symlinks or make network requests.`)
}

function parseArgs(args) {
  const options = { dir: null, json: false, help: false }
  const seen = new Set()
  for (const argument of args) {
    let key
    let value
    if (argument === '--help' || argument === '-h') key = 'help'
    else if (argument === '--json') key = 'json'
    else if (argument.startsWith('--dir=')) { key = 'dir'; value = argument.slice(6) }
    else fail(`unknown option or positional argument '${argument}'`)
    if (seen.has(key)) fail(`option '--${key}' may be supplied only once`)
    seen.add(key)
    if (key === 'dir' && !value) fail('--dir requires a value')
    options[key] = value ?? true
  }
  if (options.help) {
    if (args.length !== 1) fail('--help cannot be combined with other options')
    return options
  }
  if (!options.dir) fail('--dir=SITE is required')
  return options
}

function findTagEnd(html, start) {
  let quote = null
  for (let index = start + 1; index < html.length; index++) {
    const character = html[index]
    if (quote) { if (character === quote) quote = null }
    else if (character === '"' || character === "'") quote = character
    else if (character === '>') return index
  }
  return -1
}

function decodeEntities(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"', nbsp: ' ' }
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi, (source, decimal, hexadecimal, name) => {
    if (name) return named[name.toLowerCase()] ?? source
    const point = Number.parseInt(decimal ?? hexadecimal, decimal ? 10 : 16)
    return Number.isInteger(point) && point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point) : '\ufffd'
  })
}

function parseAttributes(source) {
  const attributes = new Map()
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
      value = decodeEntities(source.slice(valueStart, index))
      if (quote && source[index] === quote) index++
    }
    if (!attributes.has(name)) attributes.set(name, value)
  }
  return attributes
}

function tokenize(html) {
  const tokens = []
  let index = 0
  let line = 1
  let templateDepth = 0
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
      const value = html.slice(index, end)
      tokens.push({ type: 'text', value, line, inert: templateDepth > 0 })
      advance(end)
      continue
    }
    const end = findTagEnd(html, index)
    if (end < 0) { advance(html.length); continue }
    const startLine = line
    const inside = html.slice(index + 1, end).trim()
    const match = inside.match(/^(\/)?\s*([a-z][\w:-]*)\b([\s\S]*)$/i)
    advance(end + 1)
    if (!match) continue
    const closing = Boolean(match[1])
    const name = match[2].toLowerCase()
    const inert = templateDepth > 0 || name === 'template'
    tokens.push({ type: 'tag', name, closing, attributes: parseAttributes(match[3]), line: startLine, inert })
    if (name === 'template') templateDepth = closing ? Math.max(0, templateDepth - 1) : templateDepth + 1
    if (!closing && RAW_TEXT.has(name)) {
      const closePattern = new RegExp(`<\\/\\s*${name}\\s*>`, 'ig')
      closePattern.lastIndex = index
      const closingMatch = closePattern.exec(html)
      advance(closingMatch ? closePattern.lastIndex : html.length)
    }
  }
  return tokens
}

function elementTexts(tokens, name) {
  const values = []
  let current = null
  for (const token of tokens) {
    if (token.inert) continue
    if (token.type === 'tag' && token.name === name) {
      if (!token.closing && current === null) current = ''
      else if (token.closing && current !== null) { values.push(decodeEntities(current).replace(/\s+/g, ' ').trim()); current = null }
    } else if (token.type === 'text' && current !== null) current += token.value
  }
  return values
}

function collectTree(root) {
  const files = []
  const symlinks = []
  let bytes = 0
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = resolve(directory, entry.name)
      if (entry.isSymbolicLink()) { symlinks.push(relative(root, target)); continue }
      if (entry.isDirectory()) visit(target)
      else if (entry.isFile()) {
        const size = lstatSync(target).size
        bytes += size
        files.push({ path: target, size })
        if (files.length > MAX_FILES) throw new Error(`tree exceeds ${MAX_FILES} files`)
        if (bytes > MAX_TREE_BYTES) throw new Error(`tree exceeds ${MAX_TREE_BYTES} bytes`)
      }
    }
  }
  visit(root)
  return { files, symlinks }
}

function safeDecode(value) {
  try { return decodeURIComponent(value) } catch { return null }
}

function srcsetValues(value) {
  const candidates = []
  let index = 0
  while (index < value.length) {
    while (/[\s,]/.test(value[index] ?? '')) index++
    const start = index
    if (value.slice(index).toLowerCase().startsWith('data:')) while (index < value.length && !/\s/.test(value[index])) index++
    else while (index < value.length && !/[\s,]/.test(value[index])) index++
    if (index > start) candidates.push(value.slice(start, index))
    while (index < value.length && value[index] !== ',') index++
    if (value[index] === ',') index++
  }
  return candidates
}

function inspectPage(file, html, root) {
  const tokens = tokenize(html)
  const tags = tokens.filter((token) => token.type === 'tag' && !token.closing && !token.inert)
  const documentPath = relative(root, file).split(sep).map(encodeURIComponent).join('/')
  const documentUrl = new URL(`/${documentPath}`, LOCAL_ORIGIN)
  let baseUrl = documentUrl
  let externalBase = null
  for (const tag of tags) {
    if (tag.name !== 'base' || !tag.attributes.has('href')) continue
    const value = tag.attributes.get('href') ?? ''
    try {
      baseUrl = new URL(value, documentUrl)
      externalBase = baseUrl.origin === LOCAL_ORIGIN && ['http:', 'https:'].includes(baseUrl.protocol) ? null : value
      break
    } catch {}
  }
  const ids = new Set()
  const references = []
  for (const tag of tags) {
    const id = tag.attributes.get('id')
    if (id) ids.add(id)
    if (tag.name === 'a' && tag.attributes.get('name')) ids.add(tag.attributes.get('name'))
    for (const attribute of ['href', 'src']) {
      const value = tag.attributes.get(attribute)
      if (tag.name === 'base' && attribute === 'href') continue
      if (value !== null && value !== undefined && value.trim()) references.push({ tag: tag.name, attribute, value: value.trim(), line: tag.line })
    }
    const srcset = tag.attributes.get('srcset')
    if (srcset) for (const value of srcsetValues(srcset)) references.push({ tag: tag.name, attribute: 'srcset', value, line: tag.line })
  }
  const descriptions = tags
    .filter((tag) => tag.name === 'meta' && (tag.attributes.get('name') ?? '').toLowerCase() === 'description')
    .map((tag) => (tag.attributes.get('content') ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  return { file, relative: relative(root, file), ids, references, titles: elementTexts(tokens, 'title').filter(Boolean), descriptions, baseUrl, externalBase }
}

function resolveReference(reference, source, root, knownFiles) {
  const raw = reference.value
  if (raw.startsWith('//') || EXTERNAL_SCHEMES.test(raw)) return { external: true }
  let resolvedUrl
  try { resolvedUrl = new URL(raw, source.baseUrl) } catch { return { broken: 'invalid URL' } }
  if (resolvedUrl.origin !== LOCAL_ORIGIN || !['http:', 'https:'].includes(resolvedUrl.protocol)) return { external: true }
  const decodedPath = safeDecode(resolvedUrl.pathname)
  const fragment = resolvedUrl.hash ? safeDecode(resolvedUrl.hash.slice(1)) : null
  if (decodedPath === null || (resolvedUrl.hash && fragment === null)) return { broken: 'malformed percent-encoding' }
  const candidate = resolve(root, decodedPath.replace(/^\/+/, ''))
  const rel = relative(root, candidate)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return { broken: 'reference escapes the inspected tree' }
  const choices = [candidate]
  if (decodedPath.endsWith('/')) choices.unshift(resolve(candidate, 'index.html'))
  else if (!extname(candidate)) choices.push(`${candidate}.html`, resolve(candidate, 'index.html'))
  const target = choices.find((choice) => knownFiles.has(choice))
  if (!target) return { broken: 'target does not exist' }
  return { target, fragment }
}

function runInspector(script, file) {
  const result = spawnSync(process.execPath, [resolve(scriptDirectory, script), `--file=${file}`, '--json'], {
    encoding: 'utf8', timeout: 10_000, maxBuffer: 2 * 1024 * 1024,
  })
  if (result.error) return { error: result.error.message }
  if (result.signal) return { error: `inspector terminated by signal ${result.signal}` }
  if (result.status === null) return { error: 'inspector returned no exit status' }
  try { return { exitCode: result.status, report: JSON.parse(result.stdout) } }
  catch { return { error: (result.stderr || 'inspector returned invalid JSON').trim() } }
}

function isCount(value) { return Number.isSafeInteger(value) && value >= 0 }

function inspectorError(kind, result) {
  if (result.error) return result.error
  if (kind === 'seo') {
    const summary = result.report?.summary
    if (!summary || !['pass', 'warn', 'fail', 'not_checked'].every((key) => isCount(summary[key]))) return 'SEO inspector returned an invalid report'
    const expectedExit = summary.fail ? 1 : 0
    if (result.exitCode !== expectedExit) return `SEO inspector exited ${result.exitCode}; expected ${expectedExit} for its report`
    return null
  }
  if (!isCount(result.report?.findingsCount) || result.report?.advisory !== true) return 'copy inspector returned an invalid report'
  const expectedExit = result.report.findingsCount ? 1 : 0
  return result.exitCode === expectedExit ? null : `copy inspector exited ${result.exitCode}; expected ${expectedExit} for its report`
}

function duplicateFindings(pages, field, label) {
  const groups = new Map()
  for (const page of pages) for (const value of page[field]) {
    const key = value.toLocaleLowerCase()
    if (!groups.has(key)) groups.set(key, { value, pages: [] })
    groups.get(key).pages.push(page.relative)
  }
  return [...groups.values()].filter((group) => group.pages.length > 1).map((group) => ({
    severity: 'warning', code: `duplicate_${field}`, file: group.pages[0],
    message: `Duplicate ${label} across ${group.pages.join(', ')}: "${group.value}"`,
  }))
}

function printHuman(report) {
  console.log(`Launch check: ${report.status}; ${report.files.length} HTML page(s); ${report.findings.length} finding(s).`)
  for (const finding of report.findings) console.log(`[${finding.severity.toUpperCase()}] ${finding.file}${finding.line ? `:${finding.line}` : ''} ${finding.message}`)
  for (const note of report.notChecked) console.log(`[NOT CHECKED] ${note}`)
}

const options = parseArgs(process.argv.slice(2))
if (options.help) { usage(); process.exit(0) }
let root
try { root = assertNoSymlinkPath(resolve(options.dir), 'Site directory') } catch (error) { fail(error.message) }
let rootStat
try { rootStat = lstatSync(root) } catch { fail(`site directory does not exist: ${root}`) }
if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) fail(`site path is not a real directory: ${root}`)

let treeResult
try { treeResult = collectTree(root) } catch (error) { fail(`could not inspect site tree: ${error.message}`) }
const { files: tree, symlinks } = treeResult
const knownFiles = new Set(tree.map((entry) => entry.path))
const htmlFiles = tree.filter((entry) => /\.html?$/i.test(entry.path))
if (!htmlFiles.length) fail(`site contains no .html or .htm files: ${root}`)
if (htmlFiles.length > MAX_HTML_FILES) fail(`site exceeds ${MAX_HTML_FILES} HTML files`)
const oversized = htmlFiles.find((entry) => entry.size > MAX_HTML_BYTES)
if (oversized) fail(`HTML file exceeds ${MAX_HTML_BYTES} bytes: ${oversized.path}`)

const pages = htmlFiles.map(({ path }) => inspectPage(path, readFileSync(path, 'utf8'), root))
const pageByFile = new Map(pages.map((page) => [page.file, page]))
const findings = []
const graph = new Map(pages.map((page) => [page.file, new Set()]))
let externalCount = 0
const externalBasePages = pages.filter((page) => page.externalBase !== null)
for (const page of pages) for (const reference of page.references) {
  const resolution = resolveReference(reference, page, root, knownFiles)
  if (resolution.external) { externalCount++; continue }
  if (resolution.broken) {
    findings.push({ severity: 'error', code: 'broken_reference', file: page.relative, line: reference.line,
      message: `<${reference.tag}> ${reference.attribute}="${reference.value}": ${resolution.broken}.` })
    continue
  }
  const targetPage = pageByFile.get(resolution.target)
  if (reference.tag === 'a' && targetPage) graph.get(page.file).add(targetPage.file)
  if (resolution.fragment && targetPage && !targetPage.ids.has(resolution.fragment)) {
    findings.push({ severity: 'error', code: 'missing_fragment', file: page.relative, line: reference.line,
      message: `<${reference.tag}> ${reference.attribute}="${reference.value}": fragment #${resolution.fragment} is missing in ${targetPage.relative}.` })
  }
}
findings.push(...duplicateFindings(pages, 'titles', 'title'), ...duplicateFindings(pages, 'descriptions', 'meta description'))

const entries = pages.filter((page) => /^index\.html?$/i.test(page.relative))
if (entries.length) {
  const reached = new Set()
  const queue = entries.map((page) => page.file)
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const file = queue[cursor]
    if (reached.has(file)) continue
    reached.add(file)
    queue.push(...graph.get(file))
  }
  for (const page of pages) if (!reached.has(page.file)) findings.push({ severity: 'warning', code: 'unreachable_page', file: page.relative,
    message: 'HTML page is not reachable through local anchor links from the root index page.' })
}

const files = pages.map((page) => {
  const seo = runInspector('seo-check.mjs', page.file)
  const copy = runInspector('copy-check.mjs', page.file)
  const seoError = inspectorError('seo', seo)
  const copyError = inspectorError('copy', copy)
  if (seoError) findings.push({ severity: 'error', code: 'seo_inspector_error', file: page.relative, message: seoError })
  else if (seo.report.summary.fail) findings.push({ severity: 'error', code: 'seo_failed', file: page.relative,
    message: `SEO inspector reported ${seo.report.summary.fail} failed check(s).` })
  if (copyError) findings.push({ severity: 'error', code: 'copy_inspector_error', file: page.relative, message: copyError })
  return { path: page.relative, seo: seoError ? null : seo.report, copy: copyError ? null : copy.report }
})
const broken = findings.some((finding) => finding.severity === 'error')
const status = broken ? 'fail' : findings.length || files.some((file) => file.seo?.summary?.warn || file.seo?.summary?.fail || file.copy?.findingsCount) ? 'warn' : 'pass'
const notChecked = [
  'No network requests were made; deployed HTTP status, redirects, headers, crawler policy, and remote URLs were not checked.',
  'Copy findings and SEO warnings are advisory; factual truth, legal approval, ranking, and visual rendering require human or deployed-environment review.',
]
if (!entries.length) notChecked.push('Reachability was not checked because the tree has no root index.html or index.htm entry page.')
if (externalBasePages.length) notChecked.push(`${externalBasePages.length} page(s) use an external document base; descendant references resolved against that base were not checked locally: ${externalBasePages.map((page) => page.relative).join(', ')}`)
if (externalCount) notChecked.push(`${externalCount} external reference(s) were not fetched.`)
if (symlinks.length) notChecked.push(`${symlinks.length} symbolic link(s) were skipped and not followed: ${symlinks.slice(0, 10).join(', ')}${symlinks.length > 10 ? ', …' : ''}`)
const report = { status, files, findings, notChecked }
if (options.json) console.log(JSON.stringify(report, null, 2)); else printHuman(report)
process.exit(broken ? 1 : 0)
