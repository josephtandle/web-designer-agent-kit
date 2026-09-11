function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateEventSite({ name, headline, email }) {
  const safeName = escapeHtml(name);
  const safeHeadline = escapeHtml(headline);
  const safeEmail = email ? escapeHtml(email) : '';

  const ctaLink = safeEmail ? `mailto:${safeEmail}` : '#register';
  const ctaText = 'Ask about registration';

  const ldData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": headline
  };
  const jsonLdScript = JSON.stringify(ldData, null, 2).replace(/</g, '\\u003c');

  const decorativeMotifSvg = `<svg class="poster-motif-svg" width="100%" height="80" viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="20" width="120" height="40" rx="20" fill="#E11D48" opacity="0.8"/>
    <circle cx="200" cy="40" r="25" fill="#D97706" opacity="0.8"/>
    <path d="M 280 15 L 340 65 L 220 65 Z" fill="#F43F5E" opacity="0.7"/>
    <rect x="380" y="25" width="200" height="30" rx="6" fill="#F59E0B" opacity="0.6"/>
  </svg>`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} | ${safeHeadline}</title>
  <meta name="description" content="${safeName}: ${safeHeadline}. Program schedule, location details, and registration.">
  <meta property="og:title" content="${safeName} | ${safeHeadline}">
  <meta property="og:description" content="${safeName}: ${safeHeadline}. Program schedule, location details, and registration.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">
