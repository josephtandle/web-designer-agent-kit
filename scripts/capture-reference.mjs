#!/usr/bin/env node
import { mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { imageDimensions } from './lib/image-dimensions.mjs'
import {
  assertNewPath,
  assertNoSymlinkPath,
  regular,
  writeExclusive,
} from './lib/safe-paths.mjs'

const LAUNCH_TIMEOUT_MS = 15_000
const NAVIGATION_TIMEOUT_MS = 30_000
const OPERATION_TIMEOUT_MS = 15_000
const SETTLE_TIMEOUT_MS = 5_000
const VIEWPORTS = [
  { name: 'desktop1440', width: 1440, height: 900 },
  { name: 'mobile390', width: 390, height: 844 },
]

function parseArgs(args) {
  const options = { url: null, target: null, cdp: null, help: false }
  const seen = new Set()
  for (const arg of args) {
    let key
    if (arg === '-h' || arg === '--help') key = 'help'
    else if (arg.startsWith('--target=')) key = 'target'
    else if (arg.startsWith('--cdp=')) key = 'cdp'
    else if (!arg.startsWith('-')) key = 'url'
    else throw new Error('unknown argument or option')
    if (seen.has(key)) throw new Error(`duplicate ${key === 'url' ? 'URL' : `--${key}`} argument`)
    seen.add(key)
    if (key === 'help') options.help = true
    else if (key === 'url') options.url = arg.trim()
    else options[key] = arg.slice(`--${key}=`.length).trim()
  }
  return options
}

function parseEndpoint(value, protocols) {
  try {
    const parsed = new URL(value)
    if (!protocols.includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

function withTimeout(promise, timeoutMs, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)
  })
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
  } catch {
    throw new Error('Playwright is unavailable; no installation was attempted')
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

const sha256 = file => createHash('sha256').update(readFileSync(file)).digest('hex')

async function settlePage(page) {
  return withTimeout(page.evaluate(async timeoutMs => {
    const startedAt = performance.now()
    let timer
    let settleTimedOut = false
    const deadline = new Promise(resolve => {
      timer = setTimeout(() => {
        settleTimedOut = true
        resolve()
      }, timeoutMs)
    })
    const fontsReady = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve()
    const imagesReady = Promise.all([...document.images].map(image => {
      if (image.complete) return Promise.resolve()
      return new Promise(resolveImage => {
        image.addEventListener('load', resolveImage, { once: true })
        image.addEventListener('error', resolveImage, { once: true })
      })
    }))
    await Promise.race([Promise.allSettled([fontsReady, imagesReady]), deadline])
    clearTimeout(timer)
    const images = [...document.images]
    const imageComplete = images.filter(image => image.complete).length
    const imageFailed = images.filter(image => image.complete && image.naturalWidth === 0).length
    const fontComplete = !document.fonts || document.fonts.status === 'loaded'
    return {
      elapsedMs: Math.round(performance.now() - startedAt),
      timedOut: settleTimedOut,
      fonts: {
        supported: Boolean(document.fonts),
        complete: fontComplete,
        timedOut: settleTimedOut && !fontComplete,
      },
      images: {
        total: images.length,
        complete: imageComplete,
        failed: imageFailed,
        pending: images.length - imageComplete,
        timedOut: settleTimedOut && imageComplete < images.length,
      },
    }
  }, SETTLE_TIMEOUT_MS), SETTLE_TIMEOUT_MS + 1_000, 'Page resource settle')
}

async function pageDetails(page) {
  return withTimeout(page.evaluate(() => ({
    title: document.title,
    regions: [...document.querySelectorAll('header, main, section, footer, nav, article')]
      .slice(0, 20)
      .map(element => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return {
          tag: element.tagName.toLowerCase(),
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          typography: {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
          },
          color: style.color,
          background: {
            color: style.backgroundColor,
            image: style.backgroundImage,
          },
        }
      }),
  })), OPERATION_TIMEOUT_MS, 'Page detail collection')
}

async function captureViewport(browser, sourceUrl, output, viewport) {
  const record = {
    name: viewport.name,
    viewport: { width: viewport.width, height: viewport.height },
    dpr: 1,
    sourceUrl,
    finalUrl: null,
    httpStatus: null,
    capturedAt: new Date().toISOString(),
    state: 'failed',
  }
  let context
  let page
  let temporaryScreenshot
  try {
    context = await withTimeout(browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    }), OPERATION_TIMEOUT_MS, 'Browser context creation')
    page = await withTimeout(context.newPage(), OPERATION_TIMEOUT_MS, 'Page creation')
    page.setDefaultTimeout(OPERATION_TIMEOUT_MS)
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS)

    const response = await page.goto(sourceUrl, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT_MS,
    })
    record.finalUrl = page.url()
    record.httpStatus = response?.status() ?? null
    if (record.httpStatus === null) throw new Error('Navigation returned no HTTP response')
    if (record.httpStatus >= 400) throw new Error(`Source returned HTTP ${record.httpStatus}`)

    record.networkIdle = await page.waitForLoadState('networkidle', { timeout: SETTLE_TIMEOUT_MS })
      .then(() => true, () => false)
    record.settle = await settlePage(page)
    Object.assign(record, await pageDetails(page))

    temporaryScreenshot = join(output, `.${viewport.name}.${process.pid}.png`)
    assertNoSymlinkPath(temporaryScreenshot, 'Screenshot')
    await withTimeout(page.screenshot({
      path: temporaryScreenshot,
      fullPage: true,
      timeout: OPERATION_TIMEOUT_MS,
    }), OPERATION_TIMEOUT_MS + 1_000, 'Screenshot')
    const screenshotFile = `${viewport.name}.png`
    const screenshot = join(output, screenshotFile)
    writeExclusive(screenshot, readFileSync(temporaryScreenshot))
    unlinkSync(temporaryScreenshot)
    temporaryScreenshot = null
    const screenshotDimensions = imageDimensions(screenshot)
    if (!screenshotDimensions) throw new Error('Screenshot is not a structurally valid PNG')
    record.screenshot = {
      file: screenshotFile,
      width: screenshotDimensions.width,
      height: screenshotDimensions.height,
      sha256: sha256(screenshot),
    }
    record.state = 'success'
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
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
if (options.help) {
  console.log('Usage: node capture-reference.mjs HTTP_URL --target=NEW [--cdp=HTTP_OR_WS_ENDPOINT]')
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
  console.error(`Error: ${error.message}`)
  process.exit(1)
}

