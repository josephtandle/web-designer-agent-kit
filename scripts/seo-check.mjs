#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { regular } from './lib/safe-paths.mjs'

const STATUSES = ['pass', 'warn', 'fail', 'not_checked']

function usage() {
  console.log(`Masterminds Web Designer : Local SEO/GEO Inspector

Usage:
  node scripts/seo-check.mjs --file=<HTML> [--url=<verifiedPublicURL>] [--json]
  node scripts/seo-check.mjs --help

Options:
  --file=<HTML>                Local .html or .htm file to inspect
  --url=<verifiedPublicURL>    Credential-free public http(s) URL for canonical comparison
  --json                       Print the report as JSON
  --help                       Show this help

This command reads one local file. It never fetches URLs or changes files.`)
}

function inputError(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function parseArgs(args) {
  const options = { file: null, url: null, json: false, help: false }
  const seen = new Set()
  for (const arg of args) {
    let key
    let value = null
    if (arg === '--help') key = 'help'
    else if (arg === '--json') key = 'json'
    else if (arg.startsWith('--file=')) { key = 'file'; value = arg.slice(7) }
    else if (arg.startsWith('--url=')) { key = 'url'; value = arg.slice(6) }
    else inputError(`unknown option or positional argument '${arg}'`)
    if (seen.has(key)) inputError(`option '--${key}' may be supplied only once`)
    seen.add(key)
    if ((key === 'file' || key === 'url') && !value) inputError(`--${key} requires a value`)
    options[key] = value ?? true
  }
  if (options.help) {
    if (args.length !== 1) inputError('--help cannot be combined with other options')
    return options
  }
  if (!options.file) inputError('--file=<HTML> is required')
  return options
}

function parsePublicUrl(value) {
  if (!value) return null
  let parsed
  try { parsed = new URL(value) } catch { inputError(`invalid public URL '${value}'`) }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) inputError('--url must be a credential-free http(s) URL')
  return parsed
}

function findTagEnd(html, start) {
  let quote = null
  for (let index = start + 1; index < html.length; index++) {
    const character = html[index]
    if (quote) {
      if (character === quote) quote = null
    } else if (character === '"' || character === "'") quote = character
    else if (character === '>') return index
  }
  return -1
}

const NAMED_CHARACTER_REFERENCES = new Map([
  ['comma', ','],
  ['amp', '&'],
  ['apos', "'"],
  ['gt', '>'],
  ['lt', '<'],
  ['newline', '\n'],
  ['quot', '"'],
  ['tab', '\t'],
])

function decodeCharacterReferences(value) {
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi, (reference, decimal, hexadecimal, name) => {
    if (name) return NAMED_CHARACTER_REFERENCES.get(name.toLowerCase()) ?? reference
    const codePoint = Number.parseInt(decimal ?? hexadecimal, decimal ? 10 : 16)
    if (!Number.isInteger(codePoint) || codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return '\ufffd'
    return String.fromCodePoint(codePoint)
  })
}

function parseAttributes(source) {
  const attributes = new Map()
  let index = 0
  while (index < source.length) {
    while (/\s|\//.test(source[index] ?? '')) index++
    if (index >= source.length) break
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
      value = decodeCharacterReferences(source.slice(valueStart, index))
      if (quote && source[index] === quote) index++
    }
    if (!attributes.has(name)) attributes.set(name, value)
  }
  return attributes
}

