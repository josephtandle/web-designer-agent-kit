const FIELDS = Object.freeze({
  hero: ['title', 'eyebrow', 'body', 'image', 'action', 'items'],
  standard: ['title', 'eyebrow', 'body', 'image', 'action', 'items'],
});

const catalogEntry = (id, category, label, description, fields = FIELDS.standard) =>
  Object.freeze({ id, category, label, description, fields });

export const SECTION_CATALOG = Object.freeze([
  catalogEntry('hero-split', 'hero', 'Split hero', 'A two-part opening with copy beside a strong visual.', FIELDS.hero),
  catalogEntry('hero-editorial', 'hero', 'Editorial hero', 'A typographic opening arranged like a magazine lead.', FIELDS.hero),
  catalogEntry('hero-poster', 'hero', 'Poster hero', 'A centered, high-impact opening with poster-like scale.', FIELDS.hero),
  catalogEntry('intro-note', 'intro', 'Opening note', 'A concise welcome composed as a personal note.'),
  catalogEntry('intro-bio', 'intro', 'Biography intro', 'An image-led introduction for a person or practice.'),
  catalogEntry('intro-statement', 'intro', 'Statement intro', 'A spacious declaration with supporting context.'),
  catalogEntry('services-rows', 'services', 'Service rows', 'Ruled service entries designed for useful detail.'),
  catalogEntry('services-bands', 'services', 'Service bands', 'Alternating full-width service stories.'),
  catalogEntry('services-columns', 'services', 'Service columns', 'A compact comparative service grid.'),
  catalogEntry('benefits-annotated', 'benefits', 'Annotated benefits', 'Benefits paired with labels and explanatory notes.'),
  catalogEntry('benefits-feature', 'benefits', 'Featured benefit', 'One visual feature supported by a benefit sequence.'),
  catalogEntry('benefits-checklist', 'benefits', 'Benefit checklist', 'A direct, scannable list of practical advantages.'),
  catalogEntry('work-gallery', 'work', 'Work gallery', 'A visual gallery with captions and project detail.'),
  catalogEntry('work-stories', 'work', 'Work stories', 'Narrative case-study excerpts in an editorial stack.'),
  catalogEntry('work-index', 'work', 'Work index', 'A precise, directory-like index of selected work.'),
  catalogEntry('process-steps', 'process', 'Process steps', 'Numbered steps in a clear card sequence.'),
  catalogEntry('process-timeline', 'process', 'Process timeline', 'A chronological path with connected milestones.'),
  catalogEntry('process-narrative', 'process', 'Process narrative', 'A prose-led account of how the work unfolds.'),
  catalogEntry('proof-quote', 'proof', 'Featured quote', 'A prominent quotation with careful attribution.'),
  catalogEntry('proof-stories', 'proof', 'Client stories', 'Evidence presented as attributed short stories.'),
  catalogEntry('proof-metrics', 'proof', 'Proof metrics', 'Supplied measures presented without invented claims.'),
  catalogEntry('people-profile', 'people', 'Person profile', 'A detailed portrait and biography composition.'),
  catalogEntry('people-grid', 'people', 'People grid', 'A responsive portrait directory for a team.'),
  catalogEntry('people-list', 'people', 'People list', 'A compact, ruled roster with roles and links.'),
  catalogEntry('pricing-table', 'pricing', 'Pricing table', 'Comparable supplied offers in an accessible table.'),
  catalogEntry('pricing-rows', 'pricing', 'Pricing rows', 'Roomy offer rows with clear prices and actions.'),
  catalogEntry('pricing-offer', 'pricing', 'Featured offer', 'A single offer framed with its supporting details.'),
  catalogEntry('faq-disclosure', 'faq', 'FAQ disclosures', 'Native expandable answers using disclosure controls.'),
  catalogEntry('faq-columns', 'faq', 'FAQ columns', 'Open questions and answers in balanced columns.'),
  catalogEntry('faq-index', 'faq', 'FAQ index', 'A numbered reference-style question index.'),
  catalogEntry('event-agenda', 'event', 'Event agenda', 'A chronological run-of-show with times and details.'),
  catalogEntry('event-venue', 'event', 'Event venue', 'A place-led event section with visual context.'),
  catalogEntry('event-strip', 'event', 'Event strip', 'A concise horizontal event announcement.'),
  catalogEntry('contact-panel', 'contact', 'Contact panel', 'A contained invitation with one clear next step.'),
  catalogEntry('contact-split', 'contact', 'Split contact', 'Contact copy and details in separate columns.'),
  catalogEntry('contact-band', 'contact', 'Contact band', 'A bold full-width closing invitation.'),
]);

const CATALOG_IDS = new Set(SECTION_CATALOG.map(({ id }) => id));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function classNames(...names) {
  return names.filter(Boolean).map(escapeHtml).join(' ');
}

function editPath(context, suffix) {
  const prefix = typeof context.editPrefix === 'string' ? context.editPrefix : '';
  return prefix ? `${prefix}.${suffix}` : suffix;
}

function editableAttribute(context, suffix, name = 'data-edit-path') {
  return ` ${name}="${escapeHtml(editPath(context, suffix))}"`;
}

function textElement(tag, value, context, suffix, className = '') {
  if (typeof value !== 'string') return '';
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : '';
  return `<${tag}${classAttribute}${editableAttribute(context, suffix)}>${escapeHtml(value)}</${tag}>`;
}

function resolvedUrl(value, context) {
  const resolved = context.resolveUrl(value);
  return escapeHtml(resolved);
}

