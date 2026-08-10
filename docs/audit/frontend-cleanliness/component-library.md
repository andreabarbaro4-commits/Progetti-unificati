# Component Library Audit

## Summary
- Primitives inventoried: 7
- Extraction candidates (2+ locations): 5
- Already shared (in `src/components/ui/`): 6 (Button, FormField, LocaleSwitcher, Card, Badge, Toggle)
- New components created: 3 (Card, Badge/Tag, Toggle)
- Migrations completed: see Migration Status below

## Inventory

### 1. Button

**Description:** Pill-shaped or rounded action button used for primary actions (submit, proceed, navigate).

**Shared component:** `src/components/ui/Button.tsx` — uses `cn()`, manual variant map (`dark` | `light`).

| # | File | Class / Pattern | Notes |
|---|------|-----------------|-------|
| 1 | `src/features/onboarding/steps/PersonalInfoStep.tsx` | `.de` (ad-hoc `<button>`) | Full-width, black bg, white text, rounded-lg |
| 2 | `src/features/onboarding/steps/AccountStep.tsx` | `.de` (ad-hoc `<button>`) | Same as above |
| 3 | `src/features/onboarding/steps/SendingCodeStep.tsx` | `.de` (ad-hoc `<button>`) | Same as above |
| 4 | `src/features/onboarding/steps/VerifyCodeStep.tsx` | `.era` (ad-hoc `<button>`) | Same styling as `.de` with `margin-top: 10px` |
| 5 | `src/features/onboarding/steps/VerifyCodeStep.tsx` | `.WE` (ad-hoc `<button>`) | Transparent bg, 2px black border, outline style |
| 6 | `src/features/onboarding/steps/RoleStep.tsx` | `.procedi-btn` (ad-hoc `<button>`) | Black bg, white text, large top margin |
| 7 | `src/features/onboarding/steps/JobStep.tsx` | `.tr` (ad-hoc `<button>`) | Proceed button variant with large top margin |
| 8 | `src/features/onboarding/steps/WelcomeStep.tsx` | `.wr` (ad-hoc `<button>`) | Black bg forced via `!important` |
| 9 | `src/features/onboarding/steps/PhotoUploadStep.tsx` | `.qa` / `.qa.btn-bianco` (ad-hoc) | Full-width, black bg; gray variant when no photo |
| 10 | `src/features/onboarding/steps/OrgTypeStep.tsx` | `<Button variant="dark/light">` | ✅ Uses shared component |
| 11 | `src/features/onboarding/steps/OrgDetailsStep.tsx` | Inline Tailwind `<button>` | `rounded-xl bg-black px-8 py-3 text-sm font-medium text-white` |
| 12 | `src/features/onboarding/steps/CompanySettingsStep.tsx` | Inline style `<button>` (submit) | `backgroundColor: '#000', color: '#fff', borderRadius: '10px'` |
| 13 | `src/features/onboarding/steps/CompanySettingsStep.tsx` | Inline style `<button>` (sidebar ×5) | Sidebar navigation buttons with active/inactive states |
| 14 | `src/components/ErrorBoundary.tsx` | Inline Tailwind `<button>` | `bg-indigo-600 px-4 py-2 rounded-md text-white` — different design context |

**Instances total:** 14 (across 11 files)
**Ad-hoc instances (extraction candidates):** 12 (all except OrgTypeStep which already uses `<Button>`, and ErrorBoundary which is a distinct error-page context)
**Extraction candidate:** ✅ YES — appears in 10+ locations

**Distinct visual variants identified:**
- `primary` — full-width, black bg, white text, rounded-lg (`.de`, `.era`, `.procedi-btn`, `.tr`, `.wr`, `.qa`)
- `secondary` / `outline` — transparent bg, black border (`.WE`)
- `ghost` / `disabled` — gray bg (`.qa.btn-bianco`)
- `sidebar` — smaller, left-aligned, with active/inactive state (CompanySettingsStep)

---

### 2. Card (`.Step` pattern)

**Description:** Centered container with rounded corners, box-shadow, white background, and flex-column layout. Used as the main content wrapper for each onboarding step.

**CSS definition:** `src/App.css` — `.Step` class
- `max-width: 448px`, `box-shadow: 0px 4px 40px rgba(0,0,0,0.1)`, `border-radius: 24px`, `padding: 30px`, `background: #fff`, `display: flex`, `flex-direction: column`, `align-items: center`

