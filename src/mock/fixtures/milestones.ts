import type { Milestone } from './types';

// `taskIds` below must stay in sync with each task's `milestoneId` in tasks.ts.
export const mockMilestones: Milestone[] = [
  {
    id: 'milestone-mobile-kickoff',
    projectId: 'proj-mobile-app',
    name: 'Kickoff & Discovery',
    date: '2025-02-01',
    completed: true,
    taskIds: ['task-onboarding-mockups'],
    description: 'Initial discovery, requirements gathering, and design kickoff.',
  },
  {
    id: 'milestone-mobile-beta',
    projectId: 'proj-mobile-app',
    name: 'Beta Release',
    date: '2025-05-15',
    completed: false,
    taskIds: ['task-push-notifications', 'task-unassigned-example'],
    description: 'First beta build available to internal testers.',
  },
  {
    id: 'milestone-gateway-spec',
    projectId: 'proj-api-gateway',
    name: 'Gateway Spec Finalized',
    date: '2025-04-01',
    completed: false,
    taskIds: ['task-rate-limiting', 'task-auth-docs'],
    description: 'API contract and rate-limiting rules agreed and documented.',
  },
  {
    id: 'milestone-ds-tokens',
    projectId: 'proj-design-system',
    name: 'Token Audit Complete',
    date: '2025-06-01',
    completed: false,
    taskIds: ['task-design-tokens-audit'],
    description: 'Full audit of existing color/spacing/typography tokens.',
  },
  {
    id: 'milestone-legacy-cutover',
    projectId: 'proj-legacy-migration',
    name: 'Cutover Complete',
    date: '2025-01-20',
    completed: true,
    taskIds: ['task-legacy-decommission'],
    description: 'Traffic fully switched over to the new dashboard.',
  },
];