function renderImage(image, context, suffix, className = 'section-image') {
  if (!image || typeof image.src !== 'string') return '';
  const alt = typeof image.alt === 'string' ? image.alt : '';
  const altPath = `${suffix}.alt`;
  return `<img class="${escapeHtml(className)}" src="${resolvedUrl(image.src, context)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"${editableAttribute(context, `${suffix}.src`)}${editableAttribute(context, altPath, 'data-edit-alt-path')}>`;
}

function renderAction(action, context, suffix, className = 'section-action') {
  if (!action || typeof action.href !== 'string') return '';
  const label = typeof action.label === 'string' ? action.label : action.href;
  return `<a class="${escapeHtml(className)}" href="${resolvedUrl(action.href, context)}"${editableAttribute(context, `${suffix}.href`)}>${textElement('span', label, context, `${suffix}.label`)}</a>`;
}

function headingTag(context) {
  return context.headingLevel === 1 ? 'h1' : 'h2';
}

function itemHeadingTag(context) {
  return context.headingLevel === 1 ? 'h2' : 'h3';
}

function renderSectionHeading(section, context, options = {}) {
  const titleTag = headingTag(context);
  const eyebrow = textElement('p', section.eyebrow, context, 'eyebrow', 'section-eyebrow');
  const title = textElement(titleTag, section.title, context, 'title', 'section-title');
  const body = textElement('p', section.body, context, 'body', 'section-body');
  const action = options.action === false ? '' : renderAction(section.action, context, 'action');
  return `<header class="${classNames('section-heading', options.className)}">${eyebrow}${title}${body}${action}</header>`;
}

function renderItemFields(item, index, context, options = {}) {
  const base = `items.${index}`;
  const titleTag = options.titleTag || itemHeadingTag(context);
  const image = renderImage(item.image, context, `${base}.image`, options.imageClass || 'item-image');
  const label = textElement(options.labelTag || 'p', item.label, context, `${base}.label`, 'item-label');
  const time = textElement('time', item.time, context, `${base}.time`, 'item-time');
  const value = textElement(options.valueTag || 'strong', item.value, context, `${base}.value`, 'item-value');
  const price = textElement('p', item.price, context, `${base}.price`, 'item-price');
  const body = textElement('p', item.body, context, `${base}.body`, 'item-body');
  const author = textElement('cite', item.author, context, `${base}.author`, 'item-author');
  const role = textElement('span', item.role, context, `${base}.role`, 'item-role');
  let title = textElement(titleTag, item.title, context, `${base}.title`, 'item-title');
  let link = '';

  if (typeof item.href === 'string') {
    const fallback = typeof item.title === 'string' ? item.title : typeof item.label === 'string' ? item.label : item.href;
    const contents = typeof item.title === 'string'
      ? textElement('span', item.title, context, `${base}.title`)
      : typeof item.label === 'string'
        ? textElement('span', fallback, context, `${base}.label`)
        : `<span>${escapeHtml(fallback)}</span>`;
    link = `<a class="item-link" href="${resolvedUrl(item.href, context)}"${editableAttribute(context, `${base}.href`)}>${contents}<span aria-hidden="true">↗</span></a>`;
    if (typeof item.title === 'string') title = '';
    if (typeof item.label === 'string' && typeof item.title !== 'string') {
      // The linked label already represents this leaf; avoid saying it twice.
      return `${image}${time}${value}${price}${title}${link}${body}${author}${role}`;
    }
  }

  return `${image}${time}${label}${value}${price}${title}${link}${body}${author}${role}`;
}

function renderItems(section, context, tag, className, itemTag = 'article', itemClass = 'section-item', options = {}) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return '';
  return `<${tag} class="${escapeHtml(className)}">${items.map((item, index) => `<${itemTag} class="${escapeHtml(itemClass)}">${renderItemFields(item, index, context, options)}</${itemTag}>`).join('')}</${tag}>`;
}

function renderSectionMedia(section, context, className = 'section-media') {
  if (!section.image) return '';
  return `<figure class="${escapeHtml(className)}">${renderImage(section.image, context, 'image')}</figure>`;
}

function renderShell(type, contents, section, extraClass = '') {
  const id = typeof section.id === 'string' ? ` id="${escapeHtml(section.id)}"` : '';
  return `<section${id} class="${classNames('wd-section', `section-${type}`, extraClass)}"><div class="section-shell">${contents}</div></section>`;
}

function renderDefinitionItems(section, context, className) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return '';
  return `<dl class="${escapeHtml(className)}">${items.map((item, index) => {
    const base = `items.${index}`;
    const termValue = item.title ?? item.label ?? item.value ?? item.price ?? item.time;
    const termKey = item.title != null ? 'title' : item.label != null ? 'label' : item.value != null ? 'value' : item.price != null ? 'price' : item.time != null ? 'time' : null;
    const term = termKey
      ? textElement('dt', termValue, context, `${base}.${termKey}`, 'item-title')
      : `<dt class="item-title">Item ${index + 1}</dt>`;
    const remainder = termKey ? { ...item, [termKey]: undefined } : item;
    return `${term}<dd>${renderItemFields(remainder, index, context, { titleTag: 'strong' })}</dd>`;
  }).join('')}</dl>`;
}

