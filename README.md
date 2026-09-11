# Web Designer Agent Kit 4.0.0

Install Joe Che's starter context files, Web Designer agent, portable zero-dependency site starter CLI, static preview server, and web design skill stack for Mastermind and All Sorted participants.

---

## Quick Start: Pasteable AI Brief

Paste this into your AI assistant to generate a website in seconds:

```text
Use the Web Designer agent to build my website.
Business Name: Apex Advisory
Style Archetype: Service (or Portfolio, or Event)
Headline: Strategic Leadership Solutions
Primary CTA: Email contact@example.com
```

Or generate a starter site using the optional CLI:

```bash
# Generate a Service business site starter
npm run create:site -- --target=my-service-site --style=service --name="Apex Advisory" --headline="Strategic Leadership Solutions" --email="contact@example.com"

# Preview locally on 127.0.0.1
npm run preview -- --dir=my-service-site --port=3000
```

Available site styles: `service`, `portfolio`, `event`.

---

## What Gets Installed

By default, the offline installer populates the Web Designer agent (`agents/web-designer.md`) and 2 core local web design skills into `~/.claude` (or custom `--claude-dir`):

1. **Masterminds Web Designer** (`skills/masterminds-web-designer`)
2. **Frontend Design** (`skills/frontend-design`)

### Optional Remote Skills (`--extras`)

Participants can optionally pass `--extras` to clone 20 additional remote web design skills via git:
Impeccable, GSAP Core, GSAP Timeline, GSAP ScrollTrigger, GSAP Performance, Modern Web Design, Three.js WebGL, React Three Fiber, Motion/Framer, Lightweight 3D Effects, Web3D Integration Patterns, Scroll Reveal Libraries, Animated Component Libraries, Anime.js, Barba.js, GEO Content Optimizer, Meta Tags Optimizer, Schema Markup Generator, Technical SEO Checker, Content Quality Auditor.

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

Install the Web Designer agent and the 2 core local web design skills offline without requiring remote git access. My ./CLAUDE.md, ./USER.md, and ./SOUL.md files were installed in the previous step, so do not replace them.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use matching terminal commands.
- Default install preserves existing files.
- Use --upgrade to safely update previously managed files whose hashes match prior manifest, writing .candidate files for modified files.
- Use relative project paths. Treat "." as the website project root.
- After installing, run health check: node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.

Steps:
1. Make sure node is available.
2. Install agent and core skills:
   Mac: node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs
   Windows: node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
3. Run health check:
   Mac: node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.
   Windows: node .\.masterminds-web-designer-agent-kit\scripts\health-check.mjs --project=.
```

---

### Step 3: Create & Preview Site Starters

Use the zero-dependency CLI starter tool to generate responsive, accessible sites:

```bash
# Service Business (Warm Editorial Cream & Forest Green)
node scripts/create-site.mjs --target=my-service-site --style=service --name="Apex Advisory" --headline="Strategic Leadership Solutions" --email="contact@example.com"

# Creative Portfolio Showcase (Dark Obsidian & Solid Typography)
node scripts/create-site.mjs --target=my-portfolio-site --style=portfolio --name="Tandle Design" --headline="Editorial Web Architecture" --email="studio@example.com"

# Event / Workshop Experience (Midnight Violet & Ochre/Pink Poster Typography)
node scripts/create-site.mjs --target=my-event-site --style=event --name="Mastermind Summit" --headline="Founder Intensive 2026" --email="summit@example.com"

# Preview any generated site locally (Bound strictly to 127.0.0.1)
node scripts/preview.mjs --dir=my-service-site --port=3000
```

---

## Build-Review-Repair Routine & Verification

When updating or building websites with the kit, follow this empirical verification routine:

1. **Intake & Brief Verification:** Check `.masterminds-context/brief.json` for participant preferences.
2. **Local Build & File Inspection:** Ensure generated `index.html` and `styles.css` are valid, semantic, and non-empty.
3. **Accessibility Audit:** Verify 4.5:1 text contrast minimum, 44x44px touch targets, skip to content links, and `:focus-visible` styles.
4. **Security & Route Verification:** Ensure preview server runs locally bound to `127.0.0.1` and path traversal / dotfiles are blocked.
5. **Empirical Test Suite:** Run `npm test` (`node --test tests/*.test.mjs`) to verify installation and site creation suite.

Available package scripts:
- `npm run create:site` (generates zero-dependency site starter)
- `npm run preview` (starts local static server on 127.0.0.1)
- `npm run install:kit` (installs agent and core local skills)
- `npm run install:context` (installs `CLAUDE.md`, `USER.md`, and `SOUL.md`)
- `npm run health` (runs local health check script)
- `npm test` (runs test suite with Node standard test runner)
