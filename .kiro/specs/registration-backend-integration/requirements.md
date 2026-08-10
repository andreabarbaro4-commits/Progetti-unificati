# Requirements Document

## Introduction

This spec covers wiring the Flowlee frontend registration wizard to the backend services: Auth0 for identity creation, the Flowlee API for UserProfile creation (`POST /api/users`), and the photo presign endpoint (`POST /api/users/{userId}/photo/presign`) for profile photo upload. The wizard steps are restructured to remove concerns now handled by Auth0 (email/password collection, email verification) and the remaining steps are connected to real API calls.

Reference: #[[file:openapi.yml]]

## Glossary

- **Registration_Wizard**: The horizontal carousel component (`RegistrationCarousel.tsx`) that guides new users through the sign-up flow
- **Auth0_Tenant**: The external Auth0 identity provider that handles hosted signup (email/password creation and email verification)
- **AuthProvider**: The existing React context (`AuthProvider.tsx`) that manages OIDC sessions via oidc-client-ts
- **Flowlee_API**: The backend REST API serving UserProfile and photo presign endpoints
- **UserProfile**: The backend record created via `POST /api/users`, containing userId, email, name, surname, gender, birthDate, jobTitle, and photo
- **Presign_Endpoint**: The `POST /api/users/{userId}/photo/presign` route that generates a presigned S3 PUT URL for uploading a profile photo
- **Registration_Store**: The client-side state store (Zustand or component state) that holds collected profile data across wizard steps
- **PhotoReference**: An object containing photoId and ext (file extension) that links a UserProfile to an uploaded photo

## Requirements

### Requirement 1: Auth0 Signup Redirect

**User Story:** As a new user, I want to be directed to Auth0's hosted signup screen when I click "Sign up", so that my identity (email/password) is created securely via a trusted provider.

#### Acceptance Criteria

1. WHEN the user clicks the "Sign up" button on the AuthChoiceStep, THE Registration_Wizard SHALL redirect the browser to Auth0's hosted signup screen using the AuthProvider's signup method
2. THE Registration_Wizard SHALL pass a `screen_hint=signup` parameter (or equivalent Auth0 configuration) to ensure the hosted page shows the registration form rather than the login form
3. WHEN the Auth0 signup redirect is initiated, THE Registration_Wizard SHALL store any pre-collected state so it can be restored after the callback

### Requirement 2: Auth0 Callback Handling

**User Story:** As a new user returning from Auth0 signup, I want the application to process my authentication callback and resume the registration wizard, so that I can continue setting up my profile.

#### Acceptance Criteria

1. WHEN Auth0 redirects back to the application after a successful signup, THE AuthProvider SHALL process the OIDC callback and establish an authenticated session with an access token
2. WHEN the callback is processed successfully, THE Registration_Wizard SHALL navigate the user to the Welcome step (animated greeting)
3. IF the Auth0 callback fails or returns an error, THEN THE Registration_Wizard SHALL display an error message to the user and offer a retry option
4. WHEN the session is established, THE AuthProvider SHALL make the user's `sub` claim and `email` available to downstream components

### Requirement 3: Wizard Step Reduction

**User Story:** As a product team, I want to remove redundant wizard steps that duplicate Auth0's hosted signup functionality, so that the registration flow is streamlined and non-confusing.

#### Acceptance Criteria

1. THE Registration_Wizard SHALL remove the AccountStep (email/password collection) from the carousel since Auth0 handles identity creation
2. THE Registration_Wizard SHALL remove the SendingCodeStep from the carousel since Auth0 handles email verification
3. THE Registration_Wizard SHALL remove the VerifyCodeStep from the carousel since Auth0 handles email verification
4. WHEN the wizard renders after Auth0 callback, THE Registration_Wizard SHALL present steps in this order: WelcomeStep, PersonalInfoStep, RoleStep, PhotoUploadStep

### Requirement 4: Profile Data Collection

**User Story:** As a new user, I want to provide my personal information (name, surname, gender, date of birth, job title) after signing up, so that my Flowlee profile is complete.

#### Acceptance Criteria

1. WHEN the PersonalInfoStep is displayed, THE Registration_Wizard SHALL collect name (required), surname (required), gender (required, enum: male/female/other), and birthDate (required, format YYYY-MM-DD)
2. WHEN the RoleStep is displayed, THE Registration_Wizard SHALL collect the user's job title (optional, maxLength 200)
3. THE Registration_Store SHALL persist all collected profile fields in client-side state across wizard step transitions
4. WHEN any field fails validation, THE Registration_Wizard SHALL display inline validation errors and prevent advancement to the next step

### Requirement 5: UserProfile Creation

