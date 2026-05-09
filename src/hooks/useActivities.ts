import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types/activity';

export function useActivities() {
  const userId = useAuthStore((state) => state.user?.id);
  console.log('[useActivities] DEBUG: userId:', userId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => {
      console.log('[useActivities] DEBUG: queryFn running for userId:', userId);
      return fetchActivities(userId!);
    },
    enabled: !!userId,
  });

  console.log('[useActivities] DEBUG: data:', data);
  console.log('[useActivities] DEBUG: isLoading:', isLoading, 'error:', error);

  const activities: Activity[] = data?.activities ?? [];

  return {
    activities,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
