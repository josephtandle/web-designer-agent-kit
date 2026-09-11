# Web Designer Agent Kit Upgrade Plan

This document tracks the three upgrade rounds to evolve the Web Designer Agent Kit to major release 3.0.0.

---

## Round 1: Intake and Design Guidance (Repaired & Complete)

### Status
Repaired and Complete.

### What / Why
Simplify participant intake and visual direction choices. Replace setup-heavy and mandatory effect guidance with a fast quick-start. Help both beginners and participants with existing sites move from idea to first build without friction.

### Repairs Executed
- Fixed skill path discovery to dynamically discover installed `masterminds-web-designer` skill location and load `references/design-directions.md` relative to that skill path.
- Updated visual direction recommendation logic to select the business-tailored recommendation based on site archetype (Service, Portfolio, Event) rather than hardcoding Direction 1.
- Purged invented emails, fake testimonials, unverified cohort metrics, and placeholder CTA URLs from agent and skill guidance.
- Restored concrete SEO title, meta description, H1 hierarchy, Open Graph tags, and structured JSON-LD schema markup standards.
- Added compact skill routing (`frontend-design`, `impeccable`, `schema-markup-generator`, `motion`).
- Corrected README health command to `node .masterminds-web-designer-agent-kit/scripts/health-check.mjs --project=.`.

---

## Round 2: Portable Zero-Dependency Starters and Preview (Implemented - Awaiting QA)

### Status
Implemented - Awaiting Independent Browser QA.

### What / Why
Provide standalone starter templates and preview mechanisms so participants can inspect designs locally without heavy framework dependencies or npm install requirements.

### Implementation Details
- Built `scripts/create-site.mjs`: Zero-dependency CLI site generator supporting `service`, `portfolio`, and `event` archetypes.
  - Full validation: Refuses existing non-empty target directories, rejects unknown options, validates styles and email format, rejects symlink targets and symlink paths.
  - Escapes all user text inputs (`name`, `headline`, `email`) for XSS and HTML safety.
  - Archetype 1 (Service): Warm editorial cream (`#FAF8F5`), forest green accent (`#2D5A27`), Georgia typography, split hero layout, 3-column service grid, 3-step advisory process timeline, founder bio, working contact card.
  - Archetype 2 (Portfolio): Dark obsidian (`#0D0D11`), oversized geometric typography, asymmetric gallery with original bundled abstract SVG artworks honestly labelled as illustration placeholders, capabilities list, inquiry card.
  - Archetype 3 (Event): Midnight violet (`#181325`), vibrant pink/ochre poster typography, vertical schedule timeline, honest venue logistics status block (draft callouts), transparent pass tiers.
  - Non-negotiable quality: Semantic heading structure (H1->H2->H3), unique title and meta description, skip link, `:focus-visible` outline, 44x44px touch targets, 100% offline self-contained assets, responsive (320px to 1440px), reduced motion support.
  - Working section CTAs: Verified `mailto:` when email provided, working `#contact` / `#register` section anchor fallback when email absent.
- Built `scripts/preview.mjs`: Local static server bound strictly to `127.0.0.1` ONLY.
  - Path traversal-safe with root containment validation.
  - Rejects symlinks and symlink escapes.
  - Refuses hidden files / dotfiles (`.env`, `.git`, `.DS_Store`) to prevent credential leakage.
  - Content-Type whitelist for safe public web assets.
- Built modular templates (`templates/service.mjs`, `templates/portfolio.mjs`, `templates/event.mjs`) and sample briefs (`examples/brief-service.md`, `examples/brief-portfolio.md`, `examples/brief-event.md`).
- Updated `package.json` to major version `3.0.0` with scripts `npm run create:site` and `npm run preview`.

---

## Round 3: Reliable Offline Core Installation, Health, and Release Parity (Planned)

### Status
Planned.

### What / Why
Ensure complete offline reliability, robust offline health checks, and installer feature parity across operating systems.

### Approach
- Bundle core skills locally so installation works without external git dependencies.
- Update health checks and installer scripts for offline execution.
- Finalize offline release parity across Mac and Windows.
