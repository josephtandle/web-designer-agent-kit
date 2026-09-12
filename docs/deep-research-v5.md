# Web Designer v5 deep research: content-adaptive composition, safe editing, and evidence-led evaluation

Reviewed 2026-09-12. This artifact extends [the earlier GitHub design research](github-design-research.md). It records the evidence and decisions for the proposed v5 capability wave. It does not claim that the proposal has been implemented, tested, installed, or released.

The supplied v4 evaluation is the baseline, not proof of v5: 48 tests passed, while a long-content run still showed overflow at 320 to 375 CSS pixels and a desktop `h1` height of 747 pixels. Those observations motivate a content-fit and typography upgrade. They do not establish that any proposed remedy works. Every v5 behavior below remains an implementation requirement until verified through the checks described here.

## Executive conclusion

A capable site generator should choose composition from the relationship among the supplied facts, not force every participant through one conversion funnel. Narrative, comparison, sequence, collection, proof, and action are different information structures. They need different visual arrangements, but they should share restrained site-wide typography, spacing, color, navigation, and footer rules. A catalog of 36 original section types across 12 categories provides useful breadth only if the generator selects and reorders those types according to content, preserves every supplied item, and rejects unsupported data rather than inventing it.

The site should remain model-first. A validated `site.json` should be the editable source, with pages rendered from plain, escaped fields. The editor should change generated sites through typed leaf paths, then validate and rerender, never parse arbitrary HTML back into a model.

Reference work needs measured evidence. Text extraction cannot prove geometry, typography, responsive behavior, actual fonts, crop, or interaction state. Match and Adapt workflows therefore need exact capture metadata and independently authored output.

Evaluation should test the real agent using representative participant briefs, not only call renderer functions. Outcomes should be judged independently, over repeated trials, against explicit requirements and evidence. Automated checks can catch overflow, broken links, missing metadata, fixed copy patterns, and some accessibility problems. They cannot establish complete WCAG conformance, copy quality, truthfulness, reference fidelity, or live search visibility by themselves.

## Evidence-first recommendation matrix

