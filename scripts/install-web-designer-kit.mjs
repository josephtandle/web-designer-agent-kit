#!/usr/bin/env node
import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync, lstatSync, readdirSync } from 'node:fs'
import { homedir, tmpdir, platform } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HOME = homedir()

const args = process.argv.slice(2)
let claudeDirArg = null
let REPLACE = false
let UPGRADE = false
let EXTRAS = false
let HELP = false

const allowedFlags = new Set(['replace', 'upgrade', 'extras', 'help', 'h'])

for (const arg of args) {
  if (arg === '-h' || arg === '--help') {
    HELP = true
  } else if (arg.startsWith('--claude-dir=')) {
    claudeDirArg = arg.slice('--claude-dir='.length)
  } else if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (!allowedFlags.has(key)) {
      console.error(`Error: Unknown option '--${key}'.`)
      process.exit(1)
    }
    if (key === 'replace') REPLACE = true
    if (key === 'upgrade') UPGRADE = true
    if (key === 'extras') EXTRAS = true
  } else if (arg.startsWith('-')) {
    console.error(`Error: Unknown option '${arg}'.`)
    process.exit(1)
  } else {
    console.error(`Error: Unknown argument '${arg}'.`)
    process.exit(1)
  }
}

if (HELP) {
  console.log(`
Web Designer Agent Kit Installer (4.0.0)

Usage:
  node scripts/install-web-designer-kit.mjs [--claude-dir=<path>] [--replace] [--upgrade] [--extras]

Options:
  --claude-dir=<path> Directory for Claude configuration (default: ~/.claude)
  --replace           Back up and overwrite existing files
  --upgrade           Update previously managed unmodified files, write .candidate for modified
  --extras            Opt-in to clone remote skill repositories via git
  --help, -h          Show help
`)
  process.exit(0)
}

const CLAUDE_DIR = claudeDirArg ? resolve(claudeDirArg) : join(HOME, '.claude')
const SKILLS_DIR = join(CLAUDE_DIR, 'skills')
const AGENTS_DIR = join(CLAUDE_DIR, 'agents')
const STATE_FILE = join(CLAUDE_DIR, 'masterminds-web-designer-kit.json')
const TEMP = join(tmpdir(), `web-designer-agent-kit-${Date.now()}`)

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

function computeHash(filePath) {
  if (!existsSync(filePath) || lstatSync(filePath).isDirectory()) return null
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

function checkSymlink(path) {
  if (existsSync(path)) {
    if (lstatSync(path).isSymbolicLink()) {
      throw new Error(`Path '${path}' is a symbolic link. Symlinks are refused for safety.`)
    }
  }
}

function backupPath(target) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${target}.backup-${stamp}`
}

let priorState = {}
if (existsSync(STATE_FILE)) {
  try {
    priorState = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
  } catch (e) {
    // Ignore invalid state file
  }
}
const priorFiles = priorState.files || {}

function processFileInstallation(source, target, label, relPath) {
  checkSymlink(source)
  if (existsSync(target)) checkSymlink(target)

  if (!existsSync(source)) {
    failed.push(`${label}: source missing at ${source}`)
    return
  }

  if (existsSync(target)) {
    if (REPLACE) {
      const backup = backupPath(target)
      cpSync(target, backup)
      mkdirSync(dirname(target), { recursive: true })
      cpSync(source, target)
      installed.push(`${label} (replaced)`)
      return
    }

    if (UPGRADE) {
      const currentHash = computeHash(target)
      const managedHash = priorFiles[relPath]
      if (managedHash && currentHash === managedHash) {
        mkdirSync(dirname(target), { recursive: true })
        cpSync(source, target)
        installed.push(`${label} (upgraded)`)
        return
      } else {
        const candidatePath = `${target}.candidate`
        mkdirSync(dirname(target), { recursive: true })
        cpSync(source, candidatePath)
        skipped.push(`${label}: preserved customized install; wrote candidate to ${candidatePath}`)
        return
      }
    }

    skipped.push(`${label}: already exists`)
    return
  }

  mkdirSync(dirname(target), { recursive: true })
  cpSync(source, target)
  installed.push(label)
}

function processDirectoryInstallation(sourceDir, targetDir, label, baseRelPath) {
  checkSymlink(sourceDir)
  if (existsSync(targetDir)) checkSymlink(targetDir)

  if (!existsSync(sourceDir)) {
    failed.push(`${label}: source dir missing at ${sourceDir}`)
    return
  }

  if (existsSync(targetDir) && REPLACE) {
    const backup = backupPath(targetDir)
    cpSync(targetDir, backup, { recursive: true })
    rmSync(targetDir, { recursive: true, force: true })
  }

  function walk(src, tgt, subRel) {
    const entries = readdirSync(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const tgtPath = join(tgt, entry.name)
      const relPath = join(subRel, entry.name)
      checkSymlink(srcPath)

      if (entry.isDirectory()) {
        walk(srcPath, tgtPath, relPath)
      } else if (entry.isFile()) {
        processFileInstallation(srcPath, tgtPath, `${label}/${entry.name}`, relPath)
      }
    }
  }

  walk(sourceDir, targetDir, baseRelPath)
}

function cloneRepo(name, url) {
  const target = join(TEMP, name)
  const result = spawnSync('git', ['clone', '--depth', '1', url, target], {
    timeout: 20000,
    stdio: 'pipe',
    shell: platform() === 'win32',
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`git clone failed: ${result.stderr || result.stdout || 'timeout or network failure'}`)
  }
  return target
}

function writeState() {
  const fileHashes = {}

  function recordHashes(dir, baseRel) {
    if (!existsSync(dir)) return
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relPath = join(baseRel, entry.name)
      if (entry.isDirectory()) {
        recordHashes(fullPath, relPath)
      } else if (entry.isFile()) {
        fileHashes[relPath] = computeHash(fullPath)
      }
    }
  }

  recordHashes(join(CLAUDE_DIR, 'agents'), 'agents')
  recordHashes(join(CLAUDE_DIR, 'skills'), 'skills')

  const payload = {
    version: '4.0.0',
    installedAt: new Date().toISOString(),
    kit: 'web-designer-agent-kit',
    files: fileHashes,
    installed,
    skipped,
    failed,
    extrasIncluded: EXTRAS,
  }
  mkdirSync(dirname(STATE_FILE), { recursive: true })
  writeFileSync(STATE_FILE, `${JSON.stringify(payload, null, 2)}\n`)
}

function main() {
  mkdirSync(SKILLS_DIR, { recursive: true })
  mkdirSync(AGENTS_DIR, { recursive: true })

  for (const item of localSkills) {
    processDirectoryInstallation(join(ROOT, item.from), join(SKILLS_DIR, item.to), item.to, join('skills', item.to))
  }
  for (const item of localAgents) {
    processFileInstallation(join(ROOT, item.from), join(AGENTS_DIR, item.to), `agent:${item.to}`, join('agents', item.to))
  }

  if (EXTRAS) {
    mkdirSync(TEMP, { recursive: true })
    for (const [name, repo] of Object.entries(repos)) {
      try {
        const repoPath = cloneRepo(name, repo.url)
        for (const skill of repo.skills) {
          processDirectoryInstallation(join(repoPath, skill.from), join(SKILLS_DIR, skill.to), skill.to, join('skills', skill.to))
        }
      } catch (error) {
        failed.push(`${name}: ${error.message}`)
      }
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
  console.log('  2. From your website project folder, run context installer:')
  console.log('     node scripts/install-context.mjs --target=.')
  console.log('  3. Health check from your website project folder:')
  console.log('     node scripts/health-check.mjs --project=.')
}

main()
