# Requirements Document

## Introduction

This document specifies the frontend requirements for the email verification code feature. After signing up via Auth0, the user receives a 6-digit verification code via email. The frontend must provide UI steps for sending the code and entering it for verification, integrated into the existing registration carousel. Auth0's default verification email template is disabled; a custom backend handles code generation, sending, and validation.

## Glossary

- **Verification_Code_Service**: The frontend API client module (`src/features/auth/verification-code.ts`) responsible for communicating with the backend verification endpoints.
- **SendingCodeStep**: The carousel step component that triggers the send-code API call and informs the user a code is being sent.
- **VerifyCodeStep**: The carousel step component where the user enters the 6-digit code and submits it for verification.
- **RegistrationCarousel**: The horizontal carousel component that orchestrates the multi-step registration flow.
- **Onboarding_Store**: The zustand store (`useOnboardingStore`) that persists onboarding state across the registration flow.
- **Mock_Mode**: A development mode (enabled via `VITE_MOCK=true`) where API calls are bypassed with deterministic fake responses.
- **Resend_Cooldown**: A 30-second frontend-enforced timer between consecutive resend requests.

## Requirements

### Requirement 1: Verification Code API Service

**User Story:** As a frontend developer, I want a typed API client for the verification code endpoints, so that the UI components can send and verify codes through a consistent interface.

#### Acceptance Criteria

1. THE Verification_Code_Service SHALL export a `sendVerificationCode` function that accepts an email string and returns a promise resolving to `{ message: string }`.
2. WHEN `sendVerificationCode` is called, THE Verification_Code_Service SHALL send a POST request to `/api/auth/verification-code/send` with the email in the JSON body.
3. THE Verification_Code_Service SHALL always resolve `sendVerificationCode` successfully regardless of backend response status, to prevent email enumeration.
4. WHEN a network error occurs during `sendVerificationCode`, THE Verification_Code_Service SHALL resolve with a success response and log a warning to the console.
5. THE Verification_Code_Service SHALL export a `verifyCode` function that accepts an email and a code string, and returns a promise resolving to `{ verified: true }` on success.
6. WHEN `verifyCode` receives a 400 response, THE Verification_Code_Service SHALL throw a typed error object with an `error` field set to one of: `invalid_code`, `expired_code`, or `max_attempts`.
7. WHEN a network error occurs during `verifyCode`, THE Verification_Code_Service SHALL throw an error object with `error` set to `unknown_error`.
8. THE Verification_Code_Service SHALL derive its base URL from the `VITE_API_BASE_URL` environment variable.

### Requirement 2: Mock Mode Support

**User Story:** As a developer, I want the verification code flow to work without a backend in mock mode, so that I can develop and test the UI independently.

#### Acceptance Criteria

1. WHILE Mock_Mode is enabled, THE Verification_Code_Service SHALL resolve `sendVerificationCode` immediately without making an HTTP request.
2. WHILE Mock_Mode is enabled, WHEN `verifyCode` is called with code `"123456"`, THE Verification_Code_Service SHALL resolve with `{ verified: true }`.
3. WHILE Mock_Mode is enabled, WHEN `verifyCode` is called with any code other than `"123456"`, THE Verification_Code_Service SHALL throw an error with `error: "invalid_code"`.

### Requirement 3: SendingCodeStep Behavior

**User Story:** As a user, I want to see a confirmation that a verification code is being sent to my email, so that I know to check my inbox.

#### Acceptance Criteria

1. WHEN SendingCodeStep mounts, THE SendingCodeStep SHALL call `sendVerificationCode` with the user's signup email from the Onboarding_Store.
2. WHEN SendingCodeStep is displayed, THE SendingCodeStep SHALL show the user's email address in the UI.
3. THE SendingCodeStep SHALL display for a minimum of 1.5 seconds before auto-advancing, to prevent a jarring flash-through experience.
4. WHEN both the API call completes and the minimum display time elapses, THE SendingCodeStep SHALL automatically advance to VerifyCodeStep without user interaction.
5. IF `sendVerificationCode` fails, THEN THE SendingCodeStep SHALL still auto-advance to VerifyCodeStep, allowing the user to resend from there.
6. THE SendingCodeStep SHALL NOT display a manual "Next" button; advancement is automatic.
7. WHEN the send API call is in progress, THE SendingCodeStep SHALL display a loading indicator.

### Requirement 4: VerifyCodeStep Behavior

**User Story:** As a user, I want to enter the verification code I received via email, so that I can complete email verification and continue registration.

#### Acceptance Criteria