function renderPricingTable(section, context) {
  const items = Array.isArray(section.items) ? section.items : [];
  const rows = items.map((item, index) => {
    const offer = { title: item.title, label: item.label, href: item.href };
    const price = { price: item.price, value: item.value };
    const details = { image: item.image, time: item.time, body: item.body, author: item.author, role: item.role };
    const offerContents = renderItemFields(offer, index, context) || `Offer ${index + 1}`;
    return `<tr><th scope="row">${offerContents}</th><td>${renderItemFields(price, index, context)}</td><td>${renderItemFields(details, index, context)}</td></tr>`;
  }).join('');
  return `<p class="table-scroll-cue">Scroll horizontally to compare every pricing detail.</p><div class="table-scroll" role="region" aria-label="Pricing options; scroll horizontally to compare all columns" tabindex="0"><table class="price-table"><caption class="table-caption">Pricing options</caption><thead><tr><th scope="col">Offer</th><th scope="col">Price</th><th scope="col">Details</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

const renderers = {
  'hero-split': (section, context) => renderShell('hero-split', `<div class="hero-split-copy">${renderSectionHeading(section, context)}</div>${renderSectionMedia(section, context, 'hero-split-media')}${renderItems(section, context, 'div', 'hero-support', 'article', 'hero-support-item')}`, section),

  'hero-editorial': (section, context) => renderShell('hero-editorial', `${textElement('p', section.eyebrow, context, 'eyebrow', 'section-eyebrow')}<div class="editorial-title">${textElement(headingTag(context), section.title, context, 'title', 'section-title')}</div><div class="editorial-deck">${textElement('p', section.body, context, 'body', 'section-body')}${renderAction(section.action, context, 'action')}${renderItems(section, context, 'ul', 'editorial-notes', 'li', 'editorial-note')}</div>${renderSectionMedia(section, context, 'editorial-media')}`, section),

  'hero-poster': (section, context) => renderShell('hero-poster', `<div class="poster-field">${renderSectionMedia(section, context, 'poster-media')}<div class="poster-copy">${renderSectionHeading(section, context, { action: false })}${renderAction(section.action, context, 'action', 'section-action action-inverse')}</div></div>${renderItems(section, context, 'div', 'poster-details', 'article', 'poster-detail')}`, section),

  'intro-note': (section, context) => renderShell('intro-note', `<aside class="note-card"><span class="note-mark" aria-hidden="true">✦</span>${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'note-postscript', 'div', 'note-line')}</aside>${renderSectionMedia(section, context, 'note-media')}`, section),

  'intro-bio': (section, context) => renderShell('intro-bio', `${renderSectionMedia(section, context, 'bio-portrait')}<div class="bio-copy">${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'bio-facts', 'article', 'bio-fact')}</div>`, section),

  'intro-statement': (section, context) => renderShell('intro-statement', `<div class="statement-rule" aria-hidden="true"></div>${renderSectionHeading(section, context)}${renderItems(section, context, 'ul', 'statement-notes', 'li', 'statement-note')}${renderSectionMedia(section, context, 'statement-media')}`, section),

  'services-rows': (section, context) => renderShell('services-rows', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'ruled-rows', 'article', 'ruled-row')}${renderSectionMedia(section, context)}`, section),

  'services-bands': (section, context) => renderShell('services-bands', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'service-bands', 'article', 'service-band')}${renderSectionMedia(section, context, 'bands-coda')}`, section),

  'services-columns': (section, context) => renderShell('services-columns', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'service-columns', 'article', 'service-column')}${renderSectionMedia(section, context)}`, section),

  'benefits-annotated': (section, context) => renderShell('benefits-annotated', `<div class="annotated-lead">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderDefinitionItems(section, context, 'annotated-list')}`, section),

  'benefits-feature': (section, context) => renderShell('benefits-feature', `<div class="feature-frame">${renderSectionMedia(section, context, 'feature-media')}<div class="feature-copy">${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'feature-points', 'article', 'feature-point')}</div></div>`, section),

  'benefits-checklist': (section, context) => renderShell('benefits-checklist', `${renderSectionHeading(section, context)}<div class="checklist-layout">${renderItems(section, context, 'ul', 'checklist', 'li', 'checklist-item')}${renderSectionMedia(section, context, 'checklist-media')}</div>`, section),

  'work-gallery': (section, context) => renderShell('work-gallery', `${renderSectionHeading(section, context)}${renderSectionMedia(section, context, 'gallery-lead')}${renderItems(section, context, 'div', 'work-gallery', 'figure', 'gallery-item')}`, section),

  'work-stories': (section, context) => renderShell('work-stories', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'story-stack', 'article', 'work-story')}${renderSectionMedia(section, context, 'story-coda')}`, section),

  'work-index': (section, context) => renderShell('work-index', `<div class="index-mast">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'ol', 'work-index', 'li', 'work-index-row')}`, section),

  'process-steps': (section, context) => renderShell('process-steps', `${renderSectionHeading(section, context)}${renderItems(section, context, 'ol', 'step-cards', 'li', 'step-card')}${renderSectionMedia(section, context)}`, section),

  'process-timeline': (section, context) => renderShell('process-timeline', `<div class="timeline-lead">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'ol', 'timeline', 'li', 'timeline-stop')}`, section),

  'process-narrative': (section, context) => renderShell('process-narrative', `${renderSectionHeading(section, context)}<div class="narrative-body">${renderItems(section, context, 'div', 'narrative-chapters', 'section', 'narrative-chapter')}${renderSectionMedia(section, context, 'narrative-media')}</div>`, section),

  'proof-quote': (section, context) => renderShell('proof-quote', `${renderSectionHeading(section, context)}<blockquote class="featured-quote">${renderItems(section, context, 'div', 'quote-voices', 'div', 'quote-voice') || '<span aria-hidden="true">“</span>'}</blockquote>${renderSectionMedia(section, context, 'quote-portrait')}`, section),

  'proof-stories': (section, context) => renderShell('proof-stories', `<div class="proof-lead">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'div', 'proof-stories', 'blockquote', 'proof-story')}`, section),

  'proof-metrics': (section, context) => renderShell('proof-metrics', `${renderSectionHeading(section, context)}${renderDefinitionItems(section, context, 'metric-ledger')}${renderSectionMedia(section, context, 'metrics-media')}`, section),

  'people-profile': (section, context) => renderShell('people-profile', `<div class="profile-frame">${renderSectionMedia(section, context, 'profile-portrait')}<div class="profile-copy">${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'profile-details', 'article', 'profile-detail')}</div></div>`, section),

  'people-grid': (section, context) => renderShell('people-grid', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'people-grid', 'article', 'person-card')}${renderSectionMedia(section, context, 'people-coda')}`, section),

  'people-list': (section, context) => renderShell('people-list', `<div class="people-list-head">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'ul', 'people-list', 'li', 'person-row')}`, section),

  'pricing-table': (section, context) => renderShell('pricing-table', `${renderSectionHeading(section, context)}${renderPricingTable(section, context)}${renderSectionMedia(section, context)}`, section),

  'pricing-rows': (section, context) => renderShell('pricing-rows', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'price-rows', 'article', 'price-row')}${renderSectionMedia(section, context)}`, section),

  'pricing-offer': (section, context) => renderShell('pricing-offer', `<div class="offer-card">${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'offer-inclusions', 'article', 'offer-inclusion')}${renderSectionMedia(section, context, 'offer-media')}</div>`, section),

  'faq-disclosure': (section, context) => renderShell('faq-disclosure', `${renderSectionHeading(section, context)}<div class="faq-disclosures">${(Array.isArray(section.items) ? section.items : []).map((item, index) => {
    const summaryValue = item.title ?? item.label ?? `Question ${index + 1}`;
    const summaryKey = item.title != null ? 'title' : item.label != null ? 'label' : null;
    const summary = summaryKey ? textElement('span', summaryValue, context, `items.${index}.${summaryKey}`) : `<span>${escapeHtml(summaryValue)}</span>`;
    const rest = { ...item };
    if (summaryKey) rest[summaryKey] = undefined;
    return `<details><summary>${summary}<span aria-hidden="true">＋</span></summary><div class="disclosure-answer">${renderItemFields(rest, index, context)}</div></details>`;
  }).join('')}</div>${renderSectionMedia(section, context)}`, section),

  'faq-columns': (section, context) => renderShell('faq-columns', `${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'faq-columns', 'article', 'faq-column')}${renderSectionMedia(section, context)}`, section),

  'faq-index': (section, context) => renderShell('faq-index', `<div class="faq-index-lead">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'ol', 'faq-index', 'li', 'faq-index-entry')}`, section),

  'event-agenda': (section, context) => renderShell('event-agenda', `${renderSectionHeading(section, context)}${renderItems(section, context, 'ol', 'agenda', 'li', 'agenda-slot')}${renderSectionMedia(section, context, 'agenda-media')}`, section),

  'event-venue': (section, context) => renderShell('event-venue', `<div class="venue-copy">${renderSectionHeading(section, context)}${renderItems(section, context, 'div', 'venue-details', 'article', 'venue-detail')}</div>${renderSectionMedia(section, context, 'venue-image')}`, section),

  'event-strip': (section, context) => renderShell('event-strip', `<div class="event-strip-copy">${renderSectionHeading(section, context, { action: false })}</div>${renderItems(section, context, 'div', 'event-strip-facts', 'div', 'event-strip-fact')}${renderAction(section.action, context, 'action')}${renderSectionMedia(section, context, 'event-strip-image')}`, section),

  'contact-panel': (section, context) => renderShell('contact-panel', `<div class="contact-panel-card">${renderSectionHeading(section, context)}${renderItems(section, context, 'address', 'contact-lines', 'div', 'contact-line')}${renderSectionMedia(section, context, 'contact-panel-image')}</div>`, section),

  'contact-split': (section, context) => renderShell('contact-split', `<div class="contact-invitation">${renderSectionHeading(section, context)}${renderSectionMedia(section, context)}</div>${renderItems(section, context, 'address', 'contact-directory', 'div', 'contact-entry')}`, section),

  'contact-band': (section, context) => renderShell('contact-band', `<div class="contact-band-copy">${renderSectionHeading(section, context, { action: false })}</div>${renderAction(section.action, context, 'action', 'section-action action-inverse')}${renderItems(section, context, 'div', 'contact-band-notes', 'div', 'contact-band-note')}${renderSectionMedia(section, context, 'contact-band-image')}`, section),
};

export function renderSection(section, context) {
  if (!section || typeof section !== 'object') throw new TypeError('section must be an object');
  if (!context || typeof context !== 'object' || typeof context.resolveUrl !== 'function') {
    throw new TypeError('context.resolveUrl must be a function');
  }
  if (!CATALOG_IDS.has(section.type)) throw new RangeError(`Unknown section type: ${String(section.type)}`);
  return renderers[section.type](section, context);
}

export const SECTION_CSS = String.raw`
:root {
  --section-background: var(--background, #f4f0e8);
  --section-text: var(--text, #17201b);
  --section-accent: var(--accent, #b5482f);
  --section-accent-text: var(--accentText, #fffaf2);
  --section-muted: var(--muted, #68706a);
  --section-surface: var(--surface, #fffdf8);
  --section-font: var(--font, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  --section-heading-font: var(--headingFont, Iowan Old Style, Baskerville, Georgia, serif);
  --section-radius: var(--radius, 0.25rem);
  --section-space: var(--space, 1rem);
  --section-rule: color-mix(in srgb, var(--section-text) 18%, transparent);
  --section-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--section-text) 11%, transparent);
}

.wd-section, .wd-section * { box-sizing: border-box; }
.wd-section {
  color: var(--section-text);
  background: var(--section-background);
  font-family: var(--section-font);
  line-height: 1.6;
  overflow: clip;
}
.section-shell { width: min(76rem, calc(100% - clamp(2rem, 7vw, 7rem))); margin-inline: auto; padding-block: clamp(4rem, 9vw, 8.5rem); }
.section-heading { max-width: 48rem; }
.section-eyebrow, .item-label, .item-time, .item-role { margin: 0 0 .8rem; font-size: .75rem; font-weight: 750; letter-spacing: .11em; text-transform: uppercase; }
.section-eyebrow, .item-label, .item-time { color: inherit; }
.section-title, .item-title { margin: 0; font-family: var(--section-heading-font); font-weight: 600; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.section-title { font-size: clamp(2.45rem, 6vw, 6.6rem); line-height: .97; }
.item-title { font-size: clamp(1.35rem, 2.4vw, 2.25rem); line-height: 1.08; }
.section-body { max-width: 42rem; margin: 1.35rem 0 0; color: var(--section-muted); font-size: clamp(1rem, 1.4vw, 1.2rem); text-wrap: pretty; overflow-wrap: anywhere; }
.item-body { margin: .75rem 0 0; color: var(--section-muted); overflow-wrap: anywhere; }
.item-value, .item-price { display: block; margin: .45rem 0; font-family: var(--section-heading-font); font-size: clamp(1.3rem, 2.7vw, 2.5rem); line-height: 1; overflow-wrap: anywhere; }
.item-author { display: block; margin-top: 1rem; font-style: normal; font-weight: 750; }
.item-role { display: block; margin-top: .25rem; color: var(--section-muted); }
.section-action, .item-link { display: inline-flex; min-height: 2.75rem; max-width: 100%; align-items: center; gap: .65rem; margin-top: 1.5rem; color: inherit; font-weight: 750; text-underline-offset: .24em; overflow-wrap: anywhere; }
.section-action { justify-content: center; padding: .65rem 1rem; border: 1px solid currentColor; border-radius: var(--section-radius); text-decoration: none; }
.section-action:hover { background: var(--section-text); color: var(--section-background); }
.section-image, .item-image { display: block; width: 100%; height: auto; border-radius: var(--section-radius); object-fit: cover; }
.section-media, figure { margin: 0; }
.section-item { min-width: 0; }
.wd-section address { font-style: normal; }
.wd-section a:focus-visible, .wd-section summary:focus-visible { outline: .2rem solid currentColor; outline-offset: .25rem; }

.section-hero-split .section-shell { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(16rem, .75fr); gap: clamp(2rem, 7vw, 7rem); align-items: center; min-height: min(52rem, 86vh); }
.hero-split-media img { aspect-ratio: 4 / 5; box-shadow: 1rem 1rem 0 var(--section-accent); }
.hero-support { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 1rem 2rem; padding-top: 1.5rem; border-top: 1px solid var(--section-rule); }
.hero-support-item { flex: 1 1 13rem; }

.section-hero-editorial .section-shell { container-type: inline-size; display: grid; grid-template-columns: minmax(6rem, .22fr) minmax(0, 1.55fr) minmax(14rem, .55fr); gap: clamp(1.5rem, 4cqi, 4rem); align-items: start; }
.section-hero-editorial .section-eyebrow { grid-column: 1; grid-row: 1; }
.editorial-title { grid-column: 2 / -1; grid-row: 1; min-width: 0; }
.editorial-title .section-title { font-size: clamp(3.6rem, 10cqi, 7.5rem); line-height: .94; overflow-wrap: break-word; word-break: normal; }
.editorial-deck { grid-column: 3; grid-row: 2; padding-top: clamp(1rem, 3cqi, 2.5rem); }
.editorial-media { grid-column: 2; grid-row: 2; margin-top: 0; }
.editorial-media img { max-height: 34rem; object-fit: cover; }
.editorial-notes { padding: 1.5rem 0 0; list-style: none; border-top: 1px solid var(--section-rule); }

.section-hero-poster, .service-band:nth-child(odd), .section-proof-quote, .offer-card, .section-contact-band {
  --section-accent: var(--section-background);
  --section-muted: color-mix(in srgb, var(--section-background) 72%, transparent);
  --section-rule: color-mix(in srgb, var(--section-background) 25%, transparent);
  color: var(--section-background);
  background: var(--section-text);
}
.poster-field { position: relative; display: grid; min-height: min(48rem, 82vh); place-items: center; isolation: isolate; text-align: center; }
.poster-media { position: absolute; inset: 0; z-index: -2; opacity: .42; }
.poster-media img { width: 100%; height: 100%; object-fit: cover; }
.poster-field::after { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--section-text) 80%, transparent)); content: ""; }
.poster-copy { max-width: 64rem; padding: 2rem; }
.poster-copy .section-heading { margin-inline: auto; }
.poster-copy .section-body, .section-contact-band .section-body { margin-inline: auto; }
.action-inverse:hover { background: var(--section-background); color: var(--section-text); }
.poster-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: 1px; margin-top: 1px; background: var(--section-rule); }
.poster-detail { padding: 1.25rem; background: var(--section-text); }

.section-intro-note .section-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(13rem, .42fr); gap: clamp(2rem, 7vw, 6rem); align-items: end; }
.note-card { position: relative; padding: clamp(2rem, 5vw, 4.5rem); border: 1px solid var(--section-rule); background: var(--section-surface); box-shadow: var(--section-shadow); }
.note-mark { position: absolute; top: 1rem; right: 1rem; color: var(--section-accent); font-size: 1.5rem; }
.note-postscript { columns: 2 14rem; column-gap: 2rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--section-rule); }
.note-line { break-inside: avoid; }
.note-media img { aspect-ratio: 3 / 4; }

