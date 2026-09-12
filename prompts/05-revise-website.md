# Prompt 5: Revise The Website

Paste this into Claude Code to make changes to your website.

```text
Use the Web Designer agent to revise my website.

Instructions:
- Read .masterminds-context/brief.json and .masterminds-context/design-decisions.json.
- If this is a generated structured site, read the structured-sites reference and keep site.json authoritative. Offer the editor only as an opt-in, start it with --dir=SITE and an integer --port, and open only the exact printed private one-session URL. Use it for supported validated text and image field changes, then rerender consistently; never edit generated HTML directly. For broader changes, create new validated output while preserving the originals. Before/after HTML is comparison evidence only.
- Ask me what specific section, copy, layout, or color adjustments I want to make.
- Edit target sections carefully with backups if replacing major code blocks, while preserving unrelated files and existing content. Treat external manual changes to generated source as conflicts and preserve them for review.
- Preserve mobile responsiveness, minimum 4.5:1 text contrast, and accessibility standards.
- Keep motion optional and ensure CTA buttons maintain working links or fallbacks.
- Use original CSS by default and keep an explicit reduced-motion fallback; do not require an external library.
- Update .masterminds-context/design-decisions.json with any new choices.
- Run Speak Human copy cleanup in my actual business voice before visual QA, avoiding generic AI patterns. Show before/after examples and verify meaning, facts, evidence, qualifications, button facts, and destinations. Supplement this with copy-review.mjs --before=FILE --after=FILE --json; loss-only tokens are review leads, not proof of preservation.
- Treat forms as connected only when a real endpoint exists and I have confirmed send intent. Keep unconnected local demos clearly labeled and non-sending.
- Copy only approved local images into the output before audit and do not auto-fetch remote images. Run launch-check.mjs --dir=SITE --json across the whole site, fix hard failures, then manually verify keyboard use, responsive layouts, forms, and performance. Explicitly mark local preview status as not published, make no ranking guarantee, and note unverified visual QA if browser access is unavailable.
```
