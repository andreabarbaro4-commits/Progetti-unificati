import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const signinRedirectMock = vi.fn();
const getUserMock = vi.fn().mockResolvedValue(null);

vi.mock('oidc-client-ts', () => {
  const events = {
    addUserLoaded: vi.fn(),
    addUserUnloaded: vi.fn(),
    removeUserLoaded: vi.fn(),
    removeUserUnloaded: vi.fn(),
  };

  class MockWebStorageStateStore {
    constructor() {
      // no-op
    }
  }

  class MockUserManager {
    signinRedirect = signinRedirectMock;
    getUser = getUserMock;
    events = events;
  }

  return {
    UserManager: MockUserManager,
    WebStorageStateStore: MockWebStorageStateStore,
  };
});

vi.mock('../../lib/api-client', () => ({
  setTokenProvider: vi.fn(),
  setRefreshHandler: vi.fn(),
  setLoginRedirect: vi.fn(),
}));

vi.mock('../../lib/query-client', () => ({
  queryClient: { clear: vi.fn() },
}));

vi.mock('../onboarding/useOnboardingStore', () => ({
  useOnboardingStore: { getState: () => ({ reset: vi.fn() }) },
}));

// ─── Test helpers ────────────────────────────────────────────────────────────

let captured: ReturnType<typeof useAuth> | null = null;

function TestConsumer() {
  captured = useAuth();
  return null;
}

function renderWithProvider(envOverrides?: Record<string, string>) {
  // Set up import.meta.env values used by AuthProvider
  const originalEnv = { ...import.meta.env };
  Object.assign(import.meta.env, {
    VITE_AUTH_AUTHORITY: 'https://test.auth0.com',
    VITE_AUTH_CLIENT_ID: 'test-client-id',
    VITE_AUTH_AUDIENCE: 'https://api.test.com',
    ...envOverrides,
  });

  const result = render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );

  // Restore env after setup
  Object.assign(import.meta.env, originalEnv);
  return result;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthProvider.loginWithHint', () => {
  beforeEach(() => {
    captured = null;
    signinRedirectMock.mockClear();
    getUserMock.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls signinRedirect with login_hint, audience, and provided returnTo as state', async () => {
    renderWithProvider();

    // Wait for initial getUser to resolve
    await act(async () => {});

    act(() => {
      captured!.loginWithHint('user@example.com', '/onboarding');
    });

    expect(signinRedirectMock).toHaveBeenCalledTimes(1);
    expect(signinRedirectMock).toHaveBeenCalledWith({
      state: '/onboarding',
      extraQueryParams: {
        audience: 'https://api.test.com',
        login_hint: 'user@example.com',
      },
    });
  });

  it('sets state to current pathname when returnTo is not provided', async () => {
    renderWithProvider();

    await act(async () => {});

    act(() => {
      captured!.loginWithHint('another@example.com');
    });

    expect(signinRedirectMock).toHaveBeenCalledTimes(1);
    expect(signinRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.any(String),
        extraQueryParams: expect.objectContaining({
          login_hint: 'another@example.com',
        }),
      }),
    );
  });

  it('includes audience in extraQueryParams alongside login_hint', async () => {
    renderWithProvider();

    await act(async () => {});

    act(() => {
      captured!.loginWithHint('test@test.com', '/dashboard');
    });

    const call = signinRedirectMock.mock.calls[0][0];
    expect(call.extraQueryParams).toHaveProperty('audience', 'https://api.test.com');
    expect(call.extraQueryParams).toHaveProperty('login_hint', 'test@test.com');
  });

  it('omits audience from extraQueryParams when VITE_AUTH_AUDIENCE is empty', async () => {
    renderWithProvider();

    await act(async () => {});

    // Override the env at the time loginWithHint reads it
    const original = import.meta.env.VITE_AUTH_AUDIENCE;
    import.meta.env.VITE_AUTH_AUDIENCE = '';

    act(() => {
      captured!.loginWithHint('noaudience@test.com', '/home');
    });

    // Restore
    import.meta.env.VITE_AUTH_AUDIENCE = original;

    expect(signinRedirectMock).toHaveBeenCalledWith({
      state: '/home',
      extraQueryParams: {
        login_hint: 'noaudience@test.com',
      },
    });
  });
});
