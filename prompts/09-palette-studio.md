# Prompt 9: Palette Studio and Contrast Review

Paste this into your AI assistant to build and audit a website palette.

```text
Use the bundled local Palette Studio. Do not fetch external libraries.

Brand Hex Seed: #2D5A27

Review all 12 distinct palettes and choose a paired light/dark theme appropriate to the brand. Export exactly 10 semantic tokens, including border and onAccent. Label every tested foreground/background pair and its text size and weight.

Use unrounded sRGB values and the 0.04045 breakpoint. Require 4.5:1 for normal text and 3:1 for large text and relevant UI boundaries. Confirm onAccent against every accent used for text or icons. Do not infer whole-page accessibility from palette checks alone.

Save the chosen tokens for editable HTML/CSS use and report uncertified pairs. Verify the control panel remains readable independently of the canvas preview.
```
