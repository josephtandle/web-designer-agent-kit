# Prompt 3: Install The Web Designer Agent Kit

Paste this into Claude Code.

```text
Install Joe Che's Web Designer Agent Kit.

You are working inside my current website project folder. Treat "." as the project root on both Mac and Windows.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use the matching terminal commands.
- Do not overwrite any existing files.
- If a target skill or agent already exists, leave it alone and report it as skipped.
- If git, node, or npm is missing, stop and tell me exactly what to install.
- If one external skill repo fails, continue installing the rest and report the failure clearly.
- Use relative project paths for the repo folder and context files.
- Clone the kit into ./.masterminds-web-designer-agent-kit.
- After installing, run the health check with --project=.

Steps:
1. Check:
   git --version
   node --version
   npm --version
2. If the repo is not already in this project, clone it:
   git clone https://github.com/josephtandle/web-designer-agent-kit .masterminds-web-designer-agent-kit
3. Install context files:
   Mac:
   node .masterminds-web-designer-agent-kit/scripts/install-context.mjs --target=.

   Windows PowerShell:
   node .\.masterminds-web-designer-agent-kit\scripts\install-context.mjs --target=.
4. Install the agent and skills:
   Mac:
   node .masterminds-web-designer-agent-kit/scripts/install-web-designer-kit.mjs

   Windows PowerShell:
   node .\.masterminds-web-designer-agent-kit\scripts\install-web-designer-kit.mjs
5. Run the health check:
   Mac:
   node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.

   Windows PowerShell:
   node .\.masterminds-web-designer-agent-kit\scripts\health-check.mjs --project=.
6. Tell me:
   - installed skills
   - skipped skills
   - failed skills
   - created/skipped CLAUDE.md, USER.md, and SOUL.md files
   - the next prompt to paste
```
