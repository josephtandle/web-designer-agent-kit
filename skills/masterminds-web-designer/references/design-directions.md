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
4. Offer at most 3 visual directions based on the site archetype below. Recommend one option based on their business type. If the participant delegates the choice, default to Direction 1.
5. Save choices to `.masterminds-context/design-decisions.json`.

---

## Site Archetype 1: Service Business

### Art Direction: Warm Professional Clarity
Designed for coaches, consultants, practitioners, and service providers who need to build trust quickly.

- **Color Palette:**
  - Background: Off-white / Cream `#FAF8F5`
  - Primary Surface: Soft Warm Gray `#F0ECE1`
  - Primary Text: Deep Charcoal `#1F2421`
  - Accent / CTA: Muted Terracotta `#C85A32` or Forest Sage `#3A5A40`
  - Border / Line: Soft Sand `#E2DCD0`
- **Typography Scale:**
  - Headings: Serif display (Fraunces, Playfair Display, or Georgia), weight 600
  - Body & UI: Clean sans-serif (Inter, Plus Jakarta Sans, or system-ui), weight 400/500
  - Scale: H1 2.75rem / 3.5rem desktop, H2 2rem, H3 1.35rem, Body 1.05rem (line-height 1.6)
- **Composition & Layout Strategy:**
  - Single main column or gentle 60/40 asymmetrical split.
  - Generous vertical whitespace (80px to 120px section padding).
  - Clean card structures with subtle 1px borders instead of heavy box shadows.
- **Assets Strategy:**
  - High-quality personal headshots or warm ambient background imagery.
  - Simple vector iconography with 1.5px stroke weight matching text color.
- **Motion (Optional):**
  - Subtle fade-in on scroll (duration 0.4s, ease-out). Motion is strictly optional and must respect `prefers-reduced-motion`.
- **Honest Placeholder Facts & Proof:**
  - Use real participant stats when available. If proof is pending, state process details (for example, "Enrolling Cohort 3") rather than fake testimonials or fabricated revenue numbers.
- **CTA Fallbacks:**
  - Direct mailto link (`mailto:hello@example.com`) or booking URL (`https://cal.com/example`). If booking link is missing, fallback to simple contact anchor form.
- **Responsive & Accessibility:**
  - Contrast ratio 4.5:1 minimum for body text, 3:1 for large headings.
  - Touch targets 44x44px minimum. Touch-friendly spacing on mobile.

---

## Site Archetype 2: Portfolio / Creative Showcase

### Art Direction: Editorial Minimalist Studio
Designed for visual artists, photographers, writers, designers, and creative founders who want their work to take center stage.

- **Color Palette:**
  - Background: Deep Obsidian `#121212` or Crisp Pure White `#FFFFFF`
  - Primary Text: High-Contrast Cream `#F5F5F7` or Charcoal `#111111`
  - Accent / CTA: Electric Cobalt `#2563EB` or Warm Amber `#D97706`
  - Border / Line: Subtle Charcoal `#2A2A2D` or Light Gray `#E5E5E5`
- **Typography Scale:**
  - Headings: Modern Geometric Sans (Space Grotesk, Syne, or Instrument Sans), weight 700
  - Body & UI: Neutral Sans (Inter or system-ui), weight 400
  - Scale: H1 3.5rem desktop / 2.25rem mobile, H2 2.25rem, Body 1rem (line-height 1.5)
- **Composition & Layout Strategy:**
  - Masonry gallery or full-bleed horizontal project showcases.
  - Large typography treatments with generous margin offsets.
  - Minimal decorative clutter; let imagery and typography define structure.
- **Assets Strategy:**
  - High-resolution work samples, project stills, or video embeds.
  - Consistent aspect ratios for grid items (4:3 or 16:9).
- **Motion (Optional):**
  - Smooth hover scale on image cards (scale 1.02, 0.3s transition). Optional page transition or image reveal.
- **Honest Placeholder Facts & Proof:**
  - List verified project names, client categories, or completed works. Do not invent awards or press coverage.
- **CTA Fallbacks:**
  - Project inquiry form or direct email CTA link.
- **Responsive & Accessibility:**
  - Alt text required on all portfolio image elements.
  - Keyboard nav focus outlines clearly visible (`outline: 2px solid currentColor`).

---

## Site Archetype 3: Event / Workshop / Experience

### Art Direction: Vibrant Energy & Direct Focus
Designed for event hosts, retreat facilitators, workshop leaders, and product launches requiring high conversion energy.

- **Color Palette:**
  - Background: Midnight Violet `#181325` or Deep Slate `#0F172A`
  - Card / Surface: Translucent Violet `#251F35` with light border `#3D3356`
  - Primary Text: Crisp Milk `#FCF4EB`
  - Accent / CTA: Vibrant Magenta-Pink `#EC4899` or Electric Coral `#FF6B6B`
- **Typography Scale:**
  - Headings: Expressive Display Sans (Plus Jakarta Sans or Cabinet Grotesk), weight 800
  - Body & UI: Readable Sans (Inter or system-ui), weight 400/500
  - Scale: H1 3.75rem desktop / 2.5rem mobile, H2 2.5rem, Body 1.1rem
- **Composition & Layout Strategy:**
  - Hero with event date, venue, and primary registration CTA above fold.
  - Schedule / Agenda breakdown table or vertical timeline.
  - Clear pricing tiers or single-ticket conversion block.
- **Assets Strategy:**
  - Atmospheric photography from past gatherings, venue imagery, or host photo.
  - Countdown or date badge component.
- **Motion (Optional):**
  - Subtle pulse on CTA button or countdown ticker. Keep static if reduced motion is requested.
- **Honest Placeholder Facts & Proof:**
  - Display actual seat count, date, location (or online link), and transparent schedule details.
- **CTA Fallbacks:**
  - Direct ticket registration link, Stripe checkout link, or waitlist email capture form.
- **Responsive & Accessibility:**
  - Single-column stack on mobile devices for agenda and pricing cards.
  - ARIA landmarks on main content regions.
