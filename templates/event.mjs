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
  const ctaText = safeEmail ? `Register via ${safeEmail}` : 'Reserve Seat';

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
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "${safeName}",
    "description": "${safeHeadline}",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  }
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header">
    <div class="container header-inner">
      <a href="#" class="brand-logo">${safeName}</a>
      <nav class="site-nav" aria-label="Main Navigation">
        <a href="#program">Program</a>
        <a href="#location">Location</a>
        <a href="#passes">Passes</a>
        <a href="#register" class="nav-cta">Register</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero-section">
      <div class="container">
        <div class="event-meta-badge">
          <span class="meta-item">Date: Schedule Draft / TBD</span>
          <span class="meta-divider">•</span>
          <span class="meta-item">Venue: Main Hall / Online Stream</span>
        </div>
        <h1 class="hero-title">${safeHeadline}</h1>
        <p class="hero-description">An immersive gathering bringing together founders, practitioners, and leaders for intensive workshops and strategic exchange.</p>
        <div class="hero-actions">
          <a href="${ctaLink}" class="btn btn-primary">${ctaText}</a>
          <a href="#program" class="btn btn-secondary">View Agenda</a>
        </div>
      </div>
    </section>

    <section id="program" class="program-section">
      <div class="container">
        <div class="section-header">
          <h2>Program Schedule (Draft)</h2>
          <p>Structured sessions designed for actionable takeaways and peer collaboration.</p>
        </div>
        <div class="timeline">
          <div class="timeline-item">
            <div class="time-col">09:00 AM</div>
            <div class="content-col">
              <h3>Opening Keynote &amp; Vision</h3>
              <p>Welcome address and strategic framework setting for the day's focus areas.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">10:30 AM</div>
            <div class="content-col">
              <h3>Interactive Workshop Sessions</h3>
              <p>Breakout working groups tackling core execution challenges with live peer feedback.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">02:00 PM</div>
            <div class="content-col">
              <h3>Panel Discussion &amp; Q&amp;A</h3>
              <p>Unfiltered discussion on practical implementation, overcoming friction, and scaling results.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="time-col">04:30 PM</div>
            <div class="content-col">
              <h3>Closing Synthesis &amp; Networking</h3>
              <p>Final summary of action items followed by open connection and networking reception.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="location" class="location-section">
      <div class="container location-card">
        <h2>Venue &amp; Event Logistics</h2>
        <p class="notice-draft"><strong>Notice:</strong> Specific room assignments and stream links are finalized prior to event launch.</p>
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
            <p>Hybrid (In-person &amp; Interactive Virtual Stream)</p>
          </div>
        </div>
      </div>
    </section>

    <section id="passes" class="passes-section">
      <div class="container">
        <div class="section-header">
          <h2>Registration Passes (Draft Tiers)</h2>
          <p>Transparent registration options with no hidden fees.</p>
        </div>
        <div class="passes-grid">
          <div class="pass-card">
            <span class="pass-type">Standard Pass</span>
            <div class="pass-price">Draft Tier</div>
            <ul class="pass-features">
              <li>Full access to all keynote sessions</li>
              <li>Workshop materials and action guides</li>
              <li>Peer networking access</li>
            </ul>
            <a href="${ctaLink}" class="btn btn-secondary card-btn">Register Interest</a>
          </div>

          <div class="pass-card pass-featured">
            <span class="pass-type">VIP Access</span>
            <div class="pass-price">Draft Tier</div>
            <ul class="pass-features">
              <li>Includes all Standard Pass features</li>
              <li>Priority seating &amp; VIP reception</li>
              <li>1-on-1 organizer consultation block</li>
            </ul>
            <a href="${ctaLink}" class="btn btn-primary card-btn">Reserve VIP Pass</a>
          </div>
        </div>
      </div>
    </section>

    <section id="register" class="register-section">
      <div class="container">
        <div class="register-box">
          <h2>Secure Your Place</h2>
          <p>Capacity is managed to ensure high-quality discussion and group interaction.</p>
          ${safeEmail ? `
          <div class="register-action">
            <a href="mailto:${safeEmail}" class="btn btn-primary btn-large">Email ${safeEmail} to Register</a>
          </div>
          ` : `
          <div class="register-notice">
            <p><strong>Organizer Contact:</strong> Please provide a valid host email in your project brief to activate direct email registration links.</p>
            <a href="#main-content" class="btn btn-primary">Back to Top</a>
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
  --bg-main: #181325;
  --bg-surface: #251F35;
  --bg-card: #2D2540;
  --text-main: #FCF4EB;
  --text-muted: #D1C4E9;
  --accent-primary: #E11D48;
  --accent-hover: #BE123C;
  --accent-secondary: #D97706;
  --border-color: #3D3356;
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

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
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
  background-color: rgba(24, 19, 37, 0.95);
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
}

.site-nav {
  display: flex;
  align-items: center;
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
}

.meta-divider {
  color: var(--border-color);
}

/* Hero Section */
.hero-section {
  padding: 6rem 0 5rem 0;
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
  gap: 1.5rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1.5rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.75rem;
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
  padding: 3rem;
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
  h1.hero-title { font-size: 2rem; }
  .header-inner { flex-direction: column; height: auto; padding: 1rem 0; gap: 0.75rem; }
  .site-nav { gap: 1rem; }
  .footer-inner { flex-direction: column; gap: 1rem; text-align: center; }
  .event-meta-badge { flex-direction: column; gap: 0.25rem; border-radius: 12px; }
  .meta-divider { display: none; }
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

  const briefMd = `# Design Brief: ${safeName}

**Style Archetype:** Event / Workshop / Experience (Vibrant Energy & Direct Focus)
**Event Name:** ${safeName}
**Headline / Theme:** ${safeHeadline}
**Organizer Contact:** ${safeEmail || 'Not specified (using section fallback anchor)'}

---

## Visual Direction Parameters

- **Palette:** Midnight violet background (\`#181325\`), translucent surface (\`#251F35\`), card purple (\`#2D2540\`), milk primary text (\`#FCF4EB\`), vibrant pink accent (\`#E11D48\`), ochre secondary accent (\`#D97706\`).
- **Typography:** Expressive poster sans typography scale, high impact title, clean agenda layout.
- **Layout:** Centered event hero with date/venue badges, vertical program timeline, honest venue logistics status block, transparent pass tiers.
- **Accessibility:** Minimum 4.5:1 text contrast ratio, 44x44px touch targets, skip link, visible focus states, prefers-reduced-motion CSS support.
- **CTA Routing:** ${safeEmail ? `Verified mailto link to ${safeEmail}` : 'Working #register section anchor fallback.'}
`;

  const readmeMd = `# ${safeName} : Event Starter Site

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
