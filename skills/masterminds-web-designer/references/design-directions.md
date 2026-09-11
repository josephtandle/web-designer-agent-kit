# Visual Direction Playbook

Use this playbook to choose and execute visual directions for Mastermind and All Sorted participants.

## Intake Quick-Start Workflow

When starting a project or update:
1. Check `CLAUDE.md`, `USER.md`, and `SOUL.md` for existing participant context.
2. Read or generate a brief saved to `.masterminds-context/brief.json`.
3. If information is missing, ask at most 3 essential questions:
   - What is the business or project name and primary offer?
   - Who is the audience or client?
   - What main CTA action should visitors take?
4. Offer at most 3 visual directions based on the site archetype below. Recommend one option based on their business type. If the participant delegates the choice, select the recommended direction for their business archetype rather than defaulting to Direction 1.
5. Save choices to `.masterminds-context/design-decisions.json`.

---

## Built-in Specialty Capabilities

- **UI Composition and Craft:** Use bundled `frontend-design`, Palette Studio, Component Lab, and Layout Atlas. Optional skills may help but are not required.
- **Motion and Micro-Interactions:** Use original CSS transitions or keyframes by default. Keep motion optional and provide an explicit `prefers-reduced-motion` fallback. No external library is required.
- **SEO, GEO, and Structured Metadata:** Load `search-readiness.md`, then provide unique titles and descriptions, one H1, semantic navigation, crawlable visible text, and accurate heading structure. Make the entity identity clear, answer useful audience questions directly, and use verifiable facts. Use real Open Graph assets only when provided. Add canonical URLs only for verified public domains. Schema must match visible facts.
- **Source Research:** Treat the catalog as research-only. The default workflow does not fetch or install external GitHub code.

<!-- Source pin: the bundled scripts/seo-check.mjs contract and search-readiness.md govern website-finish search checks. -->
At website finish, run `node "$KIT_ROOT/scripts/seo-check.mjs" "--file=$PROJECT_ROOT/<site>/index.html" --json` as a read-only local audit. Fix confirmed local failures and rerun it. Use `"--url=<verified-public-URL>"` only for a verified public URL. Do not promise rankings, indexing, AI-answer inclusion, or citations, and do not require `llms.txt` or special AI schema. Unless separately observed, report `live_http: not_checked`, `robots: not_checked`, `indexing: not_checked`, and `ai_citations: not_checked`. External SEO skills are strictly optional, only for researching a specific identified gap, and never required to install.

---

## Site Archetype 1: Service Business

### Art Direction: Warm Professional Clarity
Designed for coaches, consultants, practitioners, and service providers who need to build trust quickly.

- **Color Palette:**
  - Background: Off-white / Cream `#FAF8F5`
  - Primary Surface: Soft Warm Gray `#F0ECE1`
  - Primary Text: Deep Charcoal `#1F2421`
  - Accent / CTA: Forest Sage `#2D5A27` or Muted Terracotta `#C85A32`
  - Border / Line: Soft Sand `#E2DCD0`
- **Typography Scale:**
  - Headings: Serif display (Georgia, Fraunces, or Playfair Display), weight 600
  - Body & UI: Clean sans-serif (Inter, Plus Jakarta Sans, or system-ui), weight 400/500
  - Scale: H1 2.75rem / 3.5rem desktop, H2 2rem, H3 1.35rem, Body 1.05rem (line-height 1.6)
- **Composition & Layout Strategy:**
  - Split hero layout (headline & key value card side-by-side).
  - Generous vertical whitespace (80px to 120px section padding).
  - Clean card structures with subtle 1px borders instead of heavy box shadows.
- **Assets Strategy:**
  - High-quality personal headshots or warm ambient background imagery.
  - Simple vector iconography with 1.5px stroke weight matching text color.
- **Motion (Optional):**
  - Subtle fade-in on scroll. Motion is strictly optional and must respect `prefers-reduced-motion`.
- **Honest Placeholder Facts & Proof:**
  - Use real participant stats when available. State process details accurately based on participant input, never inventing fake testimonials, unverified cohort numbers, or fabricated revenue stats.
- **CTA Fallbacks:**
  - Use a verified mailto or booking destination. A local `#contact` anchor may navigate to contact information, but it is not a form submission. Label unconnected demo forms and prevent submission.
