/**
 * @store expenseStore
 * @description Global expense state managed by Zustand.
 *              Used for optimistic updates — the canonical data source is Supabase via React Query.
 *
 * @state
 *   - expenses: Expense[]    — List of expenses (may be partial cache)
 *   - isLoading: boolean     — Fetch in progress
 *   - error: string | null   — Error message if fetch failed
 *
 * @actions
 *   - setExpenses(expenses)        — Replace all expenses
 *   - addExpense(expense)          — Prepend to list
 *   - updateExpense(id, updates)   — Update in-place
 *   - removeExpense(id)            — Remove by ID
 *   - setLoading(bool) / setError(msg) / clearExpenses()
 */

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
