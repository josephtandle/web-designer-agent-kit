# Composition design

Use composition to clarify the relationships already present in the participant's content. Do not begin with a page funnel, a favorite grid, or a component showcase. Read the facts first, identify what belongs together, then choose and order sections that make those relationships legible.

## Diagnose the relationship

Classify each content group by its main job:

- **Narrative** explains a person, idea, origin, or change. Give it readable measure and room for voice.
- **Comparison** distinguishes options or outcomes. Align only dimensions that genuinely match.
- **Sequence** communicates steps, an agenda, a timeline, or a method. Make order and progress unmistakable.
- **Collection** presents items scanned independently. Use repetition, but let varied content fit.
- **Proof** supports a claim with attributed stories, quotations, metrics, or examples. Never invent proof, detach attribution, or strengthen a supplied claim.
- **Action** gives the next step, such as contact, booking, registration, or email. Keep the destination and consequence explicit.

A section can mix relationships, but one should lead. If unclear, simplify the grouping first.

## Choose and reorder, do not impose a funnel

The built-in library has 36 section types in 12 categories: hero, introduction, services, benefits, work, process, proof, people, pricing, FAQ, event, and contact. Categories are a search aid, not a required page order. Choose a variant because its structure fits the available facts, item count, evidence, and intended next step.

Reorder sections when the story requires it. An event may need context, agenda, venue, then registration; a proven consultant may lead with proof. A sparse brief should produce a sparse page, not fabricated claims or filler.

Preserve every supplied item. If a chosen variant cannot hold the content, select another variant, let the structure grow, or report the mismatch. Never silently drop the fourth service because a card row was designed for three.

## Preserve the existing stack and share the system

Work within the project's framework, rendering model, commands, and conventions unless the task authorizes a change. Do not migrate stacks or add dependencies merely to apply this guidance.

Across pages, share semantic tokens for color, type, spacing, radius, surfaces, and focus, plus navigation and footer behavior. Pages may still vary in density, measure, imagery, and order. Consistency does not mean identical layouts.

Keep the structured model authoritative. Render escaped content into semantic HTML. Edit validated model leaves and rerender, rather than parsing arbitrary HTML back into data.

## Design for content fit, responsiveness, and zoom

Change topology when content stops fitting, not at a fashionable device label. Columns can stack, peer actions can wrap, and a focal hero must grow beyond its minimum. Container queries can serve sections whose available space varies independently.

Test real content at narrow, middle, and wide widths, including the longest heading, email, URL, label, and list. At 200 percent zoom, reading order, focus, navigation, dialogs, and actions must remain usable without clipped text or ordinary two-dimensional scrolling.

Use bounded fluid type and spacing, readable line length, and verified fallbacks. Heading balance must not conceal overflow. For reference fidelity, check the font that rendered.

## Use evidence and human words

Separate observed facts from interpretation. For reference work, record exact URL, final URL, viewport, device pixel ratio, state, time, crop, screenshot, element bounds, typography, and rendered fonts when available. Text extraction helps inventory content, but it does not prove geometry or visual fidelity.

Name the intent. **Match** aims to reproduce observed spatial relationships with independently authored code and authorized assets. **Adapt** carries selected principles into a deliberately different structure. Neither mode permits copying source code, protected assets, fonts, branding, or screenshots without rights.

Protect names, dates, prices, destinations, quotations, claims, and attribution before polishing copy. Prefer direct, specific sentences over inflated promises and empty contrasts. Automated language checks are advisory, not detectors of authorship, truth, or voice. Read the page as a human.

## Acceptance combines objective and subjective judgment

Objective checks should cover fact preservation, valid structure, heading order, contrast, focusability, route safety, working internal destinations, metadata uniqueness, content overflow, zoom, long strings, shared-token propagation, reduced motion, and file scope. Automated accessibility checks find only a subset of issues, so include keyboard and visual inspection.

Subjective review asks whether composition fits the relationship, hierarchy and rhythm are clear, copy sounds human, claims have evidence, and Match or Adapt intent is met. Label judgments and preserve screenshots and notes.

Do not hide quality in one score. Report dimensions, conditions, unresolved differences, and confidence. Readiness requires objective gates and no material subjective concern. One example is not proof of general capability.

## Run a bounded browser acceptance loop

Use a finite **build -> capture -> critique -> fix -> recheck** loop. Start with one complete pass at 320, 390, 768, and 1440 CSS pixels, repair prioritized material failures, then recheck every affected viewport. Run one final pass after inserting representative long copy or making later revisions. Do not keep polishing without a new observed discrepancy; record remaining uncertainty.

Before capturing evidence, wait for fonts and images, then settle or disable finite entry animations so the capture represents the intended resting state. Separately enable `prefers-reduced-motion: reduce` and confirm moving treatments are removed or safely reduced without hiding content or actions.

At every viewport, inspect the rendered box and intended aspect ratio of each meaningful image. Successful loading and a document with no reported overflow do not prove visual quality. Keep intrinsic `width` and `height` attributes to reserve space, and use `height: auto` for naturally fluid images. Use an explicit bounded frame, declared aspect ratio, and intentional `object-fit`/`object-position` only when cropping is part of the design. Inspect edges and descendants for clipping masked by `overflow: hidden`, including text, focus rings, shadows, and controls.

Verify each primary CTA at its visible center with the browser's actual hit-test result, then reach and activate it by keyboard. The target must be the intended control, not an overlay, decorative layer, or neighboring link. Confirm visible focus and the expected navigation or safe local behavior.

For Match work, capture candidate and reference at the same viewport, device pixel ratio, UI state, font/loading state, and scroll position. Compare text line breaks and measured element positions, sizes, and spacing; a similar page silhouette or overall outline is insufficient. For Adapt work, identify which reference relationships are intentionally retained and judge those under the same controlled conditions.

If a real browser cannot be used, stop the browser portion and report exactly which viewports and interactions are blocked. Static inspection, loaded-image checks, launch scripts, and absence of document overflow remain useful partial evidence, but none may be reported as browser or visual acceptance.
