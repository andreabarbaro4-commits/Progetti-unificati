# Design Document: Auth Choice + Login Card

## Overview

This feature adds a Login/Sign up choice as the first card inside the existing `RegistrationCarousel`, and a Login_Card that performs a real (frontend-documented) credential check against `POST /auth/login`. Selecting Sign_Up continues into the unmodified 7-step registration flow. Selecting Login shows an email/password form; a successful submission establishes an authenticated session and navigates straight to `/dashboard`, skipping the rest of the carousel and all organization-setup phases.

The implementation is deliberately scoped to `RegistrationCarousel.tsx` and two new sibling step components. `OnboardingWizard.tsx` and `useOnboardingStore.ts` are **not modified** — the login success path never touches `phase`/`setPhase`, it navigates directly, which is also how it manages to bypass org-setup entirely.

## Architecture

```mermaid
graph TD
    RC[RegistrationCarousel] -->|index 0, authView='choice'| ACS[AuthChoiceStep]
    RC -->|index 0, authView='login'| LC[LoginCard]
    ACS -->|onSignUp: advance index 0→1| PIS[PersonalInfoStep index 1]
    ACS -->|onLogin: setAuthView 'login'| LC
    RC --> PIS
    RC --> AS[AccountStep index 2]
    RC --> SCS[SendingCodeStep index 3]
    RC --> VCS[VerifyCodeStep index 4]
    RC --> WS[WelcomeStep index 5]
    RC --> RS[RoleStep index 6]
    RC --> PUS[PhotoUploadStep index 7]

    LC -->|POST /auth/login| API[api-client.ts]
    API -->|mock mode| MLH[Mock_Login_Handler]
    API -->|real mode| Backend[future backend, out of scope]
    LC -->|on success| Auth[useAuth().establishSession]
    Auth --> AuthGuard
    LC -->|on success| Nav[navigate '/dashboard']
```

**State flow:**
1. `RegistrationCarousel` gains one new piece of local state, `authView: 'choice' | 'login'`, defaulting to `'choice'`. This is a display toggle for the card at index 0 only — it does not move `activeIndex`.
2. `activeIndex` starts at `0` as today. Index `0` now renders `AuthChoiceStep` (when `authView === 'choice'`) or `LoginCard` (when `authView === 'login'`), instead of `PersonalInfoStep`.
3. Selecting **Sign up** on `AuthChoiceStep` calls the existing `advance()` — identical to how every other step advances — moving `activeIndex` from `0` to `1`, which now renders `PersonalInfoStep`. Every step after that is unchanged, just shifted one index to the right.
4. Selecting **Login** on `AuthChoiceStep` calls `setAuthView('login')`. `activeIndex` stays `0`; the card at index 0 swaps its rendered content to `LoginCard`. No carousel slide animation happens (matches "no back button, no extra transition" simplicity of the existing carousel).
5. `LoginCard` owns its own form, submission, and error state. On success it calls `useAuth().establishSession(...)` and `useNavigate()(...)` directly — it does not call `advance()` or go through `OnboardingWizard`/`onComplete` at all. This is what makes the bypass of org-setup phases work: the login path never sets `phase` to anything, it leaves the onboarding flow entirely.

## Components and Interfaces

### RegistrationCarousel (modified)

The existing component gets four categories of changes, all driven by the same root cause: the step array grew from 7 to 8 and every existing index shifts by one.

```tsx
const CAROUSEL_CONFIG = {
  cardWidth: 448,
  cardHeight: 700,
  cardGap: 24,
  transitionDuration: 400,
  expandDuration: 500,
  collapseDuration: 400,
  welcomeStepIndex: 5, // was 4 — shifted by the new Auth_Choice_Step at index 0
}

const TOTAL_STEPS = 8 // was 7
```

**New local state:**

```tsx
const [authView, setAuthView] = useState<'choice' | 'login'>('choice')
```

**`advance()` index-dependent special cases — before → after:**

