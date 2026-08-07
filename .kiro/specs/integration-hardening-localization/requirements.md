# Requirements Document

## Introduction

This feature hardens the Flowlee frontend application across five cross-cutting concerns: full internationalization and localization support (English and Italian), robust auth session lifecycle management (logout, expiry, refresh failure), consistent form validation with react-hook-form and zod, a global error boundary for graceful failure handling, and CORS coordination between each deployment stage's frontend origin and its corresponding API Gateway.

## Glossary

- **App**: The Flowlee React single-page application
- **Locale_Switcher**: The UI control that allows the user to change the active display language
- **i18n_Module**: The i18next-based internationalization subsystem (`src/lib/i18n.ts`)
- **Auth_Module**: The OIDC authentication provider (`src/features/auth/auth-provider.tsx`) using oidc-client-ts and Auth0
- **Form_Validator**: The form validation layer composed of react-hook-form for state management and zod for schema declaration
- **Error_Boundary**: The top-level React error boundary component that catches unhandled errors from the component tree
- **API_Client**: The typed fetch wrapper (`src/lib/api-client.ts`) responsible for backend communication
- **CDK_Stack**: The AWS CDK infrastructure stack that provisions CloudFront, S3, and related resources per stage
- **Stage**: One of the four deployment environments: dev, test, preprod, prod
- **CORS_Config**: The Cross-Origin Resource Sharing configuration applied to the backend API Gateway for a given stage

## Requirements

### Requirement 1: Language Rendering and Switching

**User Story:** As a user, I want to view the application in my preferred language and switch between English and Italian, so that I can use the application comfortably in my native language.

#### Acceptance Criteria

1. THE App SHALL render all user-visible text using translation keys resolved by the i18n_Module for the two supported locales: English and Italian
2. WHEN the user selects a language via the Locale_Switcher, THE i18n_Module SHALL update the active locale and re-render all translated text without a page reload
3. IF a translation key is missing in the active locale, THEN THE i18n_Module SHALL resolve the key using English as the fallback language
4. WHEN the App loads and a persisted language preference exists, THE i18n_Module SHALL initialize with that persisted language
5. IF the persisted language preference is not one of the supported locales (English, Italian), THEN THE i18n_Module SHALL discard the invalid value and initialize with English
6. THE Locale_Switcher SHALL present exactly the two supported languages (English and Italian) as selectable options

### Requirement 2: Language Persistence

**User Story:** As a user, I want my language preference to survive page reloads and browser sessions, so that I do not have to re-select my language every time I visit.

#### Acceptance Criteria

1. WHEN the user selects a language via the Locale_Switcher, THE i18n_Module SHALL persist the selected language code to browser localStorage within 1 second of selection
2. WHEN the App loads, IF a persisted language preference exists in localStorage and its value matches a supported language code, THEN THE i18n_Module SHALL initialize with that stored language
3. WHEN the App loads, IF no persisted language preference exists in localStorage or the stored value does not match a supported language code, THEN THE i18n_Module SHALL initialize with English and remove the invalid entry if one was present
4. IF localStorage is unavailable or write operations fail, THEN THE i18n_Module SHALL continue operating with the selected language for the current session without displaying an error to the user

### Requirement 3: Locale-Aware Formatting

**User Story:** As a user, I want dates, numbers, and currencies to be displayed according to my selected locale, so that I can interpret data naturally.

#### Acceptance Criteria

1. WHEN a date value is displayed, THE App SHALL format it using the Intl.DateTimeFormat API with the active locale, using the "short" date style (e.g., "15/06/2025" for it, "6/15/2025" for en)
2. WHEN a numeric value is displayed, THE App SHALL format it using the Intl.NumberFormat API with the active locale, applying locale-appropriate decimal separators and thousands grouping
3. WHEN a currency value is displayed, THE App SHALL format it using the Intl.NumberFormat API with style "currency", the active locale, and the currency code associated with the displayed value
4. WHEN the active locale changes, THE App SHALL re-format all currently displayed dates, numbers, and currency values to reflect the new locale without requiring a page reload, within 1 second of the locale change
5. IF the active locale is not supported by the browser's Intl API, THEN THE App SHALL fall back to the application's fallback locale for all formatting operations

### Requirement 4: Auth Session Logout

**User Story:** As a user, I want to log out cleanly, so that my session is fully terminated and I am returned to a safe entry point.

#### Acceptance Criteria

1. WHEN the user triggers logout, THE Auth_Module SHALL initiate RP-initiated logout with Auth0, ending the user's session at the identity provider
2. WHEN the user triggers logout, THE Auth_Module SHALL clear all in-memory tokens (access, refresh, ID) and purge any cached server state held by the Server_State_Manager and any client state held in feature-scoped Client_State_Manager stores
3. WHEN the session is revoked and tokens are cleared, THE Auth_Module SHALL redirect the user to the application root path (`/`) via the Auth0 post-logout redirect URI, and the user SHALL be in an unauthenticated state upon arrival
4. IF the logout request to Auth0 fails due to a network error or a non-success response, THEN THE Auth_Module SHALL still clear all local tokens and cached state, and SHALL redirect the user to the application root path (`/`) in an unauthenticated state

### Requirement 5: Auth Session Expiry and Refresh Failure

**User Story:** As a user, I want the application to handle expired or unrefreshable sessions gracefully, so that I receive a clear message and can re-authenticate without losing my place.

#### Acceptance Criteria

