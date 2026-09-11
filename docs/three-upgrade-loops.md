# Web Designer Agent Kit Upgrade Plan

This document tracks the three upgrade rounds evolving the Web Designer Agent Kit to major release 4.0.0.

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

## Round 2: Portable Zero-Dependency Starters and Preview (Repaired & Complete)

### Status
Repaired and Complete.

### What / Why
Provide standalone starter templates and preview mechanisms so participants can inspect designs locally without heavy framework dependencies or npm install requirements.

### Implementation Details
- Built `scripts/create-site.mjs`: Zero-dependency CLI site generator supporting `service`, `portfolio`, and `event` archetypes.
  - Full validation: Refuses existing non-empty target directories, rejects unknown options and positional flags, validates styles and email format, permits canonical parent resolution while refusing target symlinks.
  - Escapes all user text inputs (`name`, `headline`, `email`) safely.
  - Archetype 1 (Service): Warm editorial cream (`#FAF8F5`), forest green accent (`#2D5A27`), Georgia typography, split hero layout, 3-column service grid, 3-step advisory process timeline, founder bio, working contact card.
  - Archetype 2 (Portfolio): Dark obsidian (`#0D0D11`), oversized solid typography without gradient text, asymmetric gallery with original bundled abstract SVG artworks visibly labelled as illustration placeholders, capabilities list, inquiry card.
  - Archetype 3 (Event): Midnight violet (`#1C1917`), vibrant pink/ochre poster typography with decorative SVG header motif, vertical schedule timeline, honest venue logistics status block (draft callouts), transparent pass tiers.
- Built `scripts/preview.mjs`: Local static server bound strictly to `127.0.0.1` ONLY.
  - Path traversal-safe via `path.relative` root containment validation (fixing sibling-prefix escape bugs).
  - Rejects symlinks and symlink escapes.
  - Refuses hidden files / dotfiles (`.env`, `.git`, `.DS_Store`) to prevent credential leakage.
  - Strict Content-Type whitelist for safe public web assets (HTML, CSS, JS, SVG, images, fonts).
- Built modular templates (`templates/service.mjs`, `templates/portfolio.mjs`, `templates/event.mjs`) with raw JSON-LD serialization and script tag escaping.

---

## Round 3: Reliable Offline Core Installation, Health, and Release Parity 4.0.0 (Complete)

### Status
Complete - Released as Version 4.0.0.

### What / Why
Ensure complete offline reliability, robust health checks, safe upgrade mechanisms, and complete parity across Mac and Windows.

### Implementation Details
- **Offline Core Installation:** Default installer `scripts/install-web-designer-kit.mjs` installs bundled agent and 2 core local skills (`masterminds-web-designer`, `frontend-design`) completely offline without calling git. Optional `--extras` flag enables cloning 20 remote skills with a 20s timeout.
- **Explicit Installation Root:** Added `--claude-dir=<path>` flag to installer and health check for explicit target configuration.
- **Safe `--upgrade` Mechanism:** Updates previously managed files whose sha256 hashes match prior manifest, while preserving customized installs by producing reviewable `${target}.candidate` files.
- **Symlink Protection:** Enforces strict symlink destination guards across installer, context installer, preview server, and site generator.
- **Manifest State Tracking:** Records actual per-file sha256 hashes Sitting on disk after installation.
- **Unique Context Proposals:** `install-context.mjs` preserves existing original files AND prior `.masterminds-context` proposals by generating unique proposal filenames (`.1`, `.2`, etc.) when repeated context installation runs occur.
- **Robust Health Check:** `scripts/health-check.mjs` verifies non-empty core agent and skill files, validates manifest hashes, checks project context (`CLAUDE.md`, `USER.md`, `SOUL.md`), and exits nonzero with clear action instructions if missing.
- **Standardized Node 24 Stack:** Configured `.nvmrc`, `.node-version`, and `package.json` for Node 24 requirement (`engines: ">=24"`), zero external npm dependencies, and `npm test` script (`node --test tests/*.test.mjs`).
