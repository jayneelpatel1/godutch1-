/**
 * @hook useFriendBalances
 * @description Fetches aggregated balances for all friends across all groups.
 *              Uses React Query for caching — data is fresh for 5 minutes.
 *
 * @returns {
 *   friends: FriendBalance[]  — List of friends with total and per-group balances
 *   isLoading: boolean         — True on first fetch only
 *   error: string | null       — Error message if query failed
 *   refetch: () => void        — Manually trigger re-fetch
 * }
 *
 * @dependencies useAuthStore (reads current user ID)
 * @query-key ['friendBalances', userId]
 */

import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { fetchFriendBalances, fetchSettlementsBetweenUsers } from '@/services/friendService';
import type { Settlement } from '@/types/settlement';

export function useFriendBalances() {
  const userId = useAuthStore((state) => state.user?.id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['friendBalances', userId],
    queryFn: () => fetchFriendBalances(userId!),
    enabled: !!userId,
  });

  return {
    friends: data?.friends ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * @hook useSettlementsBetweenUsers
 * @description Fetches past settlements between the current user and a specific friend.
 *
 * @param friendId — UUID of the friend
 * @returns {
 *   settlements: (Settlement & { groupName: string })[]
 *   isLoading: boolean
 *   error: string | null
 *   refetch: () => void
 * }
 *
 * @query-key ['settlementsBetween', userId, friendId]
 */
export function useSettlementsBetweenUsers(friendId: string) {
  const userId = useAuthStore((state) => state.user?.id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settlementsBetween', userId, friendId],
    queryFn: () => fetchSettlementsBetweenUsers(userId!, friendId),
    enabled: !!userId && !!friendId,
  });

  return {
    settlements: data?.settlements ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
