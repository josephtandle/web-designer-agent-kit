function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateServiceSite({ name, headline, email }) {
  const safeName = escapeHtml(name);
  const safeHeadline = escapeHtml(headline);
  const safeEmail = email ? escapeHtml(email) : '';

  const ctaLink = safeEmail ? `mailto:${safeEmail}` : '#contact';
  const ctaText = safeEmail ? `Email ${safeName}` : 'Get In Touch';

  const ldData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": name,
    "description": headline
  };
  const jsonLdScript = JSON.stringify(ldData, null, 2).replace(/</g, '\\u003c');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} | ${safeHeadline}</title>
  <meta name="description" content="Professional services from ${safeName}. ${safeHeadline}">
  <meta property="og:title" content="${safeName} | ${safeHeadline}">
  <meta property="og:description" content="Professional services from ${safeName}. ${safeHeadline}">
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
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="#about">About</a>
        <a href="#contact" class="nav-cta">Contact</a>
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
      <div class="container hero-split">
        <div class="hero-content">
          <span class="badge">Professional Advisory &amp; Services</span>
          <h1>${safeHeadline}</h1>
          <p class="hero-subtext">Dedicated strategy, guidance, and execution tailored to your specific goals. Clear communication and structured methodology.</p>
          <div class="hero-actions">
            <a href="${ctaLink}" class="btn btn-primary">${ctaText}</a>
            <a href="#services" class="btn btn-secondary">Explore Services</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="card-badge">Service Overview</div>
          <h3>Structured Working Model</h3>
          <ul class="check-list">
            <li>Tailored strategy sessions</li>
            <li>Direct project alignment</li>
            <li>Transparent milestones</li>
            <li>Clear evaluation criteria</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="services" class="services-section">
      <div class="container">
        <div class="section-header">
          <h2>Core Services</h2>
          <p>Practical solutions designed for sustainable growth and operational excellence.</p>
        </div>
        <div class="services-grid">
          <article class="service-card">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h3>Strategic Planning</h3>
            <p>Comprehensive roadmap development to align team execution with core business objectives.</p>
          </article>
          <article class="service-card">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <h3>Operational Optimization</h3>
            <p>Streamline workflows, reduce friction, and build scalable internal operating procedures.</p>
          </article>
          <article class="service-card">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Advisory &amp; Mentorship</h3>
            <p>Ongoing guidance and strategic review to navigate key decisions with confidence.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="process" class="process-section">
      <div class="container">
        <div class="section-header">
          <h2>Our Process</h2>
          <p>A simple, transparent 3-step engagement model.</p>
        </div>
        <div class="process-steps">
          <div class="step-item">
            <div class="step-number">01</div>
            <h3>Discovery</h3>
            <p>We review your current state, identify bottlenecks, and define success metrics.</p>
          </div>
          <div class="step-item">
            <div class="step-number">02</div>
            <h3>Strategy &amp; Roadmap</h3>
            <p>We design an actionable execution plan prioritized for maximum efficiency.</p>
          </div>
          <div class="step-item">
            <div class="step-number">03</div>
            <h3>Execution &amp; Review</h3>
            <p>We implement solutions with regular feedback loops to ensure ongoing results.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="about-section">
      <div class="container about-grid">
        <div class="about-text">
          <h2>About ${safeName}</h2>
          <p>Founded on principles of clarity, direct communication, and practical results. We partner with leaders to eliminate operational noise and focus on key priorities.</p>
          <p>Every engagement is customized to your requirements without fluff or unnecessary overhead.</p>
        </div>
        <div class="about-quote">
          <blockquote>
            "Clarity precedes momentum. When strategy is clear, execution follows naturally."
          </blockquote>
          <cite>Working Philosophy (Draft Example)</cite>
        </div>
      </div>
    </section>

    <section id="contact" class="contact-section">
      <div class="container">
        <div class="contact-card">
          <h2>Ready to get started?</h2>
          <p>Reach out to discuss your project or schedule an initial advisory consultation.</p>
          ${safeEmail ? `
          <div class="contact-action">
            <a href="mailto:${safeEmail}" class="btn btn-primary btn-large">Email ${safeEmail}</a>
          </div>
          ` : `
          <div class="contact-notice">
            <p><strong>Direct Inquiries:</strong> Please update your brief with a valid email address or contact link to enable direct click-to-email routing.</p>
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
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="#about">About</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

  const stylesCss = `:root {
  --bg-main: #FAF8F5;
  --bg-surface: #F0ECE1;
  --bg-card: #FFFFFF;
  --text-main: #1F2421;
  --text-muted: #4A5568;
  --accent-primary: #2D5A27;
  --accent-hover: #1E3A1E;
  --accent-secondary: #C85A32;
  --border-color: #E2DCD0;
  --font-serif: Georgia, Cambria, "Times New Roman", Times, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
  line-height: 1.6;
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
  background: var(--text-main);
  color: #FFFFFF;
  padding: 0.75rem 1.25rem;
  z-index: 9999;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
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
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1, h2, h3 {
  font-family: var(--font-serif);
  color: var(--text-main);
  line-height: 1.25;
}

h1 {
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.35rem;
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
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.brand-logo {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--text-main);
  font-weight: 500;
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
  padding: 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
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
  padding: 0 2rem;
  min-height: 48px;
}

.badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-secondary);
  background-color: var(--bg-surface);
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Hero Section */
.hero-section {
  padding: 5rem 0;
  background-color: var(--bg-main);
}

.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-subtext {
  font-size: 1.15rem;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2.5rem;
}

.card-badge {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: 0.75rem;
}

.check-list {
  list-style: none;
  margin-top: 1.25rem;
}

.check-list li {
  position: relative;
  padding-left: 1.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-main);
  font-weight: 500;
}

