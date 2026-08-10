import type { LoginUserProfile } from '../../features/auth/api';

export interface MockLoginCredential {
  email: string;
  password: string;
  profile: LoginUserProfile;
}

// Seeded credentials for the mock POST /auth/login handler (Req 7).
// The first entry intentionally reuses the same identity as the always-on
// MockAuthProvider user (see ./user.ts) so a manual login in a mock build
// produces a consistent, already-familiar profile.
export const mockLoginCredentials: MockLoginCredential[] = [
  {
    email: 'dev@flowlee.local',
    password: 'password123',
    profile: { id: 'mock-user-001', email: 'dev@flowlee.local', name: 'Mock Developer' },
  },
  {
    email: 'priya.sharma@flowlee.io',
    password: 'password123',
    profile: { id: 'authuser-2', email: 'priya.sharma@flowlee.io', name: 'Priya Sharma' },
  },
];
