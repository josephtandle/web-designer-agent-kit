#!/usr/bin/env node

import process from 'node:process'
import { join } from 'node:path'
import { SECTION_CATALOG, SECTION_CSS, renderSection } from '../templates/sections.mjs'
import { assertNewPath, mkdirSafe, writeExclusive } from './lib/safe-paths.mjs'
import { validateBrief } from './lib/site-brief.mjs'

const EXPECTED_IDS = [
  'hero-split', 'hero-editorial', 'hero-poster',
  'intro-note', 'intro-bio', 'intro-statement',
  'services-rows', 'services-bands', 'services-columns',
  'benefits-annotated', 'benefits-feature', 'benefits-checklist',
  'work-gallery', 'work-stories', 'work-index',
  'process-steps', 'process-timeline', 'process-narrative',
  'proof-quote', 'proof-stories', 'proof-metrics',
  'people-profile', 'people-grid', 'people-list',
  'pricing-table', 'pricing-rows', 'pricing-offer',
  'faq-disclosure', 'faq-columns', 'faq-index',
  'event-agenda', 'event-venue', 'event-strip',
  'contact-panel', 'contact-split', 'contact-band',
]

function fail(message) {
  console.error(`Error: ${message}`)
  process.exitCode = 1
}

function usage() {
  console.log(`Section Gallery (dependency-free)\n\nUsage:\n  node scripts/section-gallery.mjs --target=NEW_DIR\n\nCreates one self-contained offline index.html. The target must not already exist.`)
}

function parseArgs(args) {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) return { help: true }
  if (args.length !== 1 || !args[0].startsWith('--target=')) {
    throw new Error('Expected exactly one non-empty --target=NEW_DIR option. Use --help for usage.')
  }
  const target = args[0].slice('--target='.length)
  if (!target.trim()) throw new Error('--target cannot be blank or whitespace.')
  return { help: false, target }
}

function illustration(seed, label) {
  const palettes = [
    ['#18352f', '#e3a72f', '#f6eddf'],
    ['#34253f', '#e16b5b', '#f5e7d6'],
    ['#15354a', '#65a9a6', '#f4d49a'],
    ['#3d2d22', '#c9733d', '#e8d8bc'],
  ]
  const [dark, accent, light] = palettes[seed % palettes.length]
  const offset = 22 + (seed % 5) * 13
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" role="img" aria-label="${label}"><rect width="900" height="700" fill="${light}"/><path d="M0 510L${310 + offset} 170l210 245L900 78v622H0z" fill="${dark}"/><circle cx="${620 - offset}" cy="${185 + offset}" r="118" fill="${accent}"/><path d="M70 82h330v22H70zm0 48h215v10H70z" fill="${dark}" opacity=".78"/><path d="M96 610c155-94 270-84 412 0" fill="none" stroke="${light}" stroke-width="18" stroke-linecap="round"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function commonSection(entry, index) {
  const sectionId = `example-${entry.id}`
  return {
    id: sectionId,
    type: entry.id,
    eyebrow: 'Fictional example · layout sample',
    title: `${entry.label} example`,
    body: `${entry.description} This fictional copy demonstrates the layout only and is not a claim about a real person, client, price, or result.`,
    image: { src: illustration(index, `Original abstract illustration for the ${entry.label} example`), alt: `Original abstract shapes illustrating ${entry.label}` },
    action: { label: 'Example action', href: `#${sectionId}` },
    items: [
      { label: 'Example 01', title: 'First supplied detail', body: 'Replace this fictional demonstration with accurate project facts.' },
      { label: 'Example 02', title: 'Second supplied detail', body: 'The layout adapts to concise, truthful source material.' },
      { label: 'Example 03', title: 'Third supplied detail', body: 'No result or endorsement is implied by this sample.' },
    ],
  }
}