- **SEO & Accessibility:**
  - Use one meaningful H1, a unique title and description, semantic navigation, and crawlable text. Add only schema supported by visible facts.
  - Contrast ratio 4.5:1 minimum for body text, 3:1 for large headings.
  - Touch targets 44x44px minimum with visible focus states (`:focus-visible`).

---

## Site Archetype 2: Portfolio / Creative Showcase

### Art Direction: Editorial Minimalist Studio
Designed for visual artists, photographers, writers, designers, and creative founders who want their work to take center stage.

- **Color Palette:**
  - Background: Deep Obsidian `#0D0D11` or Crisp Pure White `#FFFFFF`
  - Primary Text: High-Contrast Cream `#F5F5F7` or Charcoal `#111111`
  - Accent / CTA: Sky Blue `#38BDF8` or Electric Cobalt `#2563EB`
  - Border / Line: Subtle Charcoal `#2A2A36` or Light Gray `#E5E5E5`
- **Typography Scale:**
  - Headings: Modern Geometric Sans (Space Grotesk, Syne, or Instrument Sans), weight 700
  - Body & UI: Neutral Sans (Inter or system-ui), weight 400
  - Scale: H1 3.5rem desktop / 2.25rem mobile, H2 2.25rem, Body 1rem (line-height 1.5)
- **Composition & Layout Strategy:**
  - Asymmetric project gallery featuring bundled original abstract SVG artworks honestly labelled as illustration placeholders.
  - Large typography treatments with generous margin offsets.
  - Minimal decorative clutter; let imagery and typography define structure.
- **Assets Strategy:**
  - High-resolution work samples, project stills, or SVG abstract vector works.
  - Consistent aspect ratios for grid items (4:3 or 16:9).
- **Motion (Optional):**
  - Smooth hover scale on image cards (scale 1.02, 0.3s transition). Optional page transition or image reveal.
- **Honest Placeholder Facts & Proof:**
  - List verified project names, client categories, or completed works. Do not invent awards or press coverage.
- **CTA Fallbacks:**
  - Use a verified email link or a local anchor to visible contact information. Do not present navigation as form submission.
- **SEO & Accessibility:**
  - Alt text required on all image elements.
  - Keyboard nav focus outlines clearly visible (`:focus-visible`).

---

## Site Archetype 3: Event / Workshop / Experience

### Art Direction: Vibrant Energy & Direct Focus
Designed for event hosts, retreat facilitators, workshop leaders, and product launches requiring high conversion energy.

- **Color Palette:**
  - Background: Midnight Violet `#181325` or Deep Slate `#0F172A`
  - Card / Surface: Translucent Violet `#251F35` with light border `#3D3356`
  - Primary Text: Crisp Milk `#FCF4EB`
  - Accent / CTA: Vibrant Magenta-Pink `#E11D48` or Electric Coral `#FF6B6B`
  - Secondary Accent: Warm Ochre `#D97706`
- **Typography Scale:**
  - Headings: Expressive Display Sans (Plus Jakarta Sans or Cabinet Grotesk), weight 800
  - Body & UI: Readable Sans (Inter or system-ui), weight 400/500
  - Scale: H1 3.75rem desktop / 2.5rem mobile, H2 2.5rem, Body 1.1rem
- **Composition & Layout Strategy:**
  - Centered hero banner with date and venue callout badges (clearly marked as Draft if unspecified).
  - Schedule & agenda breakdown vertical timeline.
  - Clear pricing tiers or single-ticket conversion block.
- **Assets Strategy:**
  - Atmospheric photography from past gatherings, venue imagery, or host photo.
- **Motion (Optional):**
  - Subtle pulse on CTA button. Keep static if reduced motion is requested.
- **Honest Placeholder Facts & Proof:**
  - Display confirmed seat count, date, location or online link, and schedule details. Draft callouts may appear visibly in a local prototype but must not be emitted as factual Event schema.
- **CTA Fallbacks:**
  - Use a verified ticket destination or organizer mailto link. A local `#register` anchor is navigation only unless a connected endpoint exists and the user has confirmed send intent.
- **SEO & Accessibility:**
  - Single-column stack on mobile devices for agenda and pricing cards.
  - ARIA landmarks on main content regions.
