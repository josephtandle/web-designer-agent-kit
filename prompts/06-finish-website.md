# Prompt 6: Finish And Prepare For Launch

Paste this into Claude Code when your website design is ready to publish.

```text
Use the Web Designer agent to finish my website and prepare it for launch.

Instructions:
- Perform a final site audit across mobile and desktop layouts.
- Check title tags, meta descriptions, semantic heading hierarchy, and Open Graph tags.
- Verify image alt text, contrast ratios (4.5:1 minimum), and 44x44px touch targets.
- Confirm all CTA buttons have working destinations or mailto fallbacks.
- Ensure no placeholder text or unverified claims remain.
- Save final launch configuration summary to .masterminds-context/launch-checklist.json.
- Explicitly state local preview status (preview only, not published) and report any unverified QA checks if live browser rendering was not executed.
- Provide exact steps to deploy to Vercel, Netlify, or GitHub Pages.
```
