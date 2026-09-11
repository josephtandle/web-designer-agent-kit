import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const temp = () => mkdtempSync(join(tmpdir(), 'web-designer-check-'))
const run = (script, args = []) => spawnSync(process.execPath, [resolve(root, 'scripts', script), ...(script === 'create-site.mjs' ? ['--name=Sample Studio', '--headline=A useful new perspective'].filter(flag => !args.some(arg => arg.split('=')[0] === flag.split('=')[0])) : []), ...args], { encoding: 'utf8', timeout: 15000 })

for (const style of ['service', 'portfolio', 'event']) {
  test(`${style}: a short brief produces an offline editable site`, () => {
    const target = join(temp(), 'My site')
    const result = run('create-site.mjs', [`--target=${target}`, `--style=${style}`, '--name=Ada & Co', '--headline=Make room for better work'])
    assert.equal(result.status, 0, result.stderr)
    const html = readFileSync(join(target, 'index.html'), 'utf8')
    assert.match(html, /Ada (?:&amp;|&) Co/)
    assert.match(html, /Make room for better work/)
    assert.equal((html.match(/<h1\b/gi) || []).length, 1)
    assert.ok(existsSync(join(target, 'styles.css')))
    assert.doesNotMatch(html, /https?:\/\/[^"'\s>]+\.(?:js|css)/i)
    assert.doesNotMatch(html, /hello@example\.com|cal\.com\/example|action=["']#["']/)
  })
}

test('starter rerun preserves participant edits and unrelated files', () => {
  const target = join(temp(), 'site')
  mkdirSync(target)
  writeFileSync(join(target, 'index.html'), 'participant original')
  writeFileSync(join(target, 'notes.txt'), 'important')
  const result = run('create-site.mjs', [`--target=${target}`, '--style=service'])
  assert.notEqual(result.status, 0)
  assert.equal(readFileSync(join(target, 'index.html'), 'utf8'), 'participant original')
  assert.equal(readFileSync(join(target, 'notes.txt'), 'utf8'), 'important')
})

test('unsafe contact and unknown options are rejected before writing', () => {
  for (const option of ['--email=javascript:alert(1)', '--style=bogus', '--mystery=yes']) {
    const target = join(temp(), 'site')
    const result = run('create-site.mjs', [`--target=${target}`, ...(option.startsWith('--style=') ? [] : ['--style=service']), option])
    assert.notEqual(result.status, 0)
    assert.equal(existsSync(join(target, 'index.html')), false)
  }
})

test('HTML supplied as business text is rendered as text', () => {
  const target = join(temp(), 'site')
  const result = run('create-site.mjs', [`--target=${target}`, '--style=service', '--name=<script>alert(1)</script>'])
  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(readFileSync(join(target, 'index.html'), 'utf8'), /<script>alert\(1\)<\/script>/)
})

test('symlink output directory is refused', () => {
  const base = temp()
  const real = join(base, 'real')
  mkdirSync(real)
  const target = join(base, 'alias')
  symlinkSync(real, target, 'dir')
  const result = run('create-site.mjs', [`--target=${target}`, '--style=service'])
  assert.notEqual(result.status, 0)
  assert.equal(existsSync(join(real, 'index.html')), false)
})

test('health must fail for an empty install and missing project context', () => {
  const base = temp()
  const result = run('health-check.mjs', [`--claude-dir=${join(base, 'claude')}`, `--project=${join(base, 'project')}`])
  assert.notEqual(result.status, 0, 'Missing installation must not be reported as healthy')
})


test('bare value flags fail before creating a site',()=>{
 for(const flag of ['--name','--headline','--target']) {
 const base=temp();const target=join(base,'site');const args=flag==='--target'?[flag,'--style=service']:[`--target=${target}`,'--style=service',flag];
 const result=spawnSync(process.execPath,[resolve(root,'scripts/create-site.mjs'),...args],{cwd:base,encoding:'utf8',timeout:15000});assert.notEqual(result.status,0);assert.equal(existsSync(join(base,'true')),false);assert.equal(existsSync(target),false);
 }
});

test("starter refuses symlink ancestors before writing",()=>{const base=temp();const real=join(base,"real");mkdirSync(real);symlinkSync(real,join(base,"alias"),"dir");const result=run("create-site.mjs",["--target="+join(base,"alias","site"),"--style=service"]);assert.notEqual(result.status,0);assert.equal(existsSync(join(real,"site")),false)});
