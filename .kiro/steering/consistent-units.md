---
inclusion: auto
---

# Consistent Measurement Units

## Policy
This codebase uses **rem** as the primary measurement unit for ALL sizing, spacing, typography, and layout values. This is a MANDATORY rule that cannot be ignored.

## Allowed Units
- **rem** — Primary unit for ALL measurements: font sizes, padding, margin, gap, width, height, border-radius, max-width, min-height
- **%** — ONLY for flex-basis, width ratios within flex/grid containers (e.g. `w-[40%]`), and responsive width (`100%`)
- **svh/dvh** — ONLY for viewport-height-dependent layout containers (e.g. the root `min-height: 100svh`)

## Prohibited Units (in component/feature code)
- **px** — NEVER use raw pixels. Convert to rem (divide by 16). Example: 24px → 1.5rem
- **vh/vw** — NEVER use viewport units for element sizing. Use rem instead.
- **em** — Avoid. Use rem for consistency.

## Conversion Reference (base: 16px = 1rem)
- 4px = 0.25rem
- 8px = 0.5rem
- 12px = 0.75rem
- 16px = 1rem
- 20px = 1.25rem
- 24px = 1.5rem
- 32px = 2rem
- 40px = 2.5rem
- 48px = 3rem
- 56px = 3.5rem
- 64px = 4rem
- 80px = 5rem
- 96px = 6rem

## Tailwind Usage
- Use Tailwind's built-in spacing/sizing classes which are already rem-based: `p-4` (1rem), `text-4xl` (2.25rem), `gap-3` (0.75rem), etc.
- For custom values, always use rem in brackets: `text-[3.75rem]`, `p-[2.5rem]`, `rounded-[1.5rem]`
- NEVER write `px` in Tailwind brackets: ~~`w-[159px]`~~ → `w-[9.9375rem]` or use the closest Tailwind class

## Exceptions
- `box-shadow` values may use px for blur/spread (standard CSS convention)
- `border-width` may use px for 1px borders (sub-rem precision needed)
- Third-party library overrides where rem conversion would break the library

## Instructions for AI
- ALWAYS convert any pixel value to rem before writing it
- ALWAYS use Tailwind's built-in rem-based classes when possible
- NEVER introduce vh, vw, or px units in new component code
- When refactoring, convert existing px/vh/vw to rem
- For responsive font sizing, use Tailwind's responsive prefixes (`md:text-5xl lg:text-6xl`) or clamp with rem: `clamp(2rem, 4vw, 4.5rem)` — note: clamp's middle value may use vw as it's a ratio, but min/max MUST be rem
- For layout heights that need to be viewport-relative, use CSS custom properties set at the root level, not inline vh units
