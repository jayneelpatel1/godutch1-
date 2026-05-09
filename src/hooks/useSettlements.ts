import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { createSettlement, deleteSettlement, fetchSettlements, fetchGroupBalances } from '@/services/settlementService';
import type { SettlementInput } from '@/types/settlement';

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

export function useGroupBalances() {
  const userId = useAuthStore((state) => state.user?.id);
  const groups = useAuthStore((state) => state.user); // We need group IDs, we'll get them from params

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groupBalances', userId],
    queryFn: async () => {
      if (!userId) return { balances: [] };
      return { balances: [] };
    },
    enabled: false,
  });

  return {
    balances: data?.balances ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

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
