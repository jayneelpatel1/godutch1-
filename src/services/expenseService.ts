import { supabase } from './supabase';
import { createActivity, createActivityForGroupMembers } from './activityService';

import type { Expense, ExpenseInput, ExpenseSplit, ExpenseWithSplits } from '@/types/expense';

export async function fetchExpenses(groupId: string): Promise<{ expenses: ExpenseWithSplits[]; error: string | null }> {
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

    const expenses: ExpenseWithSplits[] = (data || []).map((d) => ({
      ...mapExpenseFromDB(d),
      splits: (d.expense_splits || []).map(mapSplitFromDB),
    }));
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

    const expense = { ...mapExpenseFromDB(data), splits: (data.expense_splits || []).map(mapSplitFromDB) } as ExpenseWithSplits;
    return { expense, error: null };
  } catch {
    return { expense: null, error: 'Failed to fetch expense.' };
  }
}

export async function createExpense(input: ExpenseInput): Promise<{ expense: ExpenseWithSplits | null; error: string | null }> {
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

    const expense: ExpenseWithSplits = {
      ...mapExpenseFromDB(expenseData),
      splits: splits.map((s) => ({
        userId: s.user_id as string,
        owedAmount: s.owed_amount as number,
        percentage: s.percentage as number | undefined,
        ratio: s.ratio as number | undefined,
      })),
    };

    // DEBUG: Log expense_created activity creation
    console.log('[expenseService] DEBUG: Creating expense_created activity for creator:', { userId: input.paidBy, groupId: input.groupId, note: input.note, amount: input.amount });
    try {
      const actorResult = await createActivity({
        userId: input.paidBy,
        groupId: input.groupId,
        type: 'expense_created',
        title: `Expense added: ${input.note || expense.category}`,
        description: `₹${input.amount.toFixed(2)} · ${input.category}`,
        metadata: { amount: input.amount, category: input.category, note: input.note },
      });
      console.log('[expenseService] DEBUG: Actor activity result:', actorResult);
    } catch (e) {
      console.error('[expenseService] DEBUG: Failed to log expense_created activity:', e);
    }

    // DEBUG: Log group member notification attempt
    console.log('[expenseService] DEBUG: Creating activities for group members:', { groupId: input.groupId, actorId: input.paidBy });
    try {
      const membersResult = await createActivityForGroupMembers(input.groupId, input.paidBy, {
        type: 'expense_created',
        title: input.note || 'New expense added',
        description: `₹${input.amount.toFixed(2)} · ${input.category}`,
        metadata: { amount: input.amount, category: input.category, note: input.note },
      });
      console.log('[expenseService] DEBUG: Group members activity result:', membersResult);
    } catch (e) {
      console.error('[expenseService] DEBUG: Failed to notify group members:', e);
    }

    return { expense, error: null };
  } catch {
    return { expense: null, error: 'Failed to create expense.' };
  }
}

export async function updateExpense(expenseId: string, updates: Partial<ExpenseInput>, groupId?: string, paidBy?: string): Promise<{ error: string | null }> {
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

    // Log expense_updated activity for the updater
    if (paidBy) {
      try {
        await createActivity({
          userId: paidBy,
          groupId,
          type: 'expense_updated',
          title: 'Expense updated',
          description: updates.note || updates.category || 'Expense details changed',
          metadata: { expenseId, ...updates },
        });
      } catch (e) {
        console.error('[expenseService] Failed to log expense_updated activity:', e);
      }

      // Notify all other group members about the update
      try {
        await createActivityForGroupMembers(groupId!, paidBy, {
          type: 'expense_updated',
          title: 'Expense updated',
          description: updates.note || 'An expense was modified',
          metadata: { expenseId, ...updates },
        });
      } catch (e) {
        console.error('[expenseService] Failed to notify group members about update:', e);
      }
    }

    return { error: error?.message || null };
  } catch {
    return { error: 'Failed to update expense.' };
  }
}

export async function deleteExpense(expenseId: string, groupId?: string, paidBy?: string, note?: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    // Log expense_deleted activity for the deleter
    if (paidBy) {
      try {
        await createActivity({
          userId: paidBy,
          groupId,
          type: 'expense_deleted',
          title: 'Expense deleted',
          description: note || 'Expense was removed',
          metadata: { expenseId },
        });
      } catch (e) {
        console.error('[expenseService] Failed to log expense_deleted activity:', e);
      }

      // Notify all other group members about the deletion
      try {
        await createActivityForGroupMembers(groupId!, paidBy, {
          type: 'expense_deleted',
          title: 'Expense deleted',
          description: note || 'An expense was removed',
          metadata: { expenseId },
        });
      } catch (e) {
        console.error('[expenseService] Failed to notify group members about deletion:', e);
      }
    }

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
