#!/usr/bin/env node
import { mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { imageDimensions } from './lib/image-dimensions.mjs'
import { assertNewPath, assertNoSymlinkPath, regular, writeExclusive } from './lib/safe-paths.mjs'

const LAUNCH_TIMEOUT_MS = 15_000
const NAVIGATION_TIMEOUT_MS = 30_000
const OPERATION_TIMEOUT_MS = 15_000
const SETTLE_TIMEOUT_MS = 5_000
const MAX_CASES = 6
const MAX_ACTIONS = 10
const MAX_SCREENSHOT_PIXELS = 40_000_000
const DEFAULT_CASES = [
  { name: 'desktop1440', width: 1440, height: 900, dpr: 1, colorScheme: 'light', reducedMotion: 'no-preference', fullPage: true, actions: [] },
  { name: 'mobile390', width: 390, height: 844, dpr: 1, colorScheme: 'light', reducedMotion: 'no-preference', fullPage: true, actions: [] },
]

const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
const sha256Bytes = bytes => createHash('sha256').update(bytes).digest('hex')
const sha256File = file => sha256Bytes(readFileSync(file))
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function exactKeys(object, allowed, label) {
  const extras = Object.keys(object).filter(key => !allowed.includes(key))
  if (extras.length) throw new Error(`${label} has unknown field: ${extras[0]}`)
}

function finiteNumber(value, label, minimum, maximum, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum || (integer && !Number.isInteger(value))) {
    throw new Error(`${label} must be ${integer ? 'an integer' : 'a finite number'} from ${minimum} to ${maximum}`)
  }
  return value
}

function parseSelector(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 500 || /[\0\r\n]/u.test(value)) {
    throw new Error(`${label} must be a nonempty single-line CSS selector of at most 500 characters`)
  }
  return value.trim()
}

function parseAction(value, label) {
  if (!plainObject(value) || typeof value.type !== 'string') throw new Error(`${label} must be an action object with a type`)
  if (value.type === 'wait') {
    exactKeys(value, ['type', 'ms'], label)
    return { type: 'wait', ms: finiteNumber(value.ms, `${label}.ms`, 0, SETTLE_TIMEOUT_MS, true) }
  }
  if (['hover', 'focus', 'open-details', 'scroll'].includes(value.type)) {
    exactKeys(value, ['type', 'selector'], label)
    return { type: value.type, selector: parseSelector(value.selector, `${label}.selector`) }
  }
  throw new Error(`${label}.type must be wait, hover, focus, open-details, or scroll`)
}