${jsonLdScript}
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header">
    <div class="container header-inner">
      <a href="#main-content" class="brand-logo">${safeName}</a>
      <nav class="site-nav" aria-label="Main Navigation">
        <a href="#program">Program</a>
        <a href="#location">Location</a>
        <a href="#passes">Passes</a>
        <a href="#register" class="nav-cta">Registration</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <div class="draft-banner">
      <div class="container">
        <span>Draft event announcement: dates, venue, and registration details are examples</span>
      </div>
    </div>

    <section class="hero-section">
      <div class="container">
        <div class="poster-header-motif">
          ${decorativeMotifSvg}
        </div>
        <div class="event-meta-badge">
          <span class="meta-item">Date: Draft Schedule / TBD</span>
          <span class="meta-divider">•</span>
          <span class="meta-item">Venue: To be confirmed</span>
        </div>
        <h1 class="hero-title">${safeHeadline}</h1>
        <p class="hero-description">A day to meet, work through a shared topic, ask questions, and spend time together.</p>
        <div class="hero-actions">
          <a href="${ctaLink}" class="btn btn-primary">${ctaText}</a>
          <a href="#program" class="btn btn-secondary">View the draft program</a>
        </div>
      </div>
    </section>

    <section id="program" class="program-section">
      <div class="container">
        <div class="section-header">
          <h2>Draft program</h2>
          <p>This is a sample outline. Replace the times and session details before publishing.</p>
        </div>
        <div class="timeline">
          <div class="timeline-item">
            <div class="time-col">09:00 AM</div>
            <div class="content-col">
              <h3>Welcome</h3>
              <p>A short welcome and overview of the day.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">10:30 AM</div>
            <div class="content-col">
              <h3>Work session</h3>
              <p>Small-group time to work through the main topic.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">02:00 PM</div>
            <div class="content-col">
              <h3>Questions and discussion</h3>
              <p>Time for participant questions and shared discussion.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">04:30 PM</div>
            <div class="content-col">
              <h3>Closing and conversation</h3>
              <p>Brief closing notes, followed by informal conversation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="location" class="location-section">
      <div class="container location-card">
        <h2>Venue and event details</h2>
        <p class="notice-draft"><strong>Draft details:</strong> Room and stream information still need organizer confirmation.</p>
        <div class="logistics-grid">
          <div class="logistics-item">
            <h3>Event Host</h3>
            <p>${safeName}</p>
          </div>
          <div class="logistics-item">
            <h3>Location Status</h3>
            <p>Draft / Subject to organizer confirmation</p>
          </div>
          <div class="logistics-item">
            <h3>Format</h3>
            <p>Example only: hybrid, in-person, or online</p>
          </div>
        </div>
      </div>
    </section>

    <section id="passes" class="passes-section">
      <div class="container">
        <div class="section-header">
          <h2>Example registration options</h2>
          <p>These sample options are not confirmed. Replace them with the organizer's actual offer.</p>
        </div>
        <div class="passes-grid">
          <div class="pass-card">
            <span class="pass-type">In-person place (example)</span>
            <div class="pass-price">Price to be confirmed</div>
            <ul class="pass-features">
              <li>Scheduled sessions</li>
              <li>Event materials</li>
              <li>Venue access</li>
            </ul>
            <a href="${ctaLink}" class="btn btn-secondary card-btn">Ask about registration</a>
          </div>

          <div class="pass-card pass-featured">
            <span class="pass-type">Online place (example)</span>
            <div class="pass-price">Price to be confirmed</div>
            <ul class="pass-features">
              <li>Stream access</li>
              <li>Online event materials</li>
              <li>Joining details by email</li>
            </ul>
            <a href="${ctaLink}" class="btn btn-primary card-btn">Ask about registration</a>
          </div>
        </div>
      </div>
    </section>

    <section id="register" class="register-section">
      <div class="container">
        <div class="register-box">
          <h2>Registration details</h2>
          <p>This is a draft announcement. Registration is not configured until an organizer contact is provided.</p>
          ${safeEmail ? `
          <div class="register-action">
            <a href="mailto:${safeEmail}" class="btn btn-primary btn-large">Ask about registration: ${safeEmail}</a>
          </div>
          ` : `
          <div class="register-notice">
            <p>Add a host email to the project brief before publishing this draft.</p>
            <a href="#main-content" class="btn btn-primary">Back to top</a>
          </div>
          `}
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>&copy; ${new Date().getFullYear()} ${safeName}. All rights reserved.</p>
      <div class="footer-links">
        <a href="#program">Program</a>
        <a href="#location">Location</a>
        <a href="#passes">Passes</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

  const stylesCss = `:root {
  --bg-main: #1C1917;
  --bg-surface: #292524;
  --bg-card: #322D29;
  --text-main: #FAFAF9;
  --text-muted: #D6D3D1;
  --accent-primary: #E11D48;
  --accent-hover: #BE123C;
  --accent-secondary: #D97706;
  --border-color: #44403C;
  --font-sans: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
  --max-width: 1140px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.5;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  background: var(--accent-primary);
  color: #FFFFFF;
  padding: 0.75rem 1.25rem;
  z-index: 9999;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 700;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 1rem;
}

.draft-banner {
  background-color: var(--bg-surface);
  border-bottom: 1px dashed var(--border-color);
  padding: 0.5rem 0;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-secondary);
}

.container {
  width: 100%;
  min-width: 0;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

main, section, .header-inner, .site-nav, .hero-actions,
.timeline-item, .content-col, .logistics-grid, .logistics-item,
.passes-grid, .pass-card, .register-box, .register-notice {
  min-width: 0;
}

h1, h2, h3 {
  color: var(--text-main);
  line-height: 1.2;
}

h1.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #FFFFFF;
}

h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

a {
  color: var(--accent-secondary);
  text-decoration: none;
}

a:focus-visible, button:focus-visible {
  outline: 3px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Site Header */
.site-header {
  background-color: rgba(28, 25, 23, 0.95);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
}

.brand-logo {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  overflow-wrap: anywhere;
}

.site-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--text-muted);
  font-weight: 600;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.site-nav a.nav-cta {
  background-color: var(--accent-primary);
  color: #FFFFFF;
  padding: 0 1.25rem;
  border-radius: 4px;
}

.site-nav a.nav-cta:hover {
  background-color: var(--accent-hover);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 1.75rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  max-width: 100%;
  height: auto;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
  overflow-wrap: anywhere;
  text-align: center;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #FFFFFF;
  border: 1px solid var(--accent-primary);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-surface);
}

.btn-large {
  font-size: 1.1rem;
  padding: 0 2.25rem;
  min-height: 50px;
}

.poster-header-motif {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.poster-motif-svg {
  display: block;
  width: 100%;
  height: auto;
  min-width: 0;
  max-width: 680px;
}

/* Event Meta Badge */
.event-meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-secondary);
  margin-bottom: 1.5rem;
  max-width: 100%;
}

.meta-divider {
  color: var(--border-color);
}

/* Hero Section */
.hero-section {
  padding: 4rem 0 4rem 0;
  text-align: center;
  max-width: 850px;
  margin: 0 auto;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Program Section */
.program-section {
  padding: 5rem 0;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-color);
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3.5rem auto;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--border-color);
}

.timeline-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding: 1.75rem 0;
}

.time-col {
  font-weight: 700;
  color: var(--accent-secondary);
  font-size: 1.1rem;
}

/* Location Section */
.location-section {
  padding: 5rem 0;
}

.location-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: clamp(1.25rem, 5vw, 3rem);
  overflow-wrap: anywhere;
}

.notice-draft {
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.logistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.logistics-item {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 8px;
}

/* Passes Section */
.passes-section {
  padding: 5rem 0;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-color);
}

.passes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.pass-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
}

.pass-featured {
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(225, 29, 72, 0.15);
}

.pass-type {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.pass-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-secondary);
  margin-bottom: 1.5rem;
}

.pass-features {
  list-style: none;
  margin-bottom: 2rem;
}

.pass-features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
}

.card-btn {
  margin-top: auto;
  width: 100%;
}

/* Register Section */
.register-section {
  padding: 6rem 0;
}

.register-box {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  max-width: 750px;
  margin: 0 auto;
}

.register-action {
  margin-top: 2rem;
}

.register-notice {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: var(--bg-card);
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}

/* Footer */
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 0;
  background-color: var(--bg-main);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-inner p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--text-main);
}

/* Responsive Media Queries */
@media (max-width: 800px) {
  h1.hero-title { font-size: 2.5rem; }
  .timeline-item { grid-template-columns: 1fr; gap: 0.5rem; }
  .logistics-grid, .passes-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .container { padding-left: 1rem; padding-right: 1rem; }
  .hero-section, .program-section, .location-section, .passes-section, .register-section { padding-top: 3.5rem; padding-bottom: 3.5rem; }
  h1.hero-title { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  .header-inner { flex-direction: column; height: auto; padding: 1rem 0; gap: 0.75rem; }
  .site-nav { width: 100%; justify-content: center; gap: 0.25rem 0.9rem; }
  .site-nav a { font-size: 0.9rem; }
  .footer-inner { flex-direction: column; gap: 1rem; text-align: center; }
  .event-meta-badge { flex-direction: column; gap: 0.25rem; border-radius: 12px; }
  .meta-divider { display: none; }
  .timeline-item { padding: 1.25rem 0; }
  .pass-card { padding: 1.25rem; }
  .register-box { padding: 2.5rem 1rem; }
  .btn-large { padding-left: 1rem; padding-right: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

  const briefMd = `# Design Brief: ${safeName} (Draft)

