# Prompt 5: Revise The Website

Paste this into Claude Code to make changes to your website.

```text
Use the Web Designer agent to revise my website.

Instructions:
- Read .masterminds-context/brief.json and .masterminds-context/design-decisions.json.
- Ask me what specific section, copy, layout, or color adjustments I want to make.
- Edit target sections carefully with backups if replacing major code blocks, while preserving unrelated files and existing content.
- Preserve mobile responsiveness, minimum 4.5:1 text contrast, and accessibility standards.
- Keep motion optional and ensure CTA buttons maintain working links or fallbacks.
- Update .masterminds-context/design-decisions.json with any new choices.
- Verify the updated site locally, explicitly mark local preview status as not published, and note unverified visual QA if automated browser access is unavailable.
```
