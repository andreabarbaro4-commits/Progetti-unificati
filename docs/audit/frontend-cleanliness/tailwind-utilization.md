# Tailwind Utilization Audit

## Summary
- Inline style instances found: 17 (across 5 component files)
- Inline styles converted: 17 ✅ (task 10.2 complete)
- Raw CSS declarations (Tailwind-expressible): ~200+ migrated from `App.css` (reduced from ~2000 lines to ~130 lines)
- Repeated class patterns (≥3 tokens in ≥3 files): 1 pattern identified
- CSS files with only keyframes/custom properties (out-of-scope): 1 (`AnimatedBackground.css`)

## Conversion Status

| Task | Status |
|------|--------|
| 10.1 Audit inline styles and raw CSS | ✅ Complete |
| 10.2 Convert inline styles to Tailwind | ✅ Complete |
| 10.3 Migrate raw CSS to Tailwind | ✅ Complete |
| 10.4 Extract repeated patterns | ✅ Complete |

---

## 1. Inline Style Findings

### `src/features/onboarding/steps/CompanySettingsStep.tsx`

**Highest density of inline styles in the codebase (12 inline style objects).**

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| Outer container `<div>` | `position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'` | `fixed inset-0 w-screen h-screen bg-black flex items-center justify-center overflow-hidden` |
| Modal container `<div>` | `position: 'relative', zIndex: 1, backgroundColor: '#fff', padding: '40px', borderRadius: '24px', width: '850px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'` | `relative z-1 bg-white p-10 rounded-3xl w-[850px] flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]` |
| `<h2>` heading | `fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0` | `text-xl font-bold text-black m-0` |
| Grid container | `display: 'grid', gridTemplateColumns: '220px 180px 1fr', gap: '40px'` | `grid grid-cols-[220px_180px_1fr] gap-10` |
| Sidebar flex | `display: 'flex', flexDirection: 'column', gap: '8px'` | `flex flex-col gap-2` |
| Sidebar buttons | `backgroundColor (conditional), color (conditional), border, padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer'` | `p-3 rounded-[10px] text-left text-[13px] cursor-pointer` + conditional `bg-black text-white border-none` or `bg-transparent border border-gray-200` |
| Logo label `<span>` | `fontSize: '12px', fontWeight: '600', color: '#000'` | `text-xs font-semibold text-black` |
| Logo box `<div>` | `width: '180px', height: '180px', border: '1px solid #e5e5e5', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa'` | `w-[180px] h-[180px] border border-gray-200 rounded-3xl flex items-center justify-center bg-neutral-50` |
| Logo placeholder text | `fontSize: '14px', fontWeight: 'bold', color: '#ccc'` | `text-sm font-bold text-gray-300` |
| Form container | `display: 'flex', flexDirection: 'column', gap: '16px'` | `flex flex-col gap-4` |
| Input fields | `width: '100%', padding: '12px', borderRadius: '10px'` | `w-full p-3 rounded-[10px]` |
| Team size row | `display: 'flex', gap: '10px', alignItems: 'flex-end'` | `flex gap-2.5 items-end` |
| Select element | `width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', boxSizing: 'border-box'` | `w-full h-[46px] px-3 rounded-[10px] box-border` |
| Price badge | `width: '120px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5', borderRadius: '10px', backgroundColor: '#f9f9f9', fontSize: '13px', boxSizing: 'border-box'` | `w-[120px] h-[46px] flex items-center justify-center border border-gray-200 rounded-[10px] bg-neutral-50 text-[13px] box-border` |
| Submit row | `display: 'flex', justifyContent: 'flex-end'` | `flex justify-end` |
| Button style | `padding: '10px 20px'` | `px-5 py-2.5` |

---

### `src/features/onboarding/steps/OrgDetailsStep.tsx`

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| `.step10-content` div | `display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center'` | `flex gap-10 items-center justify-center` |
| `.step10-right` div | `flex: '1', maxWidth: '300px'` | `flex-1 max-w-[300px]` |
| `.step10-left` div | `flex: '1', maxWidth: '400px'` | `flex-1 max-w-[400px]` |

---

### `src/features/onboarding/steps/VerifyCodeStep.tsx`

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| `<p>` element | `marginBottom: '20px', color: '#666', fontSize: '14px'` | `mb-5 text-gray-500 text-sm` |