.section-intro-bio .section-shell, .profile-frame { display: grid; grid-template-columns: minmax(15rem, .68fr) minmax(0, 1.1fr); gap: clamp(2rem, 7vw, 7rem); align-items: center; }
.bio-portrait img, .profile-portrait img { aspect-ratio: 4 / 5; }
.bio-facts, .profile-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
.bio-fact, .profile-detail { padding-top: 1rem; border-top: 1px solid var(--section-rule); }

.section-intro-statement .section-shell { display: grid; grid-template-columns: .12fr minmax(0, 1.2fr) minmax(13rem, .48fr); gap: clamp(1.5rem, 5vw, 5rem); }
.statement-rule { min-height: 15rem; border-left: clamp(.3rem, .7vw, .7rem) solid var(--section-accent); }
.statement-notes { margin: 0; padding: 0; list-style: none; }
.statement-note { padding: 1rem 0; border-top: 1px solid var(--section-rule); }
.statement-media { grid-column: 2 / -1; }
.statement-media img { max-height: 28rem; object-fit: cover; }

.section-services-rows .section-heading, .section-work-gallery .section-heading, .section-people-grid .section-heading { margin-bottom: 3rem; }
.ruled-rows { border-top: 1px solid var(--section-text); }
.ruled-row { display: grid; grid-template-columns: minmax(9rem, .45fr) minmax(0, 1fr); gap: 2rem; padding: clamp(1.5rem, 4vw, 3rem) 0; border-bottom: 1px solid var(--section-rule); }
.ruled-row:nth-child(even) { padding-left: clamp(0rem, 5vw, 5rem); }

