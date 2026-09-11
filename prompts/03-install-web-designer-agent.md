# Prompt 3: Install The Web Designer Agent Kit

Paste this into Claude Code.

```text
Install Joe Che's Web Designer Agent Kit.

You are working inside my current website project folder. Treat "." as the project root on both Mac and Windows.

Install the Web Designer agent and the 2 core local web design skills offline without git calls. (Optional 20 remote skills can be cloned with --extras if requested). My ./CLAUDE.md, ./USER.md, and ./SOUL.md files were installed in the previous step, so do not replace them.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use the matching terminal commands.
- Do not overwrite any existing files by default.
- Use --upgrade to safely update previously managed unmodified files while preserving customized installs with reviewable .candidate files.
- If node is missing, stop and tell me exactly what to install.
- Use relative project paths for this project.
- Use the existing ./.masterminds-web-designer-agent-kit folder if it already exists.
- After installing, run the health check with --project=.

Steps:
1. Check:
   node --version
2. Install the offline core agent and skills:
   Mac:
   node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs

   Windows PowerShell:
   node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
3. Run the health check:
   Mac:
   node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.

   Windows PowerShell:
   node .\.masterminds-web-designer-agent-kit\scripts\health-check.mjs --project=.
4. Tell me:
   - installed core skills
   - skipped skills
   - whether the Web Designer agent is ready
   - whether ./CLAUDE.md, ./USER.md, and ./SOUL.md are present
   - the next prompt to paste
```