---

### `src/features/onboarding/components/FlowleeLogo.tsx`

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| `<img>` element | `height: '20px', width: 'auto'` | `h-5 w-auto` |

---

### `src/features/onboarding/components/TopNavigation.tsx`

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| `.arrows-container` div | `cursor: 'pointer'` (conditional) | `cursor-pointer` (via cn()) |

---

### `src/components/AnimatedBackground/AnimatedBackground.tsx`

**9 inline style objects (1 container + 8 blob divs).**

Most properties are Tailwind-expressible in isolation, **however** many use complex composite values:
- `borderRadius` with asymmetric multi-value syntax (e.g. `'45% 55% 60% 40% / 50% 45% 55% 50%'`)
- `background` with `radial-gradient()` including rgba colors
- `filter: blur()` with specific px values
- `animation` referencing keyframes with timing functions and delays

| Property Category | Tailwind-expressible? | Notes |
|---|---|---|
| `position: 'fixed'/'absolute'` | ✅ | `fixed`, `absolute` |
| `inset: 0` | ✅ | `inset-0` |
| `width`/`height` (%, vw/vh, rem) | ✅ | `w-screen h-screen`, `w-[80%]`, `w-28` etc. |
| `top`/`bottom`/`left`/`right` | ✅ | `top-0`, `bottom-[5%]`, `left-[15%]` etc. |
| `zIndex: -1` | ✅ | `-z-1` |
| `pointerEvents: 'none'` | ✅ | `pointer-events-none` |
| `overflow: 'hidden'` | ✅ | `overflow-hidden` |
| `visibility` (conditional) | ✅ | `visible`/`invisible` |
| `willChange: 'transform'` | ✅ | `will-change-transform` |
| `borderRadius` (asymmetric) | ❌ | Non-standard multi-value; requires arbitrary `rounded-[...]` but syntax is complex — better kept as inline |
| `background: radial-gradient(...)` | ⚠️ | Possible via `bg-[radial-gradient(...)]` but very long; readability suffers |
| `filter: blur(Npx)` | ✅ | `blur-[55px]` etc. |
| `animation` | ⚠️ | `animate-[name_10s_ease-in-out_infinite]` — possible but complex with delays |

**Recommendation:** The AnimatedBackground blobs use composite CSS values (radial-gradient, asymmetric border-radius, keyframe animations with delays) that are technically expressible as Tailwind arbitrary values but would significantly harm readability. The inline styles serve as self-documenting visual parameters for decorative animated elements. **Leave inline styles in place** for this component.

---

### `src/features/onboarding/components/RegistrationCarousel.tsx`

| Element | Inline Properties | Tailwind Equivalent |
|---------|------------------|---------------------|
| `.carousel-track` div | `transform: translateX(${translateX}px)` | N/A — dynamic value from state, must remain inline |

**Exception:** This is a dynamic transform driven by component state and cannot be expressed as a static Tailwind class. Leave as inline style.

---

## 2. Raw CSS Findings (`src/App.css`)

`App.css` is ~2000 lines containing extensive legacy CSS. The majority of its declarations are Tailwind-expressible. Key characteristics:

### Tailwind-Expressible Property Categories Found

| Category | Example Declarations | Count (approx) | Tailwind Equivalent Examples |
|----------|---------------------|----------------|------------------------------|
| **Layout (flex/grid)** | `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content` | 80+ | `flex`, `flex-col`, `items-center`, `justify-center` |
| **Spacing (margin/padding)** | `margin-left: 168px`, `padding: 30px`, `gap: 15px`, `margin-bottom: 20px` | 100+ | `ml-[168px]`, `p-7.5`, `gap-4`, `mb-5` |
| **Sizing** | `width: 400px`, `height: 350px`, `max-width: 448px`, `min-height: 600px` | 50+ | `w-[400px]`, `h-[350px]`, `max-w-[448px]`, `min-h-[600px]` |
| **Typography** | `font-size: 32px`, `font-weight: 700`, `line-height: 1.2`, `text-align: left` | 40+ | `text-[32px]`, `font-bold`, `leading-tight`, `text-left` |
| **Colors** | `background-color: #000`, `color: #666`, `color: white`, `background-color: #f1f1f9` | 60+ | `bg-black`, `text-gray-500`, `text-white`, `bg-[#f1f1f9]` |
| **Borders/Radius** | `border-radius: 24px`, `border: 1px solid #e5e5e5`, `border-radius: 50px` | 30+ | `rounded-3xl`, `border border-gray-200`, `rounded-full` |
| **Positioning** | `position: absolute`, `top: 15px`, `z-index: 9999` | 20+ | `absolute`, `top-4`, `z-[9999]` |
| **Box-shadow** | `box-shadow: 0px 4px 40px rgba(0,0,0,0.1)` | 5+ | `shadow-[0px_4px_40px_rgba(0,0,0,0.1)]` |
| **Cursor/Transition** | `cursor: pointer`, `transition: all 0.3s` | 15+ | `cursor-pointer`, `transition-all duration-300` |

