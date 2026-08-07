import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import {
  setTokenProvider,
  setRefreshHandler,
  setLoginRedirect,
} from '../../lib/api-client';
import { queryClient } from '../../lib/query-client';
import { useOnboardingStore } from '../onboarding/store';

// ─── Single-redirect guard ───────────────────────────────────────────────────

let redirectInProgress = false;

/**
 * Prevents multiple concurrent redirects to the login page.
 * If a redirect is already in progress, additional calls are no-ops.
 */
function guardedRedirectToLogin(
  mgr: UserManager,
  returnPath: string,
): void {
  if (redirectInProgress) return;
  redirectInProgress = true;
  try {
    mgr.signinRedirect({ state: returnPath });
  } finally {
    // Reset flag after a timeout to handle edge cases where redirect doesn't
    // navigate away (e.g., popup blocked). In normal flow the page navigates
    // and this never fires.
    setTimeout(() => {
      redirectInProgress = false;
    }, 5000);
  }
}

// ─── Public interfaces ───────────────────────────────────────────────────────

export interface OidcUser {
  sub: string;
  email: string;
  name: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  user: OidcUser | null;
  getAccessToken(): string | null;
  login(returnTo?: string): void;
  logout(): Promise<void>;
  silentRefresh(): Promise<boolean>;
}

// ─── In-memory storage adapter ───────────────────────────────────────────────

/**
 * An in-memory implementation of the Web Storage API.
 * Tokens are NEVER persisted to localStorage or cookies.
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

// ─── UserManager factory ─────────────────────────────────────────────────────

function createUserManager(): UserManager | null {
  const authority = import.meta.env.VITE_AUTH_AUTHORITY || '';
  const clientId = import.meta.env.VITE_AUTH_CLIENT_ID || '';
  const audience = import.meta.env.VITE_AUTH_AUDIENCE || '';

  // Gracefully handle missing env vars — don't crash the module.
  // The provider will still mount but auth operations will be no-ops.
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
    // Auth0 requires the audience param to issue JWT access tokens for the API
    extraQueryParams: audience ? { audience } : undefined,
    userStore: new WebStorageStateStore({ store: memoryStorage }),
    stateStore: new WebStorageStateStore({ store: memoryStorage }),
  });
}

// ─── React context ───────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(oidcUser: User | null): OidcUser | null {
  if (!oidcUser?.profile) return null;
  return {
    sub: oidcUser.profile.sub,
    email: (oidcUser.profile.email as string) ?? '',
    name: (oidcUser.profile.name as string) ?? '',
  };
}

// ─── AuthProvider component ──────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const userManagerRef = useRef<UserManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<OidcUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Lazily create the UserManager once
  if (userManagerRef.current === undefined || userManagerRef.current === null) {
    userManagerRef.current = createUserManager();
  }

  const mgr = userManagerRef.current;

  // On mount: check if there's already a user session
  useEffect(() => {
    if (!mgr) {
      setIsLoading(false);
      return;
    }

    mgr.getUser().then((oidcUser) => {
      if (oidcUser && !oidcUser.expired) {
        setUser(mapUser(oidcUser));
        setAccessToken(oidcUser.access_token);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for token changes (e.g. after silent refresh)
    const onUserLoaded = (oidcUser: User) => {
      setUser(mapUser(oidcUser));
      setAccessToken(oidcUser.access_token);
    };

    const onUserUnloaded = () => {
      setUser(null);
      setAccessToken(null);
    };

    mgr.events.addUserLoaded(onUserLoaded);
    mgr.events.addUserUnloaded(onUserUnloaded);

    return () => {
      mgr.events.removeUserLoaded(onUserLoaded);
      mgr.events.removeUserUnloaded(onUserUnloaded);
    };
  }, [mgr]);

  // ─── Wire API client to auth ────────────────────────────────────────────

  useEffect(() => {
    setTokenProvider(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!mgr) return;
    setRefreshHandler(async () => {
      try {
        const oidcUser = await mgr.signinSilent();
        if (oidcUser) {
          setUser(mapUser(oidcUser));
          setAccessToken(oidcUser.access_token);
          return true;
        }
        return false;
      } catch {
        // Session refresh failed — mark session as expired
        setUser(null);
        setAccessToken(null);
        setIsSessionExpired(true);

        // Capture the current path + query string for post-login restoration
        const returnPath =
          window.location.pathname + window.location.search;

        // After 3 seconds (gives user time to see notification), redirect to login
        setTimeout(() => {
          guardedRedirectToLogin(mgr, returnPath);
        }, 3000);

        return false;
      }
    });
  }, [mgr]);

  useEffect(() => {
    if (!mgr) return;
    setLoginRedirect(() => {
      const returnPath =
        window.location.pathname + window.location.search;
      guardedRedirectToLogin(mgr, returnPath);
    });
  }, [mgr]);

  // ─── Public API ──────────────────────────────────────────────────────────

  const getAccessToken = useCallback((): string | null => {
    return accessToken;
  }, [accessToken]);

  const login = useCallback(
    (returnTo?: string) => {
      if (!mgr) return;
      const state = returnTo ?? window.location.pathname;
      mgr.signinRedirect({ state });
    },
    [mgr],
  );

  const logout = useCallback(async () => {
    if (!mgr) return;

    // 1. Clear in-memory tokens immediately
    setUser(null);
    setAccessToken(null);

    // 2. Attempt RP-initiated logout via Auth0
    try {
      await mgr.signoutRedirect({
        post_logout_redirect_uri: window.location.origin,
      });
    } catch {
      // 3. On failure: clear all client-side state and navigate away
      queryClient.clear();
      useOnboardingStore.getState().reset();
      window.location.href = '/';
    }
  }, [mgr]);

  const silentRefresh = useCallback(async (): Promise<boolean> => {
    if (!mgr) return false;
    try {
      const oidcUser = await mgr.signinSilent();
      if (oidcUser) {
        setUser(mapUser(oidcUser));
        setAccessToken(oidcUser.access_token);
        return true;
      }
      return false;
    } catch {
      setUser(null);
      setAccessToken(null);
      return false;
    }
  }, [mgr]);

  const contextValue: AuthContextValue = {
    isAuthenticated: user !== null,
    isLoading,
    isSessionExpired,
    user,
    getAccessToken,
    login,
    logout,
    silentRefresh,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
