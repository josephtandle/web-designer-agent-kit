# Prompt 4: Build The First Website

Paste this into Claude Code from the website project folder.

```text
Use the Web Designer agent and the Masterminds Web Designer skill stack to build or update my website.

First:
- Read CLAUDE.md, USER.md, and SOUL.md if present.
- Inspect the current folder to check if this is a new build or an existing website update.
- Load visual directions from skills/masterminds-web-designer/references/design-directions.md.
- Save project brief to .masterminds-context/brief.json and design choices to .masterminds-context/design-decisions.json.
- Ask at most 3 questions only if vital details are missing.
- Offer at most 3 visual directions with a recommendation and default choice if I delegate.

Build:
- A clear, responsive website tailored for the participant business or project.
- Include hero, audience/problem, services or offer, about section, proof or process, FAQ, and CTA.
- Use a visual direction that fits my brand without generic AI slop.
- Motion is optional. If added, ensure it respects reduced-motion preferences.
- Ensure responsive layout, minimum 4.5:1 text contrast, and 44x44px touch targets.
- Include SEO and AEO basics: title, meta description, semantic headings, and clean structure.
- Use honest facts without fabricated proof or fake stats.
- Provide working CTA links or a valid mailto fallback.
- Verify local preview before reporting done.

After building:
- Show me how to preview the site locally.
- Save decisions to .masterminds-context/design-decisions.json.
- Provide prompt 05 to revise or prompt 06 to finish.
```
