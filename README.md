# Web Designer Agent Kit

Install Joe Che's starter context files, Web Designer agent, and curated web design skill stack for Mastermind students.

This kit is built for Cohort 3, Session 2. It is intentionally practical:

- no silent overwrites
- macOS and Windows compatible
- one installer for `CLAUDE.md`, `USER.md`, and `SOUL.md`
- one installer for the Web Designer agent and curated skills
- one profile prompt students can fill in before building their site

## What Gets Installed

The default Web Designer stack installs 22 skills:

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

It also installs the `web-designer` Claude agent into `~/.claude/agents`.

## Recommended Session 2 Flow

1. Start Claude Code from Terminal:

```bash
claude --dangerously-skip-permissions
```

2. Install context files only.
3. Install the Web Designer agent and skills.
4. Build the first website.

## Step 1: Install Context Files Only

Paste this into Claude Code from the website project folder. It uses `.` as the project root on Mac and Windows.

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

## Step 2: Install The Web Designer Agent Kit

Paste this into Claude Code after `CLAUDE.md`, `USER.md`, and `SOUL.md` exist.

```text
Install Joe Che's Web Designer Agent Kit.

Install only the Web Designer agent and the 22 curated web design skills. My ./CLAUDE.md, ./USER.md, and ./SOUL.md files were installed in the previous step, so do not replace them.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use the matching terminal commands.
- Do not overwrite any existing files.
- If a target file or skill already exists, leave it alone and report that it was skipped.
- If you need to replace something, ask me first.
- Use relative project paths. Treat "." as the website project root.
- Clone the repo into ./.masterminds-web-designer-agent-kit.
- After installing, run the health check against --project=. and summarize what was installed, skipped, or failed.

Steps:
1. Make sure git and node are available.
2. Clone the kit into this project if it is not already here:
   git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
3. Install the agent and skills:
   Mac: node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs
   Windows: node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
4. Run the health check:
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

If any of those files already exist, the installer leaves them untouched and writes proposed replacements to `.masterminds-context/`.

## Fill In Your Profile

After context files are installed, paste the prompt in `prompts/02-fill-user-and-soul.md` into Claude Code. Claude will ask questions and update `USER.md` and `SOUL.md`.

## Start Building

After the agent kit and context files are installed, paste the prompt in `prompts/04-build-first-website.md`.

## Health Check

```bash
node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.
```

The health check verifies:

- Claude skill directory exists
- Web Designer agent file exists
- curated skills are installed or skipped
- context files exist in the current project
