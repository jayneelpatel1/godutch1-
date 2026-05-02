import { supabase } from './supabase';

import type { Expense, ExpenseInput, ExpenseSplit, ExpenseWithSplits } from '@/types/expense';

export async function fetchExpenses(groupId: string): Promise<{ expenses: Expense[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_splits(*)
      `)
      .eq('group_id', groupId)
      .order('date', { ascending: false });

    if (error) {
      return { expenses: [], error: error.message };
    }

    const expenses: Expense[] = (data || []).map(mapExpenseFromDB);
    return { expenses, error: null };
  } catch {
    return { expenses: [], error: 'Failed to fetch expenses.' };
  }
}

export async function fetchExpenseById(expenseId: string): Promise<{ expense: ExpenseWithSplits | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_splits(*)
      `)
      .eq('id', expenseId)
      .single();

    if (error || !data) {
      return { expense: null, error: error?.message || 'Expense not found.' };
    }

    const expense: ExpenseWithSplits = mapExpenseFromDB(data);
    expense.splits = (data.expense_splits || []).map(mapSplitFromDB);
    return { expense, error: null };
  } catch {
    return { expense: null, error: 'Failed to fetch expense.' };
  }
}

export async function createExpense(input: ExpenseInput): Promise<{ expense: Expense | null; error: string | null }> {
  try {
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: input.groupId,
        paid_by: input.paidBy,
        amount: input.amount,
        note: input.note,
        category: input.category,
        split_type: input.splitType,
        date: input.date,
        created_by: input.paidBy,
      })
      .select()
      .single();

    if (expenseError || !expenseData) {
      return { expense: null, error: expenseError?.message || 'Failed to create expense.' };
    }

    const splits = input.splits.map((split) => ({
      expense_id: expenseData.id,
      user_id: split.userId,
      owed_amount: split.owedAmount,
      percentage: split.percentage,
      ratio: split.ratio,
    }));

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splits);

    if (splitError) {
      return { expense: null, error: splitError.message };
    }

    const expense: Expense = mapExpenseFromDB(expenseData);
    return { expense, error: null };
  } catch {
    return { expense: null, error: 'Failed to create expense.' };
  }
}

export async function updateExpense(expenseId: string, updates: Partial<ExpenseInput>): Promise<{ error: string | null }> {
  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.splitType !== undefined) dbUpdates.split_type = updates.splitType;
    if (updates.date !== undefined) dbUpdates.date = updates.date;

    const { error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', expenseId);

    if (updates.splits !== undefined && updates.splits.length > 0) {
      await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expenseId);

      const splits = updates.splits.map((split) => ({
        expense_id: expenseId,
        user_id: split.userId,
        owed_amount: split.owedAmount,
        percentage: split.percentage,
        ratio: split.ratio,
      }));

      await supabase
        .from('expense_splits')
        .insert(splits);
    }

    return { error: error?.message || null };
  } catch {
    return { error: 'Failed to update expense.' };
  }
}

export async function deleteExpense(expenseId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    return { error: error?.message || null };
  } catch {
    return { error: 'Failed to delete expense.' };
  }
}

function mapExpenseFromDB(data: Record<string, unknown>): Expense {
  return {
    id: data.id as string,
    groupId: data.group_id as string,
    paidBy: data.paid_by as string,
    amount: data.amount as number,
    note: (data.note as string) || '',
    category: data.category as Expense['category'],
    splitType: data.split_type as Expense['splitType'],
    date: data.date as string,
    createdBy: data.created_by as string,
    createdAt: data.created_at as string,
  };
}

function mapSplitFromDB(data: Record<string, unknown>): ExpenseSplit {
  return {
    userId: data.user_id as string,
    owedAmount: data.owed_amount as number,
    percentage: data.percentage as number | undefined,
    ratio: data.ratio as number | undefined,
  };
}
