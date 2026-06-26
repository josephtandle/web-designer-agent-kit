# Web Designer Agent Kit

Install Joe Che's Web Designer agent, a curated web design skill stack, and the starter context files for Mastermind students.

This kit is built for Cohort 3, Session 2. It is intentionally practical:

- no silent overwrites
- macOS and Windows compatible
- one installer for the Web Designer agent and curated skills
- one installer for `CLAUDE.md`, `USER.md`, and `SOUL.md`
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

## Install The Agent Kit

Paste this into Claude Code from any folder:

```text
Install Joe Che's Web Designer Agent Kit.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use the matching terminal commands.
- Do not overwrite any existing files.
- If a target file or skill already exists, leave it alone and report that it was skipped.
- If you need to replace something, ask me first.
- After installing, run the health check and summarize what was installed, skipped, or failed.

Steps:
1. Make sure git and node are available.
2. Clone the kit if it is not already on my computer:
   git clone https://github.com/josephtandle/web-designer-agent-kit.git
3. Enter the repo:
   cd web-designer-agent-kit
4. Run:
   node scripts/install-web-designer-kit.mjs
5. Then tell me the exact command to start using the Web Designer agent.
```

Manual command:

```bash
git clone https://github.com/josephtandle/web-designer-agent-kit.git
cd web-designer-agent-kit
node scripts/install-web-designer-kit.mjs
```

## Install Project Context Files

Run this from the website project folder where you want `CLAUDE.md`, `USER.md`, and `SOUL.md`:

```bash
node ../web-designer-agent-kit/scripts/install-context.mjs
```

If any of those files already exist, the installer leaves them untouched and writes proposed replacements to `.masterminds-context/`.

## Fill In Your Profile

After context files are installed, paste the prompt in `prompts/02-fill-user-and-soul.md` into Claude Code. Claude will ask questions and update `USER.md` and `SOUL.md`.

## Start Building

After the agent kit and context files are installed, paste the prompt in `prompts/04-build-first-website.md`.

## Health Check

```bash
node scripts/health-check.mjs
```

The health check verifies:

- Claude skill directory exists
- Web Designer agent file exists
- curated skills are installed or skipped
- context files exist in the current project

