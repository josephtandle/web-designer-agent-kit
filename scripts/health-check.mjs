#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const home = homedir()
const skills = join(home, '.claude', 'skills')
const agents = join(home, '.claude', 'agents')

const expectedSkills = [
  'masterminds-web-designer',
  'frontend-design',
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

console.log('Web Designer Agent Kit health check\n')
console.log(`${existsSync(skills) ? 'OK' : 'MISSING'} skills directory: ${skills}`)
console.log(`${existsSync(agents) ? 'OK' : 'MISSING'} agents directory: ${agents}`)
console.log(`${existsSync(join(agents, 'web-designer.md')) ? 'OK' : 'MISSING'} web-designer agent`)

let installed = 0
for (const skill of expectedSkills) {
  const ok = existsSync(join(skills, skill, 'SKILL.md'))
  if (ok) installed += 1
  console.log(`${ok ? 'OK' : 'MISSING'} ${skill}`)
}

console.log(`\nInstalled skills: ${installed}/${expectedSkills.length}`)
console.log(`${existsSync('CLAUDE.md') ? 'OK' : 'MISSING'} project CLAUDE.md`)
console.log(`${existsSync('USER.md') ? 'OK' : 'MISSING'} project USER.md`)
console.log(`${existsSync('SOUL.md') ? 'OK' : 'MISSING'} project SOUL.md`)

