import { lstatSync, mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs'
import path, { dirname, join, normalize, resolve, sep } from 'node:path'

export const lstat = (file) => { try { return lstatSync(file) } catch (error) { if (error.code === 'ENOENT') return null; throw error } }
export const exists = (file) => lstat(file) !== null
export const regular = (file, nonempty = false) => { const stat = lstat(file); return Boolean(stat?.isFile() && !stat.isSymbolicLink() && (!nonempty || stat.size > 0)) }

function canonicalAlias(value) {
  const p = normalize(resolve(value))
  if (process.platform !== 'darwin') return p
  for (const alias of ['/tmp', '/var', '/etc']) if (p === alias || p.startsWith(`${alias}${sep}`)) return join('/private', p)
  return p
}

export function splitAbsolutePath(value, pathApi = path) {
  const absolute = pathApi.normalize(pathApi.resolve(value))
  const root = pathApi.parse(absolute).root
  const remainder = absolute.slice(root.length)
  return {
    absolute,
    root,
    components: remainder.split(pathApi.sep).filter(Boolean),
  }
}

// Refuse every extant symlink from filesystem root through target. macOS aliases
// are accepted only through their canonical /private counterparts.
export function assertNoSymlinkPath(value, label = 'Path') {
  const absolute = canonicalAlias(value)
  const { root, components } = splitAbsolutePath(absolute)
  let current = root
  for (const piece of components) {
    current = join(current, piece)
    const stat = lstat(current)
    if (stat?.isSymbolicLink()) throw new Error(`${label} has a symbolic-link ancestor: ${current}`)
  }
  return absolute
}

export function assertNewPath(value, label = 'Target') {
  const absolute = assertNoSymlinkPath(value, label)
  if (lstat(absolute)) throw new Error(`${label} already exists: ${absolute}`)
  return absolute
}

export function mkdirSafe(value) {
  const absolute = assertNoSymlinkPath(value)
  mkdirSync(absolute, { recursive: true })
  assertNoSymlinkPath(absolute)
  return absolute
}

export function writeExclusive(file, content, encoding = 'utf8') {
  assertNoSymlinkPath(dirname(file))
  const fd = openSync(file, 'wx')
  try { writeFileSync(fd, content, encoding) } finally { closeSync(fd) }
}
