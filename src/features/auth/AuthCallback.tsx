import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { centeredPageLayout } from '../../lib/styles';
import { useAuth } from './AuthProvider';
import { getUserProfile } from '../onboarding/api/registration-api';
import type { ApiError } from '../../lib/api-client';

/**
 * In-memory storage matching the auth-provider implementation.
 * Required because oidc-client-ts needs access to the same state store
 * that was used when initiating the login redirect.
 *
 * Note: This uses a module-level singleton so that state written during
 * signinRedirect (in auth-provider) is available here during callback.
 * In practice, the page reloads on redirect so the state store in
 * auth-provider won't persist. The UserManager.signinRedirectCallback()
 * reads the `code` and `state` from the URL query string directly,
 * so a fresh in-memory store is acceptable.
 */
class InMemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function createCallbackUserManager(): UserManager | null {
  const authority = import.meta.env.VITE_AUTH_AUTHORITY || '';
  const clientId = import.meta.env.VITE_AUTH_CLIENT_ID || '';
  const audience = import.meta.env.VITE_AUTH_AUDIENCE || '';

  if (!authority || !clientId) {
    return null;
  }

  const memoryStorage = new InMemoryStorage();

  return new UserManager({
    authority,
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile email',
    response_type: 'code',
    extraQueryParams: audience ? { audience } : undefined,
    userStore: new WebStorageStateStore({ store: memoryStorage }),
    stateStore: new WebStorageStateStore({ store: memoryStorage }),
  });
}

/**
 * Type guard to check if an error is a structured ApiError from apiClient.
 */
function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err &&
    'url' in err &&
    'method' in err
  );
}

/**
 * OIDC callback handler (Auth0).
 *
 * On mount:
 * 1. Calls `signinRedirectCallback()` to exchange the authorization code for tokens
 * 2. Establishes the session in the AuthProvider context
 * 3. Checks if the user has an existing profile via GET /api/users/{userId}
 *    - On 200: navigates to the state return path or /dashboard
 *    - On 404: navigates to /onboarding (new user flow)
 *    - On other errors: shows an error state with retry
 * 4. On OIDC error: shows error and redirects to /
 */
function AuthCallback() {
  const navigate = useNavigate();
  const { establishSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const processedRef = useRef(false);
  // Store the callback result for retry scenarios
  const callbackResultRef = useRef<{
    userId: string;
    email: string;
    name: string;
    accessToken: string;
    returnTo: string;
  } | null>(null);

  const checkProfileAndNavigate = async (params: {
    userId: string;
    email: string;
    name: string;
    accessToken: string;
    returnTo: string;
  }) => {
    const { userId, email, name, accessToken, returnTo } = params;

    // Establish session in auth context so apiClient has the token
    establishSession({ sub: userId, email, name }, accessToken);

    try {
      // Profile exists — navigate to return path or dashboard
      await getUserProfile(userId);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 404) {
        // New user — no profile yet, navigate to onboarding
        navigate('/onboarding', { replace: true });
      } else {
        // Other error (network, 500, etc.) — show error with retry
        const message = isApiError(err)
          ? err.message
          : 'Failed to check profile. Please try again.';
        setError(message);
        setIsRetryable(true);
      }
    }
  };

  useEffect(() => {
    // Prevent double-processing in React StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const mgr = createCallbackUserManager();

    if (!mgr) {
      // Auth not configured — redirect home
      navigate('/', { replace: true });
      return;
    }

    mgr
      .signinRedirectCallback()
      .then(async (user) => {
        const userId = user?.profile?.sub ?? '';
        const email = (user?.profile?.email as string) ?? '';
        const name = (user?.profile?.name as string) ?? '';
        const accessToken = user?.access_token ?? '';

        // Validate the state parameter for the return path
        const state = user?.state as string | undefined;
        const isValidReturnPath =
          typeof state === 'string' &&
          state.length > 0 &&
          state.startsWith('/') &&
          !state.startsWith('//');
        const returnTo = isValidReturnPath ? state : '/dashboard';

        // Store for retry
        const params = { userId, email, name, accessToken, returnTo };
        callbackResultRef.current = params;

        await checkProfileAndNavigate(params);
      })
      .catch((err) => {
        console.error('[AuthCallback] Signin callback failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to home after a brief delay so error is visible
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      });
  }, [navigate, establishSession]);

  const handleRetry = () => {
    setError(null);
    setIsRetryable(false);
    if (callbackResultRef.current) {
      checkProfileAndNavigate(callbackResultRef.current);
    }
  };

  if (error) {
    return (
      <div className={centeredPageLayout}>
        <div className="text-center">
          <p className="text-red-600 mb-2">
            {isRetryable ? 'Something went wrong' : 'Authentication error'}
          </p>
          <p className="text-gray-500 text-sm">{error}</p>
          {isRetryable ? (
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
          ) : (
            <p className="text-gray-400 text-xs mt-2">Redirecting...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={centeredPageLayout}>
      <p className="text-gray-600">Processing authentication...</p>
    </div>
  );
}

export default AuthCallback;
