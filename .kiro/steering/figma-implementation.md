# Figma implementation workflow

When given a Figma link to implement:

1. Pull the screenshot with `get_screenshot` — this is the primary visual reference.
2. Pull `get_design_context` to extract exact values (colors, font sizes, border radii, spacing).
3. **Measure proportions from the pixel data** — calculate relative positions and sizes from the inset percentages and absolute coordinates in the design context. Do the math. Don't guess.
4. **Think through the CSS approach** for complex layout constraints BEFORE writing any code. If something is tricky (e.g. aspect-ratio + flex, height-driven sizing), reason through the solution first.
5. Implement once, correctly. Do not ship iterative guesses.

## What to use each tool for

- `get_screenshot`: Layout structure, overall proportions, visual appearance.
- `get_design_context`: Exact values only — border-radius, font weight, colors, spacing between elements. The absolute-positioned code it returns is NEVER directly usable for implementation. It's a data source, not a template.

## Rules

- Never ask the user to describe a layout that is visible in the Figma. Read it yourself.
- Never use fixed pixel widths where proportional sizing is needed. Screens and scaling factors change.
- Never ship code without verifying the CSS approach handles the constraints (overflow, aspect-ratio, flex interactions).
- If a layout constraint is structurally ambiguous from the screenshot alone, ask ONE clarifying question before implementing — don't guess through 5 broken iterations.
