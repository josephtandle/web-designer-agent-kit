# Prompt 1: Install CLAUDE.md, USER.md, and SOUL.md

Paste this into Claude Code from the website project folder.

```text
Create my Mastermind starter context files in this website project.

You are working inside my current project folder. Treat "." as the project root on both Mac and Windows.

Create these files only if they do not already exist:
- ./CLAUDE.md
- ./USER.md
- ./SOUL.md

Rules:
- Do not overwrite existing files.
- If ./CLAUDE.md, ./USER.md, or ./SOUL.md already exists, leave it untouched.
- If a file exists, write your proposed replacement to ./.masterminds-context/ instead.
- Use only relative project paths in your commands and explanations.
- Keep USER.md basic and mostly empty.
- Keep SOUL.md relevant to a Mastermind participant building websites, assets, and business systems. Follow the spirit of UNI/Ooni: practical, identity-aware, values-aware, and focused on building real things.
- CLAUDE.md should be excellent: clear startup rules, no-overwrite rules, verification standards, web design standards, agent/skill usage, and instructions to read USER.md and SOUL.md.

CLAUDE.md must tell Claude Code:
- Read ./USER.md and ./SOUL.md before meaningful work.
- Use the Web Designer agent for website work.
- Protect existing files.
- Verify before saying something is finished.
- Build websites with strong design, mobile responsiveness, accessibility, SEO, AEO/GEO basics, and tasteful motion.
- Keep responses direct, practical, and specific.

If the Web Designer Agent Kit is already cloned in this project, use:
Mac:
node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.

Windows PowerShell:
node .\.masterminds-web-designer-agent-kit\scripts\install-context.mjs --target=.

After installing, show me:
- created files
- skipped files
- proposed replacement files
- the next command I should run
```
