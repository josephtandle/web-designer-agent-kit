# Prompt 6: Finish and Prepare for Launch

Paste this into your AI assistant when the website design is ready for a final local review.

```text
Use the Web Designer agent to finish my website and prepare a launch checklist. Do not publish.

Run Speak Human copy cleanup first, with before/after examples and a protected-facts comparison. Then inspect a working local preview at desktop and mobile sizes.

Verify unique titles and descriptions, one meaningful H1 per page, semantic navigation, crawlable text, accurate headings, approved Open Graph assets, alt text, 4.5:1 body-text contrast, 44x44px touch targets, reduced-motion behavior, and working CTA destinations. Add a canonical only when the public domain is verified. Ensure schema matches visible facts and contains no invented Event dates, metrics, ratings, prices, or addresses.

Treat a form as connected only when its real endpoint is configured and I have confirmed send intent. Label unconnected demos and prevent accidental submission. Do not use action="#", contenteditable, or navigation as fake submission.

Save the local launch checklist to .masterminds-context/launch-checklist.json. State that the local preview is not published, list observed checks, and list remaining uncertainty. Give deployment instructions as future steps, not as claims that deployment occurred.
```
