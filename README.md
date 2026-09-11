# Web Designer Agent Kit 2.0.0

Install Joe Che's starter context files, Web Designer agent, and curated web design skill stack for Mastermind and All Sorted participants.

## Quick Start: Short First-Build Prompt

If your context files are already installed, paste this prompt into your AI assistant from your website project folder:

```text
Use the Web Designer agent and Masterminds Web Designer skill stack to build my website.
Read CLAUDE.md, USER.md, and SOUL.md if present.
Load skills/masterminds-web-designer/references/design-directions.md.
Ask at most 3 questions if vital info is missing.
Offer at most 3 visual directions with a recommendation and default option.
Build a responsive, accessible website with working CTA links and honest details.
Save decisions to .masterminds-context/design-decisions.json and show me how to preview it locally.
```

---

## What Gets Installed

The default installer populates the Web Designer agent into `~/.claude/agents` and installs 22 curated web design skills:

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

Manual Mac commands:

```bash
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.
```

Manual Windows PowerShell commands:

```powershell
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
- After installing, run health check against --project=. and summarize output.

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

Manual Mac commands:

```bash
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs
node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.
```

Manual Windows PowerShell commands:

```powershell
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
node .\.masterminds-web-designer-agent-kit\scripts\health-check.mjs --project=.
```

---

### Step 3: Fill In Profile Details

After context files are installed, paste the prompt in `prompts/02-fill-user-and-soul.md` into your AI assistant. It will update `USER.md` and `SOUL.md`.

---

### Step 4: Build and Revise Your Website

- First Build: Use `prompts/04-build-first-website.md`
- Revise Design: Use `prompts/05-revise-website.md`
- Launch Finish: Use `prompts/06-finish-website.md`

---

## Health Check and Command Compatibility

Run the health check at any time to verify installation status:

```bash
npm run health -- --project=.
```

Available package scripts:
- `npm run install:kit` (installs agent and 22 curated skills)
- `npm run install:context` (installs `CLAUDE.md`, `USER.md`, and `SOUL.md`)
- `npm run health` (verifies agent, skills, and context files)
