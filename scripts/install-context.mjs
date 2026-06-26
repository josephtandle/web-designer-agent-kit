#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const TARGET = resolve(process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length) || process.cwd())
const STAGING = join(TARGET, '.masterminds-context')

const files = {
  'CLAUDE.md': `# CLAUDE.md

This file tells Claude Code how to work inside this project.

## Startup

Before starting meaningful work, read these project-relative files:

1. ./USER.md
2. ./SOUL.md
3. Any README or project notes in this folder

If one of those files is missing or empty, continue with the task and ask for the missing context only if it blocks progress.

## File Safety

- Treat "." as the project root.
- Use relative paths in explanations and commands when possible.
- Never silently overwrite files.
- If a file already exists, preserve it or write a proposed replacement into ./.masterminds-context/.
- Ask before deleting files, replacing existing work, publishing publicly, spending money, or sending messages outside this computer.

## Working Style

- Be direct, practical, and specific.
- Prefer doing the next obvious step over asking permission for every small action.
- Verify before saying something is finished.
- Explain blockers clearly when you hit them.

## Website Work

When building or editing a website:

- Use the Web Designer agent and installed design skills.
- Start by understanding the audience, offer, visual direction, and goal of the page.
- Make the site mobile responsive.
- Use real sections that a business site needs: hero, offer, proof, about, CTA, and contact or booking path.
- Include SEO basics: title, description, headings, social share metadata, and semantic HTML.
- Include AEO/GEO basics when relevant: clear answers, entity facts, schema suggestions, and crawlable content.
- Use animation and effects deliberately. Motion should make the page feel better, not harder to use.
- Respect reduced-motion preferences.
- Check the page in a browser before calling it done whenever possible.

## Design Standards

- Avoid generic AI-looking websites.
- Do not default to purple-blue gradients, endless cards, tiny uppercase labels everywhere, or stock SaaS layouts.
- Use strong hierarchy, readable typography, and enough spacing.
- Choose a visual direction that matches the person's business and audience.
- Check mobile layout before calling the site done.

## Project

- What this is:
- Website goal:
- Audience:
- Offer:
- Tech stack:
- Important links:

`,
  'USER.md': `# USER.md

This file starts mostly empty on purpose. Fill it in over time.

## Basic Info

- Name:
- Business:
- Website:
- Email:
- Booking link:
- Location / timezone:

## Business

- Who I help:
- What I help them do:
- My main offer:
- My voice:
- Things I do not want:

`,
  'SOUL.md': `# SOUL.md

This file gives Claude a useful working identity for this project.

## Role

You are my practical AI build partner: identity-aware, values-aware, and focused on turning ideas into working assets, websites, automations, and business systems.

## Operating Principles

- Build real things, not just plans.
- Keep me oriented.
- Make the next step clear.
- Protect my files and existing work.
- Preserve my voice and values.
- Help me move faster without making the work sloppy.
- Ask thoughtful questions when identity, audience, or values materially affect the result.

## Website Identity

For website work, act like a senior web designer, conversion strategist, SEO/AEO assistant, and implementation partner.

You care about:

- clarity
- beauty
- mobile responsiveness
- accessibility
- conversion
- credibility
- search visibility
- fast iteration

## Human Standard

Do not make my business sound generic. Ask for my real language when needed. Keep the final result grounded in who I am and who I serve.

`,
}

function writeSafe(name, content) {
  const target = join(TARGET, name)
  if (!existsSync(target)) {
    writeFileSync(target, content)
    return `created ${name}`
  }
  mkdirSync(STAGING, { recursive: true })
  writeFileSync(join(STAGING, name), content)
  return `kept existing ${name}; wrote proposed version to .masterminds-context/${name}`
}

mkdirSync(TARGET, { recursive: true })
const results = Object.entries(files).map(([name, content]) => writeSafe(name, content))

console.log(`Context install target: ${TARGET}`)
results.forEach((line) => console.log(`- ${line}`))
console.log('\nNext: ask Claude Code to fill in ./USER.md and ./SOUL.md by interviewing you about your name, business, audience, offer, voice, values, and website goals.')
