# Implementation Plan: Mock Mode for Local Development

## Overview

Incremental implementation of a mock layer that replaces auth and API dependencies when `VITE_MOCK=true`. Each task produces a working state and builds on previous tasks. The mock code is tree-shakeable via dynamic imports and conditional logic.

## Tasks

- [x] 1. Create mock mode detection and update env.ts
  - [x] 1.1 Create `src/mock/index.ts` with `isMockMode()` helper
    - Export a function that returns `import.meta.env.VITE_MOCK === 'true'`
    - This is the single source of truth for mock mode detection
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Update `src/env.ts` to skip validation in mock mode
    - Import `isMockMode` from `./mock`
    - If mock mode is active, return dummy placeholder values without validating
    - If mock mode is inactive, keep existing validation logic unchanged
    - _Requirements: 1.3, 1.4_

  - [ ]* 1.3 Write unit tests for mock mode detection and env validation
    - Test `isMockMode()` returns true only when `VITE_MOCK=true`
    - Test `validateEnv()` returns dummy values in mock mode
    - Test `validateEnv()` throws when vars are missing in normal mode
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create mock auth provider
  - [x] 2.1 Create `src/mock/fixtures/user.ts` with mock user data
    - Export a `mockUser` object matching the `OidcUser` interface (`sub`, `email`, `name`)
    - _Requirements: 4.1_

  - [x] 2.2 Create `src/mock/mock-auth-provider.tsx`
    - Implement a React context provider that mirrors the `AuthContextValue` interface
    - Set `isAuthenticated: true`, `isLoading: false`, `isSessionExpired: false`
    - Provide the mock user from fixtures
    - Implement `getAccessToken` returning a static `"mock-access-token"` string
    - Implement `login`, `logout`, `silentRefresh` as no-op functions
    - Reuse the same `AuthContext` from `auth-provider.tsx` (or export the context) so `useAuth()` works
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ]* 2.3 Write unit tests for MockAuthProvider
    - Test that `useAuth()` within MockAuthProvider returns `isAuthenticated: true`
    - Test that `getAccessToken()` returns a string
    - Test that `login()`, `logout()`, `silentRefresh()` don't throw
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 3. Wire mock auth into App.tsx
  - [x] 3.1 Update `src/App.tsx` to conditionally render MockAuthProvider
    - Import `isMockMode` from `./mock`
    - Import `MockAuthProvider` from `./mock/mock-auth-provider`
    - Use `isMockMode()` to select between `MockAuthProvider` and `AuthProvider`
    - AuthGuard will pass through since `isAuthenticated` is always true in mock mode
    - _Requirements: 2.3, 1.1_

- [x] 4. Checkpoint - Verify auth mock works
  - Ensure all tests pass, ask the user if questions arise.
  - At this point, running with `VITE_MOCK=true` should render the app without auth errors.

- [x] 5. Create mock API client with handler registry
  - [x] 5.1 Create `src/mock/mock-api-client.ts`
    - Implement a handler registry: `registerMockHandler(method, path, handler)`
    - Implement `enableMockApi()` that patches `apiClient` methods (`get`, `post`, `put`, `patch`, `delete`)
    - Patched methods: look up handler by method+path, wait 50-100ms, resolve with handler return value
    - If no handler registered: reject with descriptive error message
    - Store original methods for potential `disableMockApi()` cleanup
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write unit tests for mock API client
    - Test registering a handler and calling the matching method returns mock data
    - Test calling an unregistered path rejects with descriptive error
    - Test responses are async (resolved via Promise)
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Create fixture files and wire mock API setup
  - [x] 6.1 Create `src/mock/fixtures/dashboard.ts`
    - Export `mockProjects` (array of 3-4 projects), `mockTasks` (5-6 tasks), `mockTeamMembers` (3-4 members)
    - Use realistic data matching expected API response shapes
    - _Requirements: 4.2_

  - [x] 6.2 Create `src/mock/fixtures/onboarding.ts`
    - Export `mockOrgTypes` (3-4 organization types) and `mockRoles` (4-5 roles)
    - _Requirements: 4.3_

  - [x] 6.3 Create `src/mock/setup.ts` orchestration module
    - Import handler registry and fixture data
    - Register mock handlers for all known endpoints
    - Call `enableMockApi()` to activate interception
    - _Requirements: 3.1, 3.4, 4.4_

  - [x] 6.4 Add dynamic import of mock setup in the app bootstrap
    - In `src/App.tsx` (or `src/main.tsx`), dynamically import `./mock/setup` when `isMockMode()` is true
    - Ensure the import resolves before the app renders (use top-level await or conditional init pattern)
    - _Requirements: 3.4, 5.1, 5.3_

- [x] 7. Add mock mode visual indicator
  - [x] 7.1 Create `src/mock/MockIndicator.tsx`
    - Render a fixed-position badge ("MOCK MODE") in the bottom-left corner
    - Use Tailwind classes: amber background, white text, rounded, z-50
    - _Requirements: 6.2_

  - [x] 7.2 Render MockIndicator in App.tsx conditionally
    - Show the indicator only when `isMockMode()` returns true
    - _Requirements: 6.2_

- [x] 8. Update .env.example documentation
  - [x] 8.1 Add `VITE_MOCK` entry to `.env.example`
    - Add a commented entry explaining mock mode activation
    - Default value should be commented out or empty (mock mode off by default)
    - _Requirements: 6.1_

- [x] 9. Final checkpoint - Verify full mock mode and production build
  - Ensure all tests pass, ask the user if questions arise.
  - Verify that `VITE_MOCK=true` renders the full app with mock data and shows the indicator.
  - Verify the production build (`vite build`) does not include mock modules in the output.
  - _Requirements: 5.1, 5.2, 5.3, 6.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific acceptance criteria from requirements.md
- Checkpoints ensure incremental validation
- The project uses Vitest for testing (`vitest --run`) and fast-check is available for property tests (though not needed for this feature)
- TypeScript is the implementation language (matching the existing codebase)
- All mock code lives under `src/mock/` for clear module boundaries

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["5.1", "6.1", "6.2"] },
    { "id": 5, "tasks": ["5.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["6.4", "7.2", "8.1"] }
  ]
}
```
