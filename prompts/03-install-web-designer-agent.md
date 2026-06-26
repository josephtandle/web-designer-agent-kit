# Prompt 3: Install The Web Designer Agent Kit

Paste this into Claude Code.

```text
Install Joe Che's Web Designer Agent Kit.

Rules:
- Detect whether I am on Mac, Windows PowerShell, or Windows Command Prompt.
- Use the matching terminal commands.
- Do not overwrite any existing files.
- If a target skill or agent already exists, leave it alone and report it as skipped.
- If git, node, or npm is missing, stop and tell me exactly what to install.
- If one external skill repo fails, continue installing the rest and report the failure clearly.
- After installing, run the health check.

Steps:
1. Check:
   git --version
   node --version
   npm --version
2. If the repo is not already on my computer, clone it:
   git clone https://github.com/josephtandle/web-designer-agent-kit.git
3. Enter the folder:
   cd web-designer-agent-kit
4. Run:
   node scripts/install-web-designer-kit.mjs
5. Run:
   node scripts/health-check.mjs
6. Tell me:
   - installed skills
   - skipped skills
   - failed skills
   - the next prompt to paste
```

