# Sizing Conversion Audit

## Summary
- Issues identified: 12 spacing pixel values across 6 files
- Issues resolved: 7 (converted to standard Tailwind scale classes)
- Items left unchanged: 5 (exceed 2px snap threshold)

## Changes

### src/components/ui/Card.tsx
- **What**: Converted base padding from arbitrary bracket to standard scale
- **Before**: `p-[30px]`
- **After**: `p-7` (28px, diff=2px, within threshold)

### src/features/onboarding/steps/PhotoUploadStep.tsx
- **What**: Converted spacing values to standard scale classes
- `p-[15px]` → `p-4` (16px, diff=1px)
- `mx-[5px]` → `mx-1` (4px, diff=1px)
- `mt-[25px]` → `mt-6` (24px, diff=1px)

### src/features/onboarding/components/RoleTagList.tsx
- **What**: Converted spacing values to standard scale classes
- `px-[15px]` → `px-4` (16px, diff=1px)
- `gap-[7px]` → `gap-2` (8px, diff=1px)

### src/features/onboarding/steps/JobStep.tsx
- **What**: Converted margin-top from arbitrary bracket to standard scale
- `mt-[160px]` → `mt-40` (160px, exact match)

### src/features/onboarding/steps/OrgTypeStep.tsx
- **What**: Converted margin-bottom from arbitrary bracket to standard scale
- `mb-[25px]` → `mb-6` (24px, diff=1px)

## Exceptions (spacing values exceeding 2px snap threshold)

- `ml-[60px]` in PhotoUploadStep.tsx: nearest scale step is 14 (56px, diff=4px) — exceeds threshold
- `gap-[60px]` in OrgTypeStep.tsx: nearest scale step is 14 (56px, diff=4px) — exceeds threshold
- `mt-[140px]` in RoleStep.tsx: nearest scale step is 36 (144px, diff=4px) — exceeds threshold
- `mt-[150px]` in WelcomeStep.tsx: nearest scale step is 36 (144px, diff=6px) — exceeds threshold

## CSS Exceptions (left unchanged)

The following spacing pixel values in CSS files were evaluated and left in place. They were previously assessed during the Tailwind utilization audit (task 10.3) and deliberately kept as CSS due to complex responsive media query overrides with `!important` that cannot be cleanly expressed as Tailwind responsive utilities:

- `App.css` — `.top-navigation` padding, margin-top, gap values: part of multi-breakpoint responsive navigation with `!important` overrides
- `RegistrationCarousel.css` — `.carousel-track` gap values (24px desktop, 12px mobile): tightly coupled with carousel animation transform logic and mask-image effects that remain in CSS
