import path from 'node:path';
import { SECTION_CATALOG, SECTION_CSS, renderSection } from '../../templates/sections.mjs';

const PAGE_KEYS = new Set(['path', 'title', 'description', 'sections']);
const SECTION_KEYS = new Set(['id', 'type', 'title', 'eyebrow', 'body', 'image', 'action', 'items']);
const ITEM_KEYS = new Set(['title', 'body', 'label', 'value', 'href', 'image', 'author', 'role', 'time', 'price']);
const LINK_KEYS = new Set(['label', 'href']);
const IMAGE_KEYS = new Set(['src', 'alt']);
const BRAND_KEYS = new Set(['background', 'text', 'accent', 'accentText', 'muted', 'surface', 'font', 'headingFont', 'radius', 'space']);
const ROOT_KEYS = new Set(['schemaVersion', 'name', 'language', 'brand', 'navigation', 'footer', 'pages']);
const FOOTER_KEYS = new Set(['text', 'links']);
const FONT_STACKS = {
  system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'Iowan Old Style, Baskerville, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};
const BRAND_DEFAULTS = {
  background: '#FAFAF8', text: '#181817', accent: '#315C4A', accentText: '#FFFFFF',
  muted: '#656560', surface: '#F0F0EA', font: 'system', headingFont: 'serif', radius: 16, space: 24,
};
const LIMITS = { pages: 20, sections: 50, items: 50, links: 30, short: 240, body: 8000, url: 2048 };
const MAX_MODEL_BYTES = 1024 * 1024;
const RESERVED_ROOT_NAMESPACES = new Set(['api', 'editor', 'scripts']);
const GENERATED_PATHS = new Set(['README.md', 'site.json', 'styles.css', 'scripts/preview.mjs']);

function error(at, message) { throw new Error(`${at}: ${message}`); }

function object(value, at) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) error(at, 'must be an object');
  return value;
}

function knownKeys(value, allowed, at) {
  for (const key of Object.keys(value)) if (!allowed.has(key)) error(`${at}.${key}`, 'is not a known field');
}

function string(value, at, { max = LIMITS.short, optional = false, blank = false } = {}) {
  if (optional && value === undefined) return undefined;
  if (typeof value !== 'string') error(at, 'must be a string');
  if (!blank && !value.trim()) error(at, 'must not be blank');
  if (value.length > max) error(at, `must be at most ${max} characters`);
  if (/\x00|[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) error(at, 'must not contain control characters');
  return value;
}

function list(value, at, max, { min = 0 } = {}) {
  if (!Array.isArray(value)) error(at, 'must be an array');
  if (value.length < min || value.length > max) error(at, `must contain ${min}-${max} entries`);
  return value;
}

function boundedNumber(value, at) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 96) {
    error(at, 'must be a finite number from 0 to 96');
  }
  return value;
}

function safeSegments(value, at) {
  if (value.includes('\\') || /[\x00-\x1F\x7F]/.test(value)) error(at, 'must not contain backslashes or control characters');
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { error(at, 'contains invalid URL encoding'); }
  if (decoded.includes('\\')) error(at, 'must not contain encoded backslashes');
  const segments = decoded.split('/');
  if (segments.some(segment => segment === '..')) error(at, 'must not contain path traversal');
  if (/%2f|%5c/i.test(value)) error(at, 'must not contain encoded path separators');
}

function normalizeRoute(value, at) {
  const route = string(value, at, { max: 240 });
  safeSegments(route, at);
  if (route.startsWith('/') || route.includes('#') || route.includes('?') || route.includes(':')) {
    error(at, 'must be a site-relative index.html route');
  }
  const rootNamespace = route.split('/', 1)[0];
  if (GENERATED_PATHS.has(route)) error(at, `conflicts with generated path '${route}'`);
  if (RESERVED_ROOT_NAMESPACES.has(rootNamespace)) error(at, `must not use reserved root namespace '${rootNamespace}'`);
  if (!/^(?:[a-z0-9][a-z0-9-]*\/)*index\.html$/.test(route)) {
    error(at, "must be 'index.html' or a lowercase nested route ending in '/index.html'");
  }
  return route;
}

