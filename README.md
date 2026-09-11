# Web Designer Agent Kit 4.0.0

Install Joe Che's starter context files, Web Designer agent, and original local design toolkit for Mastermind and All Sorted participants.

## Quick start: one pasteable AI request

Install Node.js 24 or newer, then download this kit once by cloning it or downloading a repository archive and extracting it into a local kit directory. Confirm that the extracted directory contains `scripts/`, `skills/`, and `agents/`. Internet access is required only for that initial download. The bundled scripts and UI tools then work locally, although a cloud-hosted AI model may still use a network.

Open a terminal in the website project you want to build. Keep that project separate from the kit checkout. Then paste this request into your AI assistant:

```text
Use the Web Designer Agent Kit from my local .masterminds-web-designer-agent-kit folder to build a working website in this current website project. First verify Node.js 24 or newer, discover and record the absolute kit root and website project root, install the context files and core agent without overwriting existing files, build editable HTML/CSS/JS, clean the visible copy, verify desktop and mobile in a local preview, and report anything not observed. Do not publish.

Business Name: Apex Advisory
Style Archetype: Service (or Portfolio, or Event)
Headline: Make the next decision clearer
Primary CTA: Email contact@example.com
```

Available starter styles are `service`, `portfolio`, and `event`.

## Download and local setup

If the intended kit folder already exists, reuse it. Do not clone over an existing file or unrelated directory. If you downloaded an archive, extract it and assign the kit-root variable to that directory instead of running `git clone`.

### macOS or Linux Bash

Run these commands from the participant's website project:

```bash
node --version
PROJECT_ROOT="$PWD"
KIT_ROOT="$PROJECT_ROOT/.masterminds-web-designer-agent-kit"

if [ -d "$KIT_ROOT/.git" ]; then
  echo "Using existing kit checkout: $KIT_ROOT"
elif [ -e "$KIT_ROOT" ]; then
  echo "KIT_ROOT exists but is not the expected git checkout. Set KIT_ROOT to the extracted kit or choose another directory."
  exit 1
else
  git clone https://github.com/josephtandle/web-designer-agent-kit.git "$KIT_ROOT"
fi

node "$KIT_ROOT/scripts/install-context.mjs" "--target=$PROJECT_ROOT"
node "$KIT_ROOT/scripts/install-web-designer-kit.mjs"
node "$KIT_ROOT/scripts/health-check.mjs" "--project=$PROJECT_ROOT"
node "$KIT_ROOT/scripts/create-site.mjs" "--target=$PROJECT_ROOT/my-service-site" "--style=service" "--name=Apex Advisory" "--headline=Make the next decision clearer" "--email=contact@example.com"
node "$KIT_ROOT/scripts/preview.mjs" "--dir=$PROJECT_ROOT/my-service-site" "--port=3000"
```

### Windows PowerShell

Run these commands from the participant's website project:

```powershell
node --version
$PROJECT_ROOT = (Get-Location).Path
$KIT_ROOT = Join-Path $PROJECT_ROOT '.masterminds-web-designer-agent-kit'

if (Test-Path (Join-Path $KIT_ROOT '.git')) {
  Write-Host "Using existing kit checkout: $KIT_ROOT"
} elseif (Test-Path $KIT_ROOT) {
  throw 'KIT_ROOT exists but is not the expected git checkout. Set KIT_ROOT to the extracted kit or choose another directory.'
} else {
  git clone https://github.com/josephtandle/web-designer-agent-kit.git $KIT_ROOT
}

node (Join-Path $KIT_ROOT 'scripts/install-context.mjs') "--target=$PROJECT_ROOT"
node (Join-Path $KIT_ROOT 'scripts/install-web-designer-kit.mjs')
node (Join-Path $KIT_ROOT 'scripts/health-check.mjs') "--project=$PROJECT_ROOT"
node (Join-Path $KIT_ROOT 'scripts/create-site.mjs') "--target=$PROJECT_ROOT\my-service-site" "--style=service" "--name=Apex Advisory" "--headline=Make the next decision clearer" "--email=contact@example.com"
node (Join-Path $KIT_ROOT 'scripts/preview.mjs') "--dir=$PROJECT_ROOT\my-service-site" "--port=3000"
```

Every path flag is passed as one quoted `--key=value` argument so paths containing spaces remain intact. These commands do not assume the website project contains `scripts/`.

## Bundled core tools and skills

Once downloaded, the local tools and generation, installation, preview, and copy-review scripts need no additional network access. URL capture is optional network work. Playwright is optional and installed separately only when that capture route is chosen.