.section-services-bands .section-shell { width: 100%; padding-bottom: 0; }
.section-services-bands .section-heading { width: min(76rem, calc(100% - clamp(2rem, 7vw, 7rem))); margin: 0 auto 3rem; }
.service-band { padding: clamp(2rem, 6vw, 5rem) max(calc((100vw - 76rem) / 2), clamp(1rem, 3.5vw, 3.5rem)); }
.service-band:nth-child(even) { padding-left: max(calc((100vw - 65rem) / 2), clamp(2rem, 10vw, 10rem)); background: var(--section-surface); }

.service-columns, .people-grid, .faq-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 1px; margin-top: 3rem; background: var(--section-rule); border: 1px solid var(--section-rule); }
.service-column, .person-card, .faq-column { padding: clamp(1.5rem, 3vw, 2.5rem); background: var(--section-surface); }
.service-column:nth-child(3n + 2) { transform: translateY(1.5rem); }

.section-benefits-annotated .section-shell { display: grid; grid-template-columns: minmax(0, .8fr) minmax(18rem, 1.2fr); gap: clamp(2rem, 7vw, 7rem); }
.annotated-lead { position: sticky; top: 2rem; align-self: start; }
.annotated-list { margin: 0; }
.annotated-list dt { padding-top: 1.5rem; border-top: 1px solid var(--section-text); }
.annotated-list dd { margin: 0; padding: 1rem 0 2.5rem 2rem; }