function parseCase(value, index) {
  const label = `spec.cases[${index}]`
  if (!plainObject(value)) throw new Error(`${label} must be an object`)
  exactKeys(value, ['name', 'width', 'height', 'dpr', 'colorScheme', 'reducedMotion', 'fullPage', 'clip', 'actions'], label)
  if (typeof value.name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/u.test(value.name)) {
    throw new Error(`${label}.name must be 1-64 filename-safe characters`)
  }
  const hasFullPage = own(value, 'fullPage')
  const hasClip = own(value, 'clip')
  if (hasFullPage === hasClip) throw new Error(`${label} must contain exactly one of fullPage or clip`)
  if (hasFullPage && typeof value.fullPage !== 'boolean') throw new Error(`${label}.fullPage must be boolean`)
  let clip
  if (hasClip) {
    if (!plainObject(value.clip)) throw new Error(`${label}.clip must be an object`)
    exactKeys(value.clip, ['x', 'y', 'width', 'height'], `${label}.clip`)
    clip = {
      x: finiteNumber(value.clip.x, `${label}.clip.x`, 0, 100_000),
      y: finiteNumber(value.clip.y, `${label}.clip.y`, 0, 100_000),
      width: finiteNumber(value.clip.width, `${label}.clip.width`, 1, 100_000),
      height: finiteNumber(value.clip.height, `${label}.clip.height`, 1, 100_000),
    }
  }
  if (!['light', 'dark', 'no-preference'].includes(value.colorScheme)) throw new Error(`${label}.colorScheme is invalid`)
  if (!['reduce', 'no-preference'].includes(value.reducedMotion)) throw new Error(`${label}.reducedMotion is invalid`)
  const actions = own(value, 'actions') ? value.actions : []
  if (!Array.isArray(actions) || actions.length > MAX_ACTIONS) throw new Error(`${label}.actions must be an array of at most ${MAX_ACTIONS} actions`)
  const parsed = {
    name: value.name,
    width: finiteNumber(value.width, `${label}.width`, 1, 10_000, true),
    height: finiteNumber(value.height, `${label}.height`, 1, 10_000, true),
    dpr: finiteNumber(value.dpr, `${label}.dpr`, 1, 3),
    colorScheme: value.colorScheme,
    reducedMotion: value.reducedMotion,
    ...(hasFullPage ? { fullPage: value.fullPage } : { clip }),
    actions: actions.map((action, actionIndex) => parseAction(action, `${label}.actions[${actionIndex}]`)),
  }
  const requestedWidth = parsed.clip?.width ?? parsed.width
  const requestedHeight = parsed.clip?.height ?? parsed.height
  const requestedPixels = requestedWidth * requestedHeight * parsed.dpr * parsed.dpr
  if (requestedPixels > MAX_SCREENSHOT_PIXELS) {
    throw new Error(`${label} requests ${Math.ceil(requestedPixels)} screenshot pixels; limit is ${MAX_SCREENSHOT_PIXELS}`)
  }
  return parsed
}

function parseSpec(raw) {
  let value
  try { value = JSON.parse(raw) } catch { throw new Error('--spec must be valid JSON') }
  if (!plainObject(value)) throw new Error('--spec must be a JSON object')
  exactKeys(value, ['cases'], 'spec')
  if (!Array.isArray(value.cases) || value.cases.length < 1 || value.cases.length > MAX_CASES) {
    throw new Error(`spec.cases must contain 1-${MAX_CASES} cases`)
  }
  const cases = value.cases.map(parseCase)
  if (new Set(cases.map(item => item.name)).size !== cases.length) throw new Error('spec case names must be unique')
  return { cases }
}

function parseArgs(args) {
  const options = { url: null, target: null, cdp: null, spec: null, specHash: null, help: false }
  const seen = new Set()
  for (const arg of args) {
    let key
    if (arg === '-h' || arg === '--help') key = 'help'
    else if (arg.startsWith('--target=')) key = 'target'
    else if (arg.startsWith('--cdp=')) key = 'cdp'
    else if (arg.startsWith('--spec=')) key = 'spec'
    else if (!arg.startsWith('-')) key = 'url'
    else throw new Error('unknown argument or option')
    if (seen.has(key)) throw new Error(`duplicate ${key === 'url' ? 'URL' : `--${key}`} argument`)
    seen.add(key)
    if (key === 'help') options.help = true
    else if (key === 'url') options.url = arg.trim()
    else if (key === 'spec') {
      const raw = arg.slice('--spec='.length)
      options.spec = parseSpec(raw)
      options.specHash = sha256Bytes(raw)
    } else options[key] = arg.slice(`--${key}=`.length).trim()
  }
  return options
}

function parseEndpoint(value, protocols) {
  try {
    const parsed = new URL(value)
    if (!protocols.includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) return null
    return parsed
  } catch { return null }
}

function withTimeout(promise, timeoutMs, label) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function loadPlaywright() {
  const custom = process.env.WEB_DESIGNER_PLAYWRIGHT_PATH
  if (custom) {
    if (!isAbsolute(custom)) throw new Error('WEB_DESIGNER_PLAYWRIGHT_PATH must be an absolute module path')
    assertNoSymlinkPath(custom, 'Playwright module')
    if (!regular(custom, true)) throw new Error('WEB_DESIGNER_PLAYWRIGHT_PATH must name a nonempty regular file')
    const imported = await withTimeout(import(pathToFileURL(custom).href), OPERATION_TIMEOUT_MS, 'Playwright module import')
    return imported.default || imported
  }
  try {
    const imported = await withTimeout(import('playwright'), OPERATION_TIMEOUT_MS, 'Playwright module import')
    return imported.default || imported
  } catch { throw new Error('Playwright is unavailable; no installation was attempted') }
}

