import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types/activity';

/**
 * @hook useActivities
 * @description Fetches all activity feed entries for the current user.
 *
 * @returns { activities: Activity[], isLoading: boolean, error: string | null, refetch: () => void }
 *
 * @dependencies useAuthStore (reads current user ID)
 * @query-key ['activities', userId]
 */
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
