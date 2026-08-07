# Requirements Document

## Introduction

Mock Mode for Local Development enables frontend developers to run the Flowlee application locally without any backend services or authentication provider. When activated via the `VITE_MOCK=true` environment variable, the application renders all components with realistic mock data, bypasses OIDC authentication, and makes all routes accessible — enabling visual development, component iteration, and behavior testing without external dependencies.

## Glossary

- **Mock_Mode**: The application state activated by setting `VITE_MOCK=true`, where all external dependencies (auth, API) are replaced by local mock implementations
- **Mock_AuthProvider**: A replacement authentication provider that supplies a fake authenticated user without connecting to Auth0
- **Mock_ApiClient**: A replacement or interceptor layer for the API client that returns predefined mock responses instead of making network requests
- **Fixture**: A static or factory-generated data object representing realistic mock data for a specific domain entity (user profile, dashboard data, etc.)
- **Env_Validator**: The `validateEnv()` function in `src/env.ts` that checks for required environment variables at startup
- **AuthGuard**: The route protection component that redirects unauthenticated users on protected routes
- **Tree_Shaking**: The build-time optimization process that excludes unused code from the production bundle

## Requirements

### Requirement 1: Mock Mode Activation

**User Story:** As a frontend developer, I want to toggle mock mode via an environment variable, so that I can switch between mock and real services without code changes.

#### Acceptance Criteria

1. WHEN `VITE_MOCK` is set to `"true"`, THE Mock_Mode SHALL activate, replacing real auth and API layers with mock implementations
2. WHEN `VITE_MOCK` is unset or set to any value other than `"true"`, THE Mock_Mode SHALL remain inactive and the application SHALL use real auth and API services
3. WHEN Mock_Mode is active, THE Env_Validator SHALL skip validation of `VITE_API_BASE_URL`, `VITE_AUTH_AUTHORITY`, and `VITE_AUTH_CLIENT_ID`
4. WHEN Mock_Mode is inactive, THE Env_Validator SHALL enforce all required environment variables as it does today

### Requirement 2: Mock Authentication

**User Story:** As a frontend developer, I want authentication to be mocked so that I can access protected routes without running Auth0 or any auth service.

#### Acceptance Criteria

1. WHEN Mock_Mode is active, THE Mock_AuthProvider SHALL provide an authenticated user context with realistic profile data (sub, email, name)
2. WHEN Mock_Mode is active, THE Mock_AuthProvider SHALL report `isAuthenticated` as `true` and `isLoading` as `false` immediately on mount
3. WHEN Mock_Mode is active, THE AuthGuard SHALL allow access to all protected routes without triggering any login redirect
4. WHEN Mock_Mode is active, THE Mock_AuthProvider SHALL expose `login`, `logout`, and `silentRefresh` methods as no-op functions that do not throw
5. WHEN Mock_Mode is active, THE Mock_AuthProvider SHALL supply a stable mock access token via `getAccessToken`

### Requirement 3: Mock API Layer

**User Story:** As a frontend developer, I want API calls to return realistic mock data, so that components render with meaningful content during local development.

#### Acceptance Criteria

1. WHEN Mock_Mode is active AND a component calls the API client, THE Mock_ApiClient SHALL return a mock response matching the expected type for that endpoint
2. WHEN Mock_Mode is active, THE Mock_ApiClient SHALL resolve responses asynchronously to simulate realistic network behavior
3. WHEN Mock_Mode is active AND an endpoint has no registered mock handler, THE Mock_ApiClient SHALL return a descriptive error indicating the missing mock
4. WHEN Mock_Mode is inactive, THE Mock_ApiClient code SHALL NOT be imported or executed

### Requirement 4: Mock Data Fixtures

**User Story:** As a frontend developer, I want realistic mock data for all existing entities, so that every component displays meaningful content in mock mode.

#### Acceptance Criteria

1. THE Fixture layer SHALL provide mock data for the authenticated user profile (matching the `OidcUser` interface)
2. THE Fixture layer SHALL provide mock data for dashboard entities (projects, tasks, team members) with multiple items
3. THE Fixture layer SHALL provide mock data for onboarding-related entities (organization types, roles, company settings)
4. WHEN a new feature is added, THE Fixture layer SHALL be extensible by adding new fixture files without modifying existing code

### Requirement 5: Production Build Isolation

**User Story:** As a platform engineer, I want mock code excluded from production builds, so that bundle size is not impacted and mock data is never exposed to end users.

#### Acceptance Criteria

1. WHEN building for production (`vite build`), THE build system SHALL exclude all mock-related modules from the output bundle
2. WHEN Mock_Mode is inactive at build time, THE build system SHALL tree-shake all mock imports so they produce zero bytes in the bundle
3. THE mock module boundary SHALL use dynamic imports or conditional logic that Vite can statically analyze for dead-code elimination

### Requirement 6: Developer Ergonomics

**User Story:** As a frontend developer, I want the mock setup to be simple and well-documented, so that new team members can start developing locally in minutes.

#### Acceptance Criteria

1. THE `.env.example` file SHALL include a `VITE_MOCK` entry with a comment explaining its purpose
2. WHEN Mock_Mode is active, THE application SHALL display a visible indicator (e.g., a banner or badge) informing the developer that mock mode is enabled
3. WHEN Mock_Mode is active AND a component renders, THE component SHALL behave identically to production mode except for the data source