function errorMessage(error) { return error instanceof Error ? error.message : String(error) }

async function settlePage(page) {
  return withTimeout(page.evaluate(async timeoutMs => {
    const startedAt = performance.now()
    let timer
    let settleTimedOut = false
    const deadline = new Promise(resolve => { timer = setTimeout(() => { settleTimedOut = true; resolve() }, timeoutMs) })
    const fontsReady = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve()
    const imagesReady = Promise.all([...document.images].map(image => image.complete ? Promise.resolve() : new Promise(resolveImage => {
      image.addEventListener('load', resolveImage, { once: true })
      image.addEventListener('error', resolveImage, { once: true })
    })))
    await Promise.race([Promise.allSettled([fontsReady, imagesReady]), deadline])
    clearTimeout(timer)
    const images = [...document.images]
    const imageComplete = images.filter(image => image.complete).length
    const imageFailed = images.filter(image => image.complete && image.naturalWidth === 0).length
    const fontComplete = !document.fonts || document.fonts.status === 'loaded'
    return {
      elapsedMs: Math.round(performance.now() - startedAt), timedOut: settleTimedOut,
      fonts: { supported: Boolean(document.fonts), complete: fontComplete, timedOut: settleTimedOut && !fontComplete },
      images: { total: images.length, complete: imageComplete, failed: imageFailed, pending: images.length - imageComplete, timedOut: settleTimedOut && imageComplete < images.length },
    }
  }, SETTLE_TIMEOUT_MS), SETTLE_TIMEOUT_MS + 1_000, 'Page resource settle')
}

async function freezeAnimations(page) {
  let styleInjectionError = null
  try {
    await withTimeout(page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition-property:none!important;scroll-behavior:auto!important}' }), OPERATION_TIMEOUT_MS, 'Animation freeze style')
  } catch (error) {
    styleInjectionError = errorMessage(error)
  }
  const frozen = await withTimeout(page.evaluate(() => {
    if (typeof document.getAnimations !== 'function') {
      return { webAnimationsSupported: false, animationsFound: 0, animationsFinished: 0, animationsPaused: 0, animationsFailed: 0 }
    }
    const animations = document.getAnimations({ subtree: true })
    let animationsFinished = 0
    let animationsPaused = 0
    let animationsFailed = 0
    for (const animation of animations) {
      try {
        animation.finish()
        animationsFinished += 1
      } catch {
        try {
          animation.pause()
          animationsPaused += 1
        } catch {
          animationsFailed += 1
        }
      }
    }
    return { webAnimationsSupported: true, animationsFound: animations.length, animationsFinished, animationsPaused, animationsFailed }
  }), OPERATION_TIMEOUT_MS, 'Animation freeze')
  const limitations = []
  if (styleInjectionError) limitations.push(`CSS animation freeze unavailable: ${styleInjectionError}`)
  if (!frozen.webAnimationsSupported) limitations.push('Web Animations API unavailable')
  if (frozen.animationsFailed) limitations.push(`${frozen.animationsFailed} animations could not be finished or paused`)
  return {
    strategy: styleInjectionError ? 'web-animations-finish-or-pause' : 'css-pause-and-web-animations-finish-or-pause',
    styleInjected: styleInjectionError === null,
    ...frozen,
    limitations,
  }
}

function measuredScreenshotPixels(capture, details) {
  const dpr = details.measuredDpr
  let width
  let height
  if (own(capture, 'clip')) ({ width, height } = capture.clip)
  else if (capture.fullPage) ({ width, height } = details.scroll)
  else ({ width, height } = capture)
  const pixels = Math.ceil(width * dpr) * Math.ceil(height * dpr)
  if (!Number.isFinite(pixels) || pixels > MAX_SCREENSHOT_PIXELS) {
    throw new Error(`Measured screenshot would contain ${Number.isFinite(pixels) ? pixels : 'an invalid number of'} pixels; limit is ${MAX_SCREENSHOT_PIXELS}`)
  }
  return pixels
}

