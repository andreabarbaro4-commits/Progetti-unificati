import { lazy } from 'react';
import type { ComponentType } from 'react';

/**
 * Single source of truth for all application routes.
 */

interface RouteDefinition {
  path: string;
  component: React.LazyExoticComponent<ComponentType>;
  isPublic: boolean;
  label?: string;
}

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./features/onboarding/OnboardingWizard')),
    isPublic: true,
    label: 'Onboarding',
  },
  {
    path: '/auth/callback',
    component: lazy(() => import('./features/auth/AuthCallback')),
    isPublic: true,
  },
  {
    path: '/dashboard',
    component: lazy(() => import('./features/dashboard/Dashboard')),
    isPublic: false,
    label: 'Dashboard',
  },
  {
    path: '*',
    component: lazy(() => import('./features/not-found/NotFound')),
    isPublic: true,
  },
];

// Only include playground in development mode.
// import.meta.env.DEV is statically replaced by Vite at build time,
// making this branch dead code in production builds (tree-shaken).
if (import.meta.env.DEV) {
  routes.push({
    path: '/dev/playground',
    component: lazy(() => import('./features/dev/playground/Playground')),
    isPublic: true,
    label: 'Playground',
  });
}