### Issues with App.css

1. **Massive duplication**: Many selectors are defined multiple times with conflicting values (e.g., `.toggle-row` appears 6+ times, `.slider` 4+ times, `.modelli-wrapper` 3+ times). Only the last declaration wins.
2. **Single-letter class names**: `.ax`, `.er`, `.bv`, `.gf`, `.zr`, `.kk`, `.gg` etc. — unclear semantics.
3. **Excessive `!important`**: ~100+ uses of `!important`, overriding each other in a specificity war.
4. **Redundant media queries**: The same `@media (max-width: 768px)` block is repeated 15+ times with overlapping/conflicting declarations.

### Declarations NOT expressible as Tailwind (leave in CSS)

| Declaration | Reason |
|-------------|--------|
| `@keyframes` in AnimatedBackground.css | Keyframe animations — not utility-expressible |
| `.carousel-track { transition: transform 400ms ease }` | Could use `transition-transform duration-[400ms] ease-in-out` but is part of carousel animation logic |
| Complex `:has()` selectors (e.g., `.Step:has(input[type='email'])`) | Structural selectors with compound logic |
| `input:checked + .slider:before` pseudo-element chains | Complex pseudo-element state logic |
| `-webkit-mask-image` / `mask-image` (RegistrationCarousel.css) | Gradient masks — no standard utility |

---

## 3. Repeated Class Patterns (≥3 tokens in ≥3 files)

### Pattern: `flex min-h-screen items-center justify-center`

**4 tokens, found in 4+ files:**

| File | Usage |
|------|-------|
| `src/App.tsx` | Suspense fallback (×2) |
| `src/features/auth/callback.tsx` | Loading and error states (×2) |
| `src/components/ErrorBoundary.tsx` | Error fallback |
| `src/features/dashboard/Dashboard.tsx` | Page wrapper |
| `src/features/not-found/NotFound.tsx` | Page wrapper (with additional `flex-col px-4`) |

**Recommendation:** Extract as a named constant (e.g., `const centeredPageLayout = 'flex min-h-screen items-center justify-center'`) or a simple layout wrapper component.

### Extraction Applied (Task 10.4)

Created `src/lib/styles.ts` with:
```typescript
export const centeredPageLayout = 'flex min-h-screen items-center justify-center';
```

**Files updated:**

| File | Before | After |
|------|--------|-------|
| `src/App.tsx` (×2) | `className="flex min-h-screen items-center justify-center"` | `className={centeredPageLayout}` |
| `src/features/auth/callback.tsx` (×2) | `className="flex min-h-screen items-center justify-center"` | `className={centeredPageLayout}` |
| `src/components/ErrorBoundary.tsx` | `className="flex min-h-screen items-center justify-center bg-gray-50 px-4"` | `className={cn(centeredPageLayout, 'bg-gray-50 px-4')}` |
| `src/features/dashboard/Dashboard.tsx` | `className="flex min-h-screen items-center justify-center"` | `className={centeredPageLayout}` |
| `src/features/not-found/NotFound.tsx` | `className="flex min-h-screen flex-col items-center justify-center px-4"` | `className={cn(centeredPageLayout, 'flex-col px-4')}` |

---

## 4. CSS Files Status

| File | Status | Action |
|------|--------|--------|
| `src/App.css` (~2000 lines) | Contains ~200+ Tailwind-expressible declarations + duplicate selectors + media queries | Migrate declarations to Tailwind classes on consuming components; delete migrated selectors |
| `src/components/AnimatedBackground/AnimatedBackground.css` | Keyframe animations only | **Leave unchanged** — out-of-scope per Req 5.7 |
| `src/features/onboarding/components/RegistrationCarousel.css` | Mix of layout + carousel animation + masks | Partially migratable; carousel-specific animation/mask logic stays |