async function performActions(page, actions) {
  const completed = []
  for (const action of actions) {
    if (action.type === 'wait') await page.waitForTimeout(action.ms)
    else {
      const locator = page.locator(action.selector).first()
      if (action.type === 'hover') await locator.hover({ timeout: OPERATION_TIMEOUT_MS })
      else if (action.type === 'focus') await locator.focus({ timeout: OPERATION_TIMEOUT_MS })
      else if (action.type === 'scroll') await locator.scrollIntoViewIfNeeded({ timeout: OPERATION_TIMEOUT_MS })
      else if (action.type === 'open-details') {
        await locator.waitFor({ state: 'attached', timeout: OPERATION_TIMEOUT_MS })
        const opened = await locator.evaluate(element => {
          if (!(element instanceof HTMLDetailsElement)) return false
          element.open = true
          return true
        })
        if (!opened) throw new Error(`open-details selector did not resolve to a details element: ${action.selector}`)
      }
    }
    completed.push(action)
  }
  return completed
}

async function pageDetails(page) {
  return withTimeout(page.evaluate(() => {
    const selectorFor = element => {
      if (element.id) return `#${CSS.escape(element.id)}`
      const label = element.getAttribute('aria-label')
      if (label) return `${element.tagName.toLowerCase()}[aria-label=${JSON.stringify(label)}]`
      const name = element.getAttribute('name')
      if (name) return `${element.tagName.toLowerCase()}[name=${JSON.stringify(name)}]`
      const parent = element.parentElement
      if (!parent) return element.tagName.toLowerCase()
      const peers = [...parent.children].filter(item => item.tagName === element.tagName)
      return `${selectorFor(parent)} > ${element.tagName.toLowerCase()}:nth-of-type(${peers.indexOf(element) + 1})`
    }
    const bounds = element => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }
    const typography = element => {
      const style = getComputedStyle(element)
      return {
        fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
        fontStyle: style.fontStyle, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
        source: 'computed-css-font-family-not-rendered-font-proof',
      }
    }
    const visible = element => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    }
    const sample = (selector, limit, mapper) => [...document.querySelectorAll(selector)].filter(visible).slice(0, limit).map(mapper)
    const text = sample('h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption', 24, element => ({
      selector: selectorFor(element), text: (element.innerText || '').trim().slice(0, 500), bounds: bounds(element), typography: typography(element),
    })).filter(item => item.text)
    const controls = sample('button,input,select,textarea,a[href],summary,[role="button"],[role="link"]', 24, element => ({
      selector: selectorFor(element), tag: element.tagName.toLowerCase(), type: element.getAttribute('type'),
      text: (element.innerText || element.getAttribute('aria-label') || element.getAttribute('value') || '').trim().slice(0, 300),
      bounds: bounds(element), typography: typography(element), disabled: 'disabled' in element ? element.disabled : null,
    }))
    const images = sample('img', 24, element => ({
      selector: selectorFor(element), alt: element.alt, bounds: bounds(element), intrinsic: { width: element.naturalWidth, height: element.naturalHeight },
      currentSrc: element.currentSrc, objectFit: getComputedStyle(element).objectFit,
    }))
    const regions = sample('header,main,section,footer,nav,article', 20, element => {
      const style = getComputedStyle(element)
      return { tag: element.tagName.toLowerCase(), rect: bounds(element), typography: typography(element), color: style.color, background: { color: style.backgroundColor, image: style.backgroundImage } }
    })
    return {
      title: document.title, regions, samples: { text, controls, images },
      scroll: { x: scrollX, y: scrollY, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      measuredDpr: devicePixelRatio,
    }
  }), OPERATION_TIMEOUT_MS, 'Page detail collection')
}

