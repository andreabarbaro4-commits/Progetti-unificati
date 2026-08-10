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
  /**
   * When true, the route is rendered inside the authenticated App Shell
   * (TopNavigationBar/BottomNavbar/AiMascotFab/GreetingBubble). Defaults to falsy
   * (no shell) for onboarding, auth callback, not-found, and dev-only routes.
   */
  isAuthenticatedLayout?: boolean;
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
    isAuthenticatedLayout: true,
  },
  {
    path: '/projects',
    component: lazy(() => import('./features/projects/ProjectsList')),
    isPublic: false,
    label: 'Projects',
    isAuthenticatedLayout: true,
  },
  {
    path: '/projects/new',
    component: lazy(() => import('./features/project-wizard/ProjectFormStep')),
    isPublic: false,
    label: 'New Project',
    isAuthenticatedLayout: true,
  },
  {
    path: '/projects/new/analysis',
    component: lazy(() => import('./features/project-wizard/AnalysisStep')),
    isPublic: false,
    label: 'Analysis',
    isAuthenticatedLayout: true,
  },
  {
    path: '/projects/new/team',
    component: lazy(() => import('./features/project-wizard/TeamSelectionStep')),
    isPublic: false,
    label: 'Team Selection',
    isAuthenticatedLayout: true,
  },
  {
    path: '/projects/:id',
    component: lazy(() => import('./features/project-detail/ProjectDetail')),
    isPublic: false,
    label: 'Project Detail',
    isAuthenticatedLayout: true,
  },
  {
    path: '/team',
    component: lazy(() => import('./features/team/TeamPage')),
    isPublic: false,
    label: 'Team',
    isAuthenticatedLayout: true,
  },
  {
    path: '/agent',
    component: lazy(() => import('./features/ai-chat/AiChatPage')),
    isPublic: false,
    label: 'AI Chat',
    isAuthenticatedLayout: true,
  },
  {
    path: '/admin',
    component: lazy(() => import('./features/admin/AdminPanel')),
    isPublic: false,
    label: 'Admin',
    isAuthenticatedLayout: true,
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