.feature-frame { display: grid; grid-template-columns: minmax(16rem, .9fr) minmax(0, 1.1fr); background: var(--section-surface); box-shadow: var(--section-shadow); }
.feature-media img { height: 100%; min-height: 28rem; object-fit: cover; border-radius: var(--section-radius) 0 0 var(--section-radius); }
.feature-copy { padding: clamp(2rem, 6vw, 5rem); }
.feature-points { margin-top: 2.5rem; }
.feature-point { padding: 1rem 0; border-top: 1px solid var(--section-rule); }

.checklist-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .45fr); gap: 3rem; margin-top: 3rem; align-items: start; }
.checklist { margin: 0; padding: 0; list-style: none; counter-reset: benefits; }
.checklist-item { position: relative; padding: 1.35rem 0 1.35rem 3.25rem; border-top: 1px solid var(--section-rule); counter-increment: benefits; }
.checklist-item::before { position: absolute; left: .35rem; content: "✓"; color: var(--section-accent); font-weight: 800; }

.work-gallery { display: grid; grid-template-columns: repeat(12, 1fr); gap: clamp(1rem, 3vw, 2.5rem); }
.gallery-item { grid-column: span 5; margin: 0; }
.gallery-item:nth-child(3n + 2) { grid-column: span 7; margin-top: 5rem; }
.gallery-item:nth-child(3n) { grid-column: 3 / span 8; }
.gallery-item .item-image { aspect-ratio: 4 / 3; margin-bottom: 1.25rem; }
.gallery-lead { margin-bottom: 2rem; }

.story-stack { margin-top: 3rem; }
.work-story { display: grid; grid-template-columns: minmax(10rem, .4fr) minmax(0, 1fr); gap: 2rem; padding: clamp(2rem, 5vw, 4rem) 0; border-top: 1px solid var(--section-rule); }
.work-story .item-image { grid-row: span 8; aspect-ratio: 3 / 2; }
.work-story:nth-child(even) { grid-template-columns: minmax(0, 1fr) minmax(10rem, .4fr); }
.work-story:nth-child(even) .item-image { grid-column: 2; }

.index-mast, .people-list-head, .faq-index-lead { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .35fr); gap: 3rem; margin-bottom: 3rem; align-items: end; }
.work-index, .faq-index { margin: 0; padding: 0; list-style-position: inside; border-top: .2rem solid var(--section-text); }
.work-index-row, .faq-index-entry { display: grid; grid-template-columns: minmax(0, .7fr) minmax(0, 1fr); gap: 2rem; padding: 1.25rem 0; border-bottom: 1px solid var(--section-rule); }

