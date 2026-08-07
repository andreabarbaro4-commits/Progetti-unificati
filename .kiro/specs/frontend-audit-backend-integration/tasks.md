# Implementation Plan: Frontend Audit & Backend Integration

## Overview

This plan migrates the Flowlee frontend from a prototype-quality single-file React SPA into a production-ready application with proper routing, state management, API integration, authentication, and deployment infrastructure. Implementation follows the 6-phase strategy defined in the design document, with each phase building on the previous one.

Package manager: **npm** (not Bun). Language: **TypeScript**.

## Tasks

- [x] 1. Phase 1 — Cleanup and Policy Enforcement
  - [x] 1.1 Remove quality tooling files and packages
    - Delete `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `commitlint.config.js`
    - Delete the `.husky/` directory entirely
    - Remove `bun.lock` or `bun.lockb` if present
    - Remove the `"packageManager": "bun@1.3.11"` field from `package.json`
    - Remove scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `prepare` from `package.json`
    - Remove all quality-related devDependencies: `eslint`, `eslint-config-prettier`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `@eslint/js`, `globals`, `typescript-eslint`, `prettier`, `prettier-plugin-tailwindcss`, `husky`, `@commitlint/cli`, `@commitlint/config-conventional`
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.2 Simplify TypeScript configuration
    - Remove `tsconfig.node.json`
    - Remove project references from `tsconfig.json` that point to `tsconfig.node.json`
    - Update build script if needed: ensure `tsc -b && vite build` still works with the simplified config
    - Merge any needed compiler options from `tsconfig.node.json` into `tsconfig.app.json`
    - _Requirements: 2.7, 2.8_

  - [x] 1.3 Consolidate to npm and verify build
    - Run `rm -rf node_modules bun.lock bun.lockb`
    - Run `npm install` to regenerate `package-lock.json`
    - Run `npm run build` and verify exit code 0 and `dist/` output
    - Confirm no `bun.lock`, `bun.lockb`, `yarn.lock`, or `pnpm-lock.yaml` exist
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.4 Create no-quality-tooling steering document
    - Create `.kiro/steering/no-quality-tooling.md` with `inclusion: auto` frontmatter
    - List all prohibited tool categories: test runners, linters, formatters, type-check scripts, pre-commit hooks, commit linters
    - State rationale referencing team decision for this phase
    - Include AI instructions: no quality devDeps, no test files, no config for prohibited tools
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Checkpoint — Verify Phase 1
  - Ensure `npm install && npm run build` exits 0
  - Verify no quality tooling files remain
  - Ask the user if questions arise.

- [x] 3. Phase 2 — Project Structure and Routing
  - [x] 3.1 Refactor App.tsx into feature-based modules
    - Extract onboarding steps into `src/features/onboarding/` (keep existing structure but wire to router)
    - Reduce `src/App.tsx` to only render root providers (StrictMode, QueryClientProvider, BrowserRouter, AuthProvider)
    - Move shared i18n setup to `src/lib/i18n.ts`
    - Ensure `src/main.tsx` remains the single React root render call
    - Create `src/stores/` directory for global UI state
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.2 Install React Router and create route configuration
    - Install `react-router-dom` via npm
    - Create `src/routes.tsx` as the single route configuration file
    - Define route definitions with `path`, `component` (lazy-loaded), `isPublic` flag, and optional `label`
    - Add routes for: onboarding (`/`), auth callback (`/auth/callback`), dashboard (`/dashboard`), and 404 catch-all
    - _Requirements: 5.1, 5.2_

  - [x] 3.3 Create auth guard component (placeholder)
    - Create `src/features/auth/auth-guard.tsx` as a placeholder that currently allows all access
    - The guard should check the `isPublic` flag from route definitions
    - When auth is not wired yet, default to allowing access (will be connected in Phase 4)
    - _Requirements: 5.4_

  - [x] 3.4 Create 404 Not Found page
    - Create a dedicated 404 page component
    - Display a message indicating the page does not exist
    - Provide a navigation link back to the home route
    - Wire into the route config as the catch-all (`*`) route
    - _Requirements: 5.3_

  - [x] 3.5 Wire routing into App shell
    - Update `src/App.tsx` to render `BrowserRouter` and `AppRoutes` component
    - `AppRoutes` reads from `src/routes.tsx` and renders routes with `React.Suspense` for lazy loading
    - Apply auth guard wrapper to non-public routes
    - Verify all defined routes are reachable (no dead routes)
    - _Requirements: 5.2, 5.5_

- [x] 4. Checkpoint — Verify Phase 2
  - Ensure `npm run build` passes
  - Verify routing works: each route renders its component
  - Ask the user if questions arise.

- [x] 5. Phase 3 — State Management and API Client
  - [x] 5.1 Create typed API client
    - Create `src/lib/api-client.ts` as a typed fetch wrapper
    - Read base URL from `VITE_API_BASE_URL` environment variable
    - Throw at module init if `VITE_API_BASE_URL` is missing
    - Implement typed generics for GET, POST, PUT, PATCH, DELETE methods
    - Implement 401 handling: attempt silent refresh, retry once, then redirect to login
    - Throw structured `ApiError` for non-2xx responses (status, message, url, method)
    - Throw structured `ApiError` with `status: null` for network errors
    - Attach Bearer token from auth module when available; omit for public endpoints
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 5.2 Configure TanStack Query
    - Install `@tanstack/react-query` via npm
    - Create `src/lib/query-client.ts` with `QueryClient` configuration: staleTime 5min, retry 3 for queries, retry 0 for mutations
    - Add `QueryClientProvider` to `src/App.tsx` root providers
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 5.3 Set up Zustand stores
    - Install `zustand` via npm
    - Create `src/features/onboarding/store.ts` with onboarding-specific state (activeStep, selectedRole)
    - Create `src/stores/ui-store.ts` for global UI state (sidebar collapsed, theme)
    - Expose state changes only through named action functions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Checkpoint — Verify Phase 3
  - Ensure `npm run build` passes
  - Verify API client module loads without errors (with env var set)
  - Ask the user if questions arise.

- [x] 7. Phase 4 — Authentication Integration
  - [x] 7.1 Install OIDC library and create auth provider
    - Install `oidc-client-ts` via npm
    - Create `src/features/auth/auth-provider.tsx` with React context exposing: `isAuthenticated`, `isLoading`, `user`, `getAccessToken()`, `login()`, `logout()`, `silentRefresh()`
    - Read `VITE_AUTH_AUTHORITY` and `VITE_AUTH_CLIENT_ID` from environment
    - Configure Authorization Code + PKCE flow
    - Store access token in memory only (not localStorage or cookies)
    - _Requirements: 9.1, 9.3_

  - [x] 7.2 Create callback handler and token lifecycle
    - Create `src/features/auth/callback.tsx` to handle OIDC redirect with authorization code
    - Exchange code for tokens, store in memory, redirect to originally requested URL
    - Implement silent refresh via hidden iframe or refresh token
    - On refresh failure: discard tokens, redirect to login
    - _Requirements: 9.3, 9.4, 9.5_

  - [x] 7.3 Wire auth guard to real OIDC state
    - Update `src/features/auth/auth-guard.tsx` to check real `isAuthenticated` from auth context
    - Redirect unauthenticated users to Auth0 login, persisting the requested URL
    - Implement logout: revoke session, clear tokens, redirect to root
    - _Requirements: 9.2, 9.5, 9.6_

  - [x] 7.4 Connect API client to auth module
    - Wire `getAccessToken()` from auth provider into the API client's token attachment logic
    - Ensure 401 → silent refresh → retry flow works end-to-end
    - _Requirements: 6.4, 6.7, 9.4_

- [x] 8. Checkpoint — Verify Phase 4
  - Ensure `npm run build` passes with auth env vars defined
  - Verify auth provider mounts without errors
  - Ask the user if questions arise.

- [x] 9. Phase 5 — Environment Configuration and Documentation
  - [x] 9.1 Create environment validation module
    - Create `src/env.ts` that validates `VITE_API_BASE_URL`, `VITE_AUTH_AUTHORITY`, `VITE_AUTH_CLIENT_ID` at module init
    - Throw descriptive error listing missing variables if any are undefined or empty
    - Export typed `env` object for use throughout the app
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 9.2 Create .env.example file
    - Create `.env.example` at repository root
    - List all required `VITE_` variables with placeholder values and inline comments
    - _Requirements: 10.4_

  - [x] 9.3 Write README.md
    - Include sections: project overview, prerequisites (Node 20+, npm), local setup instructions, available scripts, environment variable reference, deployment summary
    - Ensure step-by-step from clone to running dev server is documented
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 9.4 Write docs/architecture.md
    - Create `docs/` directory
    - Include sections: project structure, routing strategy, state management (TanStack Query + Zustand), API client design, authentication flow, environment configuration strategy
    - Include a Mermaid component/layer diagram showing data flow
    - Each section includes "Decision Rationale" subsection
    - Include revision history table at the top
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 9.5 Write docs/deployment.md
    - Describe four stages: flowlee-dev, flowlee-test, flowlee-preprod, flowlee-prod
    - List CDK stack resources (S3, CloudFront, OAC, ACM, Route 53)
    - Document GitHub Actions pipeline stages in execution order
    - Describe approval gates and who can approve
    - Include rollback procedures for each stage
    - Document CloudFront SPA routing (custom error responses for 403/404)
    - Include table mapping stage → AWS account/environment → deployment trigger
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 10. Checkpoint — Verify Phase 5
  - Ensure `npm run build` passes with `.env.example` values (or env vars set)
  - Verify all documentation files exist at expected paths
  - Ask the user if questions arise.

- [x] 11. Phase 6 — Infrastructure and CI/CD
  - [x] 11.1 Initialize CDK project
    - Create `infra/` directory at repository root
    - Initialize with `cdk.json`, `package.json`, `tsconfig.json`
    - Install CDK dependencies: `aws-cdk-lib`, `constructs`
    - _Requirements: 14.7_

  - [x] 11.2 Implement FrontendStack CDK construct
    - Create `infra/lib/frontend-stack.ts`
    - Provision S3 bucket with BlockPublicAccess.BLOCK_ALL and S3-managed encryption
    - Provision CloudFront distribution with OAC
    - Configure bucket policy allowing only CloudFront access
    - Configure custom error responses: 403→/index.html 200, 404→/index.html 200, TTL 0s
    - Provision ACM certificate in us-east-1 with DNS validation
    - Configure Route 53 A and AAAA alias records
    - Accept stage name as constructor prop for resource namespacing
    - Output CloudFront distribution domain and S3 bucket name as stack outputs
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9_

  - [x] 11.3 Create CDK app entry point
    - Create `infra/bin/app.ts` that instantiates `FrontendStack` with stage context
    - Ensure `cdk synth` runs successfully
    - _Requirements: 14.7_

  - [x] 11.4 Create GitHub Actions deployment workflow
    - Create `.github/workflows/deploy.yml`
    - Build job: checkout, setup Node 20, `npm ci`, `npm run build` with stage-specific env vars, upload artifact
    - Deploy-dev job: auto-deploy on push to main, `aws s3 sync`, `aws cloudfront create-invalidation --paths "/*"`
    - Deploy-test job: requires manual approval after dev succeeds
    - Deploy-preprod job: requires manual approval after test succeeds
    - Deploy-prod job: requires manual approval after preprod succeeds
    - Use GitHub environment protection rules for approval gates (72h timeout)
    - Each deploy stage rebuilds with stage-specific `VITE_` env vars
    - Fail and halt on any non-zero exit code
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_

- [x] 12. Final Checkpoint
  - Ensure `npm run build` passes in the app root
  - Ensure `cd infra && npm install && npx cdk synth` passes
  - Verify GitHub Actions workflow YAML is valid
  - Verify all required files exist at expected paths
  - Ask the user if questions arise.

## Notes

- This feature does NOT include property-based tests. The design explicitly states PBT is not applicable (IaC, CI/CD config, project restructuring, integration wiring).
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation between phases.
- The auth guard in Phase 2 is a placeholder; it gets wired to real OIDC state in Phase 4.
- All `npm install` commands use exact versions pinned in `package-lock.json` via `npm ci` in CI.
- The API client is created before auth is wired — it will initially work without token attachment until Phase 4 connects them.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.4"] },
    { "id": 5, "tasks": ["3.3", "3.5"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 7, "tasks": ["7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3"] },
    { "id": 9, "tasks": ["7.4"] },
    { "id": 10, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["11.2", "11.4"] },
    { "id": 13, "tasks": ["11.3"] }
  ]
}
```