| Evidence and limitation | Recommendation | Observable acceptance evidence | Decision |
| --- | --- | --- | --- |
| [Bedrock Split](https://github.com/Bedrock-Layouts/Bedrock/blob/main/packages/split/README.md) uses a minimum-width boundary before columns stack; Inline Cluster wraps peer items; [Cover](https://github.com/Bedrock-Layouts/Bedrock/blob/main/packages/cover/README.md) allocates remaining height around a principal region. These are separate relationship patterns, not a universal grid. | Diagnose the content relationship before choosing layout. Give each section type its own responsive topology and content constraints. | Long and short fixtures at 320, 768, and 1440 CSS pixels show no clipped text, inaccessible action, or unintended horizontal scroll. | Adopt for v5. |
| The [Every Layout skill material](https://github.com/AVivero/every-layout-skill/blob/main/references/decision-tree.md) emphasizes choosing by content relationships and retaining the host stack. Its [MIT repository license](https://github.com/AVivero/every-layout-skill/blob/main/LICENSE) does not grant rights to the separate commercial book or site. | Fold only the general reasoning into original local guidance. Preserve the participant project's existing stack unless a supplied contract explicitly replaces it. | Repository diff shows original prose and implementation, no vendored upstream code, and no unnecessary framework migration. | Adopt for v5. |
| [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) respond to a component's available space; [subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid) shares ancestor tracks. Neither decides editorial meaning. | Use container-local breakpoints where reusable sections can appear in different shells. Use shared tracks only when visual alignment benefits related content. | Section fixtures work in narrow and wide containers independent of the page viewport; editorial layouts align without forcing every section into identical columns. | Adopt selectively. |
| [Utopia](https://github.com/trys/utopia-core) demonstrates fluid type and spacing scales, but the verified notes did not locate a root license file. [React Wrap Balancer](https://github.com/shuding/react-wrap-balancer) and Capsize have permissive licenses, yet their ideas can be met with native CSS and measured font handling. | Generate bounded shared type and space tokens. Prefer native wrapping and fallback-font controls before adding runtime dependencies. | Computed styles remain within declared bounds; long headings wrap cleanly; fallback loading produces no material overlap or control displacement. | Adopt the principle; defer dependencies. |
| [GrapesJS](https://grapesjs.com/docs/modules/Storage.html) and Editor.js retain structured state rather than treating exported HTML as the full editing model. GrapesJS also exposes [undo management](https://grapesjs.com/docs/api/undo_manager.html). | Keep `site.json` authoritative. Edit validated text and image leaves, rerender every affected page, and maintain revision-aware undo and redo. | An edit survives reload, undo restores the prior model and rendered files, stale or unauthorized writes fail, and unrelated files remain byte-identical. | Adopt for an opt-in generated-site editor. |
| [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) and upload guidance, iframe sandboxing, CSP, and [DOMParser documentation](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString) show that loopback and parsing boundaries still require explicit protection. `DOMParser.parseFromString()` is not sanitization. | Use a random fragment token, exact Host and Origin checks, bounded JSON, strict routes and URLs, sandboxed preview, preview CSP, re-encoded validated images, staged writes, and conflict detection. | Negative tests reject missing or bad authorization, unsafe protocols, traversal and encoded aliases, symlinks, oversize data, stale revisions, and partial-write scenarios. | Adopt as a release gate. |
| [Playwright](https://playwright.dev/docs/emulation) can control viewport, color scheme, screenshot behavior, animations, crop, and pixel mode. Snapshot stability still depends on environment. [CDP](https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getPlatformFontsForNode) can report platform fonts. | Make reference records explicit about viewport, DPR, scheme, page state, crop, scale, timestamp, URLs, and actual fonts. Compare aligned renderings rather than unlabelled screenshots. | A capture manifest plus image can be replayed in the declared environment; comparator records alignment and does not present a score without its conditions. | Adopt for Match and Adapt evidence. |
| [Shot-scraper](https://github.com/simonw/shot-scraper) shows configurable page and selector capture without requiring its runtime in the kit. Browser Use and [Firecrawl](https://github.com/firecrawl/firecrawl) address navigation and extraction, but extraction alone does not prove layout. Firecrawl core is AGPL-3.0. | Keep browser capture as an optional route, not a required build dependency. Treat text extraction as content inventory only. | Offline generation works without research tools; failed capture is reported; a text-only fetch is never labelled a visual match. | Adopt boundary; defer navigation dependency. |
| [Design2Code](https://github.com/NoviScl/Design2Code) separates block, text, position, color, and image similarity. Its code and data have different licenses. The [benchmark paper](https://arxiv.org/abs/2403.03163) describes research but does not authorize copying a dataset. | Evaluate reference fidelity by separate dimensions and use only owned or expressly permitted fixtures. Do not collapse meaning, geometry, typography, and assets into one unexplained number. | Reports show per-dimension evidence, fixture provenance, viewport/state, grader identity, and unresolved differences. | Adopt methodology; defer external dataset use. |
| [Anthropic's eval guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) favors outcome-oriented tasks, independent graders, and repeated trials for variable agents. | Benchmark the actual Web Designer agent on complete briefs and revision requests, comparing v5 with the v4 baseline under the same tasks. | Multiple trials preserve artifacts, prompts, outputs, grader rubrics, failures, and aggregate distributions. No single successful demo is called proof. | Adopt before release claims. |
| [retext-simplify](https://github.com/retextjs/retext-simplify) and [retext-readability](https://github.com/retextjs/retext-readability) provide advisory linguistic signals. Readability formulas can be distorted, and neither tool detects AI authorship or factual accuracy. | Protect supplied facts first. Use deterministic scans as review prompts, then conduct a human-language and fact-diff review. | Report distinguishes fixed-pattern matches, protected facts, subjective copy notes, and accepted exceptions. | Adopt as advisory review. |
| [Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/new-audits.md) asks audits to provide actionable, resource-specific evidence. Google's link, sitemap, structured-data, and [AI-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) does not guarantee discovery or ranking. | Audit every generated page, destination, metadata field, and structured claim locally. Label live indexing, rankings, and AI visibility as not checked unless separately observed. | Local audit catches missing targets and duplicate metadata; crawlable links use real `href` values; reports do not turn a sitemap into an indexing claim. | Adopt. |
| [Playwright accessibility tests](https://playwright.dev/docs/accessibility-testing) find a subset of issues. [Web Vitals](https://web.dev/articles/vitals) distinguishes controlled lab observations from real-user field data. | Combine automated accessibility checks with keyboard, focus, zoom, long-content, and visual review. Keep lab results separate from production telemetry. | Acceptance report lists automated findings, manual checks, test environment, and any field data source separately. | Adopt. |

## Composition model and section breadth

The proposed 36-section catalog is useful as a vocabulary, not as 36 mandatory stops. It contains three original variants in each of 12 categories: hero, introduction, services, benefits, work, process, proof, people, pricing, FAQ, event, and contact. The exact IDs are part of the approved contract and should remain stable because briefs, edit paths, fixtures, and documentation will refer to them.

Selection starts with the facts. An agenda is a sequence, service tiers are a comparison, a portfolio is a collection, a testimonial is proof, a biography is narrative, and booking details are an action. Relationship, content volume, evidence strength, and intended next step decide the variant.

Order should also respond to the brief. A recognized expert may open with proof before services. A new workshop may need context, agenda, venue, then registration. A case-study site may alternate narrative and evidence. The generator should not manufacture a testimonial, metric, price, client name, or urgency claim just to populate a preferred sequence. Missing evidence is a design constraint, not a prompt to fabricate.

Each section accepts only normalized contract fields. Text is plain and escaped; images include source and alternative text; actions include labels and constrained destinations. No supplied item should disappear because a variant has too few slots. Render all items, choose a compatible structure, or reject the brief precisely.

The site-level brand tokens supply a shared rhythm across pages: background, text, accent, accent text, muted and surface colors, font roles, radius, and spacing. Bounded token values keep sections compatible while allowing distinct compositions. Shared tokens should not flatten every page into the same density. Sections can vary in measure, alignment, imagery, and whitespace while still using the same scale.

Responsive design must be content-fit rather than device-name driven. A comparison may retain columns while each card has enough measure, then stack. Actions may wrap as a cluster. A focal hero may allocate remaining height but must grow past its minimum when copy expands. Container queries are appropriate when the same section can occupy a full page or a narrower editor preview. Viewport checks remain necessary because navigation, page shells, fixed elements, and zoom involve the whole document.

## Multi-page rendering and safe editing

The brief schema should describe the complete site before files are written. Validation covers unknown keys, bounds, colors, font choices, unique safe routes, metadata, sections, image protocols, and link schemes. Pages are limited to `index.html` or a safe slug plus `/index.html`. Reject encoded separators, dot segments, backslashes, controls, credentials, protocol-relative URLs, and decoded route aliases.

Rendering is a pure transformation from brief to file record. A structured build produces only planned pages, `styles.css`, `site.json`, `README.md`, and the required static preview. Shared navigation uses `aria-current`. The renderer plans before writing, refuses nonempty or symlink targets, and never fetches external assets.

The opt-in editor serves only a generated directory over loopback. Editable attributes identify model leaf paths but do not authorize arbitrary properties. The server validates each path and bounded value, compares an optimistic source hash, and rerenders planned files. External changes become conflicts rather than being overwritten.

Undo and redo operate on validated model revisions. An original disk snapshot provides recovery; in-memory history supports the session. Stage and commit planned files together. Reserve model, stylesheet, documentation, script, editor API, and private paths from page routing.

Sandbox the preview and constrain it with CSP. Use a random fragment token, authenticated requests, exact Host and Origin checks, and no permissive CORS. Image editing requires signature and decoded-image checks, size and dimension limits, safe re-encoding, and final validation. Browser re-encoding does not replace server validation.

Provide pointer and keyboard routes, including an accessible field list. Modal focus must enter predictably, remain constrained, support safe escape, and return to its trigger. Announce save, error, stale, undo, and redo states without unexpected focus movement.

## Reference fidelity methodology

Reference recreation begins by naming the mode. Match means reproduce observed spatial relationships as closely as permitted while using independently authored markup and authorized participant content. Adapt means retain selected principles, such as editorial rhythm or split emphasis, while intentionally changing the page structure. The mode must be present in the evidence record because a valid Adapt result can be a poor pixel match by design.

A reference record includes source and final URLs, time, viewport, device pixel ratio, scheme, runtime, scroll and interaction state, animation policy, crop or selector, and comparison scale. Sampled elements record descriptions, bounds, typography, background, and actual platform fonts where available. A computed family list does not prove which face rendered.

Comparison happens in bounded passes. First inspect structure: section order, major bands, alignment, measure, whitespace, and responsive topology. Then inspect type and authorized assets: actual font, weight, size, line height, image crop, aspect ratio, and focal treatment. Finally inspect details: borders, radius, shadow, icon weight, micro-spacing, and restrained motion. Fixing structural divergence before shadow color prevents cosmetic work from hiding a wrong composition.

Side-by-side, overlay, and difference views require explicit alignment. Pixel differences are evidence, not a verdict: rendering variation can create harmless differences, while a low difference can conceal copied screenshots, inaccessible controls, bad semantics, or false content. Pair visual evidence with content, interaction, and provenance checks.

## Actual-agent benchmark methodology

Unit and integration tests are necessary but cannot show whether the agent chooses appropriate compositions from an ambiguous participant brief. The release benchmark should invoke the actual skill-led workflow and preserve the complete task artifact. At minimum, the task set should include a long-content service site, a three-page participant site, an event or agenda, a sparse brief without proof, a reference Match request, a reference Adapt request, and a revision that changes shared branding and one local field.

Run each task against v4 and candidate v5 with equivalent inputs and a recorded environment. Use repeated trials. Preserve prompts, briefs, files, screenshots, audits, timings, failures, and revision diffs, including failed attempts.

Independent graders should not be the generating agent. Objective checks cover schema validity, fact preservation, route safety, broken destinations, metadata uniqueness, heading structure, overflow, contrast, focusability, zoom behavior, file scope, and successful revision persistence. Subjective graders evaluate whether composition fits the content relationship, hierarchy is clear, prose sounds human without changing facts, visual rhythm is coherent, and Match or Adapt intent is satisfied. The rubric should expose each dimension rather than hide disagreement in one score.

Reference tasks add geometry, type, image, color, and block comparisons. Copy tasks add a protected-fact diff. Multi-page tasks check shared tokens and navigation. Editor tasks check reload, undo, stale and unauthorized updates, conflicts, and unrelated files. Report trials, graders, uncertainty, and regressions, never universal superiority.

## Licensing, provenance, and asset boundaries

The planned implementation is original local code and prose. Studying an interface concept does not import its [source license](https://github.com/AVivero/every-layout-skill/blob/main/LICENSE), but it also does not erase intellectual-property obligations. No upstream code, CSS, prose, icon paths, test data, screenshots, templates, or [benchmark dataset](https://github.com/NoviScl/Design2Code) should be copied unless a separate incorporation decision verifies the exact material and complies with its license.

Permissive licenses differ. MIT, ISC, and Apache-2.0 each have their own notice and redistribution terms. A license at a repository root may not govern every subtree, paid product, dataset, embedded server, brand asset, or linked publication. The verified notes identify Bedrock, the Every Layout skill repository, React Wrap Balancer, Capsize, and Browser Use as MIT; [shot-scraper as Apache-2.0](https://github.com/simonw/shot-scraper); [Firecrawl core as AGPL-3.0](https://github.com/firecrawl/firecrawl); Design2Code code as MIT and its data as ODC-By. Utopia's package declares ISC, but the verified review did not locate a root license file, so broader scope is unknown. That uncertainty should remain explicit.

The [Every Layout skill repository](https://github.com/AVivero/every-layout-skill/blob/main/LICENSE) does not license the original commercial book merely because its own repository is MIT. [Firecrawl's AGPL-3.0 core](https://github.com/firecrawl/firecrawl) and embedded-server exclusions make it unsuitable for casual bundling. Design2Code's research dataset should not be used until research intent and ODC-By compliance are resolved. The benchmark paper is evidence about evaluation, not a data license. User-provided fonts, logos, photographs, reference branding, personal data, testimonials, and model releases retain their own rights regardless of how the generator is licensed.

## Decisions adopted and deferred

Adopted for the v5 implementation contract:

1. A normalized, validated multi-page brief is the source of truth.
2. The 36 named original section types are chosen and reordered from content relationships, not inserted as a fixed funnel.
3. Shared tokens, navigation, and footer apply across pages, with content-fit responsive behavior and explicit long-content checks.
4. The renderer is pure, preserves all supplied facts and items, escapes text, constrains URLs and routes, and performs no automatic asset fetch.
5. The editor is opt-in, loopback-only, model-first, revision-aware, undoable, and limited to generated outputs.
6. Reference evidence records exact metadata and distinguishes Match from Adapt.
7. Whole-site audits and copy review separate deterministic findings, subjective judgment, protected facts, and live checks.
8. Release evaluation exercises the actual agent with repeated trials and independent graders against v4.

Deferred pending implementation and verification:

1. Any claim that the 36 sections are visually distinct, responsive, or complete.
2. Any claim that the editor is secure, accessible, crash-safe, or preserves unrelated files.
3. Adding React Wrap Balancer, Capsize, Utopia, browser navigation, scraping, or editor framework dependencies.
4. Use or redistribution of external benchmark data, source templates, icons, assets, fonts, or reference branding.
5. Public publishing, account integration, private-site fetching, arbitrary DOM round-tripping, and automatic remote asset downloads.
6. Live indexing, ranking, AI visibility, real-user Web Vitals, universal accessibility, or best-in-world quality claims.
7. Changes to the Web Designer agent skill. Integration follows only after implementation evidence exists.

## Numbered primary source inventory

1. [Bedrock Split README](https://github.com/Bedrock-Layouts/Bedrock/blob/main/packages/split/README.md), inspected for fractional splits with a minimum-width stacking boundary. Repository [MIT license](https://github.com/Bedrock-Layouts/Bedrock/blob/main/LICENSE).
2. [Bedrock Cover README](https://github.com/Bedrock-Layouts/Bedrock/blob/main/packages/cover/README.md), inspected for stable top, middle, and bottom allocation that can grow beyond a minimum height. License scope as in item 1.
3. [Bedrock Inline Cluster README](https://github.com/Bedrock-Layouts/Bedrock/blob/main/packages/inline-cluster/README.md), inspected for wrapping peer facts and actions. License scope as in item 1.
4. [Every Layout skill decision tree](https://github.com/AVivero/every-layout-skill/blob/main/references/decision-tree.md), inspected for relation-led composition choice.
5. [Every Layout skill instructions](https://github.com/AVivero/every-layout-skill/blob/main/SKILL.md), inspected for preserving the existing stack. The repository [MIT license](https://github.com/AVivero/every-layout-skill/blob/main/LICENSE) does not license the separate original book or site.
6. [MDN Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries), inspected for component-local responsive topology.
7. [MDN Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid), inspected for sharing tracks in open editorial layouts.
8. [Utopia Core](https://github.com/trys/utopia-core), inspected for fluid type and spacing scales. The package declares ISC; root license scope was not established in the supplied verification.
9. [React Wrap Balancer](https://github.com/shuding/react-wrap-balancer), inspected for headline balancing with native behavior preferred first. The verified repository license is MIT in `LICENSE.md`.
10. [Capsize](https://github.com/seek-oss/capsize), inspected for font-metric-aware fallback and layout-shift reduction. The verified repository license is MIT.
11. [GrapesJS Storage](https://grapesjs.com/docs/modules/Storage.html), inspected for preserving structured editor state rather than relying on HTML reimport.
12. [Editor.js saving data](https://editorjs.io/saving-data/), inspected for structured block output.
13. [GrapesJS Undo Manager](https://grapesjs.com/docs/api/undo_manager.html), inspected for tracked change-stack concepts.
14. [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), inspected for token, custom-header, and origin defenses.
15. [MDN iframe element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe), inspected for sandbox boundaries, including the same-origin and script interaction.
16. [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy), inspected for constraining preview resources and execution.
17. [MDN DOMParser.parseFromString](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString), inspected to confirm that parsing is not sanitization.
18. [MDN HTMLCanvasElement.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob), inspected for browser image re-encoding.
19. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), inspected for bounded server-side image validation.
20. [WAI-ARIA Authoring Practices modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), inspected for keyboard focus and return behavior.
21. [Playwright emulation](https://playwright.dev/docs/emulation), inspected for viewport, device pixel ratio, and color-scheme controls.
22. [Playwright page screenshot API](https://playwright.dev/docs/api/class-page#page-screenshot), inspected for animation policy, CSS versus device pixels, and crop behavior.
23. [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots), inspected for the need to match snapshot environments.
24. [Chrome DevTools Protocol CSS.getPlatformFontsForNode](https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getPlatformFontsForNode), inspected for actual rendered-font evidence.
25. [shot-scraper](https://github.com/simonw/shot-scraper), inspected for configurable capture. The verified repository license is Apache-2.0.
26. [shot-scraper screenshot documentation](https://shot-scraper.datasette.io/en/stable/screenshots.html), inspected for selector capture.
27. [Browser Use](https://github.com/browser-use/browser-use), inspected as an optional navigation route, not a required dependency. The verified repository license is MIT.
28. [Firecrawl](https://github.com/firecrawl/firecrawl), inspected for extraction and inventory limits. The verified core license is AGPL-3.0 with separate embedded-server boundaries.
29. [Design2Code](https://github.com/NoviScl/Design2Code), inspected for separate block, text, position, color, and image metrics. Verified license notes identify code as MIT and data as ODC-By; dataset use remains deferred.
30. [Design2Code research paper](https://arxiv.org/abs/2403.03163), inspected for evaluation methodology, not as permission to copy benchmark data.
31. [Anthropic, Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), inspected for actual-outcome tasks, independent graders, and repeated trials.
32. [retext-simplify](https://github.com/retextjs/retext-simplify), inspected for advisory phrase guidance and ignore-list concepts, not AI detection.
33. [retext-readability](https://github.com/retextjs/retext-readability), inspected for sentence readability formulas and their limits.
34. [Lighthouse new-audit guidance](https://github.com/GoogleChrome/lighthouse/blob/main/docs/new-audits.md), inspected for actionable, resource-specific audit evidence.
35. [Google crawlable links guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), inspected for real `href` navigation.
36. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), inspected with the limitation that discovery does not guarantee indexing.
37. [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), inspected for keeping machine-readable claims consistent with visible page content.
38. [Google AI features and website guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), inspected for ordinary useful-content and SEO guidance, not guaranteed AI visibility.
39. [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing), inspected with its stated limitation that automation does not prove complete WCAG conformance.
40. [web.dev Web Vitals](https://web.dev/articles/vitals), inspected for the distinction between lab observations and real-user field data.

## Verification standard for the later implementation

The approved check is a Node 24 full test run, browser exercises of participant generation, editor behavior, reference capture and comparison, and section fixtures, followed by independent review and extracted-package installation and generation. The evidence package should include the v4 baseline, all candidate trials, width and zoom observations, security negatives, whole-site and copy reports, screenshot metadata, and preserved artifacts. Until those checks exist, this report supports a design decision, not a shipped-feature claim.
