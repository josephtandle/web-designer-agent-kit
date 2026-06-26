# Prompt 1: Install CLAUDE.md, USER.md, and SOUL.md Only

Paste this into Claude Code from the website project folder.

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
- If a file exists, write your proposed replacement to ./.masterminds-context/ instead.
- Use relative project paths in commands and explanations.
- CLAUDE.md should include Joe's Ultimate CLAUDE.md ideas: read before writing, verify before done, protect files, no secrets, simple task routing, autonomy with clear stop points, and web design standards.
- SOUL.md should follow the relevant UNI/Ooni spirit: genuinely useful, resourceful before asking, privacy-aware, values-aware, identity-aware, continuity through files, and focused on helping me build real assets.
- USER.md should be useful but easy to fill in: basic info, business, audience, offer, voice, website goals, services, proof, visual references, and contact links.

Run the correct commands for my system:

Mac:
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.

Windows PowerShell:
git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
node .\.masterminds-web-designer-agent-kit\scripts\install-context.mjs --target=.

After installing, show me:
- created files
- skipped files
- proposed replacement files
- a short explanation of what each file does
- the next step
```
