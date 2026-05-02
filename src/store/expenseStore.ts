import { create } from 'zustand';

import type { Expense, ExpenseState } from '@/types/expense';

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  isLoading: false,
  error: null,
  setExpenses: (expenses: Expense[]) => set({ expenses }),
  addExpense: (expense: Expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpense: (id: string, updates: Partial<Expense>) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  removeExpense: (id: string) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearExpenses: () => set({ expenses: [], error: null }),
}));
