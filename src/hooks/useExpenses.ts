import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useExpenseStore } from '@/store/expenseStore';
import { createExpense, deleteExpense, fetchExpenseById, fetchExpenses, updateExpense } from '@/services/expenseService';
import { createOrUpdateUser } from '@/services/userService';
import type { ExpenseInput } from '@/types/expense';

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

export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user);
  const addLocalExpense = useExpenseStore((state) => state.addExpense);

  return useMutation({
    mutationFn: async (expenseInput: ExpenseInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Online-only mode: Skip local SQLite save
      // Offline sync will be implemented in later phase

      const userResult = await createOrUpdateUser(userId);
      if (!userResult.success) {
        throw new Error(userResult.error ?? 'Failed to save user details');
      }

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
