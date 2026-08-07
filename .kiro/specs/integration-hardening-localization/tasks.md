# Implementation Plan: Integration Hardening & Localization

## Overview

This plan implements five cross-cutting concerns for the Flowlee frontend: full i18n with locale-aware formatting, auth session lifecycle hardening (logout, expiry, single-redirect guard), form validation via react-hook-form + zod, a global error boundary, and CDK/CORS deployment coordination. Tasks are ordered by dependency: foundational utilities first, then consumers of those utilities, then integration and wiring.

## Tasks

- [x] 1. Install dependencies and set up testing infrastructure
  - [x] 1.1 Install runtime dependencies (`@hookform/resolvers`, `zod`, `react-hook-form`)
    - Run `npm install @hookform/resolvers zod react-hook-form`
    - Verify `package.json` contains all three packages
    - _Requirements: 7.1, 7.2_

  - [x] 1.2 Install dev dependency for property-based testing (`fast-check`)
    - Run `npm install --save-dev fast-check vitest @testing-library/react @testing-library/jest-dom jsdom`
    - Create `vitest.config.ts` at project root with jsdom environment
    - _Requirements: Testing infrastructure_

- [x] 2. Enhance i18n module with persistence and locale validation
  - [x] 2.1 Extend `src/lib/i18n.ts` with `getInitialLocale` and `persistLocale`
    - Add `STORAGE_KEY = 'flowlee-lang'` constant
    - Add `SUPPORTED_LOCALES = ['en', 'it'] as const` and `SupportedLocale` type
    - Implement `getInitialLocale()`: read from localStorage, validate, return 'en' if invalid/missing, remove invalid entries
    - Implement `persistLocale(locale)`: write to localStorage with silent catch
    - Wire `getInitialLocale()` into `i18n.init({ lng: getInitialLocale() })`
    - Export `SUPPORTED_LOCALES`, `SupportedLocale`, `persistLocale`, and `STORAGE_KEY` for use by other modules
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property tests for i18n locale persistence (Properties 1, 2, 4)
    - **Property 1: Language Persistence Round-Trip** — For any supported locale, persisting and reading back produces the same value
    - **Validates: Requirements 1.4, 2.1, 2.2**
    - **Property 2: Invalid Locale Rejection** — For any non-supported string in localStorage, initialization discards it and returns 'en'
    - **Validates: Requirements 1.5, 2.3**
    - **Property 4: localStorage Failure Does Not Crash** — If localStorage throws on write, the module still holds the selected locale without throwing
    - **Validates: Requirements 2.4**

- [x] 3. Create LocaleSwitcher component and useFormatters hook
  - [x] 3.1 Create `src/components/ui/LocaleSwitcher.tsx`
    - Render exactly two selectable options: English ("EN") and Italian ("IT")
    - On selection: call `i18n.changeLanguage(locale)` and `persistLocale(locale)`
    - Display current active language as selected state
    - Accept optional `className` prop for styling flexibility
    - _Requirements: 1.2, 1.6, 2.1_

  - [x] 3.2 Create `src/lib/useFormatters.ts` hook
    - Implement `useFormatters()` returning `{ formatDate, formatNumber, formatCurrency }`
    - `formatDate(date, options?)`: wraps `Intl.DateTimeFormat` with active locale and `dateStyle: 'short'` default
    - `formatNumber(value, options?)`: wraps `Intl.NumberFormat` with active locale
    - `formatCurrency(value, currency, options?)`: wraps `Intl.NumberFormat` with `style: 'currency'`
    - Subscribe to `i18n.on('languageChanged')` to re-render on locale change
    - Fallback to 'en' if browser Intl doesn't support the active locale
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.3 Write property tests for formatting (Properties 5, 6, 7)
    - **Property 5: Date Formatting Locale Consistency** — For any valid Date and supported locale, `formatDate` output matches `Intl.DateTimeFormat` with that locale and `dateStyle: 'short'`
    - **Validates: Requirements 3.1**
    - **Property 6: Number Formatting Decimal Separator** — For any number with fractional part, 'it' uses comma, 'en' uses period as decimal separator
    - **Validates: Requirements 3.2**
    - **Property 7: Currency Formatting Includes Currency Identifier** — For any number and valid ISO 4217 code, output contains the currency symbol or code
    - **Validates: Requirements 3.3**

  - [ ]* 3.4 Write property test for missing translation key fallback (Property 3)
    - **Property 3: Missing Translation Key Fallback** — For any key present in 'en' but missing in 'it', resolving with 'it' active returns the English value
    - **Validates: Requirements 1.3**