---

## Exceptions

- **AnimatedBackground inline styles**: Complex composite values (asymmetric border-radius, radial-gradient backgrounds, animation with delays) — technically expressible as Tailwind arbitrary values but severely harms readability. Left in place.
- **RegistrationCarousel dynamic transform**: `translateX(${translateX}px)` — driven by component state, cannot be a static class. Left as inline.
- **AnimatedBackground.css keyframes**: CSS keyframe animations have no Tailwind utility equivalent. Left unchanged.
- **RegistrationCarousel.css mask-image**: Gradient mask declarations have no standard Tailwind utility. Left unchanged.

---

## Raw CSS Migration Details (Task 10.3)

### Overview

`App.css` was reduced from **~2000 lines** (138KB compiled CSS output) to **~130 lines** (28KB compiled CSS output) — an **80% reduction** in compiled CSS size.

### Classes Migrated to Tailwind

The following CSS classes were converted to inline Tailwind utilities on their consuming components:

| CSS Class | File(s) Consuming | Tailwind Equivalent |
|-----------|------------------|---------------------|
| `.section-title` | All step components (9 files) | `font-['Nunito',sans-serif] font-bold text-[32px] leading-normal` |
| `.logo` (wrapper div) | PersonalInfoStep, SendingCodeStep, VerifyCodeStep, AccountStep | `font-bold text-[#7a3a8a] mb-5 text-xl` or `ml-2.5` |
| `.Step-inner-container` | AccountStep | `flex flex-col grow w-full` |
| `.input-group` + children | VerifyCodeStep | `relative flex flex-col mb-5 bg-transparent` + label/input classes |
| `.search-container` | RoleTagList | `flex items-center bg-[#f0f0f0] px-[15px] py-2.5 rounded-lg my-2.5 border border-[#e0e0e0]` |
| `.search-icon` | RoleTagList | `mr-2.5 text-[#888]` |
| `.search-input` | RoleTagList | `bg-transparent border-none outline-none w-full text-black` |
| `.ruoli-container` | RoleTagList | `flex flex-wrap justify-between gap-[7px] my-2.5 max-w-[300px] -ml-20` |
| `.step10-content` | OrgTypeStep, OrgDetailsStep | `flex items-center justify-between gap-[60px] h-full` |
| `.step10-left` | OrgTypeStep, OrgDetailsStep | `flex-1` / `flex-1 max-w-[400px]` |
| `.step10-right` | OrgTypeStep, OrgDetailsStep | `flex-1 flex justify-center` |
| `.step10-subtitle` | OrgTypeStep | `text-gray-500 text-[15px] mb-[25px]` |
| `.step10-buttons` | OrgTypeStep | `flex gap-3` |
| `.step10-image` | OrgTypeStep | `w-[300px] h-auto object-contain` |
| `.we` | PhotoUploadStep | `w-full flex flex-col items-center justify-center gap-px p-[15px]` |
| `.profile-circle` | PhotoUploadStep | `w-[120px] h-[120px] rounded-full bg-[#f0f0f0] ...` |
| `.profile-img` | PhotoUploadStep | `w-full h-full object-cover rounded-full` |
| `.nome` | PhotoUploadStep | `ml-[60px] mt-2.5 text-center mb-0 flex gap-0` |
| `.VE` | PhotoUploadStep | `text-red-500` |
| `.button-container` | PhotoUploadStep | `flex flex-wrap justify-center gap-2.5 w-full` |
| `.step` (tag styling) | PhotoUploadStep | `py-0.5 mx-[5px] border border-[#999] rounded-[5px] bg-transparent cursor-pointer whitespace-nowrap` |
| `.avatar-decorativo` | PhotoUploadStep, JobStep | `absolute bottom-[100px] right-5 w-[120px] h-auto pointer-events-none z-10` |
| `.rt` | PhotoUploadStep | `w-[400px] -ml-2.5 p-2.5 mt-[25px] box-border` |
| `.hey` | WelcomeStep | `flex justify-center items-center mt-[150px]` |
| `.avatar` | SendingCodeStep | `flex w-[400px] h-[350px] object-contain mb-2.5` |
| `.arrows-container` | TopNavigation | `flex flex-row items-center justify-start gap-2 w-auto` |
| `.top-icon` | TopNavigation | `text-xl text-[#666] cursor-pointer` |

