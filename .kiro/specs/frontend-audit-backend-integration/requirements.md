# Requirements Document

## Introduction

This document defines requirements for auditing and remediating the Flowlee frontend repository to prepare it for backend integration. The scope covers project health cleanup (consolidating to npm, removing quality tooling), routing completeness, introducing a typed API client layer with TanStack Query and Zustand, enforcing a no-quality-tooling policy via steering documents, producing developer documentation, and deploying to AWS via CDK (S3 + CloudFront + OAC) across four stages.

## Glossary

- **Frontend_App**: The Flowlee React single-page application built with Vite and TypeScript
- **Build_Pipeline**: The GitHub Actions CI/CD workflow that builds and deploys the Frontend_App
- **API_Client**: A thin fetch-based HTTP wrapper that attaches authentication tokens and reads the base URL from environment configuration
- **Server_State_Manager**: TanStack Query instance responsible for caching, fetching, and synchronizing remote server data
- **Client_State_Manager**: Zustand store(s) responsible for managing local UI state not derived from the server
- **Auth_Provider**: Auth0 OIDC identity provider that issues access tokens for authenticated API requests
- **CDK_Stack**: AWS CDK infrastructure-as-code defining S3, CloudFront, OAC, ACM, and Route 53 resources for static hosting
- **Steering_Document**: A `.kiro/steering/` file that durably encodes project policy for AI-assisted tooling
- **Route_Table**: The complete mapping of URL paths to React components, including guards and fallback behavior
- **Stage**: One of four deployment environments: flowlee-dev, flowlee-test, flowlee-preprod, flowlee-prod

## Requirements

### Requirement 1: Single Package Manager

**User Story:** As a developer, I want the project to use exactly one package manager (npm), so that dependency resolution is deterministic and onboarding is frictionless.

#### Acceptance Criteria

1. THE Frontend_App SHALL use npm as the sole package manager, with a committed `package-lock.json` file present at the repository root
2. WHEN a developer clones the repository and runs `npm install && npm run build`, THE Frontend_App SHALL complete both commands with exit code 0 and produce a `dist/` directory
3. THE Frontend_App SHALL NOT contain `bun.lock`, `bun.lockb`, `yarn.lock`, or `pnpm-lock.yaml` files at the repository root
4. THE Frontend_App SHALL retain the standard npm lockfile approach (`package-lock.json`) without declaring a `"packageManager"` field for an alternative package manager in `package.json`

---

### Requirement 2: Quality Tooling Removal

**User Story:** As a team lead, I want all linting, formatting, type-checking scripts, and pre-commit hooks removed, so that the team operates without automated quality gates during this phase.

#### Acceptance Criteria

