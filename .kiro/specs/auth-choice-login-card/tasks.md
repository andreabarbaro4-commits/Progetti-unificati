# Implementation Plan: Auth Choice + Login Card

## Overview

Add a Login/Sign up choice as the new first card (index 0) inside the existing `RegistrationCarousel`, plus a self-contained `LoginCard` that authenticates against a documented `POST /auth/login` contract. The build order is bottom-up: data/API types first, then the mock backing and the `establishSession` auth primitive, then the two new step components in isolation, and finally the `RegistrationCarousel` index-shift integration that wires everything together and renumbers the existing 7 steps to indices 1–7.

## Tasks

- [x] 1. Define login data model and API contract
  - [x] 1.1 Add `LoginSchema` to `src/features/onboarding/schemas.ts`
    - Add `LoginSchema` (email: required + valid format, password: required non-empty via `min(1)`) and exported `LoginData` type, following the existing schema pattern in this file (e.g. `AccountSchema`)
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 1.2 Write property test for LoginSchema email validation
    - **Property 1: Email field validation is exactly "non-empty and valid email format"**
    - **Validates: Requirements 3.2, 3.3**
    - Use `fast-check` with `fc.string()` for the negative space and a valid-email arbitrary for positive cases, asserting `LoginSchema.safeParse(...)` success/failure on the email field matches exactly

  - [ ]* 1.3 Write property test for LoginSchema password validation
    - **Property 2: Password field validation is exactly "non-empty"**
    - **Validates: Requirements 3.4**
    - Use `fast-check` with `fc.string()` for the password field, holding email to a syntactically valid arbitrary

  - [x] 1.4 Create `src/features/auth/api.ts`
    - Define `LoginRequest`, `LoginUserProfile`, `LoginSuccessResponse` interfaces
    - Implement `login(request: LoginRequest): Promise<LoginSuccessResponse>` calling `apiClient.post('/auth/login', request, { requireAuth: false })`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 1.5 Write unit test for `login()` request wiring
    - Spy on `apiClient.post` and assert it is called with path `/auth/login` and a `{ email, password }` body matching the input
    - _Requirements: 6.1_

- [x] 2. Add i18n keys for Auth_Choice_Step and Login_Card
  - [x] 2.1 Add `auth.*` keys to `src/locales/en.json` and `src/locales/it.json`
    - Add `auth.choice_title`, `auth.sign_up`, `auth.login`, `auth.login_title` (and any other `auth.*` key referenced by the components built in tasks 6–7) to both locale files
    - _Requirements: 8.3_

- [x] 3. Add Mock_Login_Handler and Mock_Credentials
  - [x] 3.1 Create `src/mock/fixtures/loginCredentials.ts`
    - Define `MockLoginCredential` interface (`email`, `password`, `profile: LoginUserProfile`)
    - Export `mockLoginCredentials` array seeded with at least 2 entries, one reusing the `mock-user-001` / `dev@flowlee.local` identity from `fixtures/user.ts`
    - _Requirements: 7.4_

  - [x] 3.2 Register `POST /auth/login` handler in `src/mock/setup.ts`
    - Add a `registerMockHandler('POST', '/auth/login', ...)` call that looks up `mockLoginCredentials` by exact `(email, password)` match
    - Return `{ accessToken, user: match.profile }` on match; `throw new Error('Invalid email or password')` otherwise, following the existing lookup-and-throw convention used by e.g. the `/clients/:id` `PUT` handler
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 3.3 Write property test for Mock_Login_Handler
    - **Property 5: Mock_Login_Handler accepts if and only if the credential pair is seeded**
    - **Validates: Requirements 7.2, 7.3**
    - Call the registered `/auth/login` handler (directly, or via `apiClient.post` with `enableMockApi()` active) with generated email/password pairs against a small fixed test fixture, asserting success iff the pair matches an entry

  - [ ]* 3.4 Write unit test verifying handler registration
    - Assert `registerMockHandler` is invoked for `POST` `/auth/login` when `src/mock/setup.ts` is imported
    - _Requirements: 7.1_

- [x] 4. Add establishSession to auth context
  - [x] 4.1 Add `establishSession` to `AuthContextValue` and `AuthProvider` in `src/features/auth/AuthProvider.tsx`
    - Add `establishSession(user: OidcUser, accessToken: string): void` to the `AuthContextValue` interface
    - Implement it as a `useCallback` calling the existing `setUser(newUser)` / `setAccessToken(newAccessToken)` setters, and include it in `contextValue`
    - _Requirements: 4.1_

  - [x] 4.2 Add matching no-op `establishSession` to `src/mock/MockAuthProvider.tsx`
    - Add `establishSession: () => {}` to the `mockAuthValue` literal to satisfy the extended `AuthContextValue` type
    - _Requirements: 4.1_

  - [ ]* 4.3 Write property test for establishSession
    - **Property 4: Establishing a session from a successful response makes that exact user authenticated**
    - **Validates: Requirements 4.1**
    - Render a small test harness component consuming `useAuth()` inside `AuthProvider`, call `establishSession` with generated `(accessToken, user)` pairs, and assert `isAuthenticated` becomes `true` and `user` matches exactly

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement AuthChoiceStep component
  - [x] 6.1 Create `src/features/onboarding/steps/AuthChoiceStep.tsx`
    - Accept `onSignUp: () => void` and `onLogin: () => void` props
    - Render `FlowleeLogo`, a bold title via `t('auth.choice_title')`, a solid "Sign up" button and an outlined "Log in" button (both sourcing label text via `t()`), and `<StepIndicator hasNext={true} />`, following the existing step visual shell (Req 8.1)
    - _Requirements: 1.2, 8.1, 8.3_

  - [ ]* 6.2 Write unit tests for AuthChoiceStep
    - Assert exactly two buttons are rendered (Req 1.2)
    - Assert clicking the Sign_Up button invokes `onSignUp`, and clicking the Login button invokes `onLogin`
    - _Requirements: 1.2_