async function captureOne(browser, browserVersion, sourceUrl, output, capture, specHash) {
  const record = {
    name: capture.name, viewport: { width: capture.width, height: capture.height }, dpr: capture.dpr,
    colorScheme: capture.colorScheme, reducedMotion: capture.reducedMotion, sourceUrl, finalUrl: null, httpStatus: null,
    capturedAt: new Date().toISOString(), state: 'failed', status: 'failed', browserVersion, specHash,
    screenshotPolicy: { animations: 'frozen-before-measure', caret: 'hide', scale: 'device' },
  }
  let context
  let page
  let temporaryScreenshot
  try {
    context = await withTimeout(browser.newContext({
      viewport: { width: capture.width, height: capture.height }, deviceScaleFactor: capture.dpr,
      colorScheme: capture.colorScheme, reducedMotion: capture.reducedMotion,
    }), OPERATION_TIMEOUT_MS, 'Browser context creation')
    page = await withTimeout(context.newPage(), OPERATION_TIMEOUT_MS, 'Page creation')
    page.setDefaultTimeout(OPERATION_TIMEOUT_MS)
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS)
    const response = await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
    record.finalUrl = page.url()
    record.httpStatus = response?.status() ?? null
    if (record.httpStatus === null) throw new Error('Navigation returned no HTTP response')
    if (record.httpStatus >= 400) throw new Error(`Source returned HTTP ${record.httpStatus}`)
    record.networkIdle = await page.waitForLoadState('networkidle', { timeout: SETTLE_TIMEOUT_MS }).then(() => true, () => false)
    record.settle = await settlePage(page)
    record.actions = await performActions(page, capture.actions)
    record.postActionSettle = await settlePage(page)
    record.frozenAnimationState = await freezeAnimations(page)
    record.postFreezeSettle = await settlePage(page)
    const details = await pageDetails(page)
    Object.assign(record, details)
    record.requestedScreenshotPixels = own(capture, 'clip')
      ? Math.ceil(capture.clip.width * capture.dpr) * Math.ceil(capture.clip.height * capture.dpr)
      : Math.ceil(capture.width * capture.dpr) * Math.ceil(capture.height * capture.dpr)
    record.measuredScreenshotPixels = measuredScreenshotPixels(capture, details)

    temporaryScreenshot = join(output, `.${capture.name}.${process.pid}.png`)
    assertNoSymlinkPath(temporaryScreenshot, 'Screenshot')
    const screenshotOptions = {
      path: temporaryScreenshot, timeout: OPERATION_TIMEOUT_MS, animations: 'allow', caret: 'hide', scale: 'device',
      ...(own(capture, 'clip') ? { clip: capture.clip } : { fullPage: capture.fullPage }),
    }
    await withTimeout(page.screenshot(screenshotOptions), OPERATION_TIMEOUT_MS + 1_000, 'Screenshot')
    const screenshotFile = `${capture.name}.png`
    const screenshot = join(output, screenshotFile)
    writeExclusive(screenshot, readFileSync(temporaryScreenshot))
    unlinkSync(temporaryScreenshot)
    temporaryScreenshot = null
    const screenshotDimensions = imageDimensions(screenshot)
    if (!screenshotDimensions) throw new Error('Screenshot is not a structurally valid PNG')
    const cssShot = own(capture, 'clip')
      ? { width: capture.clip.width, height: capture.clip.height, origin: { x: capture.clip.x, y: capture.clip.y }, kind: 'clip' }
      : { width: screenshotDimensions.width / record.measuredDpr, height: screenshotDimensions.height / record.measuredDpr, origin: capture.fullPage ? { x: 0, y: 0 } : { x: record.scroll.x, y: record.scroll.y }, kind: capture.fullPage ? 'fullPage' : 'viewport' }
    record.clip = own(capture, 'clip') ? capture.clip : null
    record.fullPage = own(capture, 'fullPage') ? capture.fullPage : null
    record.screenshot = {
      file: screenshotFile, width: screenshotDimensions.width, height: screenshotDimensions.height, sha256: sha256File(screenshot),
      scale: 'device', cssWidth: cssShot.width, cssHeight: cssShot.height, cropOrigin: cssShot.origin, captureKind: cssShot.kind,
      pixelsPerCssPixel: { x: screenshotDimensions.width / cssShot.width, y: screenshotDimensions.height / cssShot.height },
    }
    record.state = 'success'
    record.status = 'success'
  } catch (error) {
    if (page) record.finalUrl = page.url() || record.finalUrl
    record.error = errorMessage(error)
  } finally {
    if (temporaryScreenshot && regular(temporaryScreenshot)) unlinkSync(temporaryScreenshot)
    if (page) await withTimeout(page.close(), SETTLE_TIMEOUT_MS, 'Page close').catch(() => {})
    if (context) await withTimeout(context.close(), SETTLE_TIMEOUT_MS, 'Browser context close').catch(() => {})
  }
  return record
}