function sampleFor(entry, index) {
  const section = commonSection(entry, index)
  const sectionHref = `#${section.id}`
  const image = (suffix) => ({
    src: illustration(index + suffix, `Original abstract illustration ${suffix + 1} for ${entry.label}`),
    alt: `Original abstract illustration ${suffix + 1}`,
  })

  switch (entry.category) {
    case 'hero':
      section.title = 'A clear fictional opening for a thoughtful idea'
      section.items = [
        { label: 'Example focus', value: 'Useful clarity', body: 'Demonstration wording, not a measured outcome.' },
        { label: 'Example format', value: 'Flexible pages', body: 'Replace with facts from the real brief.' },
      ]
      break
    case 'intro':
      section.items = [
        { title: 'Background example', body: 'A fictional studio exploring useful, calm digital experiences.' },
        { title: 'Working note', body: 'This biography-style copy is explicitly a layout sample.' },
      ]
      break
    case 'services':
      section.items = [
        { label: 'Example service A', title: 'Discovery session', body: 'A fictional service description for testing content rhythm.', href: sectionHref },
        { label: 'Example service B', title: 'Design direction', body: 'An example label, not an offer currently for sale.', href: sectionHref },
        { label: 'Example service C', title: 'Delivery support', body: 'Replace with scope verified by the service provider.', href: sectionHref },
      ]
      break
    case 'benefits':
      section.items = [
        { label: 'Example benefit', title: 'A calmer starting point', body: 'Illustrative benefit language; verify before publishing.' },
        { label: 'Example benefit', title: 'A clearer handoff', body: 'No performance improvement is claimed.' },
        { label: 'Example benefit', title: 'A useful structure', body: 'A neutral example for assessing the renderer.' },
      ]
      break
    case 'work':
      section.items = [0, 1, 2].map((number) => ({
        image: image(number + 1), label: `Fictional study 0${number + 1}`,
        title: ['Field Notes', 'Common Ground', 'Open Hours'][number],
        body: 'Original placeholder artwork and fictional project text for layout evaluation.',
        href: sectionHref,
      }))
      break
    case 'process':
      section.items = [
        { label: 'Step 01', title: 'Listen', body: 'Gather only the facts and constraints supplied in the brief.' },
        { label: 'Step 02', title: 'Shape', body: 'Develop an appropriate structure and original visual direction.' },
        { label: 'Step 03', title: 'Check', body: 'Verify the result against the intended user path.' },
      ]
      break
    case 'proof':
      section.body = 'Proof components require verified source material. Everything below is explicitly a layout sample, not evidence.'
      if (entry.id === 'proof-metrics') {
        section.items = [
          { label: 'Example measure', value: 'Not supplied', body: 'Insert a verified value and source.' },
          { label: 'Example period', value: 'Not supplied', body: 'State the relevant timeframe.' },
          { label: 'Example context', value: 'Required', body: 'Explain what the measure actually represents.' },
        ]
      } else {
        section.items = [
          { body: '“This is quotation layout sample copy, not a real testimonial.”', author: 'Fictional name', role: 'Example attribution · not a client' },
          { body: '“Replace this text only with a quotation and attribution you can verify.”', author: 'Layout sample', role: 'No endorsement implied' },
        ]
      }
      break
    case 'people':
      section.items = [0, 1, 2].map((number) => ({
        image: image(number + 1), label: 'Fictional profile',
        title: ['Alex Example', 'Morgan Sample', 'Riley Placeholder'][number],
        role: ['Example role A', 'Example role B', 'Example role C'][number],
        body: 'A fictional profile created only to demonstrate this people layout.',
        href: sectionHref,
      }))
      break
    case 'pricing':
      section.body = 'Example offer labels and price placeholders demonstrate hierarchy only; they are not purchasable offers.'
      section.items = [
        { label: 'Example option A', title: 'Starter layout', price: 'Price supplied by you', body: 'Example inclusion label · replace with verified scope.' },
        { label: 'Example option B', title: 'Expanded layout', price: 'Price supplied by you', body: 'No currency, discount, or availability is implied.' },
        { label: 'Example option C', title: 'Custom layout', price: 'Quote from provider', body: 'A truthful placeholder for a bespoke offer.' },
      ]
      break
    case 'faq':
      section.items = [
        { title: 'Is this a real organisation or offer?', body: 'No. It is clearly labeled fictional sample content for previewing the section layout.' },
        { title: 'Can these answers be published as-is?', body: 'No. Replace them with answers checked against the real brief.' },
        { title: 'Does the example make performance claims?', body: 'No. It demonstrates structure without claiming real outcomes.' },
      ]
      break
    case 'event':
      section.title = 'Open Studio · fictional event example'
      section.body = 'A sample event layout. The date, place, availability, and programme are not real.'
      section.items = [
        { time: '10:00 · example', label: 'Sample agenda', title: 'Welcome and orientation', body: 'Fictional schedule item.' },
        { time: '11:30 · example', label: 'Sample agenda', title: 'Guided working session', body: 'Fictional schedule item.' },
        { time: '14:00 · example', label: 'Sample agenda', title: 'Questions and close', body: 'Fictional schedule item.' },
      ]
      break
    case 'contact':
      section.title = 'Start a fictional conversation'
      section.body = 'Contact details are deliberately non-deliverable examples for layout evaluation.'
      section.action = { label: 'Example contact action', href: sectionHref }
      section.items = [
        { label: 'Example email', title: 'hello@example.invalid', href: sectionHref, body: 'Reserved invalid domain; no inbox exists.' },
        { label: 'Example hours', value: 'By arrangement', body: 'Sample availability language only.' },
      ]
      break
    default:
      throw new Error(`Unsupported section category: ${entry.category}`)
  }
  return section
}

