# Prompt 1: Install Starter Context Files

Paste this into your AI assistant from the participant's website project folder.

```text
Install only the Mastermind starter context files for this website project.

Requirements:
- Confirm Node.js 24 or newer with node --version.
- Keep the local kit checkout separate from the website project files.
- Discover and record the absolute KIT_ROOT and PROJECT_ROOT once.
- If the intended kit checkout already exists, reuse it. Never clone over an existing file or unrelated directory.
- If the kit is not downloaded, explain that the initial clone or archive download requires internet access. The installer works locally after download.
- Create CLAUDE.md, USER.md, and SOUL.md without overwriting existing files. Put proposed alternatives below .masterminds-context/.
- Do not install the agent or skills yet.
- Pass path options as one quoted --key=value argument.

For macOS or Linux Bash, use:
node --version
PROJECT_ROOT="$PWD"
KIT_ROOT="$PROJECT_ROOT/.masterminds-web-designer-agent-kit"
if [ -d "$KIT_ROOT/.git" ]; then
  echo "Using existing kit checkout: $KIT_ROOT"
elif [ -e "$KIT_ROOT" ]; then
  echo "Stop: KIT_ROOT exists but is not the expected checkout."
  exit 1
else
  git clone https://github.com/josephtandle/web-designer-agent-kit.git "$KIT_ROOT"
fi
node "$KIT_ROOT/scripts/install-context.mjs" "--target=$PROJECT_ROOT"

For Windows PowerShell, use:
node --version
$PROJECT_ROOT = (Get-Location).Path
$KIT_ROOT = Join-Path $PROJECT_ROOT '.masterminds-web-designer-agent-kit'
if (Test-Path (Join-Path $KIT_ROOT '.git')) {
  Write-Host "Using existing kit checkout: $KIT_ROOT"
} elseif (Test-Path $KIT_ROOT) {
  throw 'KIT_ROOT exists but is not the expected checkout.'
} else {
  git clone https://github.com/josephtandle/web-designer-agent-kit.git $KIT_ROOT
}
node (Join-Path $KIT_ROOT 'scripts/install-context.mjs') "--target=$PROJECT_ROOT"

If an archive was downloaded instead, set KIT_ROOT to its extracted directory and skip git clone.

Afterward, report created, skipped, and proposed files, explain each file briefly, and give the next prompt.
```
