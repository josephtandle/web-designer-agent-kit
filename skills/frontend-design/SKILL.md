---
name: frontend-design
description: Use for distinctive frontend design, visual direction, layout, typography, color harmony, sRGB contrast verification, responsive interfaces, anti-AI-slop website polish, and Speak Human copy editing.
---

# Frontend Design

Before writing code, choose a concrete design direction.

## Context

Identify:

- audience
- page goal
- offer
- emotional tone
- visual references or anti-references

If the user has `USER.md` or `SOUL.md`, use those first.

## Anti-Slop Rules

Avoid:

- generic purple-blue gradients
- endless card grids
- tiny uppercase labels above every section
- centered everything
- Inter/system font as a default design decision
- glassmorphism everywhere
- pure black or pure white
- gray text on colored backgrounds
- text overflow on mobile
- empty marketing clichés when they do not carry meaning; retain technical terms, product names, and protected quotations
- em dashes in rewritten prose

## Quality Rules

- Typography should create hierarchy.
- Spacing should create rhythm.
- Color should feel intentional and pass sRGB contrast checks.
- Original CSS is the default for motion and effects; no external library is required. Motion should support understanding and include an explicit `prefers-reduced-motion` fallback.
- Mobile layout should be designed for 320px, not merely shrunk.
- Every page needs one memorable visual idea.
- Make Speak Human review a normal step before final visual QA: profile first, requested preset second, existing voice third. Review inflation, empty contrasts, forced conclusions, synonym cycling, rhythm, and clichés contextually. Edit a safe copy of visible prose, show before/after examples, and confirm that meaning, facts, evidence, and qualifications remain intact. Preserve exact quotations, technical names, legal text, citations, links, and SEO unless the user explicitly authorizes changes.

## Built-in specialty standards

- SEO: use a unique title and description, one meaningful H1, semantic navigation, crawlable visible text, and a logical heading structure. Use an Open Graph asset only when provided or approved. Add a canonical URL only for a verified public domain. Schema must match visible facts and must not invent Event dates, success metrics, ratings, or other evidence.
- Forms: consider a form connected only when a real endpoint exists and the user has confirmed send intent. Never use `action="#"`, `contenteditable`, or navigation links as fake submission. Label unconnected demos and prevent accidental sends.
- Research: treat source catalogs as inspiration and research only. The default workflow does not fetch external GitHub code or require external packages.

## Output Standard

Build functioning, editable, original code and verify it locally. Return a working preview and name remaining uncertainty. Do not stop at a mockup unless the user asks for one, and do not call a local preview published.
