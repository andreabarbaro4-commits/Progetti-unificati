# Requirements Document

## Introduction

This feature adds a new first card to the onboarding flow that lets a visitor choose between **Login** and **Sign up** before entering the existing registration process. Choosing **Sign up** continues into the current flow unchanged (the existing 7-step `Registration_Carousel`, then organization setup, then the dashboard). Choosing **Login** shows a simple email/password card; submitting valid credentials ends with the user on the dashboard.

Scope decisions made during clarification:
- The Login_Card performs a real credential check. The frontend defines and calls a documented `POST /auth/login` API contract. Building the production backend behind that contract is **out of scope** for this feature.
- While `VITE_MOCK` is active, a mock handler for `POST /auth/login` is added to this repository's existing mock layer (`registerMockHandler` / `src/mock/setup.ts`), backed by a small set of seeded mock credentials, so the Login_Card is fully exercisable in local/demo builds.
- The new choice card is a new first step **inside** `Registration_Carousel` (not a new `Onboarding_Wizard` phase). Choosing Sign up advances into `Personal_Info_Step` exactly as the flow behaves today; `Registration_Carousel`'s remaining 7 steps are otherwise unchanged.
- Back-navigation is out of scope: consistent with the existing carousel, which has no back button on any step today.

## Glossary

- **Onboarding_Wizard**: The top-level onboarding flow component (`OnboardingWizard`) that renders `Registration_Carousel` during the `registration` phase, then hands off to organization setup, then navigates to the Dashboard.
- **Registration_Carousel**: The existing horizontal single-page carousel (`RegistrationCarousel`) that renders the registration steps in sequence and advances via each step's `onNext` callback.
- **Auth_Choice_Step**: The new first step rendered by Registration_Carousel, presenting the Login and Sign_Up options.
- **Login_Card**: The card shown when the user selects Login on the Auth_Choice_Step, containing an email field and a password field and a submit action.
- **Personal_Info_Step**: The existing first step of the registration steps (`PersonalInfoStep`), now reached after Auth_Choice_Step when the user selects Sign_Up.
- **Sign_Up**: The choice on Auth_Choice_Step that continues into the existing registration flow starting at Personal_Info_Step.
- **Login_Request**: The `POST /auth/login` request the Login_Card sends, containing an email and a password.
- **Login_Contract**: The documented request/response shape of `POST /auth/login`: request body `{ email, password }`; success response contains an access token and a user profile; failure response returns a 401 status with an error message.
- **Mock_Login_Handler**: The mock handler registered for `POST /auth/login` via `registerMockHandler`, active only while `isMockMode()` is true, validating credentials against Mock_Credentials.
- **Mock_Credentials**: A seeded set of email/password pairs, added to the mock fixtures, that Mock_Login_Handler treats as valid for successful login.
- **Dashboard**: The existing authenticated route at `/dashboard`, guarded by `AuthGuard`.
- **Auth_Session**: The authenticated state (as observed by `AuthGuard`/`useAuth`) that permits navigation to non-public routes such as Dashboard.

## Requirements

### Requirement 1: Present the Login/Sign up choice first

**User Story:** As a visitor starting onboarding, I want to see a choice between Login and Sign up first, so that I can either sign in to an existing account or create a new one.

#### Acceptance Criteria

1. WHEN Registration_Carousel mounts, THE Registration_Carousel SHALL display Auth_Choice_Step as the first visible card.
2. THE Auth_Choice_Step SHALL display exactly two selectable options: Login and Sign_Up.
3. WHEN a visitor selects Sign_Up on Auth_Choice_Step, THE Registration_Carousel SHALL advance to Personal_Info_Step.
4. WHEN a visitor selects Login on Auth_Choice_Step, THE Registration_Carousel SHALL display Login_Card.

### Requirement 2: Preserve the existing sign-up flow unchanged

**User Story:** As a visitor who wants to create a new account, I want the sign-up flow to behave exactly as it does today, so that adding the choice card does not disrupt registration.

#### Acceptance Criteria

1. WHEN a visitor selects Sign_Up, THE Registration_Carousel SHALL present the existing 7 registration steps (Personal_Info_Step, AccountStep, SendingCodeStep, VerifyCodeStep, WelcomeStep, RoleStep, PhotoUploadStep) in their current order, with each step's existing fields, validation, and transition behavior unchanged.
2. WHEN a visitor completes PhotoUploadStep after selecting Sign_Up, THE Onboarding_Wizard SHALL transition to the `org-type` phase exactly as it does today.
3. THE Registration_Carousel SHALL NOT alter the props, callbacks, or internal behavior of Personal_Info_Step, AccountStep, SendingCodeStep, VerifyCodeStep, WelcomeStep, RoleStep, or PhotoUploadStep.

