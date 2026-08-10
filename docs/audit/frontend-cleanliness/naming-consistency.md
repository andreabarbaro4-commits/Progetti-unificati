# Naming Consistency Audit

## Summary
- Issues identified: 5 (file naming) + prop-ordering applied across all components
- Issues resolved: 5 (file naming) + prop-ordering conventions applied
- Items left unchanged: 0

## Naming Convention Rules

| Category | Rule | Example |
|----------|------|---------|
| Component files | PascalCase matching default/primary export | `AuthGuard.tsx` |
| Hook files | camelCase prefixed with `use` | `useOnboardingStore.ts` |
| Utility/library files | kebab-case | `api-client.ts` |
| Barrel/index files | Exempt from rules | `index.ts` |

## Changes

### 1. `src/features/auth/callback.tsx` → `AuthCallback.tsx`

- **Violation:** File exports `AuthCallback` component (default export) but used lowercase naming
- **Fix:** Renamed to PascalCase matching the exported component name
- **Test file renamed:** `callback.test.ts` → `AuthCallback.test.ts`
- **Imports updated:** `src/routes.tsx`
- **Verified:** `tsc -b` passes

### 2. `src/features/auth/auth-guard.tsx` → `AuthGuard.tsx`

- **Violation:** File exports `AuthGuard` React component but used kebab-case (utility convention)
- **Fix:** Renamed to PascalCase matching the exported component name
- **Imports updated:** `src/App.tsx`
- **Verified:** `tsc -b` passes

### 3. `src/features/auth/auth-provider.tsx` → `AuthProvider.tsx`

- **Violation:** File exports `AuthProvider` React component and `useAuth` hook but used kebab-case (utility convention)
- **Fix:** Renamed to PascalCase matching the primary component export
- **Imports updated:** `src/App.tsx`, `src/features/auth/AuthGuard.tsx`, `src/features/auth/SessionExpiredNotification.tsx`, `src/mock/MockAuthProvider.tsx`, `src/mock/fixtures/user.ts`
- **Verified:** `tsc -b` passes

### 4. `src/mock/mock-auth-provider.tsx` → `MockAuthProvider.tsx`

- **Violation:** File exports `MockAuthProvider` React component but used kebab-case (utility convention)
- **Fix:** Renamed to PascalCase matching the exported component name
- **Imports updated:** `src/App.tsx`
- **Verified:** `tsc -b` passes

### 5. `src/features/onboarding/store.ts` → `useOnboardingStore.ts`

- **Violation:** File's primary export is `useOnboardingStore` hook but filename was generic `store.ts`
- **Fix:** Renamed to camelCase with `use` prefix matching the hook naming convention
- **Imports updated:** `src/features/auth/AuthProvider.tsx`
- **Verified:** `tsc -b` passes

## Files Already Compliant

### `src/lib/` (utility files — kebab-case)
- `api-client.ts` ✓
- `form-utils.ts` ✓
- `i18n.ts` ✓ (single word)
- `query-client.ts` ✓
- `styles.ts` ✓ (single word)
- `tailwind-scale.ts` ✓
- `utils.ts` ✓ (single word)

### `src/components/ui/` (component files — PascalCase)
- `Badge.tsx` ✓
- `Button.tsx` ✓
- `Card.tsx` ✓
- `FormField.tsx` ✓
- `LocaleSwitcher.tsx` ✓
- `Toggle.tsx` ✓

### `src/components/` (component files — PascalCase)
- `ErrorBoundary.tsx` ✓
- `AnimatedBackground/AnimatedBackground.tsx` ✓

### `src/features/onboarding/steps/` (component files — PascalCase)
- `AccountStep.tsx` ✓
- `CompanySettingsStep.tsx` ✓
- `JobStep.tsx` ✓
- `OrgDetailsStep.tsx` ✓
- `OrgTypeStep.tsx` ✓
- `PersonalInfoStep.tsx` ✓
- `PhotoUploadStep.tsx` ✓
- `RoleStep.tsx` ✓
- `SendingCodeStep.tsx` ✓
- `VerifyCodeStep.tsx` ✓
- `WelcomeStep.tsx` ✓

### `src/features/onboarding/components/` (component files — PascalCase)
- `FlowleeLogo.tsx` ✓
- `RegistrationCarousel.tsx` ✓
- `RoleTagList.tsx` ✓
- `TopNavigation.tsx` ✓

### `src/features/auth/` (after fixes)
- `AuthCallback.tsx` ✓
- `AuthGuard.tsx` ✓
- `AuthProvider.tsx` ✓
- `SessionExpiredNotification.tsx` ✓