function tokenize(html) {
  const tokens = []
  let index = 0
  let templateDepth = 0
  while (index < html.length) {
    if (html.startsWith('<!--', index)) {
      const end = html.indexOf('-->', index + 4)
      index = end < 0 ? html.length : end + 3
      continue
    }
    if (html[index] !== '<') {
      const next = html.indexOf('<', index)
      const end = next < 0 ? html.length : next
      tokens.push({ type: 'text', value: html.slice(index, end), inert: templateDepth > 0 })
      index = end
      continue
    }
    const end = findTagEnd(html, index)
    if (end < 0) { tokens.push({ type: 'text', value: html.slice(index), inert: templateDepth > 0 }); break }
    const inside = html.slice(index + 1, end).trim()
    const match = inside.match(/^(\/)?\s*([a-z][\w:-]*)\b([\s\S]*)$/i)
    if (!match) { index = end + 1; continue }
    const closing = Boolean(match[1])
    const name = match[2].toLowerCase()
    const inert = templateDepth > 0 || name === 'template'
    const token = { type: 'tag', name, closing, attributes: parseAttributes(match[3]), body: null, inert }
    tokens.push(token)
    index = end + 1
    if (name === 'template') templateDepth = closing ? Math.max(0, templateDepth - 1) : templateDepth + 1
    if (!closing && (name === 'script' || name === 'style' || name === 'textarea')) {
      const closePattern = new RegExp(`<\\/\\s*${name}\\s*>`, 'ig')
      closePattern.lastIndex = index
      const closingMatch = closePattern.exec(html)
      const bodyEnd = closingMatch ? closingMatch.index : html.length
      if (name !== 'textarea') token.body = html.slice(index, bodyEnd)
      index = closingMatch ? closePattern.lastIndex : html.length
    }
  }
  return tokens
}

function textForElements(tokens, elementName) {
  const values = []
  let current = null
  for (const token of tokens) {
    if (token.inert) continue
    if (token.type === 'tag' && token.name === elementName) {
      if (!token.closing && current === null) current = ''
      else if (token.closing && current !== null) { values.push(current.replace(/\s+/g, ' ').trim()); current = null }
    } else if (token.type === 'text' && current !== null) current += token.value
  }
  if (current !== null) values.push(current.replace(/\s+/g, ' ').trim())
  return values
}

function add(checks, id, status, evidence, action) {
  if (!STATUSES.includes(status)) throw new Error(`Invalid check status: ${status}`)
  checks.push({ id, status, evidence, action })
}