let options
try { options = parseArgs(process.argv.slice(2)) } catch (error) {
  console.error(`Error: ${errorMessage(error)}`)
  process.exit(1)
}
if (options.help) {
  console.log('Usage: node capture-reference.mjs HTTP_URL --target=NEW [--cdp=HTTP_OR_WS_ENDPOINT] [--spec=JSON]')
  process.exit(0)
}

const source = options.url ? parseEndpoint(options.url, ['http:', 'https:']) : null
const cdpEndpoint = options.cdp ? parseEndpoint(options.cdp, ['http:', 'https:', 'ws:', 'wss:']) : null
if (!source || !options.target || (options.cdp && !cdpEndpoint)) {
  console.error('Error: require a credential-free HTTP(S) URL, --target=NEW, and a valid credential-free --cdp endpoint when supplied.')
  process.exit(1)
}

const output = resolve(options.target)
try { assertNewPath(output, 'Capture target') } catch (error) {
  console.error(`Error: ${errorMessage(error)}`)
  process.exit(1)
}

async function main() {
  mkdirSync(output, { recursive: true })
  assertNoSymlinkPath(output, 'Capture target')
  const cases = options.spec?.cases ?? DEFAULT_CASES
  const captures = []
  let browser
  let browserVersion = null
  let connection = 'none'
  let fatalError = null
  try {
    const playwright = await loadPlaywright()
    if (!playwright?.chromium) throw new Error('Playwright Chromium API is unavailable')
    if (cdpEndpoint) {
      browser = await withTimeout(playwright.chromium.connectOverCDP(cdpEndpoint.href, { timeout: LAUNCH_TIMEOUT_MS }), LAUNCH_TIMEOUT_MS + 1_000, 'CDP connection')
      connection = 'cdp'
    } else {
      browser = await withTimeout(playwright.chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS }), LAUNCH_TIMEOUT_MS + 1_000, 'Browser launch')
      connection = 'owned-headless'
    }
    browserVersion = browser.version()
    for (const capture of cases) captures.push(await captureOne(browser, browserVersion, source.href, output, capture, options.specHash))
  } catch (error) { fatalError = errorMessage(error) }
  finally { if (browser) await withTimeout(browser.close(), SETTLE_TIMEOUT_MS, 'Browser close').catch(() => {}) }

  const failed = Boolean(fatalError) || captures.length !== cases.length || captures.some(item => item.state !== 'success')
  const metadata = {
    sourceUrl: source.href, finalUrl: captures.at(-1)?.finalUrl ?? null, httpStatus: captures.at(-1)?.httpStatus ?? null,
    capturedAt: new Date().toISOString(), status: failed ? 'partial_failure' : 'success', connection, browserVersion,
    specHash: options.specHash, captures, errors: fatalError ? [fatalError] : captures.filter(item => item.error).map(item => item.error),
  }
  writeExclusive(join(output, 'reference.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  if (failed) { console.error('Capture failed; see reference.json for bounded failure details.'); process.exitCode = 1 }
  else console.log(`Captured ${captures.length} reference viewports.`)
}

main().catch(error => { console.error(`Capture failed before metadata was written: ${errorMessage(error)}`); process.exit(1) })
