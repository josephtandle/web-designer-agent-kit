import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const temp = () => mkdtempSync(join(tmpdir(), 'web-designer-install-'))
function run(script, args, env = {}) {
  return spawnSync(process.execPath, [resolve(root, 'scripts', script), ...args], { encoding: 'utf8', timeout: 20000, env: { ...process.env, ...env } })
}

test('core installs without invoking Git and preserves edits on rerun', () => {
  const base = temp()
  const target = join(base, 'My Claude')
  const bin = join(base, 'bin')
  mkdirSync(bin)
  const calls = join(base, 'git-called')
  writeFileSync(join(bin, 'git'), `#!/bin/sh\ntouch '${calls}'\nexit 1\n`, { mode: 0o755 })
  const env = { PATH: `${bin}:${process.env.PATH}` }
  const result = run('install-web-designer-kit.mjs', [`--claude-dir=${target}`], env)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(calls), false, 'Core must not clone remote repositories')
  const agent = join(target, 'agents', 'web-designer.md')
  assert.equal(readFileSync(agent, 'utf8'), readFileSync(join(root, 'agents', 'web-designer.md'), 'utf8'))
  assert.ok(existsSync(join(target, 'skills', 'masterminds-web-designer', 'references', 'design-directions.md')))
  writeFileSync(agent, 'My custom designer\n')
  const second = run('install-web-designer-kit.mjs', [`--claude-dir=${target}`], env)
  assert.equal(second.status, 0, second.stderr)
  assert.equal(readFileSync(agent, 'utf8'), 'My custom designer\n')
})

test('health evaluates actual installed core, then detects a missing file', () => {
  const base = temp()
  const target = join(base, 'claude')
  const project = join(base, 'project')
  mkdirSync(project)
  const installed = run('install-web-designer-kit.mjs', [`--claude-dir=${target}`])
  assert.equal(installed.status, 0, installed.stderr)
  const context = run('install-context.mjs', [`--target=${project}`])
  assert.equal(context.status, 0, context.stderr)
  const healthy = run('health-check.mjs', [`--claude-dir=${target}`, `--project=${project}`])
  assert.equal(healthy.status, 0, healthy.stdout + healthy.stderr)
  writeFileSync(join(target, 'agents', 'web-designer.md'), '')
  const broken = run('health-check.mjs', [`--claude-dir=${target}`, `--project=${project}`])
  assert.notEqual(broken.status, 0, 'Empty core agent must fail health')
})

test('context install never overwrites previous originals or proposals', () => {
  const project = temp()
  const proposal = join(project, '.masterminds-context')
  mkdirSync(proposal)
  for (const name of ['CLAUDE.md', 'USER.md', 'SOUL.md']) {
    writeFileSync(join(project, name), `original ${name}`)
    writeFileSync(join(proposal, name), `proposal ${name}`)
  }
  for (let i = 0; i < 2; i++) {
    const result = run('install-context.mjs', [`--target=${project}`])
    assert.equal(result.status, 0, result.stderr)
  }
  for (const name of ['CLAUDE.md', 'USER.md', 'SOUL.md']) {
    assert.equal(readFileSync(join(project, name), 'utf8'), `original ${name}`)
    assert.equal(readFileSync(join(proposal, name), 'utf8'), `proposal ${name}`)
  }
})

test('rerun then upgrade never adopts and overwrites customized files', () => {
  const target = join(temp(), 'claude')
  assert.equal(run('install-web-designer-kit.mjs', [`--claude-dir=${target}`]).status, 0)
  const agent = join(target, 'agents', 'web-designer.md')
  writeFileSync(agent, 'My protected design instructions')
  assert.equal(run('install-web-designer-kit.mjs', [`--claude-dir=${target}`]).status, 0)
  assert.equal(run('install-web-designer-kit.mjs', [`--claude-dir=${target}`, '--upgrade']).status, 0)
  assert.equal(readFileSync(agent, 'utf8'), 'My protected design instructions')
})

test('manifest contains only kit-owned installed files', () => {
  const target = join(temp(), 'claude')
  mkdirSync(join(target, 'agents'), { recursive: true })
  writeFileSync(join(target, 'agents', 'unrelated.md'), 'unrelated agent')
  assert.equal(run('install-web-designer-kit.mjs', [`--claude-dir=${target}`]).status, 0)
  const state = JSON.parse(readFileSync(join(target, 'masterminds-web-designer-kit.json'), 'utf8'))
  assert.equal(Object.hasOwn(state.files, 'agents/unrelated.md'), false)
})

test('malformed state makes health fail with usable files still present', () => {
  const base = temp()
  const target = join(base, 'claude')
  const project = join(base, 'project')
  assert.equal(run('install-web-designer-kit.mjs', [`--claude-dir=${target}`]).status, 0)
  assert.equal(run('install-context.mjs', [`--target=${project}`]).status, 0)
  writeFileSync(join(target, 'masterminds-web-designer-kit.json'), '{broken')
  assert.notEqual(run('health-check.mjs', [`--claude-dir=${target}`, `--project=${project}`]).status, 0)
})
