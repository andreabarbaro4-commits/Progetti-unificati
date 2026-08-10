import type { Economics } from './types';

// Singleton per project that has economics data (Req 2.1) — only
// proj-mobile-app (from projects.ts, task 2.1) has financial data.
export const mockEconomics: Economics[] = [
  {
    id: 'economics-1',
    projectId: 'proj-mobile-app',
    totalBudget: 250000,
    currentCost: 137500,
    invoices: [
      {
        id: 'invoice-1',
        description: 'Design phase — milestone payment',
        amount: 45000,
        date: '2025-02-15T00:00:00Z',
        status: 'paid',
      },
      {
        id: 'invoice-2',
        description: 'Development phase — sprints 1-3',
        amount: 62500,
        date: '2025-03-30T00:00:00Z',
        status: 'pending',
      },
      {
        id: 'invoice-3',
        description: 'Infrastructure setup',
        amount: 8000,
        date: '2025-01-20T00:00:00Z',
        status: 'overdue',
      },
    ],
    costItems: [
      {
        id: 'cost-1',
        category: 'Labor',
        description: 'Engineering team — March',
        amount: 58000,
        date: '2025-03-31T00:00:00Z',
      },
      {
        id: 'cost-2',
        category: 'Software',
        description: 'Design & prototyping tool licenses',
        amount: 3200,
        date: '2025-03-05T00:00:00Z',
      },
      {
        id: 'cost-3',
        category: 'Infrastructure',
        description: 'Cloud hosting — Q1',
        amount: 4300,
        date: '2025-03-31T00:00:00Z',
      },
    ],
  },
];
