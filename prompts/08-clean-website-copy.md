# Prompt 8: Clean Website Copy

Paste this into your AI assistant before final visual QA.

```text
Use the Web Designer agent to clean the visible prose in my website.

Target File: absolute path to index.html

Discover the absolute KIT_ROOT. If available, run its copy-check script against the absolute target and treat warnings as review leads, not an authorship detector, automatic rewrite, or quality guarantee.

Use my explicit voice profile first, requested tone second, and existing business voice third. Do not default to Joe's voice or generic AI phrasing. Mark good lines to keep. Review inflation, empty contrasts, forced conclusions, synonym cycling, rhythm, clichés, and prompt residue in context.

If this is a generated structured site, keep site.json authoritative. Use the editor for supported editable-field prose changes and rerender consistently; never edit generated HTML directly. For broader changes, create new validated output while preserving the originals. Before/after HTML is comparison evidence only. For a non-structured site, edit a safe copy of visible prose. Rephrasing is allowed when meaning, facts, evidence, and qualifications remain intact. Preserve exact quotations, technical and product names, dates, prices, legal text, citations, destinations, and SEO unless I explicitly authorize a change. Do not modify markup, attributes, classes, scripts, or CSS as a side effect.

Show representative before/after examples and reasons, then compare protected facts, button wording and destinations, and qualifications. Run copy-review.mjs --before=FILE --after=FILE --json as a supplement. Its loss-only tokens are review leads, not proof that retained or rewritten meaning is accurate or complete. Remove em dashes from newly rewritten prose except inside exact quotations. Check mobile wrapping only if it is actually rendered, and report anything not observed.
```