- [x] 4. Checkpoint - Verify i18n foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement auth session lifecycle enhancements
  - [x] 5.1 Enhance logout in `src/features/auth/auth-provider.tsx`
    - Change `logout()` to use `mgr.signoutRedirect({ post_logout_redirect_uri: window.location.origin })`
    - Add failure resilience: wrap in try/catch, on failure still clear tokens, clear `queryClient`, reset zustand stores, navigate to `/`
    - Clear in-memory tokens (`setUser(null)`, `setAccessToken(null)`) before redirect attempt
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Implement session expiry handling with single-redirect guard
    - Add `redirectInProgress` ref/module-level flag to prevent concurrent redirects
    - Implement `guardedRedirectToLogin(returnPath)`: checks flag, sets it, initiates single redirect
    - On refresh failure in `setRefreshHandler`: set `isExpired` state, capture current path + query string, after 3s timeout call `mgr.signinRedirect({ state: returnPath })`
    - Expose `isSessionExpired` boolean from context for notification component
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_

  - [x] 5.3 Create `src/features/auth/SessionExpiredNotification.tsx`
    - Render a fixed-position toast when `isSessionExpired` is true from auth context
    - Display translated message: "Your session has expired. Redirecting to login..."
    - Auto-dismiss is handled by the redirect (component unmounts on navigation)
    - Use i18n translation key for the message
    - _Requirements: 5.2, 5.3_

  - [x] 5.4 Enhance auth callback to restore return path from OIDC state
    - In `src/features/auth/callback.tsx`, verify `user.state` is used as return path
    - Default to `/dashboard` when state is empty/undefined
    - Ensure callback handles malformed state gracefully (fallback to `/dashboard`)
    - _Requirements: 5.5, 5.6_

  - [ ]* 5.5 Write property tests for auth session (Properties 8, 9)
    - **Property 8: Route Path Preservation on Session Expiry** — For any valid route path including query params, the OIDC state parameter contains the full original path
    - **Validates: Requirements 5.4, 5.5**
    - **Property 9: Single-Redirect Guard Under Concurrent 401s** — For N ≥ 2 simultaneous 401 responses, exactly one redirect is executed
    - **Validates: Requirements 5.7**