.step-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1.25rem; margin: 3rem 0 0; padding: 0; list-style: none; counter-reset: steps; }
.step-card { min-height: 18rem; padding: 1.5rem; border: 1px solid var(--section-rule); border-radius: var(--section-radius); counter-increment: steps; }
.step-card::before { display: block; margin-bottom: 4rem; color: var(--section-accent); content: counter(steps, decimal-leading-zero); font-family: var(--section-heading-font); font-size: 1.5rem; }

.section-process-timeline .section-shell { display: grid; grid-template-columns: minmax(0, .7fr) minmax(18rem, 1.3fr); gap: clamp(2rem, 7vw, 7rem); }
.timeline { position: relative; margin: 0; padding: 0 0 0 2.5rem; list-style: none; }
.timeline::before { position: absolute; inset: .75rem auto 0 .55rem; width: 1px; background: var(--section-rule); content: ""; }
.timeline-stop { position: relative; padding: 0 0 3rem; }
.timeline-stop::before { position: absolute; top: .55rem; left: -2.3rem; width: .7rem; height: .7rem; border-radius: 50%; background: var(--section-accent); content: ""; }

.narrative-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .42fr); gap: 3rem; margin-top: 3rem; }
.narrative-chapter { padding: 2rem 0; border-top: 1px solid var(--section-rule); }
.narrative-chapter .item-body { font-family: var(--section-heading-font); font-size: clamp(1.15rem, 2vw, 1.65rem); }

.section-proof-quote .section-heading { max-width: 32rem; }
.featured-quote { max-width: 62rem; margin: 3rem auto 0; font-family: var(--section-heading-font); font-size: clamp(1.8rem, 4.6vw, 4.5rem); line-height: 1.08; text-align: center; }
.quote-voice + .quote-voice { margin-top: 3rem; padding-top: 3rem; border-top: 1px solid var(--section-rule); }

.section-proof-stories .section-shell { display: grid; grid-template-columns: minmax(0, .65fr) minmax(18rem, 1.35fr); gap: clamp(2rem, 7vw, 7rem); }
.proof-story { margin: 0; padding: 2rem 0; border-top: 1px solid var(--section-rule); }
.proof-story .item-body { color: var(--section-text); font-family: var(--section-heading-font); font-size: clamp(1.25rem, 2.4vw, 2rem); }

.metric-ledger { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); margin: 3rem 0 0; border-block: 1px solid var(--section-rule); }
.metric-ledger dt, .metric-ledger dd { margin: 0; padding: 1.5rem; border-right: 1px solid var(--section-rule); }
.metric-ledger dt { color: var(--section-accent); font-size: .8rem; text-transform: uppercase; }
.metric-ledger dd { font-family: var(--section-heading-font); }

.profile-frame { padding: clamp(1rem, 3vw, 2rem); border: 1px solid var(--section-rule); }
.person-card .item-image { aspect-ratio: 1; margin-bottom: 1.5rem; filter: saturate(.78); }
.person-card:nth-child(even) .item-image { aspect-ratio: 4 / 5; }
.people-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--section-text); }
.person-row { display: grid; grid-template-columns: 5rem minmax(9rem, .5fr) minmax(0, 1fr); gap: 1.5rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--section-rule); }
.person-row .item-image { width: 4rem; height: 4rem; border-radius: 50%; }

.table-scroll-cue { display: none; margin: 2rem 0 .75rem; color: var(--section-muted); font-size: .875rem; font-weight: 700; }
.table-scroll { margin-top: 3rem; overflow-x: auto; overscroll-behavior-inline: contain; }
.table-scroll:focus-visible { outline: .2rem solid var(--section-text); outline-offset: .25rem; }
.price-table { width: max(100%, 42rem); min-width: 42rem; border-collapse: collapse; table-layout: fixed; }
.table-caption { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.price-table th, .price-table td { padding: 2rem; vertical-align: top; border: 1px solid var(--section-rule); text-align: left; overflow-wrap: break-word; word-break: normal; }
.price-table th:nth-child(1) { width: 30%; }
.price-table th:nth-child(2) { width: 20%; }
.price-table th:nth-child(3) { width: 50%; }
.price-table .item-title, .price-table .item-value, .price-table .item-price, .price-table .item-link { overflow-wrap: break-word; word-break: normal; }
.price-table thead th { padding-block: 1rem; color: var(--section-text); font-size: .75rem; letter-spacing: .11em; text-transform: uppercase; }
.price-table tbody th { font-weight: inherit; }
.price-table tr:nth-child(even) { background: var(--section-surface); }
.price-rows { margin-top: 3rem; border-top: .2rem solid var(--section-text); }
.price-row { display: grid; grid-template-columns: minmax(9rem, .5fr) minmax(0, 1fr) minmax(8rem, .35fr); gap: 2rem; padding: 2rem 0; border-bottom: 1px solid var(--section-rule); }
.offer-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(14rem, .55fr); gap: 3rem; padding: clamp(2rem, 6vw, 5rem); border-radius: var(--section-radius); }
.offer-inclusions { grid-column: 1; }
.offer-inclusion { padding: 1rem 0; border-top: 1px solid var(--section-rule); }
.offer-media { grid-column: 2; grid-row: 1 / span 2; }

