import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useExpenseStore } from '@/store/expenseStore';
import { createExpense, deleteExpense, fetchExpenseById, fetchExpenses, updateExpense } from '@/services/expenseService';
import type { ExpenseInput } from '@/types/expense';

/**
 * @hook useExpenses
 * @description Fetches all expenses for a given group via React Query.
 *
 * @param groupId — UUID of the group
 * @returns { expenses: ExpenseWithSplits[], isLoading: boolean, error: string | null, refetch: () => void }
 *
 * @query-key ['expenses', groupId]
 */
export function useExpenses(groupId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => fetchExpenses(groupId),
    enabled: !!groupId,
  });

  return {
    expenses: data?.expenses ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * @hook useExpense
 * @description Fetches a single expense by ID with all splits.
 *
 * @param expenseId — UUID of the expense
 * @returns { expense: ExpenseWithSplits | null, isLoading: boolean, error: string | null, refetch: () => void }
 *
 * @query-key ['expense', expenseId]
 */
export function useExpense(expenseId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => fetchExpenseById(expenseId),
    enabled: !!expenseId,
  });

  return {
    expense: data?.expense ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * @hook useCreateExpense
 * @description Creates a new expense in a group, syncs to local store, and invalidates
 *              related queries.
 *
 * @param groupId — UUID of the group the expense belongs to
 * @returns { UseMutationResult } — mutate with ExpenseInput
 *
 * @invalidates ['expenses', groupId], ['activities', userId]
 */
export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user);
  const addLocalExpense = useExpenseStore((state) => state.addExpense);

  return useMutation({
    mutationFn: async (expenseInput: ExpenseInput) => {
      if (!userId) throw new Error('Not authenticated');
      const result = await createExpense(expenseInput);
      if (result.error) throw new Error(result.error);
      return result.expense;
    },
    onSuccess: (expense) => {
      if (expense) {
        addLocalExpense(expense);
      }
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId?.id] });
    },
    onError: (error) => {
      console.error('[useExpenses] createExpense mutation failed:', error.message);
    },
  });
}

/**
 * @hook useUpdateExpense
 * @description Updates an existing expense and its splits, then invalidates queries.
 *
 * @param groupId — UUID of the group for query invalidation
 * @returns { UseMutationResult } — mutate with { expenseId, updates }
 *
 * @invalidates ['expenses', groupId], ['activities', userId]
 */
export function useUpdateExpense(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async ({ expenseId, updates }: { expenseId: string; updates: Record<string, unknown> }) => {
      const result = await updateExpense(expenseId, updates as Partial<ExpenseInput>, groupId, userId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });
}

/**
 * @hook useDeleteExpense
 * @description Deletes an expense and invalidates related queries.
 *
 * @param groupId — UUID of the group for query invalidation
 * @returns { UseMutationResult } — mutate with expenseId (string)
 *
 * @invalidates ['expenses', groupId], ['activities', userId]
 */
export function useDeleteExpense(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const result = await deleteExpense(expenseId, groupId, userId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });
}
