# Implementation Plan: Embedded Auth0 Signup

## Overview

Implements the embedded Auth0 signup flow within the onboarding carousel. The work is structured to build the service layer first, then extend state management, then modify the UI components from inner to outer.

## Tasks

- [x] 1. Create Auth0 signup service module
  - [x] 1.1 Create `src/features/auth/auth0-signup.ts` with `signupWithAuth0` function
    - Define `Auth0SignupRequest`, `Auth0SignupSuccess`, `Auth0SignupError` interfaces
    - Implement POST to `${VITE_AUTH_AUTHORITY}/dbconnections/signup`
    - Use `env.VITE_AUTH_CLIENT_ID` as `client_id` and `connection: "Username-Password-Authentication"`
    - Parse success (HTTP 200) and error (HTTP 400+) responses into typed objects
    - Handle network failures with `code: "network_error"`
    - In mock mode (`isMockMode()`), resolve immediately with fake success
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.4_

  - [x] 1.2 Create `src/features/auth/auth0-error-map.ts` with error code mapping
    - Map Auth0 error codes (`user_exists`, `password_strength_error`, `password_dictionary_error`, `password_no_user_info_error`, `invalid_password`, `invalid_signup`, `network_error`) to i18n keys
    - Export `mapAuth0Error(code: string, description?: string): string` function
    - For `password_strength_error`, append the Auth0 description detail
    - Return `auth.errors.generic` fallback for unknown codes
    - _Requirements: 3.1, 3.2, 3.3_

  - [x]* 1.3 Write unit tests for auth0-signup and auth0-error-map
    - Test `signupWithAuth0` success parsing
    - Test `signupWithAuth0` error parsing for each known error code
    - Test network failure handling
    - Test mock mode bypass
    - Test `mapAuth0Error` for all known codes and unknown fallback
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 2. Add `loginWithHint` to AuthProvider
  - [x] 2.1 Add `loginWithHint(email: string, returnTo?: string)` method to `AuthContextValue` interface and implementation in `src/features/auth/AuthProvider.tsx`
    - Call `mgr.signinRedirect({ state: returnTo, extraQueryParams: { audience, login_hint: email } })`
    - Include existing `VITE_AUTH_AUDIENCE` parameter alongside `login_hint`
    - Export through `useAuth()` hook
    - _Requirements: 4.1, 4.2_

  - [x]* 2.2 Write unit tests for loginWithHint
    - Verify `signinRedirect` is called with correct `login_hint` and `audience` params
    - Verify `state` is set to the provided `returnTo`
    - _Requirements: 4.1, 4.2_

- [x] 3. Extend onboarding store and add i18n translations
  - [x] 3.1 Add `signupEmail` field to `src/features/onboarding/useOnboardingStore.ts`
    - Add `signupEmail: string | null` to store interface
    - Add `setSignupEmail: (email: string | null) => void` action
    - Include in `reset()` method (set to null)
    - Persist in session storage with existing middleware
    - _Requirements: 4.4_

  - [x] 3.2 Add i18n translation keys for Auth0 error messages
    - Add entries under `auth.errors.*` namespace in the translation files
    - Keys: `email_already_registered`, `password_too_weak`, `password_contains_user_info`, `password_too_common`, `invalid_password`, `invalid_signup`, `network_error`, `generic`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Update AccountStep to call the signup service
  - [x] 4.1 Modify `src/features/onboarding/steps/AccountStep.tsx` to integrate Auth0 signup
    - Add `isSubmitting` state — disables submit button and shows loading indicator
    - On form submit: call `signupWithAuth0({ email, password })`
    - On success: call `setSignupEmail(email)` on the store, then call `onNext()`
    - On error: call `mapAuth0Error()` and display inline error message above submit button
    - Preserve form data on error so user can correct and retry
    - In mock mode: skip the auth0 call, just advance
    - _Requirements: 1.2, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 1.4_

  - [x]* 4.2 Write unit tests for AccountStep signup integration
    - Test loading state appears during submission
    - Test error message display for known error codes
    - Test form data preserved after error
    - Test mock mode bypasses the API call
    - _Requirements: 3.4, 3.5, 1.4_

- [x] 5. Checkpoint - Verify service layer and AccountStep
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update RegistrationCarousel to include AccountStep in signup flow
  - [x] 6.1 Modify `src/features/onboarding/components/RegistrationCarousel.tsx` to accept `includeAccountStep` prop
    - Add `includeAccountStep?: boolean` prop to `RegistrationCarouselProps`
    - When `true`, insert `AccountStep` as step index 0 (before WelcomeStep)
    - Adjust `TOTAL_STEPS` dynamically based on the prop
    - Pass `firstName` state and `advance` callback to AccountStep
    - Update step indices so WelcomeStep expand animation still works correctly at its new index
    - _Requirements: 1.1, 1.3_

  - [x]* 6.2 Write unit tests for RegistrationCarousel with includeAccountStep
    - Test that AccountStep renders when `includeAccountStep={true}`
    - Test that AccountStep does NOT render when prop is false/omitted
    - Test step count is correct in both modes
    - _Requirements: 1.1, 1.3_

- [x] 7. Update OnboardingWizard to wire the signup flow
  - [x] 7.1 Modify `src/features/onboarding/OnboardingWizard.tsx` to handle embedded signup
    - When unauthenticated and user clicks "Sign Up": set `showSignupCarousel = true` (local state) instead of calling `signup()`
    - Render `RegistrationCarousel` with `includeAccountStep={true}` when `showSignupCarousel` is true
    - On carousel completion (`onComplete`): read `signupEmail` from store, call `loginWithHint(signupEmail, '/onboarding')`
    - Preserve existing login button behavior (still calls `login()`)
    - _Requirements: 1.1, 4.1, 4.4, 5.1, 5.2_

  - [x]* 7.2 Write integration test for the full signup flow
    - Test: AuthChoiceStep "Sign Up" → AccountStep renders → submit → carousel advances → completes → `loginWithHint` called with correct email
    - Test: "Login" button still triggers `login()` redirect
    - _Requirements: 1.1, 4.1, 5.1_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The project uses vitest + @testing-library/react for testing
- Mock mode detection uses `isMockMode()` from `src/mock/index.ts`
- The existing `AuthCallback.tsx` does not need changes — it already handles all OIDC callbacks including those with `login_hint`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "3.1", "3.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["7.2"] }
  ]
}
```
