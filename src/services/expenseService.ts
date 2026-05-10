import { supabase } from './supabase';
import { createActivityForGroupMembers, getUserName, getGroupName } from './activityService';

import type { Expense, ExpenseInput, ExpenseSplit, ExpenseWithSplits } from '@/types/expense';

/**
 * @function fetchExpenses
 * @description Retrieves all expenses for a group, ordered by date descending.
 *              Includes the full expense_splits relation for each expense.
 *
 * @param groupId — UUID of the group
 * @returns Object containing array of expenses (with splits) and error message
 */
export async function fetchExpenses(groupId: string): Promise<{ expenses: ExpenseWithSplits[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, expense_splits(*)')
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

/**
 * @function fetchExpenseById
 * @description Retrieves a single expense with its splits by expense ID.
 *
 * @param expenseId — UUID of the expense
 * @returns Object containing the expense (with splits) or null, and error message
 */
export async function fetchExpenseById(expenseId: string): Promise<{ expense: ExpenseWithSplits | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, expense_splits(*)')
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

/**
 * @function createExpense
 * @description Inserts a new expense into Supabase, inserts split records,
 *              and notifies group members via activity feed.
 *
 * @param input — ExpenseInput with groupId, paidBy, amount, note, category, etc.
 * @returns Object containing created expense (with splits) and error message
 *
 * @side-effects Inserts into `expenses` + `expense_splits` tables
 *              Creates activity records for all group members except payer
 */
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

    const [userName, groupName] = await Promise.all([
      getUserName(input.paidBy),
      getGroupName(input.groupId),
    ]);
    const memberDesc = `Expense added by ${userName} in ${groupName} — ₹${input.amount.toFixed(2)}`;
    const membersActivity = await createActivityForGroupMembers(input.groupId, input.paidBy, {
      type: 'expense_created',
      description: memberDesc,
    });
    if (membersActivity.error) {
      console.error('[expenseService] Failed to create activities for group members:', membersActivity.error);
    }

    return { expense, error: null };
  } catch {
    return { expense: null, error: 'Failed to create expense.' };
  }
}

/**
 * @function updateExpense
 * @description Updates an expense's fields and/or splits. If splits are provided,
 *              deletes all existing splits and re-inserts. Notifies group members.
 *
 * @param expenseId — UUID of the expense to update
 * @param updates — Partial ExpenseInput containing fields to update
 * @param groupId — Group UUID (required for activity notifications)
 * @param paidBy — User UUID who made the change (required for activity notifications)
 * @returns Object with error message (null on success)
 */
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

    if (paidBy && groupId) {
      const [userName, groupName] = await Promise.all([
        getUserName(paidBy),
        getGroupName(groupId),
      ]);
      const memberUpdDesc = `Expense updated by ${userName} in ${groupName}`;
      const membersUpd = await createActivityForGroupMembers(groupId, paidBy, {
        type: 'expense_updated',
        description: memberUpdDesc,
      });
      if (membersUpd.error) {
        console.error('[expenseService] Failed to notify members about update:', membersUpd.error);
      }
    }

    return { error: error?.message || null };
  } catch {
    return { error: 'Failed to update expense.' };
  }
}

/**
 * @function deleteExpense
 * @description Deletes an expense by ID and notifies group members.
 *              Cascading delete should handle expense_splits via DB constraint.
 *
 * @param expenseId — UUID of the expense to delete
 * @param groupId — Group UUID (required for activity notifications)
 * @param paidBy — User UUID who deleted (required for activity notifications)
 * @returns Object with error message (null on success)
 */
export async function deleteExpense(expenseId: string, groupId?: string, paidBy?: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (paidBy && groupId) {
      const [userName, groupName] = await Promise.all([
        getUserName(paidBy),
        getGroupName(groupId),
      ]);
      const memberDelDesc = `Expense deleted by ${userName} in ${groupName}`;
      const membersDel = await createActivityForGroupMembers(groupId, paidBy, {
        type: 'expense_deleted',
        description: memberDelDesc,
      });
      if (membersDel.error) {
        console.error('[expenseService] Failed to notify members about deletion:', membersDel.error);
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
