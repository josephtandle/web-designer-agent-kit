#!/usr/bin/env node
import { existsSync, statSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const args = process.argv.slice(2)
let claudeDirArg = null
let projectArg = null
let help = false

const allowedFlags = new Set(['help', 'h'])

for (const arg of args) {
  if (arg === '-h' || arg === '--help') {
    help = true
  } else if (arg.startsWith('--claude-dir=')) {
    claudeDirArg = arg.slice('--claude-dir='.length)
  } else if (arg.startsWith('--project=')) {
    projectArg = arg.slice('--project='.length)
  } else if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (!allowedFlags.has(key)) {
      console.error(`Error: Unknown option '--${key}'.`)
      process.exit(1)
    }
  } else if (arg.startsWith('-')) {
    console.error(`Error: Unknown option '${arg}'.`)
    process.exit(1)
  } else {
    console.error(`Error: Unknown argument '${arg}'.`)
    process.exit(1)
  }
}

if (help) {
  console.log(`
Web Designer Agent Kit Health Check

Usage:
  node scripts/health-check.mjs [--claude-dir=<path>] [--project=<path>]

Options:
  --claude-dir=<path> Directory for Claude configuration (default: ~/.claude)
  --project=<path>    Target project directory (default: current working directory)
  --help, -h          Show help message
`)
  process.exit(0)
}

const home = homedir()
const claudeDir = claudeDirArg ? resolve(claudeDirArg) : join(home, '.claude')
const skillsDir = join(claudeDir, 'skills')
const agentsDir = join(claudeDir, 'agents')
const projectDir = resolve(projectArg || process.cwd())

function isNonEmptyFile(path) {
  if (!existsSync(path)) return false
  try {
    return statSync(path).size > 0
  } catch (e) {
    return false
  }
}

function computeHash(filePath) {
  if (!isNonEmptyFile(filePath)) return null
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

let healthy = true

console.log('Web Designer Agent Kit health check\n')
console.log(`${existsSync(skillsDir) ? 'OK' : 'MISSING'} skills directory: ${skillsDir}`)
console.log(`${existsSync(agentsDir) ? 'OK' : 'MISSING'} agents directory: ${agentsDir}`)

// Check core agent
const agentPath = join(agentsDir, 'web-designer.md')
const agentOk = isNonEmptyFile(agentPath)
if (!agentOk) healthy = false
console.log(`${agentOk ? 'OK' : 'MISSING/EMPTY'} web-designer agent`)

// Check core skills
const coreSkills = ['masterminds-web-designer', 'frontend-design']
for (const skill of coreSkills) {
  const skillFile = join(skillsDir, skill, 'SKILL.md')
  const ok = isNonEmptyFile(skillFile)
  if (!ok) healthy = false
  console.log(`${ok ? 'OK' : 'MISSING/EMPTY'} core skill: ${skill}`)
}

// Optional remote extra skills
const optionalSkills = [
  'impeccable',
  'gsap-core',
  'gsap-timeline',
  'gsap-scrolltrigger',
  'gsap-performance',
  'modern-web-design',
  'threejs-webgl',
  'react-three-fiber',
  'motion-framer',
  'lightweight-3d-effects',
  'web3d-integration-patterns',
  'scroll-reveal-libraries',
  'animated-component-libraries',
  'animejs',
  'barba-js',
  'geo-content-optimizer',
  'meta-tags-optimizer',
  'schema-markup-generator',
  'technical-seo-checker',
  'content-quality-auditor',
]

let optionalCount = 0
for (const skill of optionalSkills) {
  const ok = isNonEmptyFile(join(skillsDir, skill, 'SKILL.md'))
  if (ok) optionalCount++
  console.log(`${ok ? 'OK' : 'OPTIONAL-MISSING'} ${skill}`)
}

console.log(`\nOptional skills installed: ${optionalCount}/${optionalSkills.length}`)
console.log(`Project context target: ${projectDir}`)

// Check project context
const contextFiles = ['CLAUDE.md', 'USER.md', 'SOUL.md']
let contextOk = true
for (const name of contextFiles) {
  const target = join(projectDir, name)
  const ok = isNonEmptyFile(target)
  if (!ok) {
    healthy = false
    contextOk = false
  }
  console.log(`${ok ? 'OK' : 'MISSING/EMPTY'} project ${name}`)
}

if (!contextOk) {
  console.log('\nInstructions to fix missing project context:')
  console.log(`  Run: node scripts/install-context.mjs --target=${projectDir}`)
}

// Verify manifest hashes if present
const manifestPath = join(claudeDir, 'masterminds-web-designer-kit.json')
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    console.log(`\nInstalled Manifest Version: ${manifest.version || 'unknown'}`)
    if (manifest.files) {
      let hashFailures = 0
      for (const relPath of ['agents/web-designer.md', 'skills/masterminds-web-designer/SKILL.md', 'skills/frontend-design/SKILL.md']) {
        const fullPath = join(claudeDir, relPath)
        const expected = manifest.files[relPath]
        const actual = computeHash(fullPath)
        if (expected && actual !== expected) {
          hashFailures++
          console.log(`WARNING: Hash mismatch for ${relPath}`)
        }
      }
    }
  } catch (e) {
    console.log('\nWARNING: Manifest file malformed')
  }
}

if (!healthy) {
  console.error('\nHealth check FAILED: One or more core agent, core skills, or project context files are missing or empty.')
  process.exit(1)
} else {
  console.log('\nHealth check PASSED: Core kit and project context are healthy.')
  process.exit(0)
}
