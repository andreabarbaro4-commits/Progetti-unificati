# Implementation Plan: Registration Backend Integration

## Overview

Connect the existing registration wizard to Auth0 and the Flowlee API. Remove redundant steps handled by Auth0, wire remaining steps to a new Zustand store, and orchestrate profile creation + photo upload via TanStack Query mutations. Add mock handlers for local development and error handling UI for resilience.

## Tasks

- [x] 1. Registration API module and types
  - [x] 1.1 Create `src/features/onboarding/api/registration-api.ts` with typed API functions
    - Define interfaces: `CreateUserProfileRequest`, `UserProfile`, `PhotoReference`, `PresignRequest`, `PresignResponse`, `UpdateUserProfileRequest`
    - Implement functions: `getUserProfile`, `createUserProfile`, `presignPhotoUpload`, `updateUserProfile`, `uploadToS3`
    - Use existing `apiClient` for all Flowlee API calls; use raw `fetch` for S3 PUT
    - _Requirements: 5.1, 5.2, 6.2, 6.3, 6.4_

- [x] 2. Registration Zustand store
  - [x] 2.1 Create `src/features/onboarding/useRegistrationStore.ts`
    - Define `RegistrationData` interface with: name, surname, gender, birthDate, jobTitle, selectedPhotoFile
    - Implement `setField`, `setPhoto`, `reset` actions
    - Keep store in-memory only (no persistence to sessionStorage)
    - _Requirements: 4.3, 8.1, 8.2_

- [x] 3. AuthProvider signup method
  - [x] 3.1 Add `signup(returnTo?: string)` to `AuthContextValue` interface in `src/features/auth/AuthProvider.tsx`
    - Implement using `mgr.signinRedirect` with `extraQueryParams: { screen_hint: 'signup' }` merged with existing audience param
    - Default `state` to `/onboarding` if no returnTo provided
    - Expose `signup` in the context value object
    - _Requirements: 1.1, 1.2_

- [x] 4. AuthCallback enhancement
  - [x] 4.1 Modify `src/features/auth/AuthCallback.tsx` to check profile existence after OIDC callback
    - After `establishSession()`, call `GET /api/users/{userId}` using `getUserProfile`
    - On 200: navigate to the state return path or `/dashboard`
    - On 404: navigate to `/onboarding` (new user flow)
    - On error (non-404): show error state with retry
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.3_

- [x] 5. Checkpoint - Verify auth flow compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wizard step reduction
  - [x] 6.1 Refactor `src/features/onboarding/components/RegistrationCarousel.tsx`
    - Remove imports and renders of `AccountStep`, `SendingCodeStep`, `VerifyCodeStep`
    - Move `AuthChoiceStep` out of the carousel (render separately in `OnboardingWizard` or pre-auth page)
    - Set new step order: index 0 = WelcomeStep, 1 = PersonalInfoStep, 2 = RoleStep, 3 = PhotoUploadStep
    - Update `TOTAL_STEPS` from 8 to 4
    - Adjust expand animation logic (WelcomeStep is now index 0, no longer index 5)
    - Update `CAROUSEL_CONFIG.welcomeStepIndex` accordingly
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.2 Update `src/features/onboarding/OnboardingWizard.tsx` to handle pre-auth vs post-auth flow
    - If user is not authenticated, show AuthChoiceStep (with signup button calling `signup()`)
    - If user is authenticated but has no profile, show RegistrationCarousel (4 steps)
    - If user is authenticated and has profile, skip to org-type phase
    - _Requirements: 9.3, 2.2_

- [x] 7. Wire PersonalInfoStep to registration store
  - [x] 7.1 Update `src/features/onboarding/steps/PersonalInfoStep.tsx`
    - Import and use `useRegistrationStore` to read/write name, surname, gender, birthDate
    - Initialize form fields from store values on mount (supports back-navigation)
    - Persist validated values to store on successful step completion
    - _Requirements: 4.1, 4.3, 4.4, 8.2_

- [x] 8. Wire RoleStep to registration store
  - [x] 8.1 Update `src/features/onboarding/steps/RoleStep.tsx`
    - Import and use `useRegistrationStore` to read/write jobTitle
    - Initialize field from store on mount
    - Persist to store on step completion
    - _Requirements: 4.2, 4.3, 8.2_