.check-list li::before {
  content: "\\2713";
  position: absolute;
  left: 0;
  color: var(--accent-primary);
  font-weight: bold;
}

/* Services Section */
.services-section {
  padding: 5rem 0;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.section-header {
  text-align: center;
  max-width: 650px;
  margin: 0 auto 3.5rem auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.service-card {
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2rem;
}

.service-icon {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

/* Process Section */
.process-section {
  padding: 5rem 0;
  background-color: var(--bg-main);
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.step-item {
  position: relative;
  padding: 2rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.step-number {
  font-family: var(--font-serif);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--accent-secondary);
  margin-bottom: 0.5rem;
}

/* About Section */
.about-section {
  padding: 5rem 0;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-color);
}

.about-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  align-items: center;
}

.about-text p {
  margin-bottom: 1rem;
}

.about-quote {
  background-color: var(--bg-card);
  border-left: 4px solid var(--accent-primary);
  padding: 2rem;
  border-radius: 0 8px 8px 0;
}

blockquote {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-style: italic;
  color: var(--text-main);
  margin-bottom: 0.75rem;
}

cite {
  font-style: normal;
  font-weight: 600;
  color: var(--accent-primary);
  font-size: 0.95rem;
}

/* Contact Section */
.contact-section {
  padding: 5rem 0;
  background-color: var(--bg-main);
}

.contact-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 3.5rem 2rem;
  text-align: center;
  max-width: 750px;
  margin: 0 auto;
}

.contact-card h2 {
  margin-bottom: 1rem;
}

.contact-action {
  margin-top: 2rem;
}

.contact-notice {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: var(--bg-card);
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}

/* Footer */
.site-footer {
  margin-top: auto;
  background-color: var(--text-main);
  color: #E2DCD0;
  padding: 2.5rem 0;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-inner p {
  color: #A0AEC0;
  font-size: 0.95rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #E2DCD0;
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: #FFFFFF;
}

/* Responsive Media Queries */
@media (max-width: 900px) {
  .hero-split, .services-grid, .process-steps, .about-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  h1 { font-size: 2.15rem; }
  h2 { font-size: 1.65rem; }
  .header-inner { flex-direction: column; height: auto; padding: 1rem 0; gap: 0.75rem; }
  .site-nav { flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
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

**Style Archetype:** Service Business (Warm Professional Clarity)
**Business Name:** ${safeName}
**Headline:** ${safeHeadline}
**Contact Email:** ${safeEmail || 'Not specified (using section fallback anchor)'}

---

## Visual Direction Parameters

- **Palette:** Off-white cream background (\`#FAF8F5\`), soft warm gray surface (\`#F0ECE1\`), deep charcoal body text (\`#1F2421\`), forest green accent (\`#2D5A27\`), muted terracotta badge (\`#C85A32\`).
- **Typography:** Serif display headings (Georgia/system serif), clean sans-serif body text.
- **Layout:** Asymmetric split hero, 3-column service grid, 3-step vertical process timeline, clean advisory about block, direct working contact card.
- **Accessibility:** Minimum 4.5:1 text contrast ratio, 44x44px touch targets, skip link, visible focus states, prefers-reduced-motion CSS support.
- **CTA Routing:** ${safeEmail ? `Verified mailto link to ${safeEmail}` : 'Working #contact section anchor fallback.'}
`;

  const readmeMd = `# ${safeName} : Service Starter Site (Draft)

This starter site was generated using the zero-dependency CLI starter tool (\`scripts/create-site.mjs\`).

## Quick Start: Preview Locally

Run the static server from your project root:

\`\`\`bash
node scripts/preview.mjs --dir=. --port=3000
\`\`\`

Then open your browser to: \`http://127.0.0.1:3000\`

Alternatively, open \`index.html\` directly in any web browser.

## Customizing Your Site

- **HTML Content:** Edit \`index.html\` to update your text, service details, and bio.
- **Styling:** Edit \`styles.css\` to adjust colors, fonts, and spacing.
- **Project Brief:** Refer to \`brief.md\` for visual direction specifications.
`;

  return { indexHtml, stylesCss, briefMd, readmeMd };
}
