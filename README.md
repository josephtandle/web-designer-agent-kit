# Web Designer Agent Kit 3.0.0

Install Joe Che's starter context files, Web Designer agent, portable zero-dependency site starter CLI, static preview server, and curated web design skill stack for Mastermind and All Sorted participants.

## Quick Start: Build & Preview a Site

Generate a portable, zero-dependency site starter in seconds:

```bash
# Generate a Service business site starter
npm run create:site -- --target=my-service-site --style=service --name="Apex Advisory" --headline="Strategic Leadership Solutions" --email="contact@example.com"

# Preview locally on 127.0.0.1
npm run preview -- --dir=my-service-site --port=3000
```

Available styles: `service`, `portfolio`, `event`.

---

## What Gets Installed

The installer populates the Web Designer agent into `~/.claude/agents` and installs 22 curated web design skills:

1. Masterminds Web Designer
2. Frontend Design fallback
3. Impeccable
4. GSAP Core
5. GSAP Timeline
6. GSAP ScrollTrigger
7. GSAP Performance
8. Modern Web Design
9. Three.js WebGL
10. React Three Fiber
11. Motion / Framer
12. Lightweight 3D Effects
13. Web3D Integration Patterns
14. Scroll Reveal Libraries
15. Animated Component Libraries
16. Anime.js
17. Barba.js
18. GEO Content Optimizer
19. Meta Tags Optimizer
20. Schema Markup Generator
21. Technical SEO Checker
22. Content Quality Auditor

---

## Installation Steps

### Step 1: Install Starter Context Files Only

Paste this into your AI assistant from your website project folder (`.` represents project root):

```text
Install only my Mastermind starter context files for this website project.

You are working inside my current website project folder. Treat "." as the project root on both Mac and Windows.

Goal:
- Install ./CLAUDE.md
- Install ./USER.md
- Install ./SOUL.md

Use Joe Che's public Web Designer Agent Kit only for the context-file installer. Do not install the Web Designer agent yet. Do not install skills yet.

Rules:
- Do not overwrite existing files.
- If ./CLAUDE.md, ./USER.md, or ./SOUL.md already exists, leave it untouched.
- If a file exists, write the proposed replacement to ./.masterminds-context/ instead.
- Use relative project paths in commands and explanations.

Commands:
Mac:
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.

Windows PowerShell:
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .\.masterminds-web-designer-agent-kit\scripts\install-context.mjs --target=.
```

---

### Step 2: Install Web Designer Agent and Skills

Paste this into your AI assistant after `CLAUDE.md`, `USER.md`, and `SOUL.md` exist:

```text
Install Joe Che's Web Designer Agent Kit.

Install only the Web Designer agent and the 22 curated web design skills. My ./CLAUDE.md, ./USER.md, and ./SOUL.md files were installed in the previous step, so do not replace them.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use matching terminal commands.
- Do not overwrite any existing files.
- If a target file or skill already exists, leave it alone and report skipped.
- Use relative project paths. Treat "." as the website project root.
- Clone the kit into ./.masterminds-web-designer-agent-kit.
- After installing, run health check: node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.

Steps:
1. Make sure git and node are available.
2. Clone kit if not present:
   git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
3. Install agent and skills:
   Mac: node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs
   Windows: node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
4. Run health check:
   Mac: node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.
   Windows: node .\.masterminds-web-designer-agent-kit\scripts\health-check.mjs --project=.
```

---

### Step 3: Create & Preview Site Starters

Use the zero-dependency CLI starter tool to generate responsive, accessible sites:

```bash
# Service Business (Warm Editorial Cream & Forest Green)
node scripts/create-site.mjs --target=my-service-site --style=service --name="Apex Advisory" --headline="Strategic Leadership Solutions" --email="contact@example.com"

# Creative Portfolio Showcase (Dark Obsidian & Asymmetric Abstract Art)
node scripts/create-site.mjs --target=my-portfolio-site --style=portfolio --name="Tandle Design" --headline="Editorial Web Architecture" --email="studio@example.com"

# Event / Workshop Experience (Midnight Violet & Vibrant Magenta/Ochre)
node scripts/create-site.mjs --target=my-event-site --style=event --name="Mastermind Summit" --headline="Founder Intensive 2026" --email="summit@example.com"

# Preview any generated site locally (Bound strictly to 127.0.0.1)
node scripts/preview.mjs --dir=my-service-site --port=3000
```

---

### Step 4: Build and Revise Your Website

- First Build: Use `prompts/04-build-first-website.md`
- Revise Design: Use `prompts/05-revise-website.md`
- Launch Finish: Use `prompts/06-finish-website.md`

---

## Health Check and Command Compatibility

Run the health check using project relative script path:

```bash
node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.
```

Note: Complete offline health check parity is scheduled for completion in Round 3 release.

Available package scripts:
- `npm run create:site` (generates zero-dependency site starter)
- `npm run preview` (starts local static server on 127.0.0.1)
- `npm run install:kit` (installs agent and 22 curated skills)
- `npm run install:context` (installs `CLAUDE.md`, `USER.md`, and `SOUL.md`)
- `npm run health` (runs local health check script)
