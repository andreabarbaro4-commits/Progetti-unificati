# Requirements Document

## Introduction

This feature replaces the current Auth0 Universal Login redirect for signup with an embedded account creation flow. Instead of redirecting users away from the custom onboarding carousel, the `AccountStep` component will collect email and password, call Auth0's `/dbconnections/signup` REST endpoint directly, and then initiate an OIDC login redirect with `login_hint` to minimize friction during token acquisition.

## Glossary

- **Onboarding_Carousel**: The horizontal multi-step registration wizard (`RegistrationCarousel.tsx`) that guides new users through account setup
- **AccountStep**: The carousel step that renders email, password, and confirm-password fields for embedded account creation
- **Auth0_Signup_Client**: A service module that calls the Auth0 `/dbconnections/signup` REST endpoint to create user accounts without redirect
- **AuthProvider**: The React context provider that manages OIDC state via `oidc-client-ts` UserManager
- **Login_Hint**: An OIDC parameter (`login_hint`) passed to `signinRedirect` that pre-fills the user's email on the Auth0 login page
- **Mock_Mode**: A development mode (`VITE_MOCK=true`) that bypasses real authentication and API calls

## Requirements

### Requirement 1: Embed AccountStep in the Onboarding Carousel

**User Story:** As a new user, I want to create my account directly within the onboarding wizard, so that I don't lose context by being redirected to an external page.

#### Acceptance Criteria

1. WHEN a user clicks "Sign Up" on the AuthChoiceStep, THE Onboarding_Carousel SHALL display the AccountStep as part of the carousel flow instead of triggering an external redirect
2. THE AccountStep SHALL collect email, password, and confirm-password fields using the existing `AccountSchema` validation
3. WHEN the AccountStep is active, THE Onboarding_Carousel SHALL show the step as part of the carousel sequence: AuthChoiceStep → AccountStep → WelcomeStep → PersonalInfoStep → RoleStep → PhotoUploadStep
4. WHILE Mock_Mode is enabled, THE Onboarding_Carousel SHALL bypass the Auth0 signup call and advance to the next step directly

### Requirement 2: Call Auth0 Signup Endpoint

**User Story:** As a new user, I want my account created when I submit my credentials in the AccountStep, so that I can proceed without visiting an external signup page.

#### Acceptance Criteria

1. WHEN the user submits valid email and password in the AccountStep, THE Auth0_Signup_Client SHALL send a POST request to `https://{AUTH0_DOMAIN}/dbconnections/signup` with `client_id`, `email`, `password`, and `connection: "Username-Password-Authentication"`
2. WHEN the Auth0 signup endpoint returns HTTP 200, THE Auth0_Signup_Client SHALL resolve successfully with the created user object
3. WHEN the Auth0 signup endpoint returns HTTP 400, THE Auth0_Signup_Client SHALL reject with structured error information including the error description from the response body
4. THE Auth0_Signup_Client SHALL derive the Auth0 domain from the existing `VITE_AUTH_AUTHORITY` environment variable
5. THE Auth0_Signup_Client SHALL use the existing `VITE_AUTH_CLIENT_ID` environment variable as the `client_id` parameter

### Requirement 3: Display Auth0 Error Feedback in the UI

**User Story:** As a new user, I want to see clear error messages when account creation fails, so that I can correct my input and try again.

#### Acceptance Criteria

1. WHEN the Auth0 signup endpoint returns an "email already exists" error, THE AccountStep SHALL display an error message indicating the email is already registered
2. WHEN the Auth0 signup endpoint returns a password policy violation, THE AccountStep SHALL display the specific policy requirement that was not met
3. WHEN the Auth0 signup endpoint returns a network or unexpected error, THE AccountStep SHALL display a generic error message and allow the user to retry
4. WHILE a signup request is in progress, THE AccountStep SHALL disable the submit button and show a loading indicator
5. WHEN an error is displayed, THE AccountStep SHALL keep the form data intact so the user can correct and resubmit

### Requirement 4: Trigger OIDC Login with Login Hint After Signup

**User Story:** As a new user who just created an account, I want the login process to be as seamless as possible, so that I don't have to re-enter my email on the Auth0 login page.

#### Acceptance Criteria

1. WHEN the Auth0 signup succeeds and the carousel completes all steps, THE AuthProvider SHALL initiate `signinRedirect` with `login_hint` set to the user's email address
2. WHEN `signinRedirect` is called with `login_hint`, THE AuthProvider SHALL include the existing `audience` parameter alongside the login hint
3. WHEN the OIDC login redirect completes, THE AuthCallback handler SHALL route the user to `/dashboard` following the existing callback flow
4. THE AuthProvider SHALL store the signup email in memory so it is available when the carousel completes and login is triggered

### Requirement 5: Preserve Existing Authentication Flows

**User Story:** As a returning user or someone who prefers social login, I want the existing login and Google signup flows to remain unchanged, so that my preferred method still works.

#### Acceptance Criteria

1. WHEN a user clicks "Login" on the AuthChoiceStep, THE AuthProvider SHALL trigger the existing `signinRedirect` flow without modification
2. WHEN Mock_Mode is enabled, THE AuthProvider SHALL continue to bypass real authentication entirely
3. THE AuthCallback handler SHALL continue to process callbacks from all authentication methods including social login providers without modification

