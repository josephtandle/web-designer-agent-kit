import test from 'node:test';
import assert from 'node:assert/strict';
import { SECTION_CATALOG } from '../templates/sections.mjs';
import { renderBrief } from '../scripts/lib/site-brief.mjs';

test('every section preserves supplied content and safe edit paths in a complete brief', () => {
  assert.equal(new Set(SECTION_CATALOG.map(entry => entry.id)).size, 36);
  for (const entry of SECTION_CATALOG) {
    const section = {
      id: 'example', type: entry.id, title: 'Supplied title', body: 'May take up to 20 days.',
      eyebrow: 'Supplied context', image: { src: 'art.png', alt: 'Supplied illustration' },
      action: { label: 'Ask about the work', href: 'mailto:hello@example.com' },
      items: [{ title: 'One offer', body: 'Repairs are not guaranteed.', label: 'Offer label',
        value: '20 days', price: '$49', author: 'Example author', role: 'Example role',
        time: '10:00', href: 'mailto:hello@example.com', image: { src: 'detail.png', alt: 'Detail illustration' } }],
    };
    const { files } = renderBrief({ schemaVersion: 1, name: 'Supplied studio', pages: [
      { path: 'index.html', title: 'Supplied page', description: 'Supplied page description.', sections: [section] },
    ] });
    const html = files['index.html'];
    for (const value of ['May take up to 20 days.', 'Repairs are not guaranteed.', '20 days', '$49', 'Example author', 'Example role', '10:00', 'Offer label', 'Detail illustration']) {
      assert.ok(html.includes(value), `${entry.id} lost ${value}`);
    }
    assert.match(html, /data-edit-path="pages\.0\.sections\.0\.items\.0\.body"/);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, entry.id);
  }
});
