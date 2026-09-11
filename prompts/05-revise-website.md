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
- Use original CSS by default and keep an explicit reduced-motion fallback; do not require an external library.
- Update .masterminds-context/design-decisions.json with any new choices.
- Run Speak Human copy cleanup before visual QA, show before/after examples, and verify meaning, facts, evidence, and qualifications.
- Treat forms as connected only when a real endpoint exists and I have confirmed send intent. Keep unconnected local demos clearly labeled and non-sending.
- Verify the updated site locally, explicitly mark local preview status as not published, and note unverified visual QA if browser access is unavailable.
```