.faq-disclosures { max-width: 58rem; margin: 3rem 0 0 auto; border-top: 1px solid var(--section-text); }
.faq-disclosures details { border-bottom: 1px solid var(--section-rule); }
.faq-disclosures summary { display: flex; min-height: 4rem; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; cursor: pointer; font-family: var(--section-heading-font); font-size: clamp(1.15rem, 2vw, 1.6rem); }
.disclosure-answer { max-width: 44rem; padding: 0 3rem 1.5rem 0; }
.faq-columns .faq-column:nth-child(3n) { grid-column: span 2; }
.faq-index { counter-reset: faq; }
.faq-index-entry { counter-increment: faq; }
.faq-index-entry::before { color: var(--section-accent); content: "Q" counter(faq, decimal-leading-zero); font-weight: 800; }

.agenda { margin: 3rem 0 0; padding: 0; list-style: none; border-top: .2rem solid var(--section-text); }
.agenda-slot { display: grid; grid-template-columns: minmax(6rem, .3fr) minmax(0, 1fr); gap: 2rem; padding: 1.5rem 0; border-bottom: 1px solid var(--section-rule); }
.agenda-slot .item-time { grid-column: 1; grid-row: 1 / span 7; font-size: 1rem; }
.section-event-venue .section-shell { display: grid; grid-template-columns: minmax(0, .8fr) minmax(16rem, 1.2fr); gap: clamp(2rem, 7vw, 7rem); align-items: center; }
.venue-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin-top: 2rem; }
.venue-image img { aspect-ratio: 5 / 4; }
.section-event-strip { color: var(--section-accent-text); background: var(--section-accent); }
.section-event-strip a:focus-visible { outline-color: var(--section-accent-text); }
.section-event-strip .section-eyebrow,
.section-event-strip .item-label,
.section-event-strip .item-time,
.section-event-strip .section-body,
.section-event-strip .item-body,
.section-event-strip .item-role { color: var(--section-accent-text); }
.section-event-strip .item-author,
.section-event-strip .item-title,
.section-event-strip .item-price,
.section-event-strip .item-value,
.section-event-strip .item-link { color: inherit; }
.section-event-strip .section-shell { display: flex; align-items: center; gap: clamp(1rem, 4vw, 4rem); padding-block: 2rem; }
.section-event-strip .section-title { font-size: clamp(1.8rem, 4vw, 3.8rem); }
.event-strip-facts { display: flex; flex: 1; flex-wrap: wrap; gap: 1rem; }
.event-strip-fact { min-width: 0; }

.section-contact-panel .section-shell { max-width: 64rem; }
.contact-panel-card { position: relative; padding: clamp(2rem, 7vw, 6rem); background: var(--section-surface); box-shadow: var(--section-shadow); }
.contact-lines { display: flex; flex-wrap: wrap; gap: 1rem 2rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--section-rule); }
.section-contact-split .section-shell { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(16rem, .8fr); gap: clamp(2rem, 8vw, 8rem); }
.contact-directory { padding: 2rem; border: 1px solid var(--section-rule); }
.contact-entry + .contact-entry { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--section-rule); }
.section-contact-band .section-shell { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2rem 4rem; align-items: end; }
.contact-band-notes { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 1rem 2rem; padding-top: 1.5rem; border-top: 1px solid var(--section-rule); }

@media (max-width: 48rem) {
  .section-shell { width: min(100% - 2rem, 76rem); padding-block: clamp(3rem, 12vw, 5rem); }
  .section-hero-split .section-shell, .section-hero-editorial .section-shell, .section-intro-note .section-shell, .section-intro-bio .section-shell, .section-intro-statement .section-shell, .section-benefits-annotated .section-shell, .feature-frame, .checklist-layout, .section-process-timeline .section-shell, .narrative-body, .section-proof-stories .section-shell, .profile-frame, .index-mast, .people-list-head, .faq-index-lead, .section-event-venue .section-shell, .section-contact-split .section-shell, .section-contact-band .section-shell { grid-template-columns: 1fr; }
  .section-hero-editorial .section-eyebrow, .editorial-title, .editorial-deck, .editorial-media, .statement-media, .offer-inclusions, .offer-media, .contact-band-notes { grid-column: 1; grid-row: auto; }
  .editorial-title .section-title { font-size: clamp(2.4rem, 13cqi, 3.5rem); line-height: 1; }
  .editorial-deck { padding-top: 0; }
  .statement-rule { min-height: 0; border-top: .4rem solid var(--section-accent); border-left: 0; }
  .annotated-lead { position: static; }
  .service-column:nth-child(3n + 2) { transform: none; }
  .gallery-item, .gallery-item:nth-child(3n + 2), .gallery-item:nth-child(3n) { grid-column: 1 / -1; margin-top: 0; }
  .work-story, .work-story:nth-child(even), .price-row { grid-template-columns: 1fr; }
  .work-story:nth-child(even) .item-image { grid-column: 1; }
  .person-row { grid-template-columns: 4rem minmax(0, 1fr); }
  .person-row .item-body, .person-row .item-link { grid-column: 2; }
  .faq-columns .faq-column:nth-child(3n) { grid-column: auto; }
  .section-event-strip .section-shell { align-items: flex-start; flex-direction: column; }
  .offer-card { grid-template-columns: 1fr; }
  .bio-facts, .profile-details, .venue-details { grid-template-columns: 1fr; }
  .table-scroll-cue { display: block; }
  .table-scroll { margin-top: 0; }
  .price-table th, .price-table td { padding: 1rem; }
}

@media (max-width: 24rem) {
  .section-title { font-size: clamp(2.2rem, 13vw, 3.2rem); }
  .poster-copy, .note-card, .service-column, .person-card, .faq-column, .contact-panel-card, .offer-card { padding-inline: 1.25rem; }
  .ruled-row, .work-index-row, .faq-index-entry, .agenda-slot { grid-template-columns: 1fr; gap: .75rem; }
  .note-postscript { columns: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .wd-section *, .wd-section *::before, .wd-section *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`;