- [x] 9. PhotoUploadStep file validation
  - [x] 9.1 Add client-side photo validation to `src/features/onboarding/steps/PhotoUploadStep.tsx`
    - Add `PhotoFileSchema` to `src/features/onboarding/schemas.ts` (type enum + max 10MB size)
    - Validate selected file against schema before allowing advancement
    - Display inline error for invalid file type or size
    - Store validated file in registration store via `setPhoto`
    - _Requirements: 6.1, 4.4_

- [x] 10. Checkpoint - Verify wizard UI compiles and steps render
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Profile creation orchestration hook
  - [x] 11.1 Create `src/features/onboarding/hooks/useProfileCreation.ts`
    - Implement chained TanStack Query mutations: createProfile → presignPhoto → uploadToS3 → updateProfile
    - Accept params: userId, email, profileData (from registration store)
    - Skip photo steps if no file selected
    - Expose: `submitRegistration`, `isSubmitting`, `error`, `reset`, `currentStep`
    - Map API errors to user-friendly messages per design error mapping table
    - _Requirements: 5.1, 5.2, 5.3, 6.2, 6.3, 6.4, 6.7, 7.1_

- [x] 12. Wire PhotoUploadStep submission
  - [x] 12.1 Connect PhotoUploadStep submit action to `useProfileCreation` hook
    - On "Complete" click: invoke `submitRegistration` with auth user info + store data
    - Show loading overlay with progress text ("Creating profile…", "Uploading photo…", "Finishing up…")
    - Disable submit button while `isSubmitting` is true
    - Display error component with retry on failure
    - On success: call `onComplete()` to trigger phase transition
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2_

- [x] 13. Profile existence guard
  - [x] 13.1 Create `src/features/onboarding/hooks/useProfileCheck.ts`
    - Implement `useProfileCheck` hook using TanStack Query with `getUserProfile`
    - Enable only when authenticated and user.sub is available
    - Set `retry: false` (404 is expected for new users)
    - _Requirements: 9.3, 8.3_

  - [x] 13.2 Integrate `useProfileCheck` into `OnboardingWizard`
    - If profile exists → skip registration, go to org-type or dashboard
    - If 404 → show registration wizard
    - If loading → show loading state
    - _Requirements: 9.3, 8.3_

- [x] 14. Checkpoint - Verify full registration flow compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Mock handlers for local development
  - [x] 15.1 Register mock handlers in `src/mock/setup.ts`
    - `GET /api/users/:userId` → return 404 by default (new user), or 200 with stored profile if one was created
    - `POST /api/users` → store profile in memory, return 201 with mock UserProfile
    - `POST /api/users/:userId/photo/presign` → return mock PresignResponse with fake uploadUrl
    - PUT to fake S3 URL → return 200
    - `PUT /api/users/:userId` → update stored profile, return 200
    - _Requirements: 5.1, 6.2, 6.3, 6.4_

- [x] 16. Error handling UI
  - [x] 16.1 Create error display component for the registration wizard
    - Create `src/features/onboarding/components/RegistrationError.tsx`
    - Accept props: message, onRetry, variant (network | validation | auth | server)
    - Render user-friendly message with appropriate action (retry button or sign-in link)
    - Ensure no raw HTTP status codes or technical details are shown
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [x] 16.2 Integrate error component into PhotoUploadStep and OnboardingWizard
    - Display RegistrationError when `useProfileCreation` reports an error
    - Wire retry action to `reset()` + `submitRegistration()` re-invocation
    - Wire auth error to `login()` redirect
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 17. Final checkpoint - Full flow verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (none marked in this plan since all tasks are core integration work)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key integration boundaries
- Property-based testing is not applicable to this feature (integration layer with side effects and external services) — use unit and integration tests instead
- The project uses TypeScript, React, Zustand, TanStack Query, Zod, and the existing `apiClient` module

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1", "9.1"] },
    { "id": 2, "tasks": ["4.1", "6.1"] },
    { "id": 3, "tasks": ["6.2", "7.1", "8.1"] },
    { "id": 4, "tasks": ["11.1", "13.1", "15.1"] },
    { "id": 5, "tasks": ["12.1", "13.2", "16.1"] },
    { "id": 6, "tasks": ["16.2"] }
  ]
}
```