- [x] 7. Implement LoginCard component
  - [x] 7.1 Create `src/features/onboarding/steps/LoginCard.tsx`
    - Take no props; use `useForm<LoginData>(createFormConfig(LoginSchema))`, `useAuth()` for `establishSession`, `useNavigate()`, and local `error` state
    - Render email/password fields (via a local `FieldGroup` helper, matching `AccountStep`'s convention) and a submit button disabled while `formState.isSubmitting` (Req 4.3)
    - On submit: clear `error` first (Req 5.3), call `login(data)`, then `establishSession(response.user, response.accessToken)` and `navigate('/dashboard')` on success (Req 4.1, 4.2), or set `error` from the caught error's message (or the fallback translation) on failure (Req 5.1, 5.2)
    - _Requirements: 3.1, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 8.2, 8.3_

  - [ ]* 7.2 Write property test for LoginCard submission
    - **Property 3: A valid submission sends exactly one Login_Request with the submitted values**
    - **Validates: Requirements 3.5**
    - Render `LoginCard`, mock the `login` export of `../../auth/api` with `vi.fn()`, fill the form with generated valid email/password pairs, submit, and assert the mock is called exactly once with matching values

  - [ ]* 7.3 Write unit tests for LoginCard
    - Assert an email input, password input, and submit button are rendered (Req 3.1)
    - Assert a successful `login()` resolution calls `navigate('/dashboard')` exactly once (Req 4.2)
    - Assert a rejected `login()` (no `.message`) shows the fallback error and never navigates (Req 5.2)
    - Assert resubmitting after a failure clears the previous error message before the new request starts (Req 5.3)
    - _Requirements: 3.1, 4.2, 5.1, 5.2, 5.3_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integrate Auth_Choice_Step and Login_Card into RegistrationCarousel
  - [x] 9.1 Add `authView` state and bump step-count constants in `src/features/onboarding/components/RegistrationCarousel.tsx`
    - Change `TOTAL_STEPS` from `7` to `8`
    - Change `CAROUSEL_CONFIG.welcomeStepIndex` from `4` to `5`
    - Add `const [authView, setAuthView] = useState<'choice' | 'login'>('choice')`
    - _Requirements: 1.1, 1.4_

  - [x] 9.2 Shift `advance()`'s index-dependent special cases in `RegistrationCarousel.tsx`
    - Change the "arriving at WelcomeStep" check from `activeIndex === 3` (setting index to `4`) to `activeIndex === 4` (setting index to `5`)
    - Change the "leaving WelcomeStep" collapse check from `activeIndex === 4 && expandState === 'expanded'` (setting index to `5`) to `activeIndex === 5 && expandState === 'expanded'` (setting index to `6`)
    - _Requirements: 2.1, 2.3_

  - [x] 9.3 Bump `getCardClassName` call-site indices and add the new index-0 card in `RegistrationCarousel.tsx`
    - Bump every existing step's `getCardClassName(n)` call-site argument by one: `PersonalInfoStep` 0→1, `AccountStep` 1→2, `SendingCodeStep` 2→3, `VerifyCodeStep` 3→4, `WelcomeStep` 4→5 (including the `isWelcomeExpanding ? ... : getCardClassName(4)` ternary), `RoleStep` 5→6, `PhotoUploadStep` 6→7
    - Import `AuthChoiceStep` and `LoginCard`, and add a new `<div className={getCardClassName(0)}>` rendering `AuthChoiceStep` (with `onSignUp={advance}`, `onLogin={() => setAuthView('login')}`) when `authView === 'choice'`, or `LoginCard` when `authView === 'login'`
    - _Requirements: 1.1, 1.3, 1.4, 2.1_

  - [ ]* 9.4 Update RegistrationCarousel unit tests for the index shift and new first card
    - Update existing tests asserting step positions to their new indices 1–7
    - Add tests: `AuthChoiceStep` renders at index 0 on mount (Req 1.1); clicking Sign_Up advances `activeIndex` to 1, rendering `PersonalInfoStep` (Req 1.3); clicking Login swaps to `LoginCard` at index 0 without changing `activeIndex` (Req 1.4)
    - Add a regression test confirming the existing 7 steps still render in order at indices 1–7 and `PhotoUploadStep` completion still triggers `onComplete` (Req 2.1, 2.2, 2.3)
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3_

  - [ ]* 9.5 Write unit test for i18n key coverage
    - Grep `AuthChoiceStep.tsx` and `LoginCard.tsx` source for `t('auth....')` calls and assert every referenced key exists in both `en.json` and `it.json`
    - _Requirements: 8.3_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `OnboardingWizard.tsx` and `useOnboardingStore.ts` are not touched by this feature — the login success path navigates directly and never sets `phase`
- Task 9's three `RegistrationCarousel.tsx` edits (9.1–9.3) must land in that order since each depends on the previous edit to the same file
- Property tests use `fast-check` (already a dev dependency), minimum 100 runs per property, each tagged with a comment referencing its design property number

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4", "2.1", "4.1", "9.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.5", "3.1", "4.2", "4.3", "6.1", "7.1", "9.2"] },
    { "id": 2, "tasks": ["3.2", "6.2", "7.2", "7.3", "9.3", "9.5"] },
    { "id": 3, "tasks": ["3.3", "3.4", "9.4"] }
  ]
}
```