function inspect(html, publicUrl) {
  const tokens = tokenize(html)
  const tags = tokens.filter((token) => token.type === 'tag' && !token.closing && !token.inert)
  const checks = []
  const titles = textForElements(tokens, 'title')
  if (!titles.some(Boolean)) add(checks, 'title', 'fail', 'No non-empty <title> was found.', 'Add a concise, page-specific title.')
  else if (titles.length > 1) add(checks, 'title', 'warn', `${titles.length} <title> elements were found.`, 'Keep one non-empty title in <head>.')
  else add(checks, 'title', 'pass', `One non-empty title was found: "${titles[0]}".`, 'Keep it accurate and page-specific.')

  const descriptions = tags.filter((tag) => tag.name === 'meta' && (tag.attributes.get('name') ?? '').toLowerCase() === 'description')
  const usableDescriptions = descriptions.filter((tag) => (tag.attributes.get('content') ?? '').trim())
  if (!usableDescriptions.length) add(checks, 'meta_description', 'fail', 'No non-empty meta description was found.', 'Add one accurate summary in <head>.')
  else if (descriptions.length > 1) add(checks, 'meta_description', 'warn', `${descriptions.length} meta description elements were found.`, 'Keep one description per page.')
  else add(checks, 'meta_description', 'pass', 'One non-empty meta description was found.', 'Keep it truthful and specific to this page.')

  const htmlTag = tags.find((tag) => tag.name === 'html')
  const lang = (htmlTag?.attributes.get('lang') ?? '').trim()
  add(checks, 'document_language', lang ? 'pass' : 'warn', lang ? `<html lang="${lang}"> is present.` : 'The <html> element has no non-empty lang attribute.', lang ? 'Confirm the language tag matches the page.' : 'Add the page language to <html lang="…">.')
  const mainCount = tags.filter((tag) => tag.name === 'main').length
  add(checks, 'main_landmark', mainCount === 1 ? 'pass' : 'warn', `${mainCount} <main> elements found.`, mainCount === 1 ? 'Keep the primary content inside it.' : 'Use one <main> for the page primary content.')

  const headings = tags.filter((tag) => /^h[1-6]$/.test(tag.name))
  const h1Texts = textForElements(tokens, 'h1')
  if (!h1Texts.some(Boolean)) add(checks, 'h1', 'fail', 'No non-empty H1 was found.', 'Add one meaningful page-level H1.')
  else if (h1Texts.length !== 1) add(checks, 'h1', 'warn', `${h1Texts.length} H1 elements were found.`, 'Use the kit convention of exactly one meaningful H1.')
  else add(checks, 'h1', 'pass', `One non-empty H1 was found: "${h1Texts[0]}".`, 'Keep it aligned with the visible page purpose.')

  const jumps = []
  for (let index = 1; index < headings.length; index++) {
    const previous = Number(headings[index - 1].name[1])
    const current = Number(headings[index].name[1])
    if (current > previous + 1) jumps.push(`${headings[index - 1].name.toUpperCase()}→${headings[index].name.toUpperCase()}`)
  }
  add(checks, 'heading_order', jumps.length ? 'warn' : 'pass', jumps.length ? `Skipped heading levels: ${jumps.join(', ')}.` : 'No downward heading-level skips were found.', jumps.length ? 'Repair the outline without choosing levels for visual size.' : 'Review the outline for meaning as well as order.')

  const anchors = tags.filter((tag) => tag.name === 'a')
  const badAnchors = anchors.filter((tag) => !tag.attributes.has('href') || !(tag.attributes.get('href') ?? '').trim() || /^javascript:/i.test((tag.attributes.get('href') ?? '').trim()))
  add(checks, 'anchor_hrefs', badAnchors.length ? 'warn' : 'pass', `${anchors.length} anchors inspected; ${badAnchors.length} missing, empty, or unsafe href values. Fragment links such as # and #contact are allowed.`, badAnchors.length ? 'Give each link a real URL, mailto, tel, or intentional fragment destination.' : 'Test destinations in the rendered site.')
  const images = tags.filter((tag) => tag.name === 'img')
  const missingAlt = images.filter((tag) => !tag.attributes.has('alt')).length
  add(checks, 'image_alt', missingAlt ? 'warn' : 'pass', `${images.length} images inspected; ${missingAlt} omit the alt attribute. Empty alt values are accepted for decorative images.`, missingAlt ? 'Add truthful alt text, or alt="" for decorative images.' : 'Confirm empty alt values are decorative and other text is accurate.')

  const robotValues = tags.filter((tag) => tag.name === 'meta' && ['robots', 'googlebot'].includes((tag.attributes.get('name') ?? '').toLowerCase())).map((tag) => (tag.attributes.get('content') ?? '').toLowerCase())
  const robotDirectives = robotValues.flatMap((value) => value.split(/[,\s]+/).filter(Boolean))
  const restrictedDirectives = [...new Set(robotDirectives.flatMap((directive) => directive === 'none' ? ['none', 'noindex', 'nofollow'] : ['noindex', 'nofollow', 'nosnippet'].includes(directive) ? [directive] : []))]
  const restricted = restrictedDirectives.length > 0
  add(checks, 'meta_robots', restricted ? 'warn' : 'pass', restricted ? `Robots restrictions found: ${restrictedDirectives.join(', ')}.` : 'No noindex, nofollow, nosnippet, or equivalent none robots directive was found; an explicit allow directive is not required.', restricted ? 'Confirm these indexing, following, and preview restrictions are intentional; preserve the site owner policy unless they approve a change.' : 'Check deployment-level controls separately.')

  const canonicals = tags.filter((tag) => tag.name === 'link' && (tag.attributes.get('rel') ?? '').toLowerCase().split(/\s+/).includes('canonical')).map((tag) => (tag.attributes.get('href') ?? '').trim())
  if (!canonicals.length) add(checks, 'canonical', 'warn', publicUrl ? `No canonical was found for ${publicUrl.href}.` : 'No canonical was found, and no verified public URL was supplied.', publicUrl ? 'Add a canonical only after confirming this public URL is preferred.' : 'At launch, verify the public URL before adding a canonical; do not invent one.')
  else if (canonicals.length > 1 || canonicals.some((value) => !value)) add(checks, 'canonical', 'warn', `${canonicals.length} canonical elements found; one or more are duplicate or empty.`, 'Keep one non-empty canonical after verifying the public URL.')
  else if (publicUrl) {
    let canonicalUrl = null
    try { canonicalUrl = new URL(canonicals[0], publicUrl) } catch {}
    const matches = canonicalUrl?.href === publicUrl.href
    add(checks, 'canonical', matches ? 'pass' : 'warn', matches ? `Canonical matches ${publicUrl.href}.` : `Canonical resolves to ${canonicalUrl?.href ?? 'an invalid URL'}, not ${publicUrl.href}.`, matches ? 'Reconfirm after deployment changes.' : 'Confirm the preferred public URL and update only with verified facts.')
  } else add(checks, 'canonical', 'warn', `A canonical is present but was not verified against a supplied public URL: ${canonicals[0]}.`, 'Supply --url with the verified public URL to compare it; do not infer correctness locally.')

  const jsonLd = tags.filter((tag) => tag.name === 'script' && (tag.attributes.get('type') ?? '').trim().toLowerCase() === 'application/ld+json')
  const malformed = []
  jsonLd.forEach((tag, index) => { try { JSON.parse(tag.body ?? '') } catch (error) { malformed.push(`block ${index + 1}: ${error.message}`) } })
  if (malformed.length) add(checks, 'json_ld', 'fail', `Malformed JSON-LD (${malformed.join('; ')}).`, 'Fix JSON syntax, then validate the applicable schema and its visible-page accuracy.')
  else add(checks, 'json_ld', 'pass', `${jsonLd.length} JSON-LD blocks parsed successfully. Zero blocks is valid.`, 'If structured data is used, confirm every claim matches visible, current facts.')

  add(checks, 'template_facts', 'not_checked', 'Local markup cannot establish that names, offers, dates, addresses, ratings, testimonials, or authority claims are true.', 'A human must compare visible copy and structured data with participant-approved evidence.')
  for (const [id, evidence, action] of [
    ['http_status', 'No network request was made; HTTP availability and status are unknown.', 'Request the verified public URL after deployment and confirm the intended success status.'],
    ['robots_txt', 'A local HTML file cannot show the deployed robots.txt policy.', 'Inspect the deployed robots.txt for each crawler policy.'],
    ['response_headers', 'A local HTML file has no deployed response headers.', 'Inspect canonical, robots, redirect, and security-related response headers after deployment.'],
    ['cdn_and_hosting', 'CDN, firewall, authentication, and hosting crawler access were not tested.', 'Test the public page from outside the authenticated development environment.'],
    ['indexing', 'Search-engine crawling and indexing were not queried.', 'Use the relevant webmaster inspection tools after launch; eligibility does not guarantee indexing.'],
    ['ranking', 'A local inspector cannot measure or promise rankings.', 'Review real search performance over time without treating markup as a ranking guarantee.'],
    ['ai_citations', 'AI-search inclusion or citations were not queried.', 'Measure observed referrals/citations separately; no special AI schema or text file is required.'],
  ]) add(checks, id, 'not_checked', evidence, action)
  return checks
}

