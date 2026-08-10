import type { ReactNode } from 'react';
import { AuthContext } from '../features/auth/AuthProvider';
import type { AuthContextValue } from '../features/auth/AuthProvider';
import { mockUser } from './fixtures/user';

const mockAuthValue: AuthContextValue = {
  isAuthenticated: true,
  isLoading: false,
  isSessionExpired: false,
  user: mockUser,
  getAccessToken: () => 'mock-access-token',
  login: () => {},
  logout: async () => {},
  silentRefresh: async () => true,
};

interface MockAuthProviderProps {
  children: ReactNode;
}

export function MockAuthProvider({ children }: MockAuthProviderProps) {
  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
}