- [x] 6. Implement Global Error Boundary
  - [x] 6.1 Create `src/components/ErrorBoundary.tsx`
    - Implement as a React class component (required for `componentDidCatch`)
    - State: `{ hasError: boolean; error: Error | null }`
    - `static getDerivedStateFromError(error)`: set `hasError = true`
    - `componentDidCatch(error, info)`: log error and component stack to `console.error`
    - Fallback UI: centered full-height container with heading "Something went wrong", brief description, and reload button calling `window.location.reload()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 6.2 Wire ErrorBoundary into `src/App.tsx`
    - Place ErrorBoundary below BrowserRouter but above AppRoutes
    - Nesting order: AuthProvider → QueryClientProvider → BrowserRouter → ErrorBoundary → SessionExpiredNotification → AppRoutes
    - _Requirements: 8.1_

- [x] 7. Checkpoint - Verify auth and error boundary
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement form validation layer
  - [x] 8.1 Create `src/lib/form-utils.ts`
    - Implement `createFormConfig(schema, options?)` helper returning `UseFormProps` with `zodResolver`, `mode: 'onBlur'`, `reValidateMode: 'onChange'`
    - Implement `zodErrorMap`: maps zod issue codes to i18n translation keys (e.g., `ZodIssueCode.too_small` → `'validation.field_too_short'`)
    - Set the custom error map globally via `z.setErrorMap(zodErrorMap)`
    - Export `createFormConfig` and `zodErrorMap`
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

  - [x] 8.2 Create `src/components/ui/FormField.tsx`
    - Props: `name`, `label` (i18n key), `error?` (i18n key), `children` (input element)
    - Render label (translated via `useTranslation()`), children, conditional error message
    - Accessibility: `aria-invalid` on input wrapper, `aria-describedby` linking error to input
    - Error message appears/disappears based on `error` prop
    - _Requirements: 7.3, 7.4, 7.6_

  - [x] 8.3 Add validation translation keys to locale files
    - Add validation namespace keys to `src/locales/en.json` and `src/locales/it.json`
    - Keys: `validation.required`, `validation.email_invalid`, `validation.field_too_short`, `validation.field_too_long`, `validation.invalid_type`, etc.
    - _Requirements: 7.6_

  - [ ]* 8.4 Write property tests for form validation (Properties 10, 11)
    - **Property 10: Zod Schema Rejects Invalid Input and Accepts Valid Input** — For any input violating a schema, `safeParse` returns `{ success: false }` with errors; for valid input, returns `{ success: true }`
    - **Validates: Requirements 7.2, 7.3, 7.4**
    - **Property 11: Validation Error Messages Are Valid i18n Keys** — For any validation error from the zod error map, the message is a key that exists in both EN and IT translation files
    - **Validates: Requirements 7.6**

- [x] 9. Migrate onboarding forms to react-hook-form + zod
  - [x] 9.1 Create zod schemas for onboarding steps
    - Define schemas for: PersonalInfoStep, AccountStep, OrgDetailsStep, CompanySettingsStep
    - Each schema reflects existing validation rules from the step components
    - Export from `src/features/onboarding/schemas.ts`
    - _Requirements: 7.1, 7.2_

  - [x] 9.2 Refactor onboarding step components to use react-hook-form
    - Integrate `useForm` with `createFormConfig(schema)` in each form step
    - Replace manual state management with react-hook-form `register`/`control`
    - Use `FormField` component for consistent error display
    - Wire `handleSubmit` to existing `onNext` callbacks
    - Steps to migrate: PersonalInfoStep, AccountStep, OrgDetailsStep, CompanySettingsStep
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7_

- [x] 10. Checkpoint - Verify form validation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. CDK stack enhancement and deployment documentation
  - [x] 11.1 Add `FrontendDomain` output to CDK stack
    - In `infra/lib/frontend-stack.ts`, add new `CfnOutput` named `FrontendDomain`
    - Value: `props.domainName`
    - Description: 'Frontend domain for Auth0 redirect URI registration'
    - Export name: `flowlee-${props.stage}-frontend-domain`
    - _Requirements: 6.1_

  - [x] 11.2 Create CORS coordination checklist in deployment docs
    - Create or update `docs/deployment.md` with CORS configuration section
    - Document per-stage origin mapping: dev → `https://dev.flowlee.com`, test → `https://test.flowlee.com`, preprod → `https://preprod.flowlee.com`, prod → `https://app.flowlee.com`
    - Document required CORS headers: `Access-Control-Allow-Origin` (single stage origin), `Access-Control-Allow-Methods` (GET, POST, PUT, PATCH, DELETE, OPTIONS), `Access-Control-Allow-Headers` (Content-Type, Authorization), `Access-Control-Max-Age` (3600)
    - Note: actual CORS enforcement is a backend API Gateway concern
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 11.3 Create Auth0 redirect URI registration documentation
    - Add section to `docs/deployment.md` documenting redirect URIs per stage
    - Login redirect URI format: `https://{stage_domain}/auth/callback`
    - Post-logout redirect URI format: `https://{stage_domain}`
    - List all four stages with their exact URIs
    - Include checklist for new stage deployment
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 12. Final integration and wiring
  - [x] 12.1 Wire LocaleSwitcher into application layout
    - Add `LocaleSwitcher` to the application's navigation/header area
    - Ensure it's accessible from all authenticated pages
    - _Requirements: 1.2, 1.6_

  - [x] 12.2 Wire SessionExpiredNotification into App.tsx provider tree
    - Place below ErrorBoundary and above AppRoutes per design nesting order
    - Verify it reads `isSessionExpired` from auth context
    - _Requirements: 5.2, 5.3_

  - [x] 12.3 Add session expiry and error boundary translation keys
    - Add keys for session expired message to `src/locales/en.json` and `src/locales/it.json`
    - Add keys for error boundary fallback UI text
    - _Requirements: 1.1, 5.2, 8.3_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (11 properties total)
- Unit tests validate specific examples and edge cases
- The existing `src/features/auth/callback.tsx` already handles OIDC state restoration (task 5.4 is a verification/enhancement pass)
- CORS configuration is a backend concern — frontend tasks only cover documentation and CDK output
- react-hook-form is NOT in package.json yet but IS listed in the design dependencies to install

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.1", "6.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "6.2", "8.1"] },
    { "id": 5, "tasks": ["5.5", "8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