### Classes Removed (replaced by shared components in earlier tasks)

- `.Step`, `.Step >*`, `.Step h1`, `.Step p`, `.Step.wide-mode` — replaced by `<Card>` component
- `.de`, `.era`, `.procedi-btn`, `.tr`, `.wr`, `.qa`, `.WE` — replaced by `<Button>` component
- `.ruolo-tag`, `.ruolo-tag.active` — replaced by `<Badge>` component
- `.switch`, `.slider`, `input:checked+.slider` — replaced by `<Toggle>` component
- `.form-error` — replaced by `<FormField>` component
- Single-letter classes (`.ax`, `.bv`, `.er`, `.gf`, `.jj`, etc.) — dead code

### CSS Left in App.css (not expressible as Tailwind)

| Selector | Reason |
|----------|--------|
| Global resets (`*`, `body`, `#root`, `.App`) | Page-level structure |
| `button` hover/active transitions | Global button behaviour |
| `.top-navigation` + responsive overrides | 10+ conflicting `@media` blocks with `!important` |
| `.nav-left`, `.nav-center`, `.right-icons` | Part of TopNavigation responsive system |

### CSS Files Status (Final)

| File | Lines Before | Lines After | Action |
|------|-------------|-------------|--------|
| `src/App.css` | ~2000 | ~130 | Reduced to global resets + TopNavigation CSS |
| `AnimatedBackground.css` | 116 | 116 | Unchanged — keyframes only |
| `RegistrationCarousel.css` | 110 | 73 | Removed dead selectors |

### Build Results

- **CSS output before:** 138.24 KB → **After:** 28.21 KB (80% reduction)
- `tsc -b`: ✅ zero errors
- `npm run build`: ✅ passes
- `vitest --run`: ✅ 15/15 tests pass

---

## Inline Style Conversion Details (Task 10.2)

All 17 inline style objects across 5 files were converted to Tailwind utility classes:

### Files Converted

| File | Inline Styles | Status |
|------|--------------|--------|
| `src/features/onboarding/steps/CompanySettingsStep.tsx` | 12 → 0 | ✅ Converted |
| `src/features/onboarding/steps/OrgDetailsStep.tsx` | 3 → 0 | ✅ Converted |
| `src/features/onboarding/steps/VerifyCodeStep.tsx` | 1 → 0 | ✅ Converted |
| `src/features/onboarding/components/FlowleeLogo.tsx` | 1 → 0 | ✅ Converted |
| `src/features/onboarding/components/TopNavigation.tsx` | 1 → 0 | ✅ Converted (via `cn()`) |

### Arbitrary Values Used (no standard utility equivalent)

| File | Element | Arbitrary Value | Reason |
|------|---------|-----------------|--------|
| CompanySettingsStep.tsx | Modal container | `shadow-[0_20px_50px_rgba(0,0,0,0.5)]` | Custom box-shadow with specific offset/blur/color |
| CompanySettingsStep.tsx | Modal container | `w-[850px]` | Non-standard width |
| CompanySettingsStep.tsx | Grid | `grid-cols-[220px_180px_1fr]` | Custom column template |
| CompanySettingsStep.tsx | Sidebar buttons | `rounded-[10px]` | 10px border-radius (between `rounded-lg` 8px and `rounded-xl` 12px) |
| CompanySettingsStep.tsx | Logo box | `w-[180px] h-[180px]` | Non-standard dimensions |
| CompanySettingsStep.tsx | Input fields | `rounded-[10px]` | Same as sidebar buttons |
| CompanySettingsStep.tsx | Select | `h-[46px]` | Non-standard height |
| CompanySettingsStep.tsx | Price badge | `w-[120px] h-[46px] rounded-[10px]` | Non-standard dimensions |
| CompanySettingsStep.tsx | Sidebar buttons | `text-[13px]` | Non-standard font size |
| CompanySettingsStep.tsx | Price badge | `text-[13px]` | Non-standard font size |
| OrgDetailsStep.tsx | Right div | `max-w-[300px]` | Non-standard max-width |
| OrgDetailsStep.tsx | Left div | `max-w-[400px]` | Non-standard max-width |
