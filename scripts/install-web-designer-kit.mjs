#!/usr/bin/env node
import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { homedir, tmpdir, platform } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HOME = homedir()
const CLAUDE_DIR = join(HOME, '.claude')
const SKILLS_DIR = join(CLAUDE_DIR, 'skills')
const AGENTS_DIR = join(CLAUDE_DIR, 'agents')
const STATE_FILE = join(CLAUDE_DIR, 'masterminds-web-designer-kit.json')
const TEMP = join(tmpdir(), `web-designer-agent-kit-${Date.now()}`)
const REPLACE = process.argv.includes('--replace')

const repos = {
  impeccable: {
    url: 'https://github.com/pbakaus/impeccable.git',
    skills: [{ from: '.claude/skills/impeccable', to: 'impeccable' }],
  },
  gsap: {
    url: 'https://github.com/greensock/gsap-skills.git',
    skills: [
      { from: 'skills/gsap-core', to: 'gsap-core' },
      { from: 'skills/gsap-timeline', to: 'gsap-timeline' },
      { from: 'skills/gsap-scrolltrigger', to: 'gsap-scrolltrigger' },
      { from: 'skills/gsap-performance', to: 'gsap-performance' },
    ],
  },
  design3d: {
    url: 'https://github.com/freshtechbro/claudedesignskills.git',
    skills: [
      { from: '.claude/skills/modern-web-design', to: 'modern-web-design' },
      { from: '.claude/skills/threejs-webgl', to: 'threejs-webgl' },
      { from: '.claude/skills/react-three-fiber', to: 'react-three-fiber' },
      { from: '.claude/skills/motion-framer', to: 'motion-framer' },
      { from: '.claude/skills/lightweight-3d-effects', to: 'lightweight-3d-effects' },
      { from: '.claude/skills/web3d-integration-patterns', to: 'web3d-integration-patterns' },
      { from: '.claude/skills/scroll-reveal-libraries', to: 'scroll-reveal-libraries' },
      { from: '.claude/skills/animated-component-libraries', to: 'animated-component-libraries' },
      { from: '.claude/skills/animejs', to: 'animejs' },
      { from: '.claude/skills/barba-js', to: 'barba-js' },
    ],
  },
  seoGeo: {
    url: 'https://github.com/aaron-he-zhu/seo-geo-claude-skills.git',
    skills: [
      { from: 'build/geo-content-optimizer', to: 'geo-content-optimizer' },
      { from: 'build/meta-tags-optimizer', to: 'meta-tags-optimizer' },
      { from: 'build/schema-markup-generator', to: 'schema-markup-generator' },
      { from: 'optimize/technical-seo-checker', to: 'technical-seo-checker' },
      { from: 'cross-cutting/content-quality-auditor', to: 'content-quality-auditor' },
    ],
  },
}

const localSkills = [
  { from: 'skills/masterminds-web-designer', to: 'masterminds-web-designer' },
  { from: 'skills/frontend-design', to: 'frontend-design' },
]

const localAgents = [
  { from: 'agents/web-designer.md', to: 'web-designer.md' },
]

const installed = []
const skipped = []
const failed = []

function run(cmd, args, cwd = ROOT) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: platform() === 'win32',
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed\n${result.stderr || result.stdout}`)
  }
  return result.stdout
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

function backupPath(target) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${target}.backup-${stamp}`
}

function safeCopyDir(source, target, label) {
  if (!existsSync(source)) {
    failed.push(`${label}: source missing at ${source}`)
    return
  }
  if (existsSync(target)) {
    if (!REPLACE) {
      skipped.push(`${label}: already exists`)
      return
    }
    const backup = backupPath(target)
    cpSync(target, backup, { recursive: true })
    rmSync(target, { recursive: true, force: true })
    skipped.push(`${label}: backed up existing copy to ${backup}`)
  }
  ensureDir(dirname(target))
  cpSync(source, target, { recursive: true })
  installed.push(label)
}

function safeCopyFile(source, target, label) {
  if (!existsSync(source)) {
    failed.push(`${label}: source missing at ${source}`)
    return
  }
  if (existsSync(target)) {
    if (!REPLACE) {
      skipped.push(`${label}: already exists`)
      return
    }
    const backup = backupPath(target)
    cpSync(target, backup)
    skipped.push(`${label}: backed up existing copy to ${backup}`)
  }
  ensureDir(dirname(target))
  cpSync(source, target)
  installed.push(label)
}

function cloneRepo(name, url) {
  const target = join(TEMP, name)
  run('git', ['clone', '--depth', '1', url, target])
  return target
}

function writeState() {
  const payload = {
    installedAt: new Date().toISOString(),
    kit: 'web-designer-agent-kit',
    installed,
    skipped,
    failed,
    selectedSkillCount: 22,
  }
  writeFileSync(STATE_FILE, `${JSON.stringify(payload, null, 2)}\n`)
}

function main() {
  ensureDir(SKILLS_DIR)
  ensureDir(AGENTS_DIR)
  ensureDir(TEMP)

  for (const item of localSkills) {
    safeCopyDir(join(ROOT, item.from), join(SKILLS_DIR, item.to), item.to)
  }
  for (const item of localAgents) {
    safeCopyFile(join(ROOT, item.from), join(AGENTS_DIR, item.to), `agent:${item.to}`)
  }

  for (const [name, repo] of Object.entries(repos)) {
    try {
      const repoPath = cloneRepo(name, repo.url)
      for (const skill of repo.skills) {
        safeCopyDir(join(repoPath, skill.from), join(SKILLS_DIR, skill.to), skill.to)
      }
    } catch (error) {
      failed.push(`${name}: ${error.message}`)
    }
  }

  writeState()

  console.log('\nWeb Designer Agent Kit install complete.\n')
  console.log(`Installed: ${installed.length}`)
  installed.forEach((item) => console.log(`  + ${item}`))
  console.log(`Skipped: ${skipped.length}`)
  skipped.forEach((item) => console.log(`  - ${item}`))
  console.log(`Failed: ${failed.length}`)
  failed.forEach((item) => console.log(`  ! ${item}`))
  console.log('\nNext:')
  console.log('  1. Restart Claude Code so it reloads skills.')
  console.log('  2. From your website project folder, run the context installer with a relative path.')
  console.log('     Mac: node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.')
  console.log('     Windows: node .\\.masterminds-web-designer-agent-kit\\scripts\\install-context.mjs --target=.')
  console.log('  3. Health check from your website project folder:')
  console.log('     Mac: node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.')
  console.log('     Windows: node .\\.masterminds-web-designer-agent-kit\\scripts\\health-check.mjs --project=.')
  console.log('  4. Ask: Use the Web Designer agent to build my first website.')
}

main()
