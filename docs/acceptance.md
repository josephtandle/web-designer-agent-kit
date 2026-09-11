# Acceptance Rubric

Use this rubric for final integration review. A statement is accepted only when supported by an observed check or a clearly identified source artifact. The main integration lane will assemble final machine-readable evidence in `docs/verification.json` after tests and observed checks.

## Participant result

- The output is a functioning local website with editable HTML/CSS/JS, not only a mockup, screenshot, prompt, or evidence folder.
- The preview URL works locally and is reported as preview, not publication.
- Remaining uncertainty and unobserved checks are explicit.

## Design quality

- The site has an original, business-appropriate direction and does not reproduce a reference as a screenshot background.
- Service, Portfolio, and Event starters have distinct layouts rather than superficial color swaps.
- All 12 palettes are distinguishable and usable in paired light/dark themes.
- Palette export contains 10 semantic tokens, including `border` and `onAccent`.
- Component Lab exposes 12 distinct layouts, 4 button treatments, 16 icons, and 3 optional effects.
- Motion uses original CSS by default and includes a reduced-motion fallback without requiring an external library.

## Reference honesty

- The reference map separates observed evidence from inference.
- Reference and candidate captures share a known CSS viewport, device pixel ratio, page state, coordinate origin, and scale where comparison claims depend on them.
- Unknown screenshot viewport or device pixel ratio is recorded as an assumption, not converted into false pixel accuracy.
- An editable candidate lives separately from reference and capture evidence.
- Desktop and mobile discrepancies are prioritized by geometry, typography, crops, and details.
- A failed engineering pass is fixed and repeated until no blocking mismatch remains or a named evidence gap blocks a conclusion.

## Content and specialty behavior

- Copy reads like a human wrote it and cleanup examples show before, after, and reason.
- Names, dates, prices, evidence, qualifications, exact quotations, technical names, legal text, links, and SEO facts remain accurate.
- Each page has a unique title and description, one meaningful H1, semantic navigation, and crawlable visible text.
- Open Graph assets are real and approved. Canonicals appear only for verified public domains.
- Structured data matches visible facts and contains no invented Event dates, results, ratings, or success metrics.
- Forms submit only through connected endpoints after confirmed user intent. Local demos are clearly unconnected and do not fake submission with `action="#"`, `contenteditable`, or navigation controls.

## Installation and dependencies

- Instructions require Node.js 24 or newer.
- Bash and PowerShell examples use valid platform-specific variable syntax.
- The absolute kit root is discovered once and remains separate from the website project root.
- Script calls use the kit root, absolute project targets, and quoted `--key=value` path arguments.
- An intended existing checkout is reused without overwrite.
- Existing participant files are preserved or receive reviewable candidate copies.
- Core generation, preview, design, copy, and comparison workflows require no external runtime libraries after the initial kit download.
- URL capture and cloud-hosted models are identified as possible network work.
- The GitHub source catalog is research-only in the default workflow.

## Evidence record

The final `docs/verification.json` should identify each check, status, command or observation, relevant artifact, and remaining limitation. Do not use this rubric or the upgrade-loop document alone as proof that checks passed. Do not claim a global quality ranking.