| # | File | Usage |
|---|------|-------|
| 1 | `src/features/onboarding/steps/PersonalInfoStep.tsx` | `<div className="Step">` |
| 2 | `src/features/onboarding/steps/AccountStep.tsx` | `<div className="Step">` |
| 3 | `src/features/onboarding/steps/SendingCodeStep.tsx` | `<div className="Step">` |
| 4 | `src/features/onboarding/steps/VerifyCodeStep.tsx` | `<div className="Step">` |
| 5 | `src/features/onboarding/steps/WelcomeStep.tsx` | `<div className="Step">` |
| 6 | `src/features/onboarding/steps/RoleStep.tsx` | `<div className="Step step-header-layout">` |
| 7 | `src/features/onboarding/steps/JobStep.tsx` | `<div className="Step step-header-layout">` |
| 8 | `src/features/onboarding/steps/PhotoUploadStep.tsx` | `<div className="Step step-header-layout">` |
| 9 | `src/features/onboarding/steps/OrgTypeStep.tsx` | `<div className="Step step-header-layout step10-layout">` |
| 10 | `src/features/onboarding/steps/OrgDetailsStep.tsx` | `<div className="Step step-header-layout step10-layout">` |

**Instances total:** 10
**Extraction candidate:** ✅ YES — appears in 10 locations

**Distinct variants identified:**
- `default` — base `.Step` (centered, narrow)
- `header` — `.Step.step-header-layout` (with top navigation area)
- `wide` — `.Step.step-header-layout.step10-layout` (wider two-column layout)

---

### 3. Badge/Tag (`.ruolo-tag` pattern)

**Description:** Pill-shaped selectable tag with border, transparent background by default, and filled active state (indigo).

**CSS definition:** `src/App.css` — `.ruolo-tag` / `.ruolo-tag.active`
- `border: 1px solid black`, `padding: 6px 12px`, `border-radius: 20px`, `cursor: pointer`
- Active: `background-color: #4f46e5`, `color: white`, `border-color: #4f46e5`

| # | File | Usage |
|---|------|-------|
| 1 | `src/features/onboarding/components/RoleTagList.tsx` | `className="ruolo-tag"` / `"ruolo-tag active"` |
| 2 | `src/features/onboarding/steps/PhotoUploadStep.tsx` | `className="step"` (similar pill-shaped tag buttons) |

**Instances total:** 2 components (rendered as lists of 7+ tags each)
**Extraction candidate:** ✅ YES — appears in 2 locations with identical visual pattern

**Distinct variants identified:**
- `default` — border only, transparent bg
- `active` — filled indigo bg, white text

---

### 4. Toggle (`.switch` / `.slider` pattern)

**Description:** A CSS-only toggle switch using a hidden checkbox input with an absolute-positioned slider knob.

**CSS definition:** `src/App.css` — `.switch`, `.slider`, `.slider:before`, `input:checked+.slider`
- Width: 44px, height: 24px, border-radius: 24px, black track color

| # | File | Usage |
|---|------|-------|
| 1 | `src/App.css` (defined) | CSS-only toggle — no TSX usage found in current components |

**Instances total:** 1 CSS definition, 0 current TSX usages (likely used in a previously removed component or reserved for CompanySettingsStep expansion)
**Extraction candidate:** ⚠️ CONDITIONAL — only 1 definition found; extract if CompanySettingsStep or other components adopt it during later tasks

**Note:** The design doc mentions extracting this from CompanySettingsStep, but the current CompanySettingsStep implementation does not use `.switch`/`.slider`. The CSS is defined but not actively rendered by any component. It may be dead CSS left from a prior iteration.

---

### 5. Form Field / Input (`.input-group` pattern via `FormField` component)

**Description:** Consistent form wrapper rendering a label, input element, and optional error message.

**Shared component:** `src/components/ui/FormField.tsx` — renders `.input-group` class with `data-invalid` and `aria-invalid` attributes.

**CSS definition:** `src/App.css` — `.input-group`, `.input-group label`, `.input-group input`
- Input: `padding: 14px`, `border: 1px solid #ccc`, `border-radius: 8px`, `font-size: 16px`
- Label: positioned statically, text-align left

| # | File | Usage |
|---|------|-------|
| 1 | `src/features/onboarding/steps/PersonalInfoStep.tsx` | `<FormField>` ×4 fields |
| 2 | `src/features/onboarding/steps/AccountStep.tsx` | `<FormField>` ×3 fields |
| 3 | `src/features/onboarding/steps/OrgDetailsStep.tsx` | `<FormField>` ×3 fields |
| 4 | `src/features/onboarding/steps/CompanySettingsStep.tsx` | `<FormField>` ×3 fields |
| 5 | `src/features/onboarding/steps/VerifyCodeStep.tsx` | `<div className="input-group">` (ad-hoc, not using FormField) |

