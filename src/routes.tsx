import { lazy } from 'react';
import type { ComponentType } from 'react';

/**
 * Single source of truth for all application routes.
 */

export interface RouteDefinition {
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
    component: lazy(() => import('./features/auth/callback')),
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