function printHuman(report) {
  console.log(`SEO/GEO local inspection: ${report.summary.fail} fail, ${report.summary.warn} warn, ${report.summary.pass} pass, ${report.summary.not_checked} not checked`)
  for (const check of report.checks) console.log(`\n[${check.status.toUpperCase()}] ${check.id}\n  Evidence: ${check.evidence}\n  Action: ${check.action}`)
}

const options = parseArgs(process.argv.slice(2))
if (options.help) { usage(); process.exit(0) }
const inputPath = resolve(options.file)
if (!/\.html?$/i.test(inputPath)) inputError(`input must have a .html or .htm extension: ${inputPath}`)
if (!regular(inputPath, true)) inputError(`input is missing, empty, symbolic, or not a regular file: ${inputPath}`)
let html
try { html = readFileSync(inputPath, 'utf8') } catch (error) { inputError(`could not read '${inputPath}': ${error.message}`) }
const publicUrl = parsePublicUrl(options.url)
const checks = inspect(html, publicUrl)
const summary = Object.fromEntries(STATUSES.map((status) => [status, checks.filter((check) => check.status === status).length]))
const report = { file: inputPath, url: publicUrl?.href ?? null, localOnly: true, summary, checks }
if (options.json) console.log(JSON.stringify(report, null, 2))
else printHuman(report)
process.exit(summary.fail ? 1 : 0)