**User Story:** As a new user who has completed profile data entry, I want my profile to be saved to the backend, so that my information is persisted and available across the platform.

#### Acceptance Criteria

1. WHEN the user completes the final data-collection step (PhotoUploadStep), THE Registration_Wizard SHALL call `POST /api/users` with the CreateUserProfileRequest payload
2. THE Registration_Wizard SHALL construct the CreateUserProfileRequest with: userId (from the authenticated user's `sub` claim), email (from the authenticated user's token), name, surname, gender, birthDate, and jobTitle (from the Registration_Store)
3. WHEN the `POST /api/users` call returns HTTP 201, THE Registration_Wizard SHALL treat the profile as successfully created and proceed to navigation
4. IF the `POST /api/users` call returns HTTP 400 (ValidationError), THEN THE Registration_Wizard SHALL display the error message from the ErrorEnvelope to the user
5. IF the `POST /api/users` call returns HTTP 403 (ForbiddenError), THEN THE Registration_Wizard SHALL display an authorization error and suggest re-authenticating
6. IF the `POST /api/users` call returns HTTP 500 (InternalError), THEN THE Registration_Wizard SHALL display a generic error message and offer a retry option

### Requirement 6: Photo Upload Flow

**User Story:** As a new user, I want to upload a profile photo during registration, so that my profile has a visual identity from the start.

#### Acceptance Criteria

1. WHEN the user selects a photo file on the PhotoUploadStep, THE Registration_Wizard SHALL validate that the file type is one of image/jpeg, image/png, image/webp, or image/gif and that the file size does not exceed 10,485,760 bytes (10MB)
2. WHEN the user confirms profile creation with a photo selected, THE Registration_Wizard SHALL first complete the `POST /api/users` call, then call `POST /api/users/{userId}/photo/presign` with the photo's contentType and sizeBytes
3. WHEN the presign endpoint returns HTTP 200, THE Registration_Wizard SHALL perform an HTTP PUT to the returned uploadUrl with the raw file content and the correct Content-Type header
4. WHEN the S3 upload completes successfully, THE Registration_Wizard SHALL call `PUT /api/users/{userId}` with a photo field containing the PhotoReference (photoId and ext from the presign response)
5. IF the presign endpoint returns HTTP 400, THEN THE Registration_Wizard SHALL display the validation error to the user (unsupported content type or file too large)
6. IF the S3 upload fails, THEN THE Registration_Wizard SHALL display an upload error and offer a retry option
7. WHEN the user skips photo upload (proceeds without selecting a photo), THE Registration_Wizard SHALL call `POST /api/users` without a photo field and proceed normally

### Requirement 7: Error Handling and User Feedback

**User Story:** As a new user, I want clear feedback when something goes wrong during registration, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHILE an API call is in progress, THE Registration_Wizard SHALL display a loading indicator and disable form submission to prevent duplicate requests
2. IF any API call returns an HTTP 500 response, THEN THE Registration_Wizard SHALL display a user-friendly error message with a retry action
3. IF any API call fails due to a network error (no response received), THEN THE Registration_Wizard SHALL display a connectivity error message with a retry action
4. WHEN displaying API errors, THE Registration_Wizard SHALL use the `message` field from the ErrorEnvelope response when available
5. THE Registration_Wizard SHALL NOT expose raw HTTP status codes or technical error details to the user

### Requirement 8: State Persistence Across Steps

**User Story:** As a new user, I want my entered data to be preserved as I move between wizard steps, so that I don't lose information if I navigate back.

#### Acceptance Criteria

1. THE Registration_Store SHALL maintain all collected profile data (name, surname, gender, birthDate, jobTitle, selected photo file) in memory for the duration of the registration session
2. WHEN the user navigates backward in the wizard, THE Registration_Store SHALL restore previously entered values into the form fields
3. IF the browser session is lost (page refresh or tab close) after Auth0 callback, THEN THE Registration_Wizard SHALL detect the authenticated-but-no-profile state and restart the wizard from the WelcomeStep

### Requirement 9: Post-Registration Navigation

**User Story:** As a new user who has completed registration, I want to be directed to the next phase of onboarding, so that I can continue setting up my workspace.

#### Acceptance Criteria

1. WHEN the UserProfile creation (and optional photo upload) completes successfully, THE Registration_Wizard SHALL transition to the organization-setup phase
2. THE Registration_Wizard SHALL use the existing phase transition mechanism (crossfade to VerticalCarouselWizard) to navigate to the org-type selection
3. IF the user has already completed registration (UserProfile exists for their userId), THEN THE Registration_Wizard SHALL skip the registration phase entirely and navigate directly to the appropriate next phase
