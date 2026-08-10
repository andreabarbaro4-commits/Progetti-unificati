import { useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: ReactNode;
  isPublic: boolean;
}

/**
 * Auth guard component wired to real OIDC state.
 *
 * - Public routes (`isPublic: true`) render children directly.
 * - Protected routes check authentication via the auth context.
 *   Unauthenticated users are redirected to Auth0 login,
 *   preserving the requested URL so they return after login.
 */
export function AuthGuard({ children, isPublic }: AuthGuardProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isPublic && !isLoading && !isAuthenticated) {
      login(window.location.pathname + window.location.search);
    }
  }, [isPublic, isLoading, isAuthenticated, login]);

  // Public routes — no auth check needed
  if (isPublic) {
    return <>{children}</>;
  }

  // Still determining auth state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Authenticated — render protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Unauthenticated — redirect is triggered by the effect above;
  // render nothing while the redirect happens.
  return null;
}
