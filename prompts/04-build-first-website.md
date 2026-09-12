# Prompt 4: Build the First Website

Paste this into your AI assistant from the website project folder.

```text
Use the Web Designer agent and bundled Masterminds Web Designer skill to build or update my website.

First read available CLAUDE.md, USER.md, and SOUL.md, inspect the existing project, discover the installed skill and absolute kit root, and read its composition-design and structured-sites references. Save the brief and design decisions below .masterminds-context/. Turn my conversation and supplied facts into any required schema yourself, validate it, and generate complete pages. Never ask me to handwrite JSON. Ask at most 3 questions only when vital facts are missing. Offer 3 coherent directions and recommend one rather than asking me to choose among all 36 sections. If visual selection helps, create the offline section gallery in a new directory and launch its preview.

Build editable, functioning, original HTML/CSS/JS. Keep the 3 quick starters available for a simple site. For a content-adaptive multi-page site, create a brief file and use create-site.mjs with --brief=FILE and --target=NEW together; both are required in structured brief mode. The brief flag is mutually exclusive only with the legacy --style, --name, --headline, and --email quick-starter fields. Do not use an image as the page. Copy only my approved local images into the output before audit; do not auto-fetch remote images. Use a usable palette, responsive layout, semantic structure, 4.5:1 body-text contrast, 44x44px touch targets, visible focus, and a reduced-motion fallback. Use original CSS by default; no external library or external GitHub fetch is required.

Clean visible prose before visual QA in my actual business voice, not a generic AI voice or Joe's voice by default. Show before/after examples and preserve meaning, facts, evidence, qualifications, technical names, exact quotations, legal text, links, button facts, and SEO.

Apply built-in SEO: unique title and description, exactly one meaningful H1, semantic navigation, crawlable visible text, and logical headings. Use an Open Graph asset only when supplied or approved. Add a canonical URL only for a verified public domain. Schema must match visible facts and must not invent Event dates or success metrics. If no public domain is known, omit deployment-dependent metadata and leave a launch TODO.

Use a native form only with a connected endpoint and confirmed send intent. Never fake submission with action="#", contenteditable, or a navigation link. Label an unconnected local demo clearly and prevent submission.

Run the whole-site launch check with --dir=SITE --json and fix every hard failure. Then start and inspect a working local preview at desktop and mobile sizes, including keyboard use, forms, and performance. Offer the structured site editor only as an opt-in for a generated site.json site, using --dir=SITE and an integer --port, and open only its exact printed private one-session URL. Report observed checks and remaining uncertainty. Do not call the preview published or claim rankings.
```
