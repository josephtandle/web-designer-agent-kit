# Web Designer Agent Kit 2.0 Upgrade Plan

This document outlines the three upgrade rounds to evolve the Web Designer Agent Kit from 1.0.0 to 2.0.0.

## Overview

The 2.0.0 release transforms the participant experience from a setup-heavy workflow into a fast, guided build process for All Sorted and Mastermind participants, whether they are building a new site or updating an existing one.

---

## Round 1: Intake and Design Guidance (Active Round)

### What / Why
Simplify participant intake and visual direction choices. Replace setup-heavy and mandatory effect guidance with a fast quick-start. Help both beginners and participants with existing sites move from idea to first build without friction.

### Approach
- Create a concise intake flow: short business brief, at most 3 essential questions when blocked, and at most 3 visual directions with a recommended default.
- Persist brief and design choices in project-local files (`.masterminds-context/brief.json` and `.masterminds-context/design-decisions.json`) without overwriting original files.
- Add a design-direction playbook in `skills/masterminds-web-designer/references/design-directions.md` covering service, portfolio, and event sites with concrete color palettes, typography scales, layout composition, asset strategies, optional motion, honest placeholder facts, working CTA fallbacks, responsive layouts, and accessibility standards.
- Add revision (`prompts/05-revise-website.md`) and finish (`prompts/06-finish-website.md`) prompts.
- Update agent (`agents/web-designer.md`), core skill (`skills/masterminds-web-designer/SKILL.md`), and `README.md` to reference the local playbook, remove mandatory 3D/effect requirements, offer an immediate pasteable prompt, and remove `--dangerously-skip-permissions` defaults while clarifying the 22-skill installer stack.

### Acceptance Criteria
- Version set to 2.0.0 in `package.json`.
- Intake workflow limits questions to max 3 when blocked and offers max 3 visual options with defaults.
- Playbook in `skills/masterminds-web-designer/references/design-directions.md` is loaded relatively by `skills/masterminds-web-designer/SKILL.md`.
- Revision and finish prompts exist under `prompts/`.
- README includes immediate pasteable first-build prompt and retains backward command compatibility.
- Zero em dashes across all modified and newly created files.

### The Check
- Verify file presence, JSON structure, relative skill path loading, and zero em dashes across markdown and JSON files.

### Out of Scope
- Round 2 starters and live preview server implementation.
- Round 3 offline npm cache and offline health checks.

---

## Round 2: Portable Zero-Dependency Starters and Preview (Planned)

### What / Why
Provide standalone starter templates and preview mechanisms so participants can inspect designs locally without heavy framework dependencies.

### Approach
- Build zero-dependency HTML/CSS/JS starters for service, portfolio, and event use cases.
- Create local preview workflows for instant browser feedback.

### Acceptance Criteria
- Portable starters render cleanly across browsers without build steps.
- Visual directions map directly to starter templates.

### The Check
- Validate starter structure and preview launch commands.

### Out of Scope
- Final offline installation fallback scripts.

---

## Round 3: Reliable Offline Core Installation, Health, and Release Parity (Planned)

### What / Why
Ensure complete offline reliability, robust health checks, and installer feature parity across operating systems.

### Approach
- Bundle core skills locally so installation works without external git dependencies.
- Update health checks and installer scripts for offline execution.

### Acceptance Criteria
- Full offline installation verified on Mac and Windows.
- Health check confirms offline assets and reports status accurately.

### The Check
- Run offline installer test and verify health status output.

### Out of Scope
- Post-2.0 feature additions.
