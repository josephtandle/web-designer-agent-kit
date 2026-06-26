# Prompt 1: Install CLAUDE.md, USER.md, and SOUL.md

Paste this into Claude Code from the website project folder.

```text
Install my Mastermind starter context files for this project.

Rules:
- Do not overwrite existing files.
- If CLAUDE.md, USER.md, or SOUL.md already exists, leave it untouched.
- If a file already exists, write the proposed new version to .masterminds-context/ instead.
- Keep USER.md basic and mostly empty.
- Keep SOUL.md relevant to a Mastermind participant building websites, assets, and business systems.
- After installing, show me exactly which files were created and which were skipped.

Use the Web Designer Agent Kit installer if it exists:
node ../web-designer-agent-kit/scripts/install-context.mjs

If that path does not exist, find the web-designer-agent-kit folder on my computer and run:
node scripts/install-context.mjs
```