1. WHEN VerifyCodeStep is displayed, THE VerifyCodeStep SHALL show the user's email address from the Onboarding_Store.
2. THE VerifyCodeStep SHALL validate that the code input contains exactly 6 numeric digits before enabling submission.
3. WHEN the user submits a valid code, THE VerifyCodeStep SHALL call `verifyCode` with the email and code.
4. WHEN `verifyCode` resolves successfully, THE VerifyCodeStep SHALL advance the carousel to the next step.
5. WHEN `verifyCode` throws `invalid_code`, THE VerifyCodeStep SHALL display an inline error message using i18n key `verification.errors.invalid_code`.
6. WHEN `verifyCode` throws `expired_code`, THE VerifyCodeStep SHALL display an inline error message using i18n key `verification.errors.expired_code`.
7. WHEN `verifyCode` throws `max_attempts`, THE VerifyCodeStep SHALL disable the code input and confirm button, and display an error message using i18n key `verification.errors.max_attempts`.
8. WHEN `verifyCode` throws `unknown_error`, THE VerifyCodeStep SHALL display an inline error message using i18n key `verification.errors.network_error` and allow retry.
9. WHILE a verify request is in progress, THE VerifyCodeStep SHALL disable both the confirm and resend buttons and show a loading indicator on the confirm button.

### Requirement 5: Resend Code with Cooldown

**User Story:** As a user, I want to request a new verification code if I didn't receive the first one, so that I can complete verification without restarting the flow.

#### Acceptance Criteria

1. WHEN the user clicks the resend button, THE VerifyCodeStep SHALL call `sendVerificationCode` with the user's email.
2. WHEN a resend is triggered, THE VerifyCodeStep SHALL start a 30-second Resend_Cooldown timer.
3. WHILE the Resend_Cooldown timer is active, THE VerifyCodeStep SHALL disable the resend button and display the remaining seconds as a countdown.
4. WHEN the Resend_Cooldown timer expires, THE VerifyCodeStep SHALL re-enable the resend button.
5. WHEN VerifyCodeStep mounts, THE VerifyCodeStep SHALL initialize the resend button in an enabled state (no initial cooldown).

### Requirement 6: RegistrationCarousel Integration

**User Story:** As a user, I want the verification steps to appear seamlessly in the registration flow after account creation, so that the experience feels continuous.

#### Acceptance Criteria

1. WHEN `includeAccountStep` is true, THE RegistrationCarousel SHALL render steps in the order: AccountStep, SendingCodeStep, VerifyCodeStep, WelcomeStep, PersonalInfoStep, RoleStep, PhotoUploadStep.
2. WHEN `includeAccountStep` is true, THE RegistrationCarousel SHALL calculate `totalSteps` as 7.
3. THE RegistrationCarousel SHALL set `welcomeStepIndex` to 3 when `includeAccountStep` is true.
4. THE RegistrationCarousel SHALL pass the `signupEmail` from the Onboarding_Store as the `email` prop to both SendingCodeStep and VerifyCodeStep.
5. THE RegistrationCarousel SHALL correctly compute `personalInfoIndex`, `roleIndex`, and `photoIndex` relative to the new `welcomeStepIndex`.

### Requirement 7: Onboarding Store Extension

**User Story:** As a developer, I want to track whether email verification is complete in the onboarding store, so that the carousel can handle edge cases like browser refresh.

#### Acceptance Criteria

1. THE Onboarding_Store SHALL include an `emailVerified` boolean field, defaulting to `false`.
2. THE Onboarding_Store SHALL expose a `setEmailVerified` action to update the `emailVerified` field.
3. WHEN the user successfully verifies their email, THE VerifyCodeStep SHALL call `setEmailVerified(true)` on the Onboarding_Store.
4. WHEN `reset()` is called on the Onboarding_Store, THE Onboarding_Store SHALL reset `emailVerified` to `false`.

### Requirement 8: Internationalization

**User Story:** As a user in any supported locale, I want error messages and UI labels to appear in my language, so that I can understand the verification flow regardless of language.

#### Acceptance Criteria

1. THE VerifyCodeStep SHALL use i18n translation keys for all user-visible text, including: `insert_code`, `code`, `resend_code`, `confirm`.
2. THE VerifyCodeStep SHALL use specific i18n keys for error messages: `verification.errors.invalid_code`, `verification.errors.expired_code`, `verification.errors.max_attempts`, `verification.errors.network_error`.
3. THE SendingCodeStep SHALL use i18n translation key `sending_code` for its heading text.

### Requirement 9: Accessibility

**User Story:** As a user relying on assistive technology, I want the verification code input to be properly labeled and error states to be announced, so that I can complete verification independently.

#### Acceptance Criteria

1. THE VerifyCodeStep SHALL associate the code input with a visible label element using matching `htmlFor`/`id` attributes.
2. WHEN a verification error occurs, THE VerifyCodeStep SHALL associate the error message with the input using `aria-describedby`.
3. WHEN a verification error occurs, THE VerifyCodeStep SHALL set `aria-invalid="true"` on the code input.
4. THE VerifyCodeStep SHALL use `aria-live="polite"` on the error message container so screen readers announce errors.
5. WHILE the Resend_Cooldown timer is active, THE VerifyCodeStep SHALL provide an `aria-label` on the resend button indicating the remaining wait time.
