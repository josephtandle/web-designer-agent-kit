# Prompt 7: Build from a Reference Layout

Paste this into your AI assistant to run the complete Match or Adapt workflow.

```text
Use the Web Designer agent to build an editable website from a visual reference.

Mode: Match (or Adapt)
Reference Project: absolute path to a new reference project
Source Reference: URL or local image path
Candidate Directory: a new directory such as candidate-01

Complete this end to end:

1. Discover and record the absolute KIT_ROOT and separate PROJECT_ROOT. Call every kit script by its absolute path and pass each path option as one quoted --key=value argument.
2. Initialize the reference map in a new reference project. Record observed versus inferred evidence: source, status and time when rendered, known CSS viewport, device pixel ratio, screenshot state, section geometry, type, wrapping, crops, controls, and unknowns. URL text fetch alone is not visual evidence.
3. If the source is a user-provided image and its CSS viewport or device pixel ratio is unknown, record the assumption and test responsive behavior. Do not claim image pixels equal CSS pixels.
4. Create actual semantic, editable HTML/CSS/JS in the separate candidate directory. Never use the screenshot as the page or a background substitute.
5. Start a working local preview of the candidate.
6. Capture the reference and candidate at the same known CSS viewport, device pixel ratio, color scheme, reduced-motion preference, scroll position, crop or full-page policy, and page state for desktop and mobile. Use any installed capture capability that can report this state.
7. The kit Playwright capture script is optional. If using its --spec option, construct and quote the raw JSON string yourself; never ask me to handwrite it. Use at most 6 cases. Each case requires name, width, height, dpr, colorScheme, and reducedMotion plus exactly one of fullPage or clip. Actions may be wait with ms, or hover, focus, open-details, or scroll with a selector. If Playwright is absent, present its installation as a separate opt-in setup step and do not install it silently. Use another installed capture capability or a clearly reported manual comparison when I do not opt in. Do not make Playwright a requirement for every user and do not fabricate capture evidence.
8. Preserve capture metadata for actions, viewport, DPR, color scheme, reduced motion, crop, final URL, and screenshot hash. Open the local Reference Compare tool. Confirm compatible state and hashes, align both images to a common coordinate origin, scale, and crop, then inspect side-by-side, overlay, and difference views.
9. Write a discrepancy list ordered by geometry, typography, image crops, then details.
10. Fix the editable build and repeat captures and comparisons for desktop and mobile.

Use three passes: structure; typography and crops; interactive details. If a pass has blocking mismatches, repeat that pass after fixing them. Do not stop merely because three passes ran. Continue until no blocking mismatch remains or an evidence gap prevents an honest conclusion.

Return the working preview, editable candidate path, observed-versus-inferred reference map, paired capture evidence, final discrepancy list, Match or Adapt conclusion, and remaining uncertainty. Do not claim publication, accessibility, or pixel accuracy without evidence.
```
