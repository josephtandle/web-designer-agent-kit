import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
const root = fileURLToPath(new URL('../', import.meta.url))

test('portable preview serves pages and rejects private files and symlink escapes', async () => {
  const base = mkdtempSync(join(tmpdir(), 'web-designer-preview-'))
  const site = join(base, 'site')
  const created = spawnSync(process.execPath, [join(root, 'scripts/create-site.mjs'), `--target=${site}`, '--style=service', '--name=Test Studio', '--headline=Clear work'], { encoding: 'utf8' })
  assert.equal(created.status, 0, created.stderr)
  writeFileSync(join(site, '.env'), 'private')
  writeFileSync(join(site, 'context.json'), '{"private":true}')
  const sibling = `${site}-outside`
  mkdirSync(sibling)
  writeFileSync(join(sibling, 'index.html'), 'outside-secret')
  symlinkSync(sibling, join(site, 'escape'), 'dir')
  const reservation = net.createServer()
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
  const port = reservation.address().port
  await new Promise(resolve => reservation.close(resolve))
  const server = spawn(process.execPath, [join(site, 'scripts/preview.mjs'), `--dir=${site}`, `--port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'] })
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Preview startup timed out')), 5000)
      server.stdout.on('data', () => { clearTimeout(timer); resolve() })
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}`)) })
    })
    const origin = `http://127.0.0.1:${port}`
    assert.equal((await fetch(origin)).status, 200)
    assert.equal((await fetch(`${origin}/styles.css`)).status, 200)
    for (const resource of ['.env', 'context.json', 'README.md', 'escape/index.html']) {
      const response = await fetch(`${origin}/${resource}`)
      assert.notEqual(response.status, 200, resource)
      assert.doesNotMatch(await response.text(), /outside-secret/)
    }
  } finally { server.kill() }
})

test('structured metadata preserves literal names and cannot terminate its script', () => {
  for (const style of ['service', 'portfolio', 'event']) {
    const site = join(mkdtempSync(join(tmpdir(), 'web-designer-schema-')), 'site')
    const name = 'A & B "Studio" \\ Works\nNew </script>'
    const result = spawnSync(process.execPath, [join(root, 'scripts/create-site.mjs'), `--target=${site}`, `--style=${style}`, `--name=${name}`, '--headline=A clear perspective'], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const html = readFileSync(join(site, 'index.html'), 'utf8')
    const script = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    if (script) {
      const metadata = JSON.parse(script[1])
      assert.equal(metadata.name, name)
    }
    assert.doesNotMatch(html, /EventScheduled/)
  }
})