1. WHEN a silent token refresh fails, THE Auth_Module SHALL clear all in-memory tokens and set the authenticated state to false
2. WHEN a silent token refresh fails, THE Auth_Module SHALL display a visible notification indicating that the session has expired before redirecting to the login page
3. WHEN a silent token refresh fails, THE Auth_Module SHALL redirect the user to the Auth0 login page within 3 seconds of displaying the session-expired notification
4. WHEN redirecting to login after a refresh failure, THE Auth_Module SHALL persist the current route path including query string parameters via the OIDC state parameter so the user returns to the same page after re-authentication
5. WHEN re-authentication succeeds and a persisted route path is available, THE Auth_Module SHALL redirect the user back to the previously persisted route path
6. IF re-authentication succeeds and no persisted route path is available or the persisted path is empty, THEN THE Auth_Module SHALL redirect the user to the dashboard page
7. IF multiple API calls receive 401 responses simultaneously triggering concurrent refresh attempts, THEN THE Auth_Module SHALL perform only a single redirect to the Auth0 login page

### Requirement 6: Auth0 Redirect URI Registration

**User Story:** As a DevOps engineer, I want every deployment stage's frontend domain registered in Auth0 as both a login redirect URI and a post-logout redirect URI, so that OIDC flows work correctly across all environments.

#### Acceptance Criteria

1. THE CDK Stack SHALL output the stage custom domain (e.g., `dev.flowlee.com`, `test.flowlee.com`, `preprod.flowlee.com`, `app.flowlee.com`) as a named stack output called `FrontendDomain` for each stage
2. THE Auth_Module SHALL construct the redirect_uri as `{stage_frontend_origin}/auth/callback` for each stage, where `stage_frontend_origin` is the HTTPS URL of the stage custom domain (e.g., `https://dev.flowlee.com`)
3. THE Auth_Module SHALL construct the post_logout_redirect_uri as the stage frontend origin (e.g., `https://dev.flowlee.com`) for each stage
4. WHEN a new stage is deployed, THE deployment documentation SHALL list both the login redirect URI (`https://{stage_domain}/auth/callback`) and the post-logout redirect URI (`https://{stage_domain}`) that must be registered in the Auth0 application configuration before the stage is considered operational
5. IF the redirect_uri or post_logout_redirect_uri sent by the Auth_Module does not match a URI registered in Auth0, THEN THE system SHALL display an error indication to the user within 5 seconds and redirect the user to the application root path within 10 seconds

### Requirement 7: Form Validation with react-hook-form and zod

**User Story:** As a user filling out forms, I want to see immediate, field-level validation errors, so that I can correct my input before submission.

#### Acceptance Criteria

1. THE Form_Validator SHALL use react-hook-form for form state management on every write-capable form
2. THE Form_Validator SHALL use zod schemas to define validation rules for each form
3. WHEN a form field loses focus and its value violates the zod schema, THE Form_Validator SHALL display a field-level error message directly below the invalid field within 200ms
4. WHEN a form is submitted with invalid fields, THE Form_Validator SHALL prevent submission, display error messages for all invalid fields, and set focus on the first invalid field in DOM order
5. WHEN the user modifies an invalid field's value to satisfy the schema, THE Form_Validator SHALL remove the corresponding error message on each keystroke (onChange) without waiting for blur
6. THE Form_Validator SHALL display error messages using the active locale's translations
7. IF a form has been submitted with errors, THEN THE Form_Validator SHALL validate all fields on each change event until the form is successfully submitted or reset

### Requirement 8: Global Error Boundary

**User Story:** As a user, I want the application to display a helpful fallback UI when an unexpected error occurs, so that I am not left staring at a blank screen.

#### Acceptance Criteria

1. THE Error_Boundary SHALL wrap the top-level component tree below the root providers (Auth, Query, Router) so that any rendering or lifecycle error in descendant components is intercepted before reaching the root
2. WHEN an unhandled error is thrown during rendering, in a lifecycle method, or in a constructor of any descendant component, THE Error_Boundary SHALL catch the error and render a fallback UI in place of the crashed component tree
3. THE Error_Boundary fallback UI SHALL display a heading indicating that something went wrong, a brief description suggesting the user try again, and a visible action button to recover
4. THE Error_Boundary fallback UI SHALL provide a button that reloads the current page when activated
5. WHEN an error is caught, THE Error_Boundary SHALL log the error object and the component stack trace to the browser console
6. IF the Error_Boundary fallback UI is rendered, THEN THE Error_Boundary SHALL ensure the fallback is centered on the viewport and occupies the full available height so the user does not see a blank or partially rendered page

### Requirement 9: CORS Coordination per Stage

**User Story:** As a DevOps engineer, I want each stage's API Gateway CORS configuration to allow requests only from that stage's frontend origin, so that cross-origin requests succeed in all environments without overly permissive policies.

#### Acceptance Criteria

1. THE CORS_Config for each Stage SHALL include exactly one origin value in the Access-Control-Allow-Origin header, matching that Stage's frontend domain (e.g., "https://dev.flowlee.com" for the dev Stage, "https://flowlee.com" for the production Stage)
2. THE CORS_Config SHALL allow the HTTP methods GET, POST, PUT, PATCH, DELETE, and OPTIONS in the Access-Control-Allow-Methods header
3. THE CORS_Config SHALL allow the headers Content-Type and Authorization in the Access-Control-Allow-Headers header
4. WHEN a preflight OPTIONS request is received from a Stage's configured frontend origin, THE CORS_Config SHALL respond with Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers headers and a 200 status within 5 seconds
5. IF a request is received from an origin that does not match the configured Stage's frontend domain, THEN THE CORS_Config SHALL omit the Access-Control-Allow-Origin header from the response
6. THE CORS_Config SHALL include an Access-Control-Max-Age header with a value of 3600 seconds to reduce preflight request frequency
7. IF the Stage's frontend domain configuration is missing or empty, THEN THE deployment SHALL fail with an error indicating the missing origin configuration