function renderOne(section, headingLevel = 2, editPrefix = 'example.section') {
  return renderSection(section, {
    headingLevel,
    pagePath: 'index.html',
    editPrefix,
    resolveUrl: (url) => url,
  })
}

const COMPOSITION_SPECS = [
  {
    id: 'composition-service', category: 'composition', label: 'Service page composition', kind: 'service',
    description: 'A complete fictional service-page example with a split hero, service rows, process steps, FAQ, and contact band.',
    ids: ['hero-split', 'services-rows', 'process-steps', 'faq-disclosure', 'contact-band'],
    brand: { background: '#F5EFE5', text: '#18352F', accent: '#B84F35', accentText: '#FFFAF1', muted: '#5B6B65', surface: '#FFFAF4', font: 'system', headingFont: 'serif', radius: 8, space: 24 },
  },
  {
    id: 'composition-portfolio', category: 'composition', label: 'Portfolio page composition', kind: 'portfolio',
    description: 'A complete fictional portfolio-page example with editorial pacing, project artwork, biography, and a split contact close.',
    ids: ['hero-editorial', 'work-gallery', 'intro-bio', 'proof-quote', 'contact-split'],
    brand: { background: '#F3EAD9', text: '#34253F', accent: '#A94C55', accentText: '#FFF8EF', muted: '#756978', surface: '#FFFDF8', font: 'serif', headingFont: 'serif', radius: 4, space: 28 },
  },
  {
    id: 'composition-event', category: 'composition', label: 'Event page composition', kind: 'event',
    description: 'A complete fictional event-page example with poster hero, agenda, venue, FAQ index, and concise contact panel.',
    ids: ['hero-poster', 'event-agenda', 'event-venue', 'faq-index', 'contact-panel'],
    brand: { background: '#EDF1ED', text: '#15354A', accent: '#B65C2E', accentText: '#FFFAF0', muted: '#5D707B', surface: '#FFFFFF', font: 'system', headingFont: 'mono', radius: 12, space: 20 },
  },
]

const SECTION_BRAND = {
  background: '#F4F0E8', text: '#17201B', accent: '#B5482F', accentText: '#FFFAF2',
  muted: '#59625D', surface: '#FFFDF8', font: 'system', headingFont: 'serif', radius: 7, space: 16,
}

const FONT_STACKS = {
  system: 'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  serif: 'Iowan Old Style,Baskerville,"Times New Roman",serif',
  mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
}

function themeCss(brand) {
  return `:root{--background:${brand.background};--text:${brand.text};--accent:${brand.accent};--accentText:${brand.accentText};--muted:${brand.muted};--surface:${brand.surface};--font:${FONT_STACKS[brand.font]};--headingFont:${FONT_STACKS[brand.headingFont]};--radius:${brand.radius}px;--space:${brand.space}px}`
}

