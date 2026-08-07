export interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Flowlee Mobile App',
    status: 'active',
    createdAt: '2024-11-15T09:00:00Z',
  },
  {
    id: 'proj-002',
    name: 'API Gateway Redesign',
    status: 'active',
    createdAt: '2025-01-08T14:30:00Z',
  },
  {
    id: 'proj-003',
    name: 'Design System v2',
    status: 'active',
    createdAt: '2025-02-20T10:15:00Z',
  },
  {
    id: 'proj-004',
    name: 'Legacy Dashboard Migration',
    status: 'archived',
    createdAt: '2024-06-01T08:00:00Z',
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-001',
    name: 'Alice Martin',
    email: 'alice.martin@flowlee.io',
    role: 'Engineering Lead',
    avatarUrl: null,
  },
  {
    id: 'user-002',
    name: 'Carlos Rivera',
    email: 'carlos.rivera@flowlee.io',
    role: 'Senior Frontend Developer',
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos',
  },
  {
    id: 'user-003',
    name: 'Priya Sharma',
    email: 'priya.sharma@flowlee.io',
    role: 'Product Designer',
    avatarUrl: 'https://i.pravatar.cc/150?u=priya',
  },
  {
    id: 'user-004',
    name: 'Luca Bianchi',
    email: 'luca.bianchi@flowlee.io',
    role: 'Backend Developer',
    avatarUrl: null,
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Implement push notification service',
    projectId: 'proj-001',
    assigneeId: 'user-002',
    status: 'in-progress',
    dueDate: '2025-03-28T00:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Design onboarding flow mockups',
    projectId: 'proj-001',
    assigneeId: 'user-003',
    status: 'done',
    dueDate: '2025-03-10T00:00:00Z',
  },
  {
    id: 'task-003',
    title: 'Set up rate limiting middleware',
    projectId: 'proj-002',
    assigneeId: 'user-004',
    status: 'todo',
    dueDate: '2025-04-05T00:00:00Z',
  },
  {
    id: 'task-004',
    title: 'Create reusable Button component',
    projectId: 'proj-003',
    assigneeId: 'user-002',
    status: 'done',
    dueDate: null,
  },
  {
    id: 'task-005',
    title: 'Write API documentation for auth endpoints',
    projectId: 'proj-002',
    assigneeId: 'user-001',
    status: 'in-progress',
    dueDate: '2025-04-01T00:00:00Z',
  },
  {
    id: 'task-006',
    title: 'Audit color contrast ratios',
    projectId: 'proj-003',
    assigneeId: 'user-003',
    status: 'todo',
    dueDate: '2025-04-12T00:00:00Z',
  },
];