1. THE Frontend_App SHALL NOT contain ESLint configuration files (`eslint.config.js`, `.eslintrc.*`)
2. THE Frontend_App SHALL NOT contain Prettier configuration files (`.prettierrc.*`, `.prettierignore`)
3. THE Frontend_App SHALL NOT contain Husky hooks directory (`.husky/`)
4. THE Frontend_App SHALL NOT contain commitlint configuration (`commitlint.config.js`)
5. THE Frontend_App SHALL NOT include `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, or `prepare` scripts in `package.json`
6. THE Frontend_App SHALL NOT include ESLint, Prettier, Husky, commitlint, or any of their plugin/config packages (including but not limited to `eslint-config-*`, `eslint-plugin-*`, `prettier-plugin-*`, `typescript-eslint`, `@eslint/*`, `@commitlint/*`, and `globals`) in `devDependencies` or `dependencies`
7. WHEN all quality tooling files and packages have been removed, THE Frontend_App `build` script (`tsc -b && vite build`) SHALL complete successfully without depending on any removed package
8. THE Frontend_App SHALL NOT contain a `tsconfig.node.json` or TypeScript project references used exclusively for type-checking scripts; TypeScript SHALL be retained only if required by the build step

---

### Requirement 3: No-Quality-Tooling Steering Document

**User Story:** As a developer using AI-assisted tooling, I want a steering document that enforces the no-test/no-lint/no-format policy, so that automated suggestions do not reintroduce removed tooling.

#### Acceptance Criteria

1. THE Frontend_App SHALL contain a steering document at `.kiro/steering/no-quality-tooling.md` with valid Kiro steering frontmatter specifying `inclusion: auto`
2. THE Steering_Document SHALL explicitly prohibit introduction of test runners (Vitest, Jest, Playwright, Cypress), linters (ESLint, Biome, stylelint), formatters (Prettier, Biome), standalone type-check scripts (`tsc --noEmit`), pre-commit hooks (Husky, lint-staged), and commit message linters (commitlint)
3. THE Steering_Document SHALL state the rationale for this policy by referencing the team decision to operate without automated quality gates during this project phase
4. THE Steering_Document SHALL instruct AI tooling to not suggest adding quality-related `devDependencies`, not generate test files, and not create configuration files for any prohibited tool category

---

### Requirement 4: Project Structure Baseline

**User Story:** As a developer, I want a well-organized project structure with a single entry point, so that the codebase is navigable and maintainable.

#### Acceptance Criteria

1. THE Frontend_App SHALL have exactly one HTML entry point (`index.html`) at the project root
2. THE Frontend_App SHALL have exactly one React root render call in `src/main.tsx`
3. THE Frontend_App SHALL organize source code under `src/` with: feature directories (`src/features/`) containing domain-specific modules each with their own components, hooks, and types; shared components (`src/components/`) containing reusable UI elements used by 2 or more features; and shared utilities (`src/lib/`) containing framework-agnostic helper functions
4. WHEN a component file exceeds 300 lines (excluding imports and type declarations), THE Frontend_App SHALL report a linting warning identifying the file and its line count, requiring extraction into sub-components before merge approval
5. IF a file is placed directly inside `src/` rather than within `src/features/`, `src/components/`, or `src/lib/`, THEN THE Frontend_App SHALL restrict it to application-level concerns only (entry point, global providers, global styles, and configuration)

---

### Requirement 5: Route Inventory and Reachability

**User Story:** As a developer, I want a complete route table with verified reachability for every route, so that no screens are orphaned or unreachable.

#### Acceptance Criteria

1. THE Frontend_App SHALL define all URL-navigable routes in a single route configuration file that serves as the sole source of truth for path-to-component mappings
2. THE Route_Table SHALL map each URL path (including parameterized paths) to exactly one React component, and each mapping SHALL specify whether the route is public or authentication-guarded
3. WHEN a URL does not match any defined route, THE Frontend_App SHALL render a dedicated 404 Not Found page that displays a message indicating the page does not exist and provides a navigation link back to a known route
4. IF a user attempts to access an authentication-guarded route without being authenticated, THEN THE Frontend_App SHALL redirect the user to the login route instead of rendering the guarded component
5. THE Frontend_App SHALL NOT contain dead routes, where a dead route is defined as any route present in the route configuration that cannot be reached by at least one of: an in-app navigation element, a programmatic redirect from another route, or a direct URL entry

---

### Requirement 6: Typed API Client Layer

**User Story:** As a developer, I want a typed fetch wrapper that reads the API base URL from environment variables and attaches auth tokens, so that all API calls are consistent, type-safe, and environment-aware.

#### Acceptance Criteria

1. THE API_Client SHALL be a wrapper around the Fetch API, located in `src/lib/api-client.ts`, responsible only for request construction, token attachment, and error mapping
2. THE API_Client SHALL read the API base URL from the `VITE_API_BASE_URL` environment variable and prepend it to all request paths
3. IF the `VITE_API_BASE_URL` environment variable is not defined at build time, THEN THE API_Client SHALL throw an error at module initialization indicating the missing variable
4. WHEN a request is made and an Auth_Provider access token is available, THE API_Client SHALL attach the token as a `Bearer` token in the `Authorization` header
5. IF a request is made and no Auth_Provider access token is available, THEN THE API_Client SHALL omit the `Authorization` header for public endpoints and reject with an error for authenticated endpoints
6. THE API_Client SHALL provide typed request body and response generics for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
7. IF a response status is 401, THEN THE API_Client SHALL attempt one silent token refresh and retry the original request; IF the retry also returns 401, THEN THE API_Client SHALL redirect the user to the Auth_Provider login page
8. IF the server returns a non-2xx HTTP response (other than 401), THEN THE API_Client SHALL throw a structured error object containing the HTTP status code, response body message, request URL, and HTTP method
9. IF a network error occurs (no response received), THEN THE API_Client SHALL throw a structured error object containing a `null` status code, the native error message, request URL, and HTTP method

---

### Requirement 7: Server State Management with TanStack Query

**User Story:** As a developer, I want TanStack Query managing all server state, so that data fetching, caching, background refetching, and error handling are standardized.

#### Acceptance Criteria

1. THE Frontend_App SHALL use TanStack Query (`@tanstack/react-query`) for all HTTP requests to the backend API
2. THE Frontend_App SHALL configure a single `QueryClient` instance with a default stale time of 5 minutes, a retry count of 3 for failed queries, and a retry count of 0 for failed mutations
3. WHEN a screen fetches data from the backend, THE Server_State_Manager SHALL use query hooks (`useQuery`, `useMutation`) rather than manual `useEffect` + `useState` patterns
4. THE Frontend_App SHALL provide a `QueryClientProvider` at the root of the component tree
5. WHEN a mutation succeeds, THE Server_State_Manager SHALL invalidate all queries whose query key shares the same resource entity as the mutation endpoint
6. IF a query fails after exhausting all retry attempts, THEN THE Server_State_Manager SHALL expose the error state to the consuming component so that a user-visible error indication can be rendered
7. IF a mutation fails, THEN THE Server_State_Manager SHALL expose the error state to the consuming component without modifying cached query data

---

### Requirement 8: Client State Management with Zustand

**User Story:** As a developer, I want Zustand managing client-only state, so that local UI state is decoupled from server state and follows a predictable pattern.

#### Acceptance Criteria

1. THE Frontend_App SHALL use Zustand for client-side state that is not fetched from or synchronized with a remote server (e.g., UI visibility toggles, active step index, sidebar collapsed state, selected theme)
2. THE Client_State_Manager SHALL expose state changes exclusively through named action functions defined within the store, prohibiting direct state mutation from consuming components
3. THE Client_State_Manager SHALL co-locate feature-scoped store definitions with their feature directories (`src/features/<feature>/store.ts`)
4. WHEN client state is shared across multiple features and does not belong to a single feature, THE Client_State_Manager SHALL define that store in `src/stores/`
5. THE Client_State_Manager SHALL NOT duplicate data that is already managed by the Server_State_Manager (TanStack Query); if a component needs server-derived data combined with local UI state, the server data SHALL be accessed via query hooks and only the local UI portion SHALL reside in the Zustand store

---

### Requirement 9: Authentication Integration

**User Story:** As a developer, I want Auth0 OIDC integration handling login, logout, and token lifecycle, so that the app securely authenticates users against the backend.

#### Acceptance Criteria

1. THE Frontend_App SHALL configure an OIDC client using the Authorization Code flow with PKCE, reading the authority URL from `VITE_AUTH_AUTHORITY` and the client ID from `VITE_AUTH_CLIENT_ID`
2. IF a user is not authenticated WHEN the user navigates to a guarded route, THEN THE Frontend_App SHALL redirect the user to the Auth_Provider login page and persist the originally requested URL
3. WHEN the Auth_Provider redirects back with an authorization code, THE Frontend_App SHALL exchange it for tokens, store the access token in memory only (not in localStorage or cookies accessible to JavaScript), make it available to the API_Client, and redirect the user to the originally requested URL
4. WHEN an access token expires, THE Frontend_App SHALL attempt a silent token refresh via a hidden iframe or refresh token within 10 seconds
5. IF the silent token refresh fails, THEN THE Frontend_App SHALL discard all stored tokens and redirect the user to the Auth_Provider login page
6. WHEN the user triggers the logout action, THE Frontend_App SHALL revoke the session with the Auth_Provider, clear all tokens from memory, and redirect the user to the application root path

---

### Requirement 10: Environment Configuration

**User Story:** As a DevOps engineer, I want environment-specific configuration per stage, so that each deployment targets the correct backend and auth endpoints.

#### Acceptance Criteria

1. THE Frontend_App SHALL support environment variables prefixed with `VITE_` for build-time injection
2. THE Frontend_App SHALL define environment variables for at minimum: `VITE_API_BASE_URL`, `VITE_AUTH_AUTHORITY`, `VITE_AUTH_CLIENT_ID`
3. WHEN the Frontend_App is built for a specific Stage (development, staging, or production), THE Build_Pipeline SHALL inject the environment values corresponding to that Stage such that each variable resolves to a non-empty string unique to the target Stage
4. THE Frontend_App SHALL provide a `.env.example` file listing all required environment variables, each with a placeholder value and a brief inline comment describing its purpose and expected format
5. IF any required environment variable (`VITE_API_BASE_URL`, `VITE_AUTH_AUTHORITY`, `VITE_AUTH_CLIENT_ID`) is undefined or empty at build time, THEN THE Build_Pipeline SHALL fail the build and output an error message indicating which variable is missing

---

### Requirement 11: Documentation — README

**User Story:** As a new team member, I want a comprehensive README, so that I can set up the project and understand its purpose without asking colleagues.

#### Acceptance Criteria

1. THE Frontend_App SHALL contain a `README.md` at the repository root
2. THE README.md SHALL include sections for: project overview (stating the application's purpose and target users), prerequisites (listing required tooling and minimum versions), local setup instructions (step-by-step commands from clone to running app), available scripts (each script name with a one-line description), environment variable reference (listing each required variable with its purpose and example value, or explicitly stating that none are required), and deployment summary (describing the build output format and the hosting target or deploy command)
3. WHEN a developer follows the README setup instructions on a machine meeting the stated prerequisites, THE Frontend_App SHALL start its development server and serve the application entry page at the documented local URL within 60 seconds without additional undocumented steps
4. WHEN a script listed in `package.json` is added, removed, or renamed, THE README.md SHALL be updated to reflect the change before the related code change is merged

---

### Requirement 12: Documentation — Architecture

**User Story:** As a developer, I want an architecture document explaining the system's layers and decisions, so that I can make informed design choices.

#### Acceptance Criteria

1. THE Frontend_App SHALL contain a `docs/architecture.md` file
2. THE architecture document SHALL describe the following sections, each with at least one paragraph of explanation and rationale: project structure, routing strategy, state management approach (TanStack Query + Zustand), API client design, authentication flow, and environment configuration strategy
3. THE architecture document SHALL include a component/layer diagram in text-based format (e.g., Mermaid or ASCII) showing data flow from API layer through state management to UI components
4. WHEN a new section is added to the architecture document, THE section SHALL include a "Decision Rationale" subsection explaining why the chosen approach was selected over alternatives
5. THE architecture document SHALL contain a revision history table at the top listing date, author, and summary of change for each update

---

### Requirement 13: Documentation — Deployment

**User Story:** As a DevOps engineer, I want a deployment document describing the infrastructure and pipeline, so that I can operate and troubleshoot deployments.

#### Acceptance Criteria

1. THE Frontend_App SHALL contain a `docs/deployment.md` file at the repository root level
2. THE deployment document SHALL describe: the four Stages (flowlee-dev, flowlee-test, flowlee-preprod, flowlee-prod) including their purpose and environment-specific configuration differences, the CDK_Stack resources listing each AWS resource type provisioned, the GitHub Actions pipeline stages in execution order, approval gates specifying which stage transitions require manual approval and who can approve, and rollback procedures specifying step-by-step instructions to revert a failed deployment for each stage
3. THE deployment document SHALL include the CloudFront distribution behavior for SPA routing, describing the custom error response configuration that returns `index.html` with HTTP status 200 for both 403 and 404 origin error codes
4. IF the deployment document omits any of the five required sections (Stages, CDK_Stack resources, pipeline stages, approval gates, rollback procedures), THEN the document SHALL be considered incomplete
5. THE deployment document SHALL include a table or list mapping each stage name to its corresponding AWS account or environment identifier and its deployment trigger (automatic on merge vs. manual approval)

---

### Requirement 14: CDK Infrastructure Stack

**User Story:** As a DevOps engineer, I want a CDK stack provisioning S3 + CloudFront + OAC for static hosting, so that the frontend is deployed securely with edge caching.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an S3 bucket with public access blocked (BlockPublicAccess set to all) and encryption enabled at rest
2. THE CDK_Stack SHALL provision a CloudFront distribution with Origin Access Control (OAC) granting read-only access to the S3 bucket, and SHALL configure a bucket policy that allows requests only from the CloudFront distribution
3. THE CDK_Stack SHALL configure custom error responses returning `/index.html` with HTTP 200 for both 403 and 404 origin status codes, with a cache TTL of 0 seconds for error responses
4. THE CDK_Stack SHALL provision an ACM certificate in the `us-east-1` region for the custom domain, using DNS validation via Route 53
5. THE CDK_Stack SHALL configure Route 53 alias records (A and AAAA) pointing the custom domain to the CloudFront distribution
6. THE CDK_Stack SHALL accept the Stage name as a context parameter or constructor prop, and SHALL use it to namespace all resource names and tags so that multiple environments deploy independently without resource conflicts
7. THE CDK_Stack SHALL be defined in a dedicated `infra/` directory at the repository root, with its own `cdk.json` entry point
8. IF the CloudFront distribution receives a request and the S3 origin returns an error other than 403 or 404, THEN THE CDK_Stack SHALL propagate the origin error status code to the client without rewriting it
9. THE CDK_Stack SHALL output the CloudFront distribution domain name and the S3 bucket name as CloudFormation stack outputs

---

### Requirement 15: CI/CD Pipeline

**User Story:** As a DevOps engineer, I want a GitHub Actions pipeline deploying to four stages with approval gates, so that releases progress safely from development to production.

#### Acceptance Criteria

1. THE Build_Pipeline SHALL build the Frontend_App by running `npm ci && npm run build` and SHALL fail the pipeline run if either command exits with a non-zero status code
2. WHEN a commit is pushed to the main branch, THE Build_Pipeline SHALL deploy the build artifacts to the flowlee-dev Stage automatically within 10 minutes of push
3. WHEN a deployment to flowlee-dev succeeds, THE Build_Pipeline SHALL require manual approval from at least one authorized approver before deploying to flowlee-test
4. WHEN a deployment to flowlee-test succeeds, THE Build_Pipeline SHALL require manual approval from at least one authorized approver before deploying to flowlee-preprod
5. WHEN a deployment to flowlee-preprod succeeds, THE Build_Pipeline SHALL require manual approval from at least one authorized approver before deploying to flowlee-prod
6. THE Build_Pipeline SHALL use `aws s3 sync` to upload the contents of the build output directory to the Stage-specific S3 bucket, and SHALL use `aws cloudfront create-invalidation` with path `/*` to clear the CDN cache after each successful upload
7. THE Build_Pipeline SHALL inject Stage-specific environment variables during the build step, where each Stage (flowlee-dev, flowlee-test, flowlee-preprod, flowlee-prod) maintains its own set of variable values
8. IF a deployment to any Stage fails, THEN THE Build_Pipeline SHALL halt the pipeline progression, report the failure status in the GitHub Actions workflow run summary, and SHALL NOT proceed to subsequent Stages
9. IF a manual approval is not granted within 72 hours, THEN THE Build_Pipeline SHALL cancel the pending deployment request for that Stage
