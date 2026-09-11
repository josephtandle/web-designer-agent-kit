# Measured Reference Layout Workflow: Match vs Adapt

Choose **Match** for observed geometry with new participant content or **Adapt** for observed principles in a distinct structure. Neither mode copies source code or assets. A screenshot is visual evidence, never the page itself.

## 1. Create the reference map

Record each item as **observed** or **inferred**:

- source URL or user-provided image path
- access time and HTTP status when a URL was rendered
- CSS viewport width and height, device pixel ratio, and screenshot state
- section bounds, container widths, columns, gaps, alignment, crops, and visible breakpoints
- type scale, line wrapping, participant assets, control states, and motion
- unknown fonts, hidden states, responsive rules, or off-screen content

Fetching URL text alone is not visual evidence. When a browser is available, record screenshots and useful selector, computed-style, and bounds evidence. Never fabricate browser observations.

User-provided image pixels are not automatically CSS viewport pixels. If viewport or device pixel ratio is unknown, record the assumption and test a responsive interpretation instead of claiming false pixel accuracy.

## 2. Build an editable candidate

Create real semantic HTML/CSS/JS in a separate candidate directory below the reference project, such as `candidate-01/`. Keep captures in separate evidence directories such as `captures-reference-01/` and `captures-candidate-01/`.

Implement header, main, sections, footer, responsive containers, typography, participant content, real controls, focus states, and reduced-motion behavior. Use original code and participant-approved assets. Never use the reference screenshot as a page background or an image substitute for the build.

Start a working local preview of the candidate.

## 3. Capture equal states

Capture the reference and candidate at the same known CSS viewport, device pixel ratio, page state, scroll position, and crop. Do this for at least one desktop and one mobile viewport.

Use any installed capture capability that reports the required state. The kit's Playwright capture script is optional. If Playwright is not installed, offer its installation as a separate opt-in setup step and do not install it silently. Otherwise use another observable browser capture path or perform and report a manual comparison. Playwright is not a requirement for all users.

## 4. Compare locally

Open Reference Compare and align both images to a common coordinate origin and scale. Review side-by-side, overlay, and difference views. Keep semantic and accessibility checks separate because visual similarity does not prove either.

Write a discrepancy list in this priority order:

1. geometry and section rhythm
2. typography, wrapping, and hierarchy
3. image crops and asset placement
4. controls, focus, motion, borders, and other details

For each discrepancy, name the evidence, proposed correction, and whether it blocks Match or Adapt acceptance.

## 5. Fix and repeat

Use three engineering passes:

1. **Structure:** semantic regions, bounds, containers, columns, gaps, and section rhythm
2. **Type and crops:** type scale, wrapping, participant assets, crop behavior, and responsive image alternatives
3. **Details:** real controls, keyboard/focus states, borders, effects, motion preferences, and action states

After each pass, recapture and compare desktop and mobile. If a pass still has a blocking mismatch, repeat that pass after fixing the build. Three passes describe the areas of work, not a rule to stop after three attempts. Continue until no blocking mismatch remains or an evidence gap prevents an honest decision.

## Completion

Return:

- the working candidate preview and editable source directory
- the reference map with observed and inferred entries
- paired desktop and mobile capture evidence with known state
- the final prioritized discrepancy list
- the Match or Adapt conclusion
- remaining uncertainty, including unknown viewport, fonts, assets, or browser states

Do not claim publication, accessibility, or pixel accuracy beyond what was observed.
