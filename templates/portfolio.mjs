function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generatePortfolioSite({ name, headline, email }) {
  const safeName = escapeHtml(name);
  const safeHeadline = escapeHtml(headline);
  const safeEmail = email ? escapeHtml(email) : '';

  const ctaLink = safeEmail ? `mailto:${safeEmail}` : '#contact';
  const ctaText = safeEmail ? `Inquire: ${safeEmail}` : 'Start A Project';

  const ldData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": headline
  };
  const jsonLdScript = JSON.stringify(ldData, null, 2).replace(/</g, '\\u003c');

  const svgAbstract1 = `<svg class="project-artwork" width="100%" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Example Abstract Illustration Placeholder 01: Vector Study">
    <rect width="400" height="240" fill="#181824"/>
    <circle cx="120" cy="120" r="70" fill="url(#grad1)" opacity="0.8"/>
    <polygon points="220,40 340,200 160,180" fill="url(#grad2)" opacity="0.6"/>
    <path d="M50 200 Q 200 50 350 200" stroke="#38BDF8" stroke-width="3" fill="none"/>
    <text x="40" y="225" fill="#64748B" font-size="11" font-family="monospace">EXAMPLE ABSTRACT ILLUSTRATION PLACEHOLDER 01</text>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#A855F7"/>
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EC4899"/>
        <stop offset="100%" stop-color="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>`;

  const svgAbstract2 = `<svg class="project-artwork" width="100%" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Example Abstract Illustration Placeholder 02: Dynamic Grid Architecture">
    <rect width="400" height="240" fill="#14141E"/>
    <rect x="40" y="40" width="140" height="160" stroke="#A855F7" stroke-width="2" rx="8" fill="#1F1F30"/>
    <circle cx="280" cy="120" r="60" stroke="#38BDF8" stroke-width="2" stroke-dasharray="8 6"/>
    <line x1="40" y1="200" x2="340" y2="40" stroke="#EC4899" stroke-width="2"/>
    <text x="40" y="225" fill="#64748B" font-size="11" font-family="monospace">EXAMPLE ABSTRACT ILLUSTRATION PLACEHOLDER 02</text>
  </svg>`;

  const svgAbstract3 = `<svg class="project-artwork" width="100%" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Example Abstract Illustration Placeholder 03: Fluid Canvas">
    <rect width="400" height="240" fill="#1A1829"/>
    <path d="M 40 120 C 120 40, 240 200, 360 120" stroke="#38BDF8" stroke-width="4" fill="none"/>
    <path d="M 40 160 C 160 80, 280 220, 360 80" stroke="#A855F7" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
    <circle cx="200" cy="120" r="16" fill="#F43F5E"/>
    <text x="40" y="225" fill="#64748B" font-size="11" font-family="monospace">EXAMPLE ABSTRACT ILLUSTRATION PLACEHOLDER 03</text>
  </svg>`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} | ${safeHeadline}</title>
  <meta name="description" content="Selected portfolio works and design direction by ${safeName}. ${safeHeadline}">
  <meta property="og:title" content="${safeName} | ${safeHeadline}">
  <meta property="og:description" content="Selected portfolio works and design direction by ${safeName}. ${safeHeadline}">
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
        <a href="#work">Selected Work</a>
        <a href="#about">About</a>
        <a href="#contact" class="nav-cta">Inquire</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <div class="draft-banner">
      <div class="container">
        <span>Draft Preview — Starter Example Content</span>
      </div>
    </div>

    <section class="hero-section">
      <div class="container">
        <span class="hero-tag">Creative Studio &amp; Portfolio</span>
        <h1 class="hero-title">${safeHeadline}</h1>
        <p class="hero-subtitle">Digital experiences, editorial systems, and creative technology.</p>
        <div class="hero-actions">
          <a href="${ctaLink}" class="btn btn-primary">${ctaText}</a>
          <a href="#work" class="btn btn-secondary">View Showcase</a>
        </div>
      </div>
    </section>

    <section id="work" class="work-section">
      <div class="container">
        <div class="section-header">
          <h2>Selected Work (Example Showcase)</h2>
          <p>Explorations in digital composition, systems architecture, and visual identity.</p>
        </div>
        <div class="gallery-grid">
          <article class="gallery-card card-large">
            <div class="artwork-wrapper">
              ${svgAbstract1}
            </div>
            <div class="card-meta">
              <span class="category">Brand Identity &amp; Digital (Example)</span>
              <h3>Prism Systems Showcase</h3>
              <p>An exploration of light refraction, modern color theory, and vector dynamics built for interactive platforms.</p>
              <div class="tags">
                <span class="tag">Identity</span>
                <span class="tag">Design System</span>
              </div>
            </div>
          </article>

          <article class="gallery-card">
            <div class="artwork-wrapper">
              ${svgAbstract2}
            </div>
            <div class="card-meta">
              <span class="category">Interactive Architecture (Example)</span>
              <h3>Dynamic Grid Protocol</h3>
              <p>Asymmetric grid layout exploration emphasizing structural negative space and geometric typography.</p>
              <div class="tags">
                <span class="tag">UI/UX</span>
                <span class="tag">Typography</span>
              </div>
            </div>
          </article>

          <article class="gallery-card">
            <div class="artwork-wrapper">
              ${svgAbstract3}
            </div>
            <div class="card-meta">
              <span class="category">Motion &amp; Canvas (Example)</span>
              <h3>Fluid Canvas Experiment</h3>
              <p>Minimalist generative canvas curves illustrating fluid state transitions and user feedback loops.</p>
              <div class="tags">
                <span class="tag">Generative</span>
                <span class="tag">Motion</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="about" class="about-section">
      <div class="container about-grid">
        <div class="about-bio">
          <h2>Creative Approach</h2>
          <p>Building high-impact digital experiences that strip away visual noise and focus on fundamental typography, deliberate layout, and brand story.</p>
          <p>Every project is crafted with strict performance standards, accessible interactions, and zero unnecessary dependencies.</p>
        </div>
        <div class="capabilities-card">
          <h3>Capabilities</h3>
          <ul class="capabilities-list">
            <li>Art Direction &amp; Brand Systems</li>
            <li>Editorial Web Design &amp; Development</li>
            <li>Custom SVG &amp; Abstract Vector Works</li>
            <li>Accessible &amp; High-Performance UI</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="contact" class="contact-section">
      <div class="container">
        <div class="inquiry-box">
          <h2>Let's build something exceptional</h2>
          <p>Currently accepting select project commissions and strategic design partnerships.</p>
          ${safeEmail ? `
          <div class="inquiry-action">
            <a href="mailto:${safeEmail}" class="btn btn-primary btn-large">Send Inquiry (${safeEmail})</a>
          </div>
          ` : `
          <div class="inquiry-notice">
            <p><strong>Direct Inquiries:</strong> Provide a valid email during project creation to enable direct click-to-email routing.</p>
            <a href="#main-content" class="btn btn-primary">Return to Top</a>
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
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

  const stylesCss = `:root {
  --bg-main: #0D0D11;
  --bg-surface: #181820;
  --bg-card: #14141C;
  --text-main: #F5F5F7;
  --text-muted: #94A3B8;
  --accent-primary: #38BDF8;
  --accent-hover: #0284C7;
  --accent-secondary: #A855F7;
  --border-color: #2A2A36;
  --font-sans: -apple-system, BlinkMacSystemFont, "Space Grotesk", "Segoe UI", Roboto, sans-serif;
  --max-width: 1200px;
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
  color: #0D0D11;
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
  color: var(--accent-primary);
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1, h2, h3 {
  color: var(--text-main);
  letter-spacing: -0.02em;
}

h1.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #F5F5F7;
}

h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

a {
  color: var(--accent-primary);
  text-decoration: none;
}

a:focus-visible, button:focus-visible {
  outline: 3px solid var(--accent-secondary);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Site Header */
.site-header {
  background-color: rgba(13, 13, 17, 0.95);
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
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.site-nav a {
  color: var(--text-muted);
  font-weight: 500;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.site-nav a:hover {
  color: var(--text-main);
}

.site-nav a.nav-cta {
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  padding: 0 1.25rem;
  border-radius: 4px;
}

.site-nav a.nav-cta:hover {
  background-color: var(--accent-primary);
  color: #0D0D11;
}

/* Buttons & Badges */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #0D0D11;
  border: 1px solid var(--accent-primary);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--text-muted);
  background-color: var(--bg-surface);
}

.btn-large {
  font-size: 1.1rem;
  padding: 0 2.25rem;
  min-height: 50px;
}

.hero-tag {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-secondary);
  margin-bottom: 1.5rem;
}

/* Hero Section */
.hero-section {
  padding: 7rem 0 5rem 0;
  max-width: 900px;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: var(--text-muted);
}

.hero-actions {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

/* Work Section & Asymmetric Gallery */
.work-section {
  padding: 5rem 0;
  border-top: 1px solid var(--border-color);
}

.section-header {
  margin-bottom: 3.5rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}

.card-large {
  grid-column: 1 / -1;
}

.gallery-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.artwork-wrapper {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-meta {
  padding: 2rem;
}

.category {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.tag {
  font-size: 0.8rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  color: var(--text-muted);
}

/* About Section */
.about-section {
  padding: 5rem 0;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.about-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3.5rem;
  align-items: start;
}

.about-bio p {
  margin-bottom: 1.25rem;
}

.capabilities-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2rem;
}

.capabilities-list {
  list-style: none;
  margin-top: 1rem;
}

.capabilities-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 500;
}

.capabilities-list li:last-child {
  border-bottom: none;
}

/* Inquiry Section */
.contact-section {
  padding: 6rem 0;
}

.inquiry-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.inquiry-box h2 {
  margin-bottom: 1rem;
}

.inquiry-action {
  margin-top: 2rem;
}

.inquiry-notice {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: var(--bg-main);
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}

/* Footer */
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 0;
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
@media (max-width: 900px) {
  h1.hero-title { font-size: 2.5rem; }
  .gallery-grid, .about-grid { grid-template-columns: 1fr; }
  .card-large { grid-column: auto; }
}

@media (max-width: 600px) {
  h1.hero-title { font-size: 2rem; }
  .header-inner { flex-direction: column; height: auto; padding: 1rem 0; gap: 0.75rem; }
  .site-nav { gap: 1rem; }
  .footer-inner { flex-direction: column; gap: 1rem; text-align: center; }
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

**Style Archetype:** Portfolio / Creative Showcase (Editorial Studio)
**Creator Name:** ${safeName}
**Headline / Specialty:** ${safeHeadline}
**Inquiry Email:** ${safeEmail || 'Not specified (using section fallback anchor)'}

---

## Visual Direction Parameters

- **Palette:** Deep obsidian background (\`#0D0D11\`), surface dark gray (\`#181820\`), high-contrast text (\`#F5F5F7\`), sky blue accent (\`#38BDF8\`), purple accent (\`#A855F7\`).
- **Typography:** Oversized solid typography (no gradient text), clean neutral body text.
- **Layout:** Full editorial hero, asymmetric gallery featuring original bundled abstract SVG artworks visibly labelled as example placeholders, capabilities list, direct inquiry card.
- **Accessibility:** High-contrast text on dark background, 44x44px touch targets, skip link, visible focus states, prefers-reduced-motion CSS support.
- **CTA Routing:** ${safeEmail ? `Verified mailto link to ${safeEmail}` : 'Working #contact section anchor fallback.'}
`;

  const readmeMd = `# ${safeName} : Portfolio Starter Site (Draft)

This portfolio starter site was generated using the zero-dependency CLI starter tool (\`scripts/create-site.mjs\`).

## Quick Start: Preview Locally

Run the static server from your project root:

\`\`\`bash
node scripts/preview.mjs --dir=. --port=3000
\`\`\`

Then open your browser to: \`http://127.0.0.1:3000\`

Alternatively, open \`index.html\` directly in any web browser.

## Customizing Your Site

- **HTML Content & Projects:** Edit \`index.html\` to replace project titles, descriptions, and capabilities.
- **Artwork & Graphics:** SVG art placeholders are embedded directly in \`index.html\`. Replace them with your own images or SVG assets.
- **Styling:** Edit \`styles.css\` to adjust colors and layout.
- **Project Brief:** Refer to \`brief.md\` for visual direction specifications.
`;

  return { indexHtml, stylesCss, briefMd, readmeMd };
}
