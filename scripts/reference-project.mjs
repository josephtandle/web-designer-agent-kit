#!/usr/bin/env node
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatCommand } from './lib/cli-format.mjs'
import { imageDimensionsFromBytes } from './lib/image-dimensions.mjs'
import {
  assertNewPath,
  assertNoSymlinkPath,
  regular,
  writeExclusive,
} from './lib/safe-paths.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function parseArgs(args) {
  const options = { target: null, url: null, image: null, mode: 'match', help: false }
  const seen = new Set()
  for (const arg of args) {
    let key
    if (arg === '-h' || arg === '--help') key = 'help'
    else if (arg.startsWith('--target=')) key = 'target'
    else if (arg.startsWith('--url=')) key = 'url'
    else if (arg.startsWith('--image=')) key = 'image'
    else if (arg.startsWith('--mode=')) key = 'mode'
    else throw new Error('unknown argument or option')
    if (seen.has(key)) throw new Error(`duplicate --${key} option`)
    seen.add(key)
    if (key === 'help') options.help = true
    else options[key] = arg.slice(`--${key}=`.length).trim()
  }
  return options
}

function parseHttpUrl(value) {
  try {
    const parsed = new URL(value)
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

let options
try { options = parseArgs(process.argv.slice(2)) } catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
if (options.help) {
  console.log('Usage: node reference-project.mjs --target=NEW (--url=HTTP_URL | --image=FILE) [--mode=match|adapt]')
  process.exit(0)
}

const sourceUrl = options.url ? parseHttpUrl(options.url) : null
if (!options.target
  || Boolean(options.url) === Boolean(options.image)
  || !['match', 'adapt'].includes(options.mode)
  || (options.url && !sourceUrl)) {
  console.error('Error: require --target=NEW, exactly one valid credential-free HTTP(S) --url or --image, and --mode=match|adapt.')
  process.exit(1)
}

const targetDir = resolve(options.target)
const comparator = join(ROOT, 'skills', 'masterminds-web-designer', 'tools', 'reference-compare.html')
const captureScript = join(ROOT, 'scripts', 'capture-reference.mjs')
const previewScript = join(ROOT, 'scripts', 'preview.mjs')

try {
  assertNewPath(targetDir, 'Target')
  for (const [label, file] of [
    ['comparator', comparator],
    ['capture script', captureScript],
    ['preview script', previewScript],
  ]) {
    assertNoSymlinkPath(file, `Bundled ${label}`)
    if (!regular(file, true)) throw new Error(`Required bundled ${label} is missing or empty`)
  }

  const comparatorBytes = readFileSync(comparator)
  let imagePath = null
  let imageBytes = null
  let dimensions = null
  if (options.image) {
    imagePath = resolve(options.image)
    assertNoSymlinkPath(imagePath, 'Image')
    if (!regular(imagePath, true) || !['.png', '.jpg', '.jpeg'].includes(extname(imagePath).toLowerCase())) {
      throw new Error('Image must be a nonempty regular PNG or JPEG')
    }
    imageBytes = readFileSync(imagePath)
    dimensions = imageDimensionsFromBytes(imageBytes)
    if (!dimensions) throw new Error('Image must contain a structurally valid PNG IHDR or supported JPEG SOF with positive dimensions')
  }

  mkdirSync(targetDir, { recursive: true })
  assertNoSymlinkPath(targetDir, 'Target')

  let imageName = null
  if (imagePath) {
    imageName = `reference-image${extname(imagePath).toLowerCase()}`
    writeExclusive(join(targetDir, imageName), imageBytes)
  }
  const referenceMap = {
    mode: options.mode,
    sourceType: sourceUrl ? 'url' : 'image',
    sourceUrl: sourceUrl?.href ?? null,
    sourceImage: imageName,
    imageDimensions: dimensions,
    viewport: null,
    status: sourceUrl ? 'pending_capture' : 'user_provided_image',
    createdAt: new Date().toISOString(),
  }
  writeExclusive(join(targetDir, 'reference-map.json'), `${JSON.stringify(referenceMap, null, 2)}\n`)
  writeExclusive(join(targetDir, 'reference-compare.html'), comparatorBytes)

  const captureCommand = sourceUrl
    ? formatCommand([process.execPath, captureScript, sourceUrl.href, `--target=${join(targetDir, 'capture')}`])
    : null
  const previewCommand = formatCommand([process.execPath, previewScript, `--dir=${targetDir}`, '--port=3000'])
  const captureInstructions = captureCommand
    ? `Capture into a new child directory:\n\n    ${captureCommand}\n\n`
    : ''
  writeExclusive(
    join(targetDir, 'README.md'),
    `# Reference Project\n\nMode: ${options.mode}\n\n${captureInstructions}Preview:\n\n    ${previewCommand}\n`,
  )
  console.log(`Successfully initialized reference project at: ${targetDir}`)
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
