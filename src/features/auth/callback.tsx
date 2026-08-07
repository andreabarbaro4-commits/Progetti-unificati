import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

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
 * OIDC callback handler (Auth0).
 *
 * On mount:
 * 1. Calls `signinRedirectCallback()` to exchange the authorization code for tokens
 * 2. On success: redirects to the originally requested URL (from OIDC state) or /dashboard
 * 3. On error: redirects to /
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

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
      .then((user) => {
        // The state parameter contains the originally requested URL.
        // Validate it is a relative path (starts with '/' but not '//') to prevent open redirects.
        const state = user?.state as string | undefined;
        const isValidReturnPath =
          typeof state === 'string' &&
          state.length > 0 &&
          state.startsWith('/') &&
          !state.startsWith('//');
        const returnTo = isValidReturnPath ? state : '/dashboard';
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        console.error('[AuthCallback] Signin callback failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to home after a brief delay so error is visible
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      });
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Authentication error</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Processing authentication...</p>
    </div>
  );
}

export default AuthCallback;