**Style Archetype:** Event / Workshop / Experience (Warm Ochre & Pink Poster Typography)
**Event Name:** ${safeName}
**Headline / Theme:** ${safeHeadline}
**Organizer Contact:** ${safeEmail || 'Not specified (using section fallback anchor)'}

---

## Visual Direction Parameters

- **Palette:** Warm charcoal background (\`#1C1917\`), surface warm stone (\`#292524\`), card stone (\`#322D29\`), vibrant pink accent (\`#E11D48\`), warm ochre secondary accent (\`#D97706\`).
- **Typography:** Warm ochre/pink poster typography, decorative original SVG motif, clear agenda layout.
- **Layout:** Centered event hero with date/venue badges, vertical program timeline, venue status block, and two clearly marked example registration options.
- **Accessibility:** Minimum 4.5:1 text contrast ratio, 44x44px touch targets, skip link, visible focus states, prefers-reduced-motion CSS support.
- **CTA Routing:** ${safeEmail ? `Mailto link to ${safeEmail}` : 'Working #register section anchor fallback.'}
`;

  const readmeMd = `# ${safeName} : Event Starter Site (Draft)

This event starter site was generated using the zero-dependency CLI starter tool (\`scripts/create-site.mjs\`).

## Quick Start: Preview Locally

Run the static server from your project root:

\`\`\`bash
node scripts/preview.mjs --dir=. --port=3000
\`\`\`

Then open your browser to: \`http://127.0.0.1:3000\`

Alternatively, open \`index.html\` directly in any web browser.

## Customizing Your Site

- **HTML Content:** Edit \`index.html\` to update the program schedule, venue details, and pass options.
- **Styling:** Edit \`styles.css\` to customize color choices and layout.
- **Project Brief:** Refer to \`brief.md\` for visual direction specifications.
`;

  return { indexHtml, stylesCss, briefMd, readmeMd };
}
