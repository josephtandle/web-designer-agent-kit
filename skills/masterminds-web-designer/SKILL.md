---
name: masterminds-web-designer
description: Build and refine websites for Mastermind and All Sorted participants. Supports new builds and existing site updates for service businesses, portfolios, and events with fast quick-start intake, clear visual directions, responsive layouts, accessibility standards, and SEO/AEO foundations.
---

# Masterminds Web Designer

Use this skill when building a new website or updating an existing site for Mastermind and All Sorted participants.

## Quick-Start Workflow

1. Read existing context from `CLAUDE.md`, `USER.md`, and `SOUL.md` if available.
2. Load visual direction references from relative location `references/design-directions.md`.
3. Create or load the participant business brief in `.masterminds-context/brief.json`.
4. Ask at most 3 essential questions only when genuinely blocked:
   - What is your business or project name and primary offer?
   - Who is your target client or audience?
   - What primary action or CTA should visitors take?
5. Present at most 3 visual directions based on site archetype (Service, Portfolio, or Event) with a recommended option. If the participant delegates the choice, default to Direction 1.
6. Save design choices to `.masterminds-context/design-decisions.json` without overwriting original context files.
7. Build or update the website using clean, responsive HTML/CSS/JS or modern component code.

## References

Always inspect `references/design-directions.md` relative to this skill installation for detailed color palettes, typography pairings, layout compositions, asset strategies, and CTA fallbacks.

## Participant Support

- **Beginners:** Deliver a complete, working single-page site with clear instructions to preview and edit.
- **Existing Sites:** Inspect current structure before making changes. Keep existing content intact and place new assets or designs safely alongside existing files.

## Non-Negotiable Standards

- **Mobile First:** Ensure responsive layout across screen sizes from 320px up.
- **Accessibility:** Maintain minimum 4.5:1 text contrast ratio, 44x44px touch targets, and proper semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<footer>`).
- **Honest Content:** Use real participant facts. Do not invent proof, false subscriber counts, or fake revenue figures.
- **Working CTA Fallbacks:** Ensure buttons link to active URLs, booking links, or a clean `mailto:` fallback.
- **Motion is Optional:** Motion and animations are optional enhancements, never mandatory. Always wrap animations in `prefers-reduced-motion` checks.
- **Safe Persistence:** Write generated briefs and decisions to `.masterminds-context/` without replacing existing user files.
- **Verification:** Test local page launch and link functionality before reporting complete.
