# Search Readiness

Use this checklist while building and before launch. It covers facts visible in one HTML file and separates them from deployment and search-platform facts that require live verification.

## Build with real, useful page content

- State the page purpose, audience, offer, and next action in clear visible text. Put essential answers in HTML text rather than only in images, video, or interaction states.
- Identify the real person or organization responsible for the page when that identity helps a visitor judge the answer. Keep names, bios, credentials, locations, prices, dates, outcomes, testimonials, and affiliations tied to participant-approved evidence.
- Answer the questions a visitor needs to decide or act. Use descriptive headings, useful internal links, and specific link text. Do not pad a page for keyword counts or manufacture authority signals.
- Keep one page-specific title, one accurate meta description, one meaningful H1 by kit convention, a logical heading outline, one primary `<main>`, and the correct document language.
- Give every functional link a real destination. `#` and section fragments are acceptable during an intentional local flow, but test them before launch. Give informative images accurate alt text and decorative images `alt=""`.

## Canonical and indexing controls

- Add a canonical only after the preferred public URL is verified. Never invent a domain, and never copy a production canonical into a different participant site without review.
- Treat `noindex` as a deliberate publishing decision. An explicit `index,follow` meta tag is not required. Review page-level directives, HTTP headers, `robots.txt`, authentication, firewall, CDN, and hosting rules together after deployment.
- Confirm that the public page returns the intended successful HTTP status and exposes important text to crawlers. Technical eligibility does not guarantee crawling, indexing, placement, or traffic.

## Structured data without fictional facts

- JSON-LD must parse, use an applicable type, and describe the page visitors can actually see. Check the current requirements for that rich-result type before launch.
- Never invent ratings, reviews, attendance, event dates, addresses, prices, inventory, awards, qualifications, or business relationships to fill schema fields. Omit unsupported properties.
- Passing a syntax or rich-results test does not prove factual accuracy or guarantee a rich result. Compare structured data with visible copy and source evidence manually.

## AI-search and crawler policy

- Normal search foundations also support Google AI search features; Google documents no special AI schema or extra machine-readable AI file requirement. `llms.txt` may be an optional publishing choice, but it is not a requirement asserted by this kit.
- Decide crawler policy by purpose. OpenAI documents `OAI-SearchBot` for search appearance and `GPTBot` for potential foundation-model training; their controls are independent. `ChatGPT-User` covers some user-initiated visits and is not the search opt-out control.
- Write crawler rules as participant policy, not as a universal default. Verify deployed `robots.txt` and access behavior rather than inferring them from local HTML.

## Run the local inspector

```sh
node scripts/seo-check.mjs --file=path/to/index.html
node scripts/seo-check.mjs --file=path/to/index.html --url=https://verified.example/page --json
```

The inspector reads only the named local HTML file. It reports `pass`, `warn`, `fail`, and `not_checked` with evidence and a next action. Missing essential title, description, or H1 and malformed JSON-LD are hard failures. Warnings are review leads, not an SEO score. It does not fetch external links or verify HTTP status, `robots.txt`, response headers, CDN behavior, indexing, ranking, or AI citations.

## Human launch review

1. Compare every visible and structured claim with the brief and approved evidence.
2. Run the local inspector and resolve failures; make an explicit decision on each warning.
3. Test navigation and the primary action in a rendered page.
4. After deployment, verify the public URL, status, redirects, canonical, robots controls, response headers, crawler access, and indexability with appropriate live tools.
5. Monitor actual search and referral data. Do not promise rankings, rich results, indexing, or AI citations.

## Primary sources

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical)
- [Google structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