**Instances total:** 5 files (4 using shared component, 1 ad-hoc)
**Already shared:** ✅ `FormField` component exists and is used in 4 of 5 locations
**Ad-hoc instance:** VerifyCodeStep uses `.input-group` directly without importing `FormField`
**Extraction candidate:** ✅ YES — the ad-hoc instance in VerifyCodeStep should be migrated to use `<FormField>`

---

### 6. Modal / Overlay

**Description:** Full-screen fixed overlay with dark background and centered white content panel.

**Pattern:** Inline styles in `CompanySettingsStep.tsx`
- Outer: `position: fixed`, `top: 0`, `left: 0`, `width: 100vw`, `height: 100vh`, `backgroundColor: '#000'`, `display: flex`, `alignItems: center`, `justifyContent: center`
- Inner: `backgroundColor: '#fff'`, `padding: '40px'`, `borderRadius: '24px'`, `width: '850px'`, `boxShadow: '0 20px 50px rgba(0,0,0,0.5)'`

| # | File | Usage |
|---|------|-------|
| 1 | `src/features/onboarding/steps/CompanySettingsStep.tsx` | Full modal with sidebar, form, logo upload |

**Instances total:** 1
**Extraction candidate:** ❌ NO — only 1 instance; does not meet the 2+ locations threshold

---

### 7. Dropdown / Select

**Description:** Native `<select>` elements with consistent form styling.

| # | File | Usage |
|---|------|-------|
| 1 | `src/features/onboarding/steps/PersonalInfoStep.tsx` | Gender select (no explicit styling, inherits `.input-group input` CSS) |
| 2 | `src/features/onboarding/steps/OrgDetailsStep.tsx` | Team size select (Tailwind: `fieldClasses`) |
| 3 | `src/features/onboarding/steps/CompanySettingsStep.tsx` | Team size select (inline styles) |

**Instances total:** 3
**Extraction candidate:** ⚠️ MARGINAL — all 3 use native `<select>` with inconsistent styling (CSS class, Tailwind, inline styles). The styling normalization will happen via FormField + Tailwind utilization tasks rather than a dedicated Select component. No custom dropdown behavior exists.

---

## Extraction Candidates Summary

| Primitive | Instances | In 2+ locations? | Action |
|-----------|-----------|-------------------|--------|
| **Button** | 14 (12 ad-hoc) | ✅ Yes (10+ files) | Refactor `Button.tsx` with cva variants; migrate all ad-hoc buttons |
| **Card** | 10 | ✅ Yes (10 files) | Create `Card.tsx` extracting `.Step` pattern |
| **Badge/Tag** | 2 components | ✅ Yes (2 files) | Create `Badge.tsx` extracting `.ruolo-tag` pattern |
| **Toggle** | 1 (CSS only) | ❌ No (0 TSX usages) | Defer — extract only if future tasks introduce usage |
| **FormField** | 5 (1 ad-hoc) | ✅ Yes (already shared) | Migrate VerifyCodeStep ad-hoc usage to `<FormField>` |
| **Modal** | 1 | ❌ No | Leave in place — single instance |
| **Dropdown/Select** | 3 | ⚠️ Marginal | Normalize via FormField/Tailwind; no dedicated component needed |

## Exceptions

- **ErrorBoundary button** (`src/components/ErrorBoundary.tsx`): Uses a distinct error-page design (indigo bg) unrelated to the onboarding flow. Will not be migrated to the shared `Button` component as it serves a different UI context.
- **Modal** (`CompanySettingsStep.tsx`): Only 1 instance; does not justify a shared Modal component per Requirement 3.1.
- **Toggle** (`.switch`/`.slider` in App.css): CSS is defined but not referenced by any TSX component. Likely dead CSS from a prior iteration. Will be evaluated during dead code / Tailwind utilization phases.
- **Dropdown/Select**: Native `<select>` elements with no custom behavior; styling normalization will be handled by FormField + Tailwind conversion rather than a dedicated component.

---

## Migration Status (Task 8.7)

### Button Migrations

