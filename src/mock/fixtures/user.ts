import type { OidcUser } from '../../features/auth/auth-provider';

export const mockUser: OidcUser = {
  sub: 'mock-user-001',
  email: 'dev@flowlee.local',
  name: 'Mock Developer',
};
