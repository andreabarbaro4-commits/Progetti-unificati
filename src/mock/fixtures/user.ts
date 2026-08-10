import type { OidcUser } from '../../features/auth/AuthProvider';

export const mockUser: OidcUser = {
  sub: 'mock-user-001',
  email: 'dev@flowlee.local',
  name: 'Mock Developer',
};