function normalizeLanguage(value) {
  const language = value === undefined ? 'en' : string(value, 'brief.language', { max: 100 });
  try {
    return Intl.getCanonicalLocales(language)[0];
  } catch {
    error('brief.language', 'must be a valid BCP 47 language tag');
  }
}

function enforceModelSize(value) {
  let serialized;
  try { serialized = JSON.stringify(value); }
  catch { error('brief', 'must be a JSON-serializable model'); }
  if (serialized === undefined) error('brief', 'must be a JSON-serializable model');
  if (Buffer.byteLength(serialized, 'utf8') > MAX_MODEL_BYTES) error('brief', 'must be at most 1 MiB');
}

function normalizeInternalPath(raw, at) {
  safeSegments(raw, at);
  let route = raw.replace(/^\/+/, '');
  if (!route || route.endsWith('/')) route += 'index.html';
  if (route.startsWith('./')) route = route.slice(2);
  return normalizeRoute(route, at);
}

function parseReference(value, at, { image = false } = {}) {
  const url = string(value, at, { max: LIMITS.url });
  if (/\s/.test(url) || url.startsWith('//')) error(at, 'must not contain whitespace or use a protocol-relative URL');
  safeSegments(url.split(/[?#]/, 1)[0], at);
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url)?.[1]?.toLowerCase();
  if (scheme) {
    const allowed = image ? new Set(['https']) : new Set(['https', 'mailto', 'tel']);
    if (!allowed.has(scheme)) error(at, `uses unsupported protocol '${scheme}:'`);
    let parsed;
    try { parsed = new URL(url); } catch { error(at, 'must be a valid URL'); }
    if (scheme === 'https') {
      if (!/^https:\/\//i.test(url) || !parsed.hostname) error(at, 'must be an absolute HTTPS URL');
      if (parsed.username || parsed.password) error(at, 'must not include credentials');
    }
    if (scheme === 'mailto' && !/^[^@/?#]+@[^@/?#]+\.[^@/?#]+(?:\?[^#]*)?$/i.test(url.slice(7))) {
      error(at, 'must contain one valid email destination');
    }
    if (scheme === 'tel' && !/^\+?[0-9().-]+$/.test(url.slice(4))) error(at, 'must contain a valid telephone destination');
    return { kind: 'external', value: url };
  }
  if (image) {
    if (url.includes('#') || url.includes('?')) error(at, 'relative image paths must not contain a query or fragment');
    const assetPath = url.replace(/^\/+/, '').replace(/^\.\//, '');
    if (!assetPath || assetPath.endsWith('/')) error(at, 'must identify an asset file');
    return { kind: 'asset', path: assetPath };
  }
  if (url.includes('?')) error(at, 'internal links must not contain a query');
  const hash = url.indexOf('#');
  const rawPath = hash === -1 ? url : url.slice(0, hash);
  const fragment = hash === -1 ? '' : url.slice(hash + 1);
  if (hash !== -1 && !/^[A-Za-z][A-Za-z0-9_-]*$/.test(fragment)) error(at, 'has an invalid fragment');
  return { kind: 'internal', rawPath, fragment };
}

function normalizeImage(value, at) {
  const input = object(value, at);
  knownKeys(input, IMAGE_KEYS, at);
  const src = string(input.src, `${at}.src`, { max: LIMITS.url });
  parseReference(src, `${at}.src`, { image: true });
  return { src, alt: string(input.alt, `${at}.alt`, { max: 500, blank: true }) };
}

function normalizeLink(value, at) {
  const input = object(value, at);
  knownKeys(input, LINK_KEYS, at);
  return { label: string(input.label, `${at}.label`), href: string(input.href, `${at}.href`, { max: LIMITS.url }) };
}

function normalizeItem(value, at) {
  const input = object(value, at);
  knownKeys(input, ITEM_KEYS, at);
  const result = {};
  for (const key of ['title', 'label', 'value', 'author', 'role', 'time', 'price']) {
    if (input[key] !== undefined) result[key] = string(input[key], `${at}.${key}`);
  }
  if (input.body !== undefined) result.body = string(input.body, `${at}.body`, { max: LIMITS.body });
  if (input.href !== undefined) result.href = string(input.href, `${at}.href`, { max: LIMITS.url });
  if (input.image !== undefined) result.image = normalizeImage(input.image, `${at}.image`);
  if (!Object.keys(result).length) error(at, 'must contain at least one content field');
  return result;
}

function normalizeSection(value, at, sectionTypes) {
  const input = object(value, at);
  knownKeys(input, SECTION_KEYS, at);
  const id = string(input.id, `${at}.id`);
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) error(`${at}.id`, 'must be a safe fragment identifier');
  const type = string(input.type, `${at}.type`);
  if (!sectionTypes.has(type)) error(`${at}.type`, `must name a section in SECTION_CATALOG`);
  const result = { id, type };
  for (const key of ['title', 'eyebrow']) if (input[key] !== undefined) result[key] = string(input[key], `${at}.${key}`);
  if (input.body !== undefined) result.body = string(input.body, `${at}.body`, { max: LIMITS.body });
  if (input.image !== undefined) result.image = normalizeImage(input.image, `${at}.image`);
  if (input.action !== undefined) result.action = normalizeLink(input.action, `${at}.action`);
  if (input.items !== undefined) {
    result.items = list(input.items, `${at}.items`, LIMITS.items).map((item, index) => normalizeItem(item, `${at}.items[${index}]`));
  }
  if (type.startsWith('hero-') && !result.title) error(`${at}.title`, 'is required for hero sections');
  return result;
}

function normalizeBrand(value) {
  if (value === undefined) return { ...BRAND_DEFAULTS };
  const input = object(value, 'brief.brand');
  knownKeys(input, BRAND_KEYS, 'brief.brand');
  const result = { ...BRAND_DEFAULTS };
  for (const key of ['background', 'text', 'accent', 'accentText', 'muted', 'surface']) {
    if (input[key] !== undefined) {
      const color = string(input[key], `brief.brand.${key}`, { max: 7 });
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) error(`brief.brand.${key}`, 'must be a six-digit hex color');
      result[key] = color.toUpperCase();
    }
  }
  for (const key of ['font', 'headingFont']) {
    if (input[key] !== undefined) {
      const font = string(input[key], `brief.brand.${key}`);
      if (!Object.hasOwn(FONT_STACKS, font)) error(`brief.brand.${key}`, 'must be system, serif, or mono');
      result[key] = font;
    }
  }
  for (const key of ['radius', 'space']) if (input[key] !== undefined) result[key] = boundedNumber(input[key], `brief.brand.${key}`);
  return result;
}

function targetForReference(reference, currentPage) {
  return reference.rawPath ? normalizeInternalPath(reference.rawPath, 'internal link') : currentPage;
}

function validateReferences(brief) {
  const pages = new Set(brief.pages.map(page => page.path));
  const anchors = new Map(brief.pages.map(page => [page.path, new Set(['top', 'main', ...page.sections.map(section => section.id)])]));
  const visit = (href, at, currentPage) => {
    const reference = parseReference(href, at);
    if (reference.kind !== 'internal') return;
    const target = targetForReference(reference, currentPage);
    if (!pages.has(target)) error(at, `does not resolve to a page in this brief ('${target}')`);
    if (reference.fragment && !anchors.get(target).has(reference.fragment)) {
      error(at, `does not resolve to a section on '${target}' ('#${reference.fragment}')`);
    }
  };
  const visitShared = (href, at) => {
    const reference = parseReference(href, at);
    if (reference.kind === 'internal' && !reference.rawPath) {
      brief.pages.forEach(page => visit(href, at, page.path));
    } else {
      visit(href, at, 'index.html');
    }
  };
  brief.navigation.forEach((link, index) => visitShared(link.href, `brief.navigation[${index}].href`));
  brief.footer?.links.forEach((link, index) => visitShared(link.href, `brief.footer.links[${index}].href`));
  brief.pages.forEach((page, pageIndex) => page.sections.forEach((section, sectionIndex) => {
    const base = `brief.pages[${pageIndex}].sections[${sectionIndex}]`;
    if (section.action) visit(section.action.href, `${base}.action.href`, page.path);
    section.items?.forEach((item, itemIndex) => {
      if (item.href) visit(item.href, `${base}.items[${itemIndex}].href`, page.path);
    });
  }));
}

export function validateBrief(input) {
  enforceModelSize(input);
  const brief = object(input, 'brief');
  knownKeys(brief, ROOT_KEYS, 'brief');
  if (brief.schemaVersion !== 1) error('brief.schemaVersion', 'must equal 1');
  const sectionTypes = new Set(SECTION_CATALOG.map(entry => entry.id));
  if (sectionTypes.size !== SECTION_CATALOG.length) error('SECTION_CATALOG', 'contains duplicate ids');
  const normalized = {
    schemaVersion: 1,
    name: string(brief.name, 'brief.name'),
    language: normalizeLanguage(brief.language),
    brand: normalizeBrand(brief.brand),
    navigation: brief.navigation === undefined ? [] : list(brief.navigation, 'brief.navigation', LIMITS.links).map((link, index) => normalizeLink(link, `brief.navigation[${index}]`)),
    pages: list(brief.pages, 'brief.pages', LIMITS.pages, { min: 1 }).map((pageValue, pageIndex) => {
      const at = `brief.pages[${pageIndex}]`;
      const page = object(pageValue, at);
      knownKeys(page, PAGE_KEYS, at);
      const sections = list(page.sections, `${at}.sections`, LIMITS.sections, { min: 1 }).map((section, sectionIndex) => normalizeSection(section, `${at}.sections[${sectionIndex}]`, sectionTypes));
      const ids = new Set();
      for (const section of sections) {
        if (ids.has(section.id) || section.id === 'top' || section.id === 'main') error(`${at}.sections`, `contains duplicate or reserved id '${section.id}'`);
        ids.add(section.id);
      }
      return {
        path: normalizeRoute(page.path, `${at}.path`),
        title: string(page.title, `${at}.title`),
        description: string(page.description, `${at}.description`, { max: 500 }),
        sections,
      };
    }),
  };
  if (brief.footer !== undefined) {
    const footer = object(brief.footer, 'brief.footer');
    knownKeys(footer, FOOTER_KEYS, 'brief.footer');
    normalized.footer = {
      text: string(footer.text, 'brief.footer.text', { max: 1000, blank: true }),
      links: list(footer.links, 'brief.footer.links', LIMITS.links).map((link, index) => normalizeLink(link, `brief.footer.links[${index}]`)),
    };
  }
  const routes = new Set();
  for (const page of normalized.pages) {
    if (routes.has(page.path)) error('brief.pages', `contains duplicate route '${page.path}'`);
    routes.add(page.path);
  }
  if (!routes.has('index.html')) error('brief.pages', "must include the root route 'index.html'");
  validateReferences(normalized);
  return normalized;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function resolveUrl(url, pagePath) {
  const rawPath = url.split('#', 1)[0];
  const scheme = /^[a-z][a-z0-9+.-]*:/i.test(url);
  const looksLikePage = !rawPath || rawPath.endsWith('/') || rawPath.endsWith('index.html');
  const reference = parseReference(url, 'rendered URL', { image: !scheme && !url.includes('#') && !looksLikePage });
  if (reference.kind === 'external') return reference.value;
  const target = reference.kind === 'asset' ? reference.path : targetForReference(reference, pagePath);
  const from = path.posix.dirname(pagePath);
  let relative = path.posix.relative(from, target) || path.posix.basename(target);
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return `${relative}${reference.kind === 'internal' && reference.fragment ? `#${reference.fragment}` : ''}`;
}

function renderNavigation(brief, page) {
  if (!brief.navigation.length) return '';
  const links = brief.navigation.map((link, index) => {
    const reference = parseReference(link.href, `brief.navigation[${index}].href`);
    const active = reference.kind === 'internal' && targetForReference(reference, page.path) === page.path;
    return `<a href="${escapeHtml(resolveUrl(link.href, page.path))}" data-edit-path="navigation.${index}.label"${active ? ' aria-current="page"' : ''}>${escapeHtml(link.label)}</a>`;
  }).join('\n');
  return `<nav aria-label="Primary">${links}</nav>`;
}

function renderFooter(brief, page) {
  if (!brief.footer) return '';
  const links = brief.footer.links.map((link, index) => `<a href="${escapeHtml(resolveUrl(link.href, page.path))}" data-edit-path="footer.links.${index}.label">${escapeHtml(link.label)}</a>`).join('\n');
  return `<footer><p data-edit-path="footer.text">${escapeHtml(brief.footer.text)}</p>${links ? `<nav aria-label="Footer">${links}</nav>` : ''}</footer>`;
}

function renderPage(brief, page, pageIndex) {
  let h1Used = false;
  const renderedSections = page.sections.map((section, sectionIndex) => {
    const isHero = section.type.startsWith('hero-');
    const headingLevel = isHero && !h1Used ? 1 : 2;
    if (headingLevel === 1) h1Used = true;
    return renderSection(section, {
      headingLevel,
      pagePath: page.path,
      editPrefix: `pages.${pageIndex}.sections.${sectionIndex}`,
      resolveUrl: url => resolveUrl(url, page.path),
    });
  }).join('\n');
  const fallbackHeading = h1Used ? '' : `<h1 class="page-title" data-edit-path="pages.${pageIndex}.title">${escapeHtml(page.title)}</h1>`;
  return `<!doctype html>
<html lang="${escapeHtml(brief.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(page.description)}">
  <title>${escapeHtml(page.title)} · ${escapeHtml(brief.name)}</title>
  <link rel="stylesheet" href="${escapeHtml(resolveUrl('styles.css', page.path))}">
</head>
<body id="top">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="site-name" href="${escapeHtml(resolveUrl('index.html', page.path))}" data-edit-path="name">${escapeHtml(brief.name)}</a>${renderNavigation(brief, page)}</header>
  <main id="main">${fallbackHeading}${renderedSections}</main>
  ${renderFooter(brief, page)}
</body>
</html>
`;
}

function renderStyles(brand) {
  return `:root {
  --background: ${brand.background};
  --text: ${brand.text};
  --accent: ${brand.accent};
  --accent-text: ${brand.accentText};
  --accentText: var(--accent-text);
  --muted: ${brand.muted};
  --surface: ${brand.surface};
  --radius: ${brand.radius}px;
  --space: ${brand.space}px;
  --font: ${FONT_STACKS[brand.font]};
  --heading-font: ${FONT_STACKS[brand.headingFont]};
  --headingFont: var(--heading-font);
}
* { box-sizing: border-box; }
html { color: var(--text); background: var(--background); font-family: var(--font); line-height: 1.6; }
body { margin: 0; overflow-wrap: anywhere; }
a { color: var(--text); }
a:focus-visible { outline: .2rem solid currentColor; outline-offset: .25rem; }
img { display: block; max-width: 100%; height: auto; }
h1, h2, h3 { font-family: var(--heading-font); line-height: 1.08; text-wrap: balance; }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: var(--space); top: var(--space); z-index: 10; padding: .5rem 1rem; background: var(--surface); }
.site-header, footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space); padding: var(--space); }
.site-header nav, footer nav { display: flex; flex-wrap: wrap; gap: 1rem; }
.site-name { color: var(--text); font-weight: 700; text-decoration: none; }
[aria-current="page"] { color: var(--text); text-decoration-thickness: .15em; }
main { min-height: 60vh; }
.page-title { max-width: 18ch; margin: calc(var(--space) * 2) auto; padding-inline: var(--space); }
@media (max-width: 640px) { .site-header, footer { align-items: flex-start; flex-direction: column; } }

${SECTION_CSS.trim()}
`;
}

export function renderBrief(input) {
  const brief = validateBrief(input);
  const files = {};
  for (const [index, page] of brief.pages.entries()) files[page.path] = renderPage(brief, page, index);
  files['styles.css'] = renderStyles(brief.brand);
  files['site.json'] = `${JSON.stringify(brief, null, 2)}\n`;
  files['README.md'] = '# Generated structured site\n\nGenerated from the validated model in `site.json`.\n\nPreview locally with the copied `scripts/preview.mjs` command shown by the generator. Relative image references are links to approved assets and are not downloaded automatically.\n';
  return { files, brief };
}
