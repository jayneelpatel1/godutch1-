import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types/activity';

export function useActivities() {
  const userId = useAuthStore((state) => state.user?.id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => fetchActivities(userId!),
    enabled: !!userId,
  });

  const activities: Activity[] = data?.activities ?? [];

  return {
    activities,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
