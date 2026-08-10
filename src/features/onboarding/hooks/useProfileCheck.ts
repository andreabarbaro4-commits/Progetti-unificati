import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { getUserProfile } from '../api/registration-api';

export function useProfileCheck() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['userProfile', user?.sub],
    queryFn: () => getUserProfile(user!.sub),
    enabled: isAuthenticated && !!user?.sub,
    retry: false, // 404 is expected for new users
  });
}
