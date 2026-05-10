import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { createSettlement, deleteSettlement, fetchSettlements, fetchGroupBalances } from '@/services/settlementService';
import type { SettlementInput } from '@/types/settlement';

/**
 * @hook useSettlements
 * @description Fetches all settlements for a given group via React Query.
 *
 * @param groupId — UUID of the group
 * @returns { settlements: Settlement[], isLoading: boolean, error: string | null, refetch: () => void }
 *
 * @query-key ['settlements', groupId]
 */
export function useSettlements(groupId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settlements', groupId],
    queryFn: () => fetchSettlements(groupId),
    enabled: !!groupId,
  });

  return {
    settlements: data?.settlements ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * @hook useCreateSettlement
 * @description Creates a settlement (payer → receiver) within a group.
 *
 * @param groupId — UUID of the group
 * @returns { UseMutationResult } — mutate with SettlementInput
 *
 * @invalidates ['settlements', groupId], ['expenses', groupId], ['activities', userId], ['groupBalances', userId]
 */
export function useCreateSettlement(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (input: SettlementInput) => {
      const result = await createSettlement(input);
      if (result.error) throw new Error(result.error);
      return result.settlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['groupBalances', userId] });
    },
    onError: (error) => {
      console.error('[useSettlements] createSettlement failed:', error.message);
    },
  });
}

/**
 * @hook useDeleteSettlement
 * @description Deletes a settlement by ID.
 *
 * @param groupId — UUID of the group for query invalidation
 * @returns { UseMutationResult } — mutate with settlementId (string)
 *
 * @invalidates ['settlements', groupId], ['expenses', groupId], ['activities', userId], ['groupBalances', userId]
 */
export function useDeleteSettlement(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (settlementId: string) => {
      const result = await deleteSettlement(settlementId, groupId, userId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['activities', userId] });
        queryClient.invalidateQueries({ queryKey: ['groupBalances', userId] });
      }
    },
    onError: (error) => {
      console.error('[useSettlements] deleteSettlement failed:', error.message);
    },
  });
}

/**
 * @hook useFetchGroupBalances
 * @description Mutation-based hook to compute the current user's net balance
 *              across multiple groups. Stores result in query cache for reuse.
 *
 * @returns { UseMutationResult } — mutate with groupIds (string[])
 *
 * @side-effects Sets query data for ['groupBalances', userId] on success
 */
export function useFetchGroupBalances() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (groupIds: string[]) => {
      if (!userId || !groupIds.length) return { balances: [] };
      const result = await fetchGroupBalances(userId, groupIds);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(['groupBalances', userId], data);
      }
    },
  });
}
