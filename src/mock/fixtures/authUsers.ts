import type { AuthUserProfile } from './types';

// Thin, read-only mirror of mock Auth0 profiles for the Admin Panel's Users
// tab (Req 36.11) — deliberately has no password field. The first entry's id
// matches the mock signed-in user (see ./user.ts's mockUser.sub) so "myself"
// shows up correctly in the admin list while mock-mode is active.
export const mockAuthUsers: AuthUserProfile[] = [
  {
    id: 'mock-user-001',
    name: 'Mock Developer',
    email: 'dev@flowlee.local',
    role: 'Admin',
    isAdmin: true,
  },
  {
    id: 'authuser-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@flowlee.io',
    role: 'Product Designer',
    isAdmin: false,
  },
  {
    id: 'authuser-3',
    name: 'Carlos Rivera',
    email: 'carlos.rivera@flowlee.io',
    role: 'Senior Frontend Developer',
    isAdmin: false,
  },
];