- **Masterminds Web Designer:** `skills/masterminds-web-designer`
- **Frontend Design:** `skills/frontend-design`
- **Palette Studio:** `skills/masterminds-web-designer/tools/palette-studio.html`, with 12 distinct palettes, paired light/dark themes, and a 10-token export contract including `border` and `onAccent`
- **Component Lab:** `skills/masterminds-web-designer/tools/component-lab.html`, with 12 distinct layouts, 4 button treatments, 16 geometric line icons, and 3 optional effects
- **Reference Compare:** `skills/masterminds-web-designer/tools/reference-compare.html`, with side-by-side, overlay, and difference views aligned to a common coordinate origin and scale
- **Layout Atlas:** `skills/masterminds-web-designer/references/layout-atlas.md`
- **Search Readiness:** `skills/masterminds-web-designer/references/search-readiness.md`, with built-in SEO and GEO guidance plus honest local-versus-live reporting

The GitHub design research catalog at `docs/github-design-research.md` is research-only in the default workflow. It does not fetch, install, clone, or vendor external repositories.

## Safe installation behavior

The context installer creates `CLAUDE.md`, `USER.md`, and `SOUL.md`. Existing files are left untouched and proposed versions are written below `.masterminds-context/`.

The core installer preserves existing files by default. Use `--upgrade` only to update previously managed files: unchanged managed files are updated, while customized files receive reviewable `.candidate` versions. Do not use replacement options unless the participant explicitly requests them.

The platform commands above establish `KIT_ROOT` once as the absolute kit checkout and `PROJECT_ROOT` once as the absolute website project. Every later script call must use the script below `KIT_ROOT` and an explicit absolute project path.

## Reference build workflow

Example Bash commands follow. PowerShell users should call each script with `node (Join-Path $KIT_ROOT 'scripts/<name>.mjs')` and use the same quoted `--key=value` arguments.

```bash
node "$KIT_ROOT/scripts/reference-project.mjs" "--target=$PROJECT_ROOT/my-reference" "--url=https://example.com" "--mode=match"
node "$KIT_ROOT/scripts/capture-reference.mjs" "https://example.com" "--target=$PROJECT_ROOT/my-reference/captures-01"
```

Before review or preview, have the AI create `$PROJECT_ROOT/my-reference/candidate/index.html` with editable CSS and JavaScript. Keep the candidate separate from the captured reference evidence. Then run:

```bash
node "$KIT_ROOT/scripts/copy-check.mjs" "--file=$PROJECT_ROOT/my-reference/candidate/index.html"
node "$KIT_ROOT/scripts/seo-check.mjs" "--file=$PROJECT_ROOT/my-reference/candidate/index.html" --json
node "$KIT_ROOT/scripts/preview.mjs" "--dir=$PROJECT_ROOT/my-reference/candidate" "--port=3000"
```

The SEO audit is read-only and runs from the established `KIT_ROOT` against an explicit file below `PROJECT_ROOT`; it does not assume the website project contains `scripts/`. In PowerShell, run the equivalent command:

```powershell
node (Join-Path $KIT_ROOT 'scripts/seo-check.mjs') "--file=$PROJECT_ROOT\my-reference\candidate\index.html" --json
```

Add `"--url=<verified-public-URL>"` only when that public URL has been verified. For a local-only audit, report `live_http: not_checked`, `robots: not_checked`, `indexing: not_checked`, and `ai_citations: not_checked`.

URL fetch text is not visual evidence. Follow `skills/masterminds-web-designer/references/reference-layout.md`: create an observed-versus-inferred reference map, build actual editable HTML/CSS in a separate candidate directory, capture the candidate at the same known viewport, DPR, and screenshot state as the reference, compare it locally, list discrepancies, fix the build, and repeat desktop and mobile passes until no blocking mismatches remain. A user-provided image's pixel dimensions are not automatically a CSS viewport. Record unknowns and test responsive behavior instead of claiming false pixel accuracy.

## Build, review, repair, and verify

1. Read the participant context and confirm facts, offer, audience, and intended CTA.
2. Build editable, functioning, original HTML/CSS/JS. An image may be evidence or an asset, never the page implementation.
3. Run Speak Human cleanup before visual QA. Show before/after examples and verify that names, dates, prices, claims, qualifiers, quotations, legal meaning, citations, links, and SEO meaning remain intact.
4. Verify semantic navigation, one H1, crawlable text, unique title and description, responsive layouts, 4.5:1 body-text contrast, 44x44px touch targets, skip navigation, focus states, and reduced-motion behavior.
5. Treat a form as connected only after verifying a real endpoint and receiving user-confirmed send intent. Otherwise label it clearly as an unconnected local demo. Links navigate; they do not pretend to submit.
6. Report local preview separately from publication or deployment. Never claim a browser check that was not observed.
7. Record final assembled machine-readable acceptance evidence in `docs/verification.json`. Until that file exists and is current, do not infer every check passes.

See `docs/acceptance.md` for the concise acceptance rubric and `docs/three-upgrade-loops.md` for the feature-intention record.