### Requirement 3: Collect login credentials

**User Story:** As a returning user, I want a simple form with email and password, so that I can log in without going through account creation.

#### Acceptance Criteria

1. THE Login_Card SHALL display an email input field and a password input field and a submit action.
2. WHEN a visitor submits Login_Card with an empty email field, THE Login_Card SHALL prevent submission and display a validation error on the email field.
3. WHEN a visitor submits Login_Card with an email value that is not a valid email format, THE Login_Card SHALL prevent submission and display a validation error on the email field.
4. WHEN a visitor submits Login_Card with an empty password field, THE Login_Card SHALL prevent submission and display a validation error on the password field.
5. WHEN a visitor submits Login_Card with a valid email format and a non-empty password, THE Login_Card SHALL send a Login_Request.

### Requirement 4: Authenticate on successful login

**User Story:** As a returning user with valid credentials, I want to land on the dashboard after logging in, so that I can continue using the product without repeating sign-up.

#### Acceptance Criteria

1. WHEN Login_Request receives a response conforming to the successful case of Login_Contract, THE System SHALL establish an Auth_Session for the returned user.
2. WHEN Auth_Session is established following a successful Login_Request, THE System SHALL navigate to Dashboard.
3. WHILE a Login_Request is pending, THE Login_Card SHALL disable the submit action to prevent duplicate submissions.

### Requirement 5: Handle failed login attempts

**User Story:** As a returning user who mistypes credentials, I want a clear error message, so that I know to try again without losing my place.

#### Acceptance Criteria

1. IF Login_Request receives a response conforming to the failure case of Login_Contract, THEN THE Login_Card SHALL display an error message and SHALL remain on Login_Card.
2. IF Login_Request fails due to a network error, THEN THE Login_Card SHALL display an error message and SHALL remain on Login_Card.
3. WHEN a visitor resubmits Login_Card after a failed attempt, THE Login_Card SHALL clear the previously displayed error message before sending the new Login_Request.

### Requirement 6: Define the login API contract

**User Story:** As a developer, I want a documented login API contract, so that the frontend and a future backend implementation agree on the same request and response shape.

#### Acceptance Criteria

1. THE System SHALL send Login_Request as `POST /auth/login` with a JSON body containing `email` and `password`, via the existing API_Client (`src/lib/api-client.ts`).
2. THE Login_Contract SHALL define the successful response as containing an access token and a user profile (id, email, name).
3. THE Login_Contract SHALL define the failure response as an HTTP 401 status with an error message.

### Requirement 7: Provide a mock login handler for local and demo builds

**User Story:** As a developer working locally or on a demo build, I want the Login_Card to work end-to-end without a real backend, so that I can build and test the feature before the production login endpoint exists.

#### Acceptance Criteria

1. WHERE `isMockMode()` is true, THE System SHALL register Mock_Login_Handler for `POST /auth/login` following the existing `registerMockHandler` pattern in `src/mock/setup.ts`.
2. WHEN Mock_Login_Handler receives a Login_Request whose email and password match an entry in Mock_Credentials, THE Mock_Login_Handler SHALL return a response conforming to the successful case of Login_Contract.
3. WHEN Mock_Login_Handler receives a Login_Request whose email and password do not match any entry in Mock_Credentials, THE Mock_Login_Handler SHALL return a response conforming to the failure case of Login_Contract.
4. THE System SHALL define Mock_Credentials as a fixture module under `src/mock/fixtures/`, following the existing fixture file conventions.

### Requirement 8: Visual and localization consistency

**User Story:** As a user, I want the new choice card and login card to look and read like the rest of the onboarding flow, so that the experience feels consistent.

#### Acceptance Criteria

1. THE Auth_Choice_Step SHALL follow the existing step visual pattern used by other registration steps (FlowleeLogo at top, bold title via `t()`, `bg-[#f1f1f9] rounded-lg` inputs where applicable, full-width black rounded submit button, StepIndicator row).
2. THE Login_Card SHALL follow the same existing step visual pattern described in Requirement 8.1.
3. THE System SHALL source all user-facing text on Auth_Choice_Step and Login_Card from `useTranslation()` / `t()`, with corresponding keys added to `src/locales/en.json` and `src/locales/it.json`.