| Location | Before | After | Why |
|---|---|---|---|
| Arriving at WelcomeStep | `if (activeIndex === 3) { setActiveIndex(4); ... }` | `if (activeIndex === 4) { setActiveIndex(5); ... }` | VerifyCodeStep is now index 4 (was 3); WelcomeStep is now index 5 (was 4) |
| Leaving WelcomeStep (collapse) | `if (activeIndex === 4 && expandState === 'expanded') { ...; setActiveIndex(5); ... }` | `if (activeIndex === 5 && expandState === 'expanded') { ...; setActiveIndex(6); ... }` | WelcomeStep now index 5; RoleStep now index 6 (was 5) |
| Last-step check | `if (activeIndex >= TOTAL_STEPS - 1) { onComplete(); return }` | unchanged (uses `TOTAL_STEPS`, now correctly evaluates to `7`, i.e. PhotoUploadStep's new index) | Already index-agnostic, just benefits from `TOTAL_STEPS` being bumped to 8 |

**JSX card index — before → after** (`getCardClassName(n)` call sites, and the component each wraps):

| Step component | Old index | New index |
|---|---|---|
| *(new)* AuthChoiceStep / LoginCard | — | **0** |
| PersonalInfoStep | 0 | 1 |
| AccountStep | 1 | 2 |
| SendingCodeStep | 2 | 3 |
| VerifyCodeStep | 3 | 4 |
| WelcomeStep | 4 | 5 |
| RoleStep | 5 | 6 |
| PhotoUploadStep | 6 | 7 |

`getCardClassName(index: number)` itself is unchanged — it already computes its class purely from `index` vs `activeIndex` (`activeIndex`, `activeIndex - 1`, `activeIndex + 1`, else hidden), so it needs no logic change, only the literal index arguments passed at each call site shift by one as shown above. The `isWelcomeExpanding ? 'carousel-card hidden-card' : getCardClassName(4)` ternary for WelcomeStep becomes `getCardClassName(5)`.

**New first card (index 0):**

```tsx
{/* Step 0: AuthChoiceStep or LoginCard */}
<div className={getCardClassName(0)}>
  {authView === 'choice' ? (
    <AuthChoiceStep onSignUp={advance} onLogin={() => setAuthView('login')} />
  ) : (
    <LoginCard />
  )}
</div>
```

`onSignUp={advance}` reuses the exact same `advance` callback every other step already receives as `onNext` — Sign_Up is not a special case in the transition logic, it is a normal advance from index 0 to index 1.

No other part of `RegistrationCarousel` changes: `useResponsiveCardWidth`, the portal/expand-collapse rendering for WelcomeStep, `translateX` calculation, and the shared state (`selectedRole`, `hasPhoto`, `firstName`) are all already index-agnostic or untouched by this feature.

### AuthChoiceStep (new)

`src/features/onboarding/steps/AuthChoiceStep.tsx`

```tsx
interface AuthChoiceStepProps {
  onSignUp: () => void
  onLogin: () => void
}
```

Follows the same visual shell as `PersonalInfoStep`/`AccountStep` (Requirement 8.1): `FlowleeLogo` at top, bold title via `t()`, then two full-width buttons instead of a form — a solid black "Sign up" button (primary, matches the existing `bg-black text-white ... rounded-[16px]` submit button styling) and an outlined "Log in" button (secondary, matches the `OrgTypeStep` outlined-button pattern: `border border-black text-black rounded-[1.5rem] ... bg-transparent`), then `<StepIndicator hasNext={true} />` since there are more steps after it in the Sign_Up path.

```tsx
export function AuthChoiceStep({ onSignUp, onLogin }: AuthChoiceStepProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      <FlowleeLogo />
      <div className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black">
        {t('auth.choice_title')}
      </div>
      <div className="flex-1" />
      <div className="mt-auto flex-shrink-0 flex flex-col gap-3">
        <button type="button" onClick={onSignUp} className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors">
          {t('auth.sign_up').toUpperCase()}
        </button>
        <button type="button" onClick={onLogin} className="w-full h-[48px] border border-black text-black rounded-[16px] text-[20px] cursor-pointer bg-transparent hover:bg-gray-50 transition-colors">
          {t('auth.login').toUpperCase()}
        </button>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
```

This component has no form, no schema, no validation — it satisfies Requirement 1.2 ("exactly two selectable options") with two buttons and nothing else.

### LoginCard (new)

`src/features/onboarding/steps/LoginCard.tsx`

```tsx
// no props — fully self-contained, like AuthCallback.tsx
export function LoginCard() {}
```

Deliberately takes **no props**. Unlike every other step, it does not receive `onNext`/`advance` because a successful login does not advance the carousel — it leaves the onboarding flow entirely. It gets everything it needs from hooks:

- `useForm<LoginData>(createFormConfig(LoginSchema))` — same pattern as `AccountStep`.
- `useAuth()` — for the new `establishSession` method (see below).
- `useNavigate()` — to go to `/dashboard` on success, same as `AuthCallback.tsx`.
- Local `useState<string | null>` for the submission error message, and a `useState<boolean>` for `isSubmitting` (disables the submit button per Requirement 4.3; react-hook-form's `formState.isSubmitting` is used directly instead of a separate flag).

```tsx
export function LoginCard() {
  const { t } = useTranslation()
  const { establishSession } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginData>(createFormConfig(LoginSchema))

  const onSubmit = async (data: LoginData) => {
    setError(null) // Requirement 5.3: clear previous error before the new request
    try {
      const response = await login(data)
      establishSession(response.user, response.accessToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.something_went_wrong'))
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      <FlowleeLogo />
      <div className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black">
        {t('auth.login_title')}
      </div>
      <form className="w-full flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup error={errors.email?.message} htmlFor="email" label={t('email')}>
          <input id="email" type="email" placeholder={t('email')}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')} />
        </FieldGroup>
        <FieldGroup error={errors.password?.message} htmlFor="password" label={t('password')}>
          <input id="password" type="password" placeholder={t('password')}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')} />
        </FieldGroup>
        {error && <p role="alert" className="text-[11px] text-red-600 mt-1">{error}</p>}
        <div className="flex-1" />
        <div className="mt-auto flex-shrink-0">
          <button type="submit" disabled={isSubmitting}
            className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {t('auth.login').toUpperCase()}
          </button>
          <StepIndicator hasNext={true} />
        </div>
      </form>
    </div>
  )
}
```

`FieldGroup` is copy-pasted the same way `AccountStep.tsx` and `PersonalInfoStep.tsx` each define their own local `FieldGroup` helper today — the codebase does not currently share this helper across step files, so this design keeps that existing (if slightly duplicated) convention rather than introducing a new shared abstraction as a side effect of this feature.

### Auth_Session integration — chosen mechanism

`AuthProvider`'s `isAuthenticated`, `getAccessToken()`, and the API client's Bearer-token wiring are all driven by exactly two pieces of React state: `user` and `accessToken`. Every existing way of becoming authenticated — initial `mgr.getUser()`, the `userLoaded` OIDC event, and `silentRefresh()` — all funnel into the same two setters, `setUser(...)` / `setAccessToken(...)`.

**Decision:** add one new method to `AuthContextValue`, `establishSession(user: OidcUser, accessToken: string): void`, implemented in `AuthProvider` as a call to those same two setters. `LoginCard` calls it directly after a successful `POST /auth/login`.

```tsx
export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  user: OidcUser | null;
  getAccessToken(): string | null;
  login(returnTo?: string): void;
  logout(): Promise<void>;
  silentRefresh(): Promise<boolean>;
  establishSession(user: OidcUser, accessToken: string): void; // new
}
```

```tsx
const establishSession = useCallback((newUser: OidcUser, newAccessToken: string): void => {
  setUser(newUser);
  setAccessToken(newAccessToken);
}, []);
```

Rejected alternatives and why:
- **Seeding the `UserManager`/`oidc-client-ts` session store**: `oidc-client-ts`'s `User` type requires an OIDC id-token/profile shape and is meant to be constructed from a real authorization code exchange. Fabricating one to satisfy `mgr.getUser()` would mean maintaining a second, parallel "fake OIDC user" construction path with no real protocol backing it, for zero benefit — nothing downstream reads from the `UserManager` directly except `AuthProvider` itself, which we already control.
- **Writing to `sessionStorage`**: `AuthGuard`/`useAuth` never read `sessionStorage` for auth state — `AuthProvider` uses an in-memory `InMemoryStorage` class specifically so tokens are never persisted to `sessionStorage`/`localStorage` (see the existing comment: "Tokens are NEVER persisted to localStorage or cookies"). Writing the session there would be invisible to `AuthGuard` and would contradict that existing security property.

This keeps a single source of truth for "who is logged in" regardless of whether the session came from Auth0/OIDC or from the password-login contract, and it requires zero changes to `AuthGuard.tsx` — `isAuthenticated` continues to mean exactly what it always meant (`user !== null`).

`MockAuthProvider.tsx`'s `mockAuthValue` literal must add a matching `establishSession: () => {}` no-op to satisfy the (now-extended) `AuthContextValue` type — mock mode is already always-authenticated, so there is nothing for it to do.

### Login API contract and location

New file: `src/features/auth/api.ts` (colocated with `AuthProvider.tsx`/`AuthGuard.tsx` in the `auth` feature, mirroring how `schemas.ts` is colocated with the `onboarding` feature's steps). `api-client.ts` itself stays a generic, domain-agnostic transport wrapper — it defines no endpoint-specific types today (compare: `Client`, `Project`, etc. all live in `mock/fixtures/types.ts`, never in `api-client.ts`), so this design keeps that separation and does not add login-specific types there.

```tsx
// src/features/auth/api.ts
import { apiClient } from '../../lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserProfile {
  id: string;
  email: string;
  name: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  user: LoginUserProfile;
}

/**
 * POST /auth/login (Login_Contract).
 * Success: 200 with { accessToken, user: { id, email, name } }.
 * Failure: 401 with a JSON body `{ message: string }` — api-client.ts already
 * extracts `errorBody.message` into the thrown ApiError, so callers only need
 * to catch and read `error.message`.
 */
export function login(request: LoginRequest): Promise<LoginSuccessResponse> {
  return apiClient.post<LoginSuccessResponse, LoginRequest>(
    '/auth/login',
    request,
    { requireAuth: false },
  );
}
```

`LoginCard` imports `login` and `LoginRequest`/`LoginSuccessResponse` from this module, not from `api-client.ts` directly. This satisfies Requirement 6.1 ("via the existing API_Client") because `login()` is a thin wrapper that still routes every call through `apiClient.post`.

### Mock_Login_Handler and Mock_Credentials

New fixture: `src/mock/fixtures/loginCredentials.ts`, following the flat, plain-array fixture convention used by `mock/fixtures/authUsers.ts`:

```tsx
// src/mock/fixtures/loginCredentials.ts
import type { LoginUserProfile } from '../../features/auth/api';

export interface MockLoginCredential {
  email: string;
  password: string;
  profile: LoginUserProfile;
}

// Seeded credentials for the mock POST /auth/login handler (Req 7).
// The first entry intentionally reuses the same identity as the always-on
// MockAuthProvider user (see ./user.ts) so a manual login in a mock build
// produces a consistent, already-familiar profile.
export const mockLoginCredentials: MockLoginCredential[] = [
  {
    email: 'dev@flowlee.local',
    password: 'password123',
    profile: { id: 'mock-user-001', email: 'dev@flowlee.local', name: 'Mock Developer' },
  },
  {
    email: 'priya.sharma@flowlee.io',
    password: 'password123',
    profile: { id: 'authuser-2', email: 'priya.sharma@flowlee.io', name: 'Priya Sharma' },
  },
];
```

Registration, added to `src/mock/setup.ts` alongside the other `registerMockHandler` calls (exact-string path, matching the convention used for `/clients`, `/team`, etc. — no dynamic segment is needed here):

```tsx
// ---------------------------------------------------------------------------
// Auth — login (Req 7)
// ---------------------------------------------------------------------------

registerMockHandler('POST', '/auth/login', (body) => {
  const { email, password } = body as LoginRequest;
  const match = mockLoginCredentials.find(
    (c) => c.email === email && c.password === password,
  );
  if (!match) {
    throw new Error('Invalid email or password');
  }
  return {
    accessToken: `mock-access-token-${match.profile.id}`,
    user: match.profile,
  } satisfies LoginSuccessResponse;
});
```

This follows the exact same "look up an entry, `throw new Error(...)` when not found" convention already used by e.g. the `/clients/:id` `PUT` handler. Because `mock-api-client.ts`'s patched `apiClient.post` is an `async` function that calls `entry.handler(body, path)` without its own `try/catch`, a thrown `Error` here becomes a rejected `Promise` — which is exactly what `LoginCard`'s `catch (err)` block already normalizes via `err instanceof Error ? err.message : ...`. This is why `LoginCard` does not need to special-case "mock 401" vs "real 401" vs "network error": all three surface as a rejected promise with a `.message`, satisfying Requirements 5.1 and 5.2 with the same code path.

`setup.ts` is only ever imported when `isMockMode()` is true (see `main.tsx`'s `if (isMockMode()) { await import('./mock/setup') }`), which is what satisfies Requirement 7.1 — no explicit `isMockMode()` check is needed inside `setup.ts` itself, matching every other handler already registered there.

## Data Models

### LoginData (form-local, `onboarding/schemas.ts`)

```tsx
export const LoginSchema = z.object({
  email: z.string().min(1, 'validation.required').email('validation.email_invalid'),
  password: z.string().min(1, 'validation.required'),
});

export type LoginData = z.infer<typeof LoginSchema>;
```

Password uses `min(1)` (any non-empty string), not `min(8)` like `AccountSchema` — Requirement 3 only asks that login rejects an *empty* password; it does not impose a strength rule for the login form (unlike sign-up's password creation, which already has its own `min(8)` rule in `AccountSchema`, untouched by this feature).

### Login_Contract (`features/auth/api.ts`)

| | Shape |
|---|---|
| Request | `POST /auth/login` — `{ email: string; password: string }` |
| Success (200) | `{ accessToken: string; user: { id: string; email: string; name: string } }` |
| Failure (401) | JSON body `{ message: string }` (consumed by `api-client.ts`'s existing `errorBody.message` handling into `ApiError.message`) |

### Mock_Credentials (`mock/fixtures/loginCredentials.ts`)

`MockLoginCredential[]` — array of `{ email, password, profile: { id, email, name } }`, seeded with 2 entries (see above).

### RegistrationCarousel step index map (post-change)

| Index | Component |
|---|---|
| 0 | `AuthChoiceStep` or `LoginCard` (toggled by `authView`) |
| 1 | `PersonalInfoStep` |
| 2 | `AccountStep` |
| 3 | `SendingCodeStep` |
| 4 | `VerifyCodeStep` |
| 5 | `WelcomeStep` |
| 6 | `RoleStep` |
| 7 | `PhotoUploadStep` |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The prework analysis (see below) found that most acceptance criteria in this feature are one-shot UI/wiring assertions (mount behavior, button click → callback, static rendering, error-message pass-through) best covered by example-based tests. Five criteria involve pure functions over a real input space — schema validation and mock-credential matching — and are captured as properties below. Two pairs of criteria were consolidated during reflection because they were "iff" halves of the same underlying rule.

### Property 1: Email field validation is exactly "non-empty and valid email format"

For any password string and any email string, `LoginSchema` validation succeeds on the email field if and only if the email string is non-empty and matches a valid email format.

**Validates: Requirements 3.2, 3.3**

### Property 2: Password field validation is exactly "non-empty"

For any syntactically valid email string and any password string, `LoginSchema` validation succeeds on the password field if and only if the password string is non-empty.

**Validates: Requirements 3.4**

### Property 3: A valid submission sends exactly one Login_Request with the submitted values

For any syntactically valid email and any non-empty password, submitting `LoginCard` with those values results in exactly one call to `login()` (the `POST /auth/login` wrapper) whose request body's `email` and `password` are unchanged from the submitted values.

**Validates: Requirements 3.5**

### Property 4: Establishing a session from a successful response makes that exact user authenticated

For any successful `Login_Contract` response payload (any `accessToken` string and any `user` profile with `id`, `email`, `name`), calling `establishSession(user, accessToken)` results in `isAuthenticated` becoming `true` and the auth context's `user` matching exactly the profile passed in.

**Validates: Requirements 4.1**

### Property 5: Mock_Login_Handler accepts if and only if the credential pair is seeded

For any email/password pair, `Mock_Login_Handler` returns a successful response containing the matching profile if and only if that exact `(email, password)` pair equals an entry in `Mock_Credentials`; for every other pair it returns a failure (a rejected call).

**Validates: Requirements 7.2, 7.3**

## Error Handling

- **Client-side validation failures (Req 3.2–3.4)**: `LoginSchema` + `createFormConfig` (via `zodResolver`) prevent `handleSubmit`'s inner callback from ever running; `react-hook-form` populates `errors.email`/`errors.password`, rendered through the same `FieldGroup` fixed-height error slot pattern used by every other step. No network call is made.
- **Note on mock mode and client-side validation**: `createFormConfig` already bypasses the zod resolver entirely when `isMockMode()` is true ("all forms are progressible without filling mandatory fields" — existing, feature-wide behavior, not something this feature changes). In a mock build, an empty/invalid submission on `LoginCard` will therefore reach `login()` directly rather than being blocked client-side, and will be rejected by `Mock_Login_Handler`'s credential match instead. Requirements 3.2–3.4 are still fully covered by testing `LoginSchema` directly (see Testing Strategy) independent of this mock-mode bypass.
- **Login_Contract failure response (401) (Req 5.1)**: `apiClient.post` throws an `ApiError` whose `.message` is read from the response body's `message` field. `LoginCard`'s `catch` block sets `error` to `err.message` and re-renders `LoginCard` — no navigation occurs, matching "SHALL remain on Login_Card."
- **Network error (Req 5.2)**: `apiClient`'s internal `fetch` throws inside a `try/catch`, producing an `ApiError` with `status: null`; this surfaces to `LoginCard`'s `catch` block identically to the 401 case — same message-based display, same "remain on Login_Card" outcome.
- **Mock failure (Req 5.1 in mock builds)**: `Mock_Login_Handler` throws a plain `Error('Invalid email or password')`, which the mocked `apiClient.post` re-throws as a rejected promise — again landing in the same `catch` block, so `LoginCard` needs no mock-vs-real branching.
- **Resubmission after failure (Req 5.3)**: `onSubmit` calls `setError(null)` as its first statement, before calling `login()`, so the old message is cleared synchronously and never briefly shown alongside a new pending request.
- **Duplicate submission while pending (Req 4.3)**: the submit `<button>` uses `disabled={isSubmitting}` from `react-hook-form`'s `formState`, which is `true` for the duration of the `handleSubmit` promise (covers both the `login()` call and the `establishSession`/`navigate` calls that follow it).
- **`establishSession` called with a malformed/partial profile**: out of scope — the shape is guaranteed by `LoginSuccessResponse`'s TypeScript type and by `Mock_Login_Handler` always returning a full seeded profile; a real backend violating its own documented contract is a backend bug, not a frontend error case to handle defensively here.

## Testing Strategy

**Property tests**: `fast-check` (already a dev dependency) with a minimum of 100 runs per property, each tagged with a comment referencing its design property, e.g.:

```tsx
// Feature: auth-choice-login-card, Property 1: Email field validation is exactly "non-empty and valid email format"
```

- Property 1 and 2 test `LoginSchema.safeParse(...)` directly (pure function, no component, no mock-mode concerns) using `fast-check` arbitraries for arbitrary strings plus a dedicated `fc.emailAddress()`-shaped valid-email arbitrary to guarantee positive cases are exercised alongside `fc.string()` for the negative space.
- Property 3 renders `LoginCard` with `@testing-library/react`, mocks `../../auth/api`'s `login` export (`vi.fn()`), fills the form with generated valid email/password pairs, submits, and asserts the mock's single call argument. Uses real `AccountSchema`-style form interaction (not mock mode) so the resolver actually runs.
- Property 4 calls `establishSession` on a test-rendered `AuthProvider` (via a small test harness component that consumes `useAuth()`) with generated profiles and asserts `isAuthenticated`/`user`.
- Property 5 calls the registered `/auth/login` mock handler function directly (or through `apiClient.post` with `enableMockApi()` active) with generated email/password pairs, asserting success iff the pair matches an entry in a small fixed `Mock_Credentials`-shaped fixture used only in the test.

**Unit tests** (`vitest` + `@testing-library/react`), covering the example/edge-case items from the prework that are not properties:

- `RegistrationCarousel` mounts with `AuthChoiceStep` visible at index 0 (Req 1.1); exactly two buttons are rendered (Req 1.2).
- Clicking Sign_Up advances to `PersonalInfoStep` at index 1 (Req 1.3); clicking Login swaps to `LoginCard` without changing `activeIndex` (Req 1.4).
- Regression: the existing 7 steps still render in order at their new indices 1–7, and `PhotoUploadStep` completion still triggers `onComplete` → `OnboardingWizard` phase transition to `org-type`, unchanged (Req 2.1, 2.2) — achieved by updating (not rewriting) the existing `RegistrationCarousel` tests to shift expected indices by one.
- `LoginCard` renders an email input, a password input, and a submit button (Req 3.1).
- On a successful `login()` mock resolution, `navigate` is called with `/dashboard` exactly once (Req 4.2).
- On a rejected `login()` mock (network-style rejection with no `.message`), the fallback `error.something_went_wrong` message is shown and `navigate` is never called (Req 5.2).
- Resubmitting after a failure clears the old error message before the new pending state begins (Req 5.3).
- `login()` in `features/auth/api.ts` calls `apiClient.post` with path `/auth/login` and a `{ email, password }` body (Req 6.1) — a spy-based test on `apiClient.post`.
- `registerMockHandler` is called for `POST '/auth/login'` when `src/mock/setup.ts` is imported (Req 7.1) — asserted the same way other handlers in that file would be (importing the module and checking the mocked `apiClient.post` resolves for that path).
- `en.json`/`it.json` both contain every new `auth.*` key referenced by `AuthChoiceStep`/`LoginCard` (Req 8.3) — a small script/test that greps the component source for `t('auth....')` calls and asserts each key exists in both locale files.

Both approaches are complementary: property tests exhaustively cover the validation and matching logic across a wide input space; unit tests cover the fixed, non-input-varying UI wiring and regression surface (index shifts, navigation, i18n key presence) that property tests would not add value for.