async function main() {
  mkdirSync(output, { recursive: true })
  assertNoSymlinkPath(output, 'Capture target')
  const captures = []
  let browser
  let connection = 'none'
  let fatalError = null

  try {
    const playwright = await loadPlaywright()
    if (!playwright?.chromium) throw new Error('Playwright Chromium API is unavailable')
    if (cdpEndpoint) {
      browser = await withTimeout(
        playwright.chromium.connectOverCDP(cdpEndpoint.href, { timeout: LAUNCH_TIMEOUT_MS }),
        LAUNCH_TIMEOUT_MS + 1_000,
        'CDP connection',
      )
      connection = 'cdp'
    } else {
      browser = await withTimeout(
        playwright.chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS }),
        LAUNCH_TIMEOUT_MS + 1_000,
        'Browser launch',
      )
      connection = 'owned-headless'
    }

    for (const viewport of VIEWPORTS) {
      captures.push(await captureViewport(browser, source.href, output, viewport))
    }
  } catch (error) {
    fatalError = errorMessage(error)
  } finally {
    if (browser) {
      // For a CDP-attached Browser, Playwright's close disconnects this client.
      // For an owned launch, it closes the browser process created above.
      await withTimeout(browser.close(), SETTLE_TIMEOUT_MS, 'Browser close').catch(() => {})
    }
  }

  const failed = Boolean(fatalError) || captures.length !== VIEWPORTS.length || captures.some(item => item.state !== 'success')
  const metadata = {
    sourceUrl: source.href,
    finalUrl: captures.at(-1)?.finalUrl ?? null,
    httpStatus: captures.at(-1)?.httpStatus ?? null,
    capturedAt: new Date().toISOString(),
    status: failed ? 'partial_failure' : 'success',
    connection,
    captures,
    errors: fatalError ? [fatalError] : captures.filter(item => item.error).map(item => item.error),
  }
  writeExclusive(join(output, 'reference.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  if (failed) {
    console.error('Capture failed; see reference.json for bounded failure details.')
    process.exitCode = 1
  } else {
    console.log(`Captured ${captures.length} reference viewports.`)
  }
}

main().catch(error => {
  console.error(`Capture failed before metadata was written: ${errorMessage(error)}`)
  process.exit(1)
})
