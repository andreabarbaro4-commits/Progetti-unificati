# Implementation Plan: Email Verification Code

## Overview

Implement the email verification code flow in the frontend registration carousel. This involves creating an API client service, wiring up existing UI components with real logic, extending the onboarding store, and updating the carousel step order. All work is TypeScript/React within the existing Vite + Tailwind project.

## Tasks

- [x] 1. Create Verification Code API service
  - [x] 1.1 Create `src/features/auth/verification-code.ts` with typed interfaces and functions
    - Export `SendCodeRequest`, `SendCodeResponse`, `VerifyCodeRequest`, `VerifyCodeSuccessResponse`, `VerifyCodeErrorResponse` types
    - Implement `sendVerificationCode`: POST to `/api/auth/verification-code/send`, always resolves (swallows errors), logs warning on failure
    - Implement `verifyCode`: POST to `/api/auth/verification-code/verify`, resolves on 200, throws typed error on 400, throws `unknown_error` on network failure
    - Add mock mode support: `sendVerificationCode` resolves immediately; `verifyCode` accepts `"123456"`, rejects others with `invalid_code`
    - Follow the same pattern as `src/features/auth/auth0-signup.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3_

  - [ ]* 1.2 Write unit tests for verification-code service
    - Test `sendVerificationCode` resolves on 200, 400, 500 responses
    - Test `sendVerificationCode` resolves on network failure (logs warning)
    - Test `verifyCode` resolves with `{ verified: true }` on 200
    - Test `verifyCode` throws typed errors (`invalid_code`, `expired_code`, `max_attempts`) on 400
    - Test `verifyCode` throws `unknown_error` on network failure
    - Test mock mode: `sendVerificationCode` resolves without fetch
    - Test mock mode: `verifyCode` accepts "123456", rejects others
    - **Property 1: sendVerificationCode never throws**
    - **Property 2: verifyCode maps backend errors to typed error codes**
    - **Property 3: Mock mode rejects all non-magic codes**
    - **Validates: Requirements 1.3, 1.4, 1.6, 2.3**
    - _Requirements: 1.1–1.8, 2.1–2.3_

- [x] 2. Extend Onboarding Store
  - [x] 2.1 Add `emailVerified` field and `setEmailVerified` action to `useOnboardingStore`
    - Add `emailVerified: boolean` field, default `false`
    - Add `setEmailVerified: (v: boolean) => void` action
    - Update `reset()` to also reset `emailVerified` to `false`
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 3. Update SendingCodeStep component
  - [x] 3.1 Wire `SendingCodeStep` with real send logic and auto-advance
    - Add `email` prop to the component interface
    - Call `sendVerificationCode(email)` on mount via `useEffect`
    - Run API call in parallel with a 1.5s minimum display timer (`Promise.all`)
    - Auto-advance by calling `onNext()` when both complete
    - Remove the manual "Next" button
    - Show loading animation during the API call
    - Display the user's email address in the UI
    - On send failure: still auto-advance (user can resend from VerifyCodeStep)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 3.2 Write unit tests for SendingCodeStep
    - Test API is called on mount with correct email
    - Test auto-advance after 1.5s minimum display
    - Test auto-advance even when API fails
    - Test email is displayed in the UI
    - Test no "Next" button is rendered
    - _Requirements: 3.1–3.7_

- [x] 4. Update VerifyCodeStep component
  - [x] 4.1 Wire `VerifyCodeStep` with form validation, verify logic, and error handling
    - Add `email` prop to the component interface
    - Display the `email` prop instead of the hardcoded address
    - Use `react-hook-form` for the code input with validation: exactly 6 numeric digits
    - Wire "Confirm" button to call `verifyCode(email, code)`
    - On success: call `setEmailVerified(true)` on store, then call `onNext()`
    - Display inline error messages using i18n keys based on error type
    - On `max_attempts`: disable code input and confirm button
    - Loading state: disable buttons and show spinner on confirm during request
    - Add accessibility attributes: `aria-describedby`, `aria-invalid`, `aria-live="polite"` on error container
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 7.3, 9.1, 9.2, 9.3, 9.4_

  - [x] 4.2 Implement resend with cooldown in VerifyCodeStep
    - Wire "Resend" button to call `sendVerificationCode(email)`
    - Start 30-second countdown timer on resend
    - Disable resend button and show remaining seconds during cooldown
    - Re-enable button when timer expires
    - No initial cooldown on mount
    - Add `aria-label` to resend button during cooldown indicating wait time
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.5_

  - [ ]* 4.3 Write unit tests for VerifyCodeStep
    - Test email prop is displayed
    - Test form rejects non-6-digit inputs
    - Test form accepts valid 6-digit codes
    - Test successful verification advances carousel
    - Test error messages display for each error type
    - Test max_attempts disables input
    - Test loading state disables buttons
    - Test resend triggers API call and starts cooldown
    - Test cooldown countdown and button re-enable
    - Test accessibility attributes (aria-describedby, aria-invalid, aria-live)
    - **Property 4: Code input validation accepts only 6-digit strings**
    - **Validates: Requirements 4.2**
    - _Requirements: 4.1–4.9, 5.1–5.5, 9.1–9.5_

- [x] 5. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update RegistrationCarousel integration
  - [x] 6.1 Insert SendingCodeStep and VerifyCodeStep into the carousel
    - Import `SendingCodeStep` and `VerifyCodeStep` components
    - Import `useOnboardingStore` to read `signupEmail`
    - Update `totalSteps` from 5 to 7 (when `includeAccountStep=true`)
    - Update `welcomeStepIndex` from 1 to 3
    - Insert `SendingCodeStep` at index 1 and `VerifyCodeStep` at index 2
    - Pass `signupEmail` as `email` prop to both new steps
    - Recalculate `personalInfoIndex`, `roleIndex`, `photoIndex` relative to new `welcomeStepIndex`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 6.2 Write unit tests for updated RegistrationCarousel
    - Test step count is 7 when `includeAccountStep=true`
    - Test step order renders correctly
    - Test `signupEmail` prop is passed to SendingCodeStep and VerifyCodeStep
    - Test index calculations are correct
    - _Requirements: 6.1–6.5_

- [x] 7. Add i18n translation keys
  - [x] 7.1 Add verification error translation keys to i18n resource files
    - Add keys: `verification.errors.invalid_code`, `verification.errors.expired_code`, `verification.errors.max_attempts`, `verification.errors.network_error`
    - Verify existing keys are present: `insert_code`, `code`, `resend_code`, `confirm`, `sending_code`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The backend is a separate repo — this plan covers frontend-only work
- Existing components (SendingCodeStep, VerifyCodeStep) already exist but are static; tasks modify them in-place
- Mock mode (VITE_MOCK=true) allows full flow testing without backend

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "7.1"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2"] },
    { "id": 4, "tasks": ["4.3", "6.1"] },
    { "id": 5, "tasks": ["6.2"] }
  ]
}
```
