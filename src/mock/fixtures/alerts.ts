import type { Alert } from './types';

// References real project ids from projects.ts and member ids from
// teamMembers.ts (task 2.1 fixtures).
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    projectId: 'proj-mobile-app',
    memberId: 'member-priya',
    type: 'overload',
    message:
      'Priya Sharma is assigned to 4 in-progress tasks, exceeding the 85% workload threshold.',
    triggeredAt: '2025-04-08T10:00:00Z',
  },
  {
    id: 'alert-2',
    projectId: 'proj-mobile-app',
    type: 'delay',
    message: 'Milestone "Design Handoff" is 3 days overdue.',
    triggeredAt: '2025-04-09T07:30:00Z',
    dismissed: true,
  },
  {
    id: 'alert-3',
    projectId: 'proj-api-gateway',
    memberId: 'member-carlos',
    type: 'outdated_document',
    message: 'Budget Spreadsheet.xlsx has not been updated in over 60 days.',
    triggeredAt: '2025-03-01T09:00:00Z',
    resolved: true,
  },
  {
    id: 'alert-4',
    projectId: 'proj-design-system',
    memberId: 'member-nina',
    type: 'delay',
    message: 'Task "Site Survey" is at risk of missing its deadline.',
    triggeredAt: '2025-04-11T16:20:00Z',
  },
];
