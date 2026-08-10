# Visual Neutrality Audit

## Summary
- Issues identified: 2
- Issues resolved: 2
- Items left unchanged: 0

## Baseline Screenshots

Baseline screenshots captured on initial state (pre-refactor) using the dev server with mock authentication enabled (`VITE_MOCK=true`). These serve as the visual reference for all subsequent refactoring phases.

### Viewports
| Viewport | Width | Height | Use Case |
|----------|-------|--------|----------|
| Mobile | 375px | 812px | iPhone X reference |
| Tablet | 768px | 1024px | iPad reference |
| Desktop | 1280px | 800px | Standard laptop |

### Captured Pages
| Page | Route | 375px | 768px | 1280px |
|------|-------|-------|-------|--------|
| Onboarding | `/` | [onboarding-375px.png](screenshots/onboarding-375px.png) | [onboarding-768px.png](screenshots/onboarding-768px.png) | [onboarding-1280px.png](screenshots/onboarding-1280px.png) |
| Dashboard | `/dashboard` | [dashboard-375px.png](screenshots/dashboard-375px.png) | [dashboard-768px.png](screenshots/dashboard-768px.png) | [dashboard-1280px.png](screenshots/dashboard-1280px.png) |
| NotFound | `/nonexistent-page` | [not-found-375px.png](screenshots/not-found-375px.png) | [not-found-768px.png](screenshots/not-found-768px.png) | [not-found-1280px.png](screenshots/not-found-1280px.png) |

### Capture Method
- Dev server started with `VITE_MOCK=true npm run dev`
- Full-page screenshots taken via Playwright browser automation
- Device pixel ratio: 1x (CSS pixels)
- File naming pattern: `{page-name}-{viewport}px.png`

## Changes

### Issue 1: Form input styling lost during CSS-to-Tailwind migration

**File:** `src/components/ui/FormField.tsx`

The original `.Step input` and `.Step select` CSS selectors were removed during the Tailwind utilization audit (Task 10.3) but the equivalent styling was not applied to the input elements. Fixed by adding descendant selector utilities (`[&_input]:`, `[&_select]:`, `[&_textarea]:`) on the FormField wrapper div to restore:
- `rounded-2xl` (border-radius: 16px)
- `bg-[#eeeaf5]` (lavender background)
- `px-5 py-4` (padding)
- `border-none outline-none` (clean appearance)
- `w-full text-base` (full width, consistent font size)

### Issue 2: CSS layer ordering causing utility overrides to fail

**File:** `src/index.css`

The `@layer base` block contained `* { margin: 0; padding: 0; }` which, due to Tailwind v4's CSS layer ordering (base declared after utilities), was overriding the padding utilities applied via `[&_input]:px-5` descendant selectors. Fixed by removing the `margin: 0; padding: 0` from the base reset — Tailwind v4's built-in reset handles this correctly, and the blanket override was preventing utility classes from functioning.

### Issue 3: PersonalInfoStep content not stretching to full card width

**File:** `src/features/onboarding/steps/PersonalInfoStep.tsx`

Added `w-full` class to the content wrapper div to ensure form fields stretch to the full width of the Card component (which uses `items-center` for flex alignment). This matches the behavior of other steps (e.g., AccountStep) that already had `w-full`.

## Exceptions

_No exceptions — all issues were resolved._

## Post-Responsiveness Comparison (Task 13.5)

Post-responsiveness screenshots have been captured and are available for comparison. These document the state after all horizontal overflow fixes (Issues 1–6) and touch target fixes (Issues 7–10) were applied.

### Post-Responsiveness Screenshots

| Page | 375px | 768px | 1280px |
|------|-------|-------|--------|
| Onboarding | [post-responsive-375px](screenshots/onboarding-post-responsive-375px.png) | [post-responsive-768px](screenshots/onboarding-post-responsive-768px.png) | [post-responsive-1280px](screenshots/onboarding-post-responsive-1280px.png) |
| Dashboard | [post-responsive-375px](screenshots/dashboard-post-responsive-375px.png) | [post-responsive-768px](screenshots/dashboard-post-responsive-768px.png) | [post-responsive-1280px](screenshots/dashboard-post-responsive-1280px.png) |
| NotFound | [post-responsive-375px](screenshots/not-found-post-responsive-375px.png) | [post-responsive-768px](screenshots/not-found-post-responsive-768px.png) | [post-responsive-1280px](screenshots/not-found-post-responsive-1280px.png) |

## Final Visual Comparison (Task 17.1)

Final screenshots captured after all refactoring phases are complete.

### Final Screenshots

| Page | 375px | 768px | 1280px |
|------|-------|-------|--------|
| Onboarding | [final-375px](screenshots/onboarding-final-375px.png) | [final-768px](screenshots/onboarding-final-768px.png) | [final-1280px](screenshots/onboarding-final-1280px.png) |
| Dashboard | [final-375px](screenshots/dashboard-final-375px.png) | [final-768px](screenshots/dashboard-final-768px.png) | [final-1280px](screenshots/dashboard-final-1280px.png) |
| NotFound | [final-375px](screenshots/not-found-final-375px.png) | [final-768px](screenshots/not-found-final-768px.png) | [final-1280px](screenshots/not-found-final-1280px.png) |

### Desktop Visual Neutrality Results (1280px)

| Page | Result | Notes |
|------|--------|-------|
| Onboarding | PASS | Form layout, input styling, card positioning, and element sizing match baseline. Logo and heading positions preserved. Button styling consistent. |
| Dashboard | PASS | Centered "Dashboard" text with animated background. Layout identical to baseline. |
| NotFound | PASS | Centered 404 content with heading, description, and action link. Layout identical to baseline. |

**Known acceptable deviations at 1280px:**
- AnimatedBackground blob positions differ between captures (CSS animation is time-dependent, non-deterministic per capture)
- LocaleSwitcher component has updated visual style (bordered button style vs plain text) — this is an intentional design improvement from the component library task (Task 8), not a regression

### Tablet Results (768px)

| Page | Result | Notes |
|------|--------|-------|
| Onboarding | PASS (with acceptable deviations) | CompanySettingsStep modal now respects viewport width. Other layout preserved. |
| Dashboard | PASS | No deviations from baseline at this viewport. |
| NotFound | PASS | No deviations from baseline at this viewport. |

### Mobile Results (375px)

| Page | Result | Notes |
|------|--------|-------|
| Onboarding | PASS (with acceptable deviations) | Layouts stack vertically instead of overflowing. Touch targets enlarged to 44x44px minimum. Images constrained to card width. |
| Dashboard | PASS | No deviations from baseline at this viewport. |
| NotFound | PASS (with acceptable deviations) | Touch targets enlarged via responsive utilities. |

### Acceptable Deviations at Smaller Viewports (375px, 768px)

Per Requirement 12.6, responsiveness fixes that add new layout behavior at 375px/768px are acceptable deviations:
- Layouts that now stack vertically instead of overflowing
- Touch targets enlarged to 44x44px minimum
- Images constrained to card width
- CompanySettingsStep modal respecting viewport width

### Verification Method

1. Dev server started with `VITE_MOCK=true npm run dev`
2. Screenshots captured via Playwright at 1x CSS pixel scale
3. Visual comparison performed between baseline and final screenshots
4. Pixel-level differences attributed to animated background (non-deterministic) and intentional component library improvements