### `src/mock/` (mixed — component/utility)
- `MockIndicator.tsx` ✓ (component — PascalCase)
- `MockAuthProvider.tsx` ✓ (component — PascalCase, after fix)
- `mock-api-client.ts` ✓ (utility — kebab-case)
- `setup.ts` ✓ (utility — single word)
- `index.ts` ✓ (barrel — exempt)

### Root `src/` files
- `App.tsx` ✓ (component — PascalCase)
- `main.tsx` ✓ (entry point — single word)
- `routes.tsx` ✓ (utility — single word)
- `env.ts` ✓ (utility — single word)

## Exceptions

- `src/features/onboarding/schemas.ts` — Utility file with Zod schemas. Single-word name satisfies kebab-case.
- `src/mock/index.ts` — Barrel file, exempt from naming rules per Requirement 8.9.

---

## Prop Ordering Conventions Applied

### Convention

**TypeScript interface prop ordering:**
1. Identification props: `id`, `name`, `type`, `value`
2. Event handler props: `on*` (onClick, onChange, onSubmit, etc.)
3. Layout/style props: `style`, `hidden`, `aria-*`, dimension/spacing props
4. `className` last

**JSX attribute ordering:**
1. `key`
2. `ref`
3. `className`
4. Remaining props alphabetically
5. Event handlers (`on*`) last

### Files Modified for Prop Ordering

| File | Change |
|------|--------|
| `src/components/ui/LocaleSwitcher.tsx` | Button JSX: reordered to `key, className, aria-pressed, type, onClick` |
| `src/components/ui/Toggle.tsx` | Input JSX: moved `className` before `checked` and `type` |
| `src/components/ui/FormField.tsx` | Label JSX: moved `className` before `htmlFor`; Error span: moved `className` before `id` and `role` |
| `src/components/ErrorBoundary.tsx` | Button JSX: moved `className` before `onClick` |
| `src/features/auth/SessionExpiredNotification.tsx` | Outer div: moved `className` before `aria-live` and `role`; SVG: reordered to `className, aria-hidden, fill, viewBox, xmlns`; Path: reordered to alphabetical |
| `src/features/onboarding/components/FlowleeLogo.tsx` | Img JSX: reordered to `className, alt, src` |
| `src/features/onboarding/components/RoleTagList.tsx` | Input JSX: reordered to `className, placeholder, type` |
| `src/features/onboarding/components/RegistrationCarousel.tsx` | RoleStep/JobStep JSX: reordered handlers (onNext, onSelectRole) to alphabetical at end |
| `src/features/onboarding/steps/RoleStep.tsx` | Interface: reordered handlers alphabetically; Button: reordered to `className, disabled, variant, onClick` |
| `src/features/onboarding/steps/JobStep.tsx` | Interface: reordered handlers alphabetically; Button/Img: applied convention |
| `src/features/onboarding/steps/PersonalInfoStep.tsx` | All inputs: reordered to `className, aria-describedby, aria-invalid, id, placeholder, type`; Button: reordered to `className, type, variant` |
| `src/features/onboarding/steps/AccountStep.tsx` | All inputs: same pattern; Button: reordered |
| `src/features/onboarding/steps/SendingCodeStep.tsx` | Img/Button: applied convention |
| `src/features/onboarding/steps/VerifyCodeStep.tsx` | Input/Buttons: applied convention |
| `src/features/onboarding/steps/WelcomeStep.tsx` | Img/Button: applied convention |
| `src/features/onboarding/steps/PhotoUploadStep.tsx` | Buttons/Imgs: applied convention |
| `src/features/onboarding/steps/OrgTypeStep.tsx` | Img: applied convention |
| `src/features/onboarding/steps/OrgDetailsStep.tsx` | All inputs/select/textarea/Button: applied convention |
| `src/features/onboarding/steps/CompanySettingsStep.tsx` | Sidebar button/inputs/select/Button: applied convention |

### Exported Types/Interfaces Verified (all PascalCase)

- `ButtonProps`, `BadgeProps`, `CardProps`, `ToggleProps`, `LocaleSwitcherProps` (private), `FormFieldProps` (private)
- `AuthContextValue`, `OidcUser`, `AuthGuardProps` (private), `AuthProviderProps` (private)
- `PersonalInfoData`, `AccountData`, `OrgDetailsData`, `CompanySettingsData`
- `SpacingResult`, `TypographyResult`, `ApiError`, `SupportedLocale`
- All step prop interfaces (private): `PersonalInfoStepProps`, `AccountStepProps`, etc.

### Visual Neutrality

Prop reordering is purely cosmetic (affects source code readability only) and has zero effect on rendered output. Verified via `tsc -b` and `npm run build` — both pass cleanly.