| # | File | Original Pattern | Migrated To | Status |
|---|------|-----------------|-------------|--------|
| 1 | `PersonalInfoStep.tsx` | `.de` button | `<Button variant="primary" className="w-full rounded-lg">` | ✅ Migrated |
| 2 | `AccountStep.tsx` | `.de` button | `<Button variant="primary" className="w-full rounded-lg">` | ✅ Migrated |
| 3 | `SendingCodeStep.tsx` | `.de` button | `<Button variant="primary" className="w-full rounded-lg">` | ✅ Migrated |
| 4 | `VerifyCodeStep.tsx` | `.era` button | `<Button variant="primary" className="w-full rounded-lg mt-2.5">` | ✅ Migrated |
| 5 | `VerifyCodeStep.tsx` | `.WE` button | `<Button variant="secondary" className="rounded-lg">` | ✅ Migrated |
| 6 | `RoleStep.tsx` | `.procedi-btn` button | `<Button variant="primary" className="w-full rounded-lg mt-[140px] text-xl">` | ✅ Migrated |
| 7 | `JobStep.tsx` | `.tr` button | `<Button variant="primary" className="w-full rounded-lg mt-[160px] text-xl">` | ✅ Migrated |
| 8 | `WelcomeStep.tsx` | `.wr` button | `<Button variant="primary" className="rounded-lg">` | ✅ Migrated |
| 9 | `PhotoUploadStep.tsx` | `.qa` button | `<Button variant="primary" className="w-full rounded-lg">` | ✅ Migrated |
| 10 | `PhotoUploadStep.tsx` | `.qa.btn-bianco` button | `<Button variant="ghost" className="w-full rounded-lg">` | ✅ Migrated |
| 11 | `OrgDetailsStep.tsx` | Inline Tailwind button | `<Button variant="primary" className="rounded-xl px-8 py-3 text-sm whitespace-nowrap">` | ✅ Migrated |
| 12 | `CompanySettingsStep.tsx` | Inline style submit button | `<Button variant="primary" size="sm" className="rounded-[10px]">` | ✅ Migrated |

**Total migrated:** 12/12 ad-hoc instances

**Intentionally excluded:**
- CompanySettingsStep sidebar buttons (5): Navigation context, already consolidated in task 6.2 into a .map() pattern. Different UI purpose (navigation, not action).
- ErrorBoundary button: Different design context (indigo-600 bg), unrelated to onboarding flow.

### Card Migrations (`.Step` → `<Card>`)

| # | File | Original Pattern | Migrated To | Status |
|---|------|-----------------|-------------|--------|
| 1 | `PersonalInfoStep.tsx` | `<div className="Step">` | `<Card>` | ✅ Migrated |
| 2 | `AccountStep.tsx` | `<div className="Step">` | `<Card>` | ✅ Migrated |
| 3 | `SendingCodeStep.tsx` | `<div className="Step">` | `<Card>` | ✅ Migrated |
| 4 | `VerifyCodeStep.tsx` | `<div className="Step">` | `<Card>` | ✅ Migrated |
| 5 | `WelcomeStep.tsx` | `<div className="Step">` | `<Card>` | ✅ Migrated |
| 6 | `RoleStep.tsx` | `<div className="Step step-header-layout">` | `<Card variant="header">` | ✅ Migrated |
| 7 | `JobStep.tsx` | `<div className="Step step-header-layout">` | `<Card variant="header">` | ✅ Migrated |
| 8 | `PhotoUploadStep.tsx` | `<div className="Step step-header-layout">` | `<Card variant="header">` | ✅ Migrated |
| 9 | `OrgTypeStep.tsx` | `<div className="Step step-header-layout step10-layout">` | `<Card variant="wide">` | ✅ Migrated |
| 10 | `OrgDetailsStep.tsx` | `<div className="Step step-header-layout step10-layout">` | `<Card variant="wide">` | ✅ Migrated |

**Total migrated:** 10/10 instances

### Badge Migrations (`.ruolo-tag` → `<Badge>`)

| # | File | Original Pattern | Migrated To | Status |
|---|------|-----------------|-------------|--------|
| 1 | `RoleTagList.tsx` | `className="ruolo-tag"` / `"ruolo-tag active"` | `<Badge variant="default">` / `<Badge variant="active">` | ✅ Migrated |

**Total migrated:** 1/1 component (renders 7 tags per instance)

**Note:** `PhotoUploadStep.tsx` has pill-shaped tags with `className="step"` but these serve a different visual pattern (display-only, no active state, different styling). Left in place as they don't match the `.ruolo-tag` design.

### Toggle

- **0 current TSX usages found.** No migration needed.
- The Toggle component (`src/components/ui/Toggle.tsx`) is available for future use.

---

## Overall Migration Totals

| Component | Ad-hoc instances found | Migrated | Excluded (with justification) |
|-----------|----------------------|----------|-------------------------------|
| Button | 12 | 12 | 2 (sidebar nav + ErrorBoundary) |
| Card | 10 | 10 | 0 |
| Badge | 1 component | 1 | 1 (PhotoUploadStep `.step` tags — different pattern) |
| Toggle | 0 | 0 | 0 |
| **Total** | **23** | **23** | **3** |
