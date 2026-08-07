import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './features/auth/auth-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocaleSwitcher } from './components/ui/LocaleSwitcher';
import { SessionExpiredNotification } from './features/auth/SessionExpiredNotification';
import { routes } from './routes';
import { AuthGuard } from './features/auth/auth-guard';
import { isMockMode } from './mock';
import './App.css';

// Lazy-load mock components so they are tree-shaken from production builds
const LazyMockAuthProvider: ComponentType<{ children: ReactNode }> | null = isMockMode()
  ? lazy(() => import('./mock/mock-auth-provider').then(m => ({ default: m.MockAuthProvider })))
  : null;

const LazyMockIndicator: ComponentType | null = isMockMode()
  ? lazy(() => import('./mock/MockIndicator').then(m => ({ default: m.MockIndicator })))
  : null;

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <Routes>
        {routes.map(({ path, component: Component, isPublic }) => (
          <Route
            key={path}
            path={path}
            element={
              <AuthGuard isPublic={isPublic}>
                <Component />
              </AuthGuard>
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
}

function App() {
  const AuthWrapper = LazyMockAuthProvider ?? AuthProvider;

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <AuthWrapper>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ErrorBoundary>
              {LazyMockIndicator && <LazyMockIndicator />}
              <SessionExpiredNotification />
              <LocaleSwitcher className="fixed top-4 right-4 z-50" />
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthWrapper>
    </Suspense>
  );
}

export default App;
