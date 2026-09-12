# Structured sites

Load this guide only when generating a content-adaptive site, using the section gallery, editing a generated structured site, reviewing revised copy, auditing a whole site, or creating state-specific captures. The participant supplies facts and choices in normal conversation. The agent creates and validates tool input. Never ask a novice to handwrite JSON.

## Choose a composition

Read `composition-design.md` before choosing section order. Offer 3 coherent directions that fit the business, then recommend one. Do not expose all 36 section types as a questionnaire.

When a visual chooser helps, create it in a new directory and launch its local preview:

```bash
node "$KIT_ROOT/scripts/section-gallery.mjs" "--target=$PROJECT_ROOT/<new-gallery>"
node "$KIT_ROOT/scripts/preview.mjs" "--dir=$PROJECT_ROOT/<new-gallery>" "--port=3000"
```

The offline gallery contains 36 individual sections and 3 complete example compositions. Use the participant's selection as a design input, not as permission to discard supplied content.

## Generate a complete site

Keep the existing `service`, `portfolio`, and `event` quick starters. For a content-adaptive site, convert the supplied facts into a structured brief file, validate it with the generator, and generate every requested page:

```bash
node "$KIT_ROOT/scripts/create-site.mjs" "--brief=$PROJECT_ROOT/.masterminds-context/site-brief.json" "--target=$PROJECT_ROOT/<new-site>"
```

`--brief=FILE` is mutually exclusive with `--style`, `--name`, `--headline`, and `--email`. The target must be a new or empty safe directory. A typical 3-page brief uses `index.html`, `about/index.html`, and `contact/index.html`, with shared navigation, footer, and brand tokens.

The schema root is `{schemaVersion:1,name,language?,brand?,navigation?,footer?,pages}`. Each page is `{path,title,description,sections}`. Each section is `{id,type,title?,eyebrow?,body?,image?,action?,items?}`. Section and item text is plain text, never raw HTML or CSS. Hero sections require a title. Preserve every supplied item and choose a structure that fits it.

Allowed routes are `index.html` or safe lowercase slug paths ending in `/index.html`. Internal page or fragment links, `https`, `mailto`, and `tel` are supported. Images may use safe site-relative asset paths or HTTPS URLs. Remote images remain external references and are not fetched automatically. Before auditing, copy every participant-approved local image into the generated output at the matching relative path. Do not copy or fetch an image without approval.

If Palette Studio supplies `themes.light.semantic` or `themes.dark.semantic`, map only these structured brand fields:

- `background`, `text`, `muted`, and `surface` keep the same names.
- `primary` maps to `accent`.
- `onPrimary` maps to `accentText`.
- Set `font`, `headingFont`, `radius`, and `space` separately.

Do not spread the entire Palette Studio token object into `brand`. Preserve the full palette export in `.masterminds-context/design-decisions.json` so tokens omitted from the renderer handoff are not lost.

## Edit a generated structured site

The visual editor is optional and works only for a generated site whose authoritative source is `site.json`:

```bash
node "$KIT_ROOT/scripts/edit-site.mjs" "--dir=$PROJECT_ROOT/<site>" "--port=3000"
```

`--port` must be an integer. Open the exact loopback URL printed by the command and keep that private one-session URL private. The editor changes supported validated text and image fields in authoritative `site.json`, then rerenders the generated pages consistently. Verify save, undo, and reload. Never edit generated HTML directly. For changes outside the editor's supported fields, create new validated output and preserve the originals. Before/after HTML is comparison evidence only, not an editable source. If generated files or `site.json` changed outside the editor, treat that as a conflict and preserve the external change for review.

## Review copy and launch readiness

Keep Speak Human as the semantic review and fact-preservation process. For a revision, supplement it with:

```bash
node "$KIT_ROOT/scripts/copy-review.mjs" "--before=$PROJECT_ROOT/<safe-before-file>" "--after=$PROJECT_ROOT/<revised-file>" --json
```

The comparison includes visible button wording among fact-sensitive prose. Its changed blocks and removed tokens are review leads. A loss-only token report is not proof that retained or rewritten claims are accurate, equivalent, complete, or in the participant's voice.

Run the read-only whole-site check:

```bash
node "$KIT_ROOT/scripts/launch-check.mjs" "--dir=$PROJECT_ROOT/<site>" --json
```

Fix every hard failure before calling the local build ready. The report is not a ranking and does not guarantee SEO, accessibility, performance, publication, or indexing. Also inspect keyboard order and focus, responsive layouts, form behavior and send state, and real browser performance by hand.

## Capture a declared state

`capture-reference.mjs` accepts an optional raw JSON string in `--spec=JSON`, not a filename. The agent constructs and quotes it. The top level is `{"cases":[...]}` with 1 to 6 cases. Every case requires `name`, `width`, `height`, `dpr`, `colorScheme`, and `reducedMotion`, plus exactly one of boolean `fullPage` or `clip`. `clip` is `{x,y,width,height}`. Optional `actions` may contain `{"type":"wait","ms":...}` or `{"type":"hover|focus|open-details|scroll","selector":"..."}`.

Example shape:

```text
node "$KIT_ROOT/scripts/capture-reference.mjs" "https://example.com" "--target=$PROJECT_ROOT/<new-captures>" '--spec={"cases":[{"name":"desktop-open","width":1440,"height":900,"dpr":1,"colorScheme":"light","reducedMotion":"no-preference","fullPage":true,"actions":[{"type":"open-details","selector":"#faq details"}]}]}'
```

Preserve the resulting metadata for actions, viewport, DPR, color scheme, reduced motion, crop or full-page state, final URL, and screenshot hash. Compare only compatible states. Keep comparator alignment, scale, crop, state checks, and hashes with the evidence.