function withoutArtwork(section) {
  const result = structuredClone(section)
  delete result.image
  result.items?.forEach((item) => delete item.image)
  return result
}

function briefFor(label, description, brand, sections) {
  return validateBrief({
    schemaVersion: 1,
    name: `Northstar ${label} example`,
    language: 'en',
    brand,
    pages: [{ path: 'index.html', title: label, description, sections: sections.map(withoutArtwork) }],
  })
}

function createComposition(spec, samplesById) {
  const sections = spec.ids.map((id) => structuredClone(samplesById.get(id)))
  sections[0].title = spec.kind === 'service'
    ? 'A fictional studio for complex, useful work'
    : spec.kind === 'portfolio'
      ? 'Selected imaginary work, arranged with intention'
      : 'Open Studio · a fictional one-day gathering'
  const body = sections.map((section, index) => renderOne(section, index === 0 ? 1 : 2, `pages.0.sections.${index}`)).join('')
  const navigation = `<header class="sample-mast"><a href="#top">Northstar Example</a><span>Fictional ${spec.kind} composition</span></header>`
  return {
    id: spec.id,
    category: spec.category,
    label: spec.label,
    description: spec.description,
    filename: `${spec.kind}-composition-example.html`,
    body: `<div id="top" class="example-flag">Fictional whole-page example · not a real organisation, offer, project, or event</div>${navigation}<main>${body}</main>`,
    extraCss: `${themeCss(spec.brand)}.sample-mast{display:flex;justify-content:space-between;gap:1rem;padding:1rem clamp(1rem,5vw,4rem);color:var(--accentText);background:var(--text);font:700 .8rem/1.4 ui-sans-serif,system-ui;text-transform:uppercase;letter-spacing:.08em}.sample-mast a{color:inherit}.example-flag{padding:.65rem 1rem;text-align:center;color:var(--text);background:var(--surface);font:700 .75rem/1.4 ui-sans-serif,system-ui;letter-spacing:.05em}.example-note{padding:2rem;text-align:center;color:var(--muted);background:var(--background);font:1rem/1.6 ui-sans-serif,system-ui}@media(max-width:420px){.sample-mast{align-items:flex-start;flex-direction:column}}`,
    data: briefFor(spec.kind, spec.description, spec.brand, sections),
  }
}

function safeScriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function galleryHtml() {
  const actualIds = SECTION_CATALOG.map(({ id }) => id)
  if (actualIds.length !== 36 || actualIds.some((id, index) => id !== EXPECTED_IDS[index])) {
    throw new Error(`SECTION_CATALOG contract mismatch: expected the documented 36 IDs in order; received ${actualIds.length}.`)
  }
  if (SECTION_CSS.includes('</style')) throw new Error('SECTION_CSS cannot contain a closing style tag.')

  const previewSectionsById = new Map()
  const samples = SECTION_CATALOG.map((entry, index) => {
    const data = sampleFor(entry, index)
    previewSectionsById.set(entry.id, data)
    return {
      id: entry.id,
      category: entry.category,
      label: entry.label,
      description: entry.description,
      filename: `${entry.id}-fictional-example.html`,
      body: `<div class="example-flag">Fictional section example · layout demonstration only</div><main>${renderOne(data, entry.category === 'hero' ? 1 : 2)}</main>`,
      extraCss: `${themeCss(SECTION_BRAND)}.example-flag{padding:.65rem 1rem;text-align:center;color:var(--text);background:var(--surface);font:700 .75rem/1.4 ui-sans-serif,system-ui;letter-spacing:.05em}.example-note{padding:2rem;text-align:center;color:var(--muted);background:var(--background);font:1rem/1.6 ui-sans-serif,system-ui}`,
      data: briefFor(entry.label, entry.description, SECTION_BRAND, [data]),
    }
  })
  const compositions = COMPOSITION_SPECS.map((spec) => createComposition(spec, previewSectionsById))
  const model = {
    catalogCount: samples.length,
    compositionCount: compositions.length,
    sectionCss: SECTION_CSS,
    items: [...compositions, ...samples],
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline Section Chooser · 36 sections + 3 compositions</title>
<style>
:root{color-scheme:light;--ink:#17201b;--paper:#eee9df;--panel:#fffdf8;--accent:#b5482f;--line:#c9c2b6;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper)}button,select{font:inherit}button:focus-visible,select:focus-visible,iframe:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.app{display:grid;grid-template-columns:minmax(16rem,22rem) minmax(0,1fr);min-height:100vh}.controls{padding:clamp(1.25rem,3vw,2.5rem);background:var(--panel);border-right:1px solid var(--line)}h1{margin:0;font:600 clamp(2rem,5vw,3.75rem)/.95 Georgia,serif;letter-spacing:-.04em}.lede{color:#59625d;line-height:1.55}.count{font-weight:800}.field{display:grid;gap:.45rem;margin-top:1.25rem}.field label,.label{font-size:.76rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.field select{width:100%;padding:.75rem;border:1px solid var(--line);border-radius:.35rem;background:white}.sizes,.actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.25rem}.sizes button,.actions button{min-height:2.75rem;padding:.65rem .85rem;border:1px solid currentColor;border-radius:.35rem;color:var(--ink);background:transparent;cursor:pointer}.sizes button[aria-pressed="true"],.actions button:hover{color:white;background:var(--ink)}.description{min-height:5rem;color:#59625d;line-height:1.5}.export-note{color:#59625d;font-size:.86rem;line-height:1.45}.preview-area{min-width:0;padding:clamp(1rem,4vw,3rem);overflow:auto}.preview-head{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-bottom:1rem}.preview-head h2{margin:0;font:600 clamp(1.45rem,3vw,2.4rem)/1 Georgia,serif}.preview-shell{width:min(100%,1100px);margin:auto;transition:width .2s ease}.preview-shell[data-width="mobile"]{width:320px;min-width:320px}iframe{display:block;width:100%;height:min(760px,78vh);border:0;outline:1px solid var(--line);background:white;box-shadow:0 1rem 3rem #17201b1a}.status{min-height:1.5rem;margin-top:1rem;color:#59625d;font-size:.9rem}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:760px){.app{grid-template-columns:1fr}.controls{border-right:0;border-bottom:1px solid var(--line)}.preview-area{padding:1rem}.preview-head{align-items:start;flex-direction:column}.preview-shell{margin-inline:0}iframe{height:680px}}
</style>
</head>
<body>
<div class="app">
  <aside class="controls" aria-labelledby="gallery-title">
    <h1 id="gallery-title">Section chooser</h1>
    <p class="lede"><span class="count">36 original section renderers</span> and three distinct whole-page compositions. Every preview and download is a clearly labeled fictional example.</p>
    <div class="field"><label for="category">Category filter</label><select id="category"></select></div>
    <div class="field"><label for="section">Section or composition</label><select id="section"></select></div>
    <p id="description" class="description"></p>
    <span class="label">Preview width</span>
    <div class="sizes" role="group" aria-label="Preview width">
      <button type="button" data-size="desktop" aria-pressed="true">Desktop</button>
      <button type="button" data-size="mobile" aria-pressed="false">Mobile · 320px</button>
    </div>
    <div class="actions">
      <button type="button" id="download-html">Download standalone HTML</button>
      <button type="button" id="download-json">Download brief JSON</button>
      <button type="button" id="copy">Copy HTML</button>
    </div>
    <p class="export-note">Preview and HTML artwork is embedded for offline use. Artwork is intentionally omitted from strict brief JSON.</p>
    <p id="status" class="status" role="status" aria-live="polite"></p>
  </aside>
  <main class="preview-area">
    <div class="preview-head"><div><span class="label">Live sandbox preview</span><h2 id="preview-title"></h2></div><span id="selection-count" class="count"></span></div>
    <div id="preview-shell" class="preview-shell" data-width="desktop"><iframe id="preview" title="Selected section preview" sandbox=""></iframe></div>
    <p id="example-note" class="sr-only">All content is fictional and exists only to demonstrate the layout.</p>
  </main>
</div>
<script>
'use strict';
const MODEL=${safeScriptJson(model)};
const categorySelect=document.getElementById('category');
const itemSelect=document.getElementById('section');
const description=document.getElementById('description');
const preview=document.getElementById('preview');
const previewTitle=document.getElementById('preview-title');
const previewShell=document.getElementById('preview-shell');
const status=document.getElementById('status');
const selectionCount=document.getElementById('selection-count');
const categories=['all','composition'].concat(Array.from(new Set(MODEL.items.filter(function(item){return item.category!=='composition'}).map(function(item){return item.category}))));
function titleCase(value){return value.charAt(0).toUpperCase()+value.slice(1)}
function documentFor(item){return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeText(item.label)+' · fictional example</title><style>'+MODEL.sectionCss+item.extraCss+'html{scroll-behavior:smooth}body{margin:0}</style></head><body>'+item.body+'<footer id="example-note" class="example-note">Fictional example for layout evaluation. Replace all sample content with verified source material before publishing.</footer></body></html>'}
function escapeText(value){return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function currentItem(){return MODEL.items.find(function(item){return item.id===itemSelect.value})||MODEL.items[0]}
function setStatus(message){status.textContent=message}
function render(){const item=currentItem();previewTitle.textContent=item.label;description.textContent=item.description;preview.title=item.label+' fictional example preview';preview.srcdoc=documentFor(item);selectionCount.textContent=MODEL.catalogCount+' sections · '+MODEL.compositionCount+' compositions';setStatus('Preview updated: '+item.label+'.')}
function populateItems(preferred){const category=categorySelect.value;const available=MODEL.items.filter(function(item){return category==='all'||item.category===category});itemSelect.replaceChildren();available.forEach(function(item){const option=document.createElement('option');option.value=item.id;option.textContent=item.label+' · '+titleCase(item.category);itemSelect.append(option)});if(preferred&&available.some(function(item){return item.id===preferred}))itemSelect.value=preferred;render()}
function download(filename,contents,type){const blob=new Blob([contents],{type:type});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(function(){URL.revokeObjectURL(url)},0)}
categorySelect.append.apply(categorySelect,categories.map(function(category){const option=document.createElement('option');option.value=category;option.textContent=category==='all'?'All 39 examples':titleCase(category);return option}));
categorySelect.value='all';populateItems('composition-service');
categorySelect.addEventListener('change',function(){populateItems()});itemSelect.addEventListener('change',render);
document.querySelectorAll('[data-size]').forEach(function(button){button.addEventListener('click',function(){const size=button.dataset.size;previewShell.dataset.width=size;document.querySelectorAll('[data-size]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button))});setStatus((size==='mobile'?'Mobile 320px':'Desktop')+' preview width selected.')})});
document.getElementById('download-html').addEventListener('click',function(){const item=currentItem();download(item.filename,documentFor(item),'text/html;charset=utf-8');setStatus('Downloaded standalone HTML for '+item.label+'.')});
document.getElementById('download-json').addEventListener('click',function(){const item=currentItem();download(item.id+'.json',JSON.stringify(item.data,null,2)+'\\n','application/json;charset=utf-8');setStatus('Downloaded strict brief JSON for '+item.label+'. Artwork remains in the HTML export only.')});
document.getElementById('copy').addEventListener('click',async function(){const item=currentItem();const html=documentFor(item);try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('Clipboard API unavailable');await navigator.clipboard.writeText(html)}catch(error){const area=document.createElement('textarea');area.value=html;area.setAttribute('aria-label','Standalone HTML to copy');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();if(!document.execCommand('copy')){area.remove();setStatus('Copy was blocked. Download the standalone HTML instead.');return}area.remove()}setStatus('Copied standalone HTML for '+item.label+'.')});
</script>
</body>
</html>\n`
}

function main() {
  let options
  try {
    options = parseArgs(process.argv.slice(2))
    if (options.help) {
      usage()
      return
    }
    const target = assertNewPath(options.target, 'Gallery target')
    const html = galleryHtml()
    mkdirSafe(target)
    writeExclusive(join(target, 'index.html'), html)
    console.log(`Created offline section gallery at ${join(target, 'index.html')} (36 sections, 3 compositions).`)
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}

main()
