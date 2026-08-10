import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './features/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatedBackground } from './components/AnimatedBackground/AnimatedBackground';
import { LocaleSwitcher } from './components/ui/LocaleSwitcher';
import { SessionExpiredNotification } from './features/auth/SessionExpiredNotification';
import { routes } from './routes';
import { AuthGuard } from './features/auth/AuthGuard';
import { isMockMode } from './mock';
import { centeredPageLayout } from './lib/styles';
import './App.css';

// Lazy-load mock components so they are tree-shaken from production builds
const LazyMockAuthProvider: ComponentType<{ children: ReactNode }> | null = isMockMode()
  ? lazy(() => import('./mock/MockAuthProvider').then(m => ({ default: m.MockAuthProvider })))
  : null;

const LazyMockIndicator: ComponentType | null = isMockMode()
  ? lazy(() => import('./mock/MockIndicator').then(m => ({ default: m.MockIndicator })))
  : null;

function AppRoutes() {
  return (
    <Suspense fallback={<div className={centeredPageLayout}>Loading…</div>}>
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
    <Suspense fallback={<div className={centeredPageLayout}>Loading…</div>}>
      <AuthWrapper>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ErrorBoundary>
              <AnimatedBackground />
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
