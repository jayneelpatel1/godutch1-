import { supabase } from './supabase';
import { createActivityForGroupMembers, getUserName, getGroupName } from './activityService';

import type { Settlement, SettlementInput } from '@/types/settlement';

/**
 * @function createSettlement
 * @description Creates a completed settlement record transferring an amount
 *              from payer to receiver within a group. Notifies all group members.
 *
 * @param input — SettlementInput with groupId, payerId, receiverId, amount
 * @returns Object containing created settlement and error message
 *
 * @side-effects Inserts into `settlements` table
 *              Creates activity records for all group members
 */
export async function createSettlement(
  input: SettlementInput
): Promise<{ settlement: Settlement | null; error: string | null }> {
  try {
    const insertData: Record<string, unknown> = {
      group_id: input.groupId,
      payer_id: input.payerId,
      receiver_id: input.receiverId,
      amount: input.amount,
      status: 'completed',
    };
    if (input.note !== undefined) {
      insertData.note = input.note;
    }

    const { data, error } = await supabase
      .from('settlements')
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      return { settlement: null, error: error?.message || 'Failed to create settlement.' };
    }

    const settlement: Settlement = {
      id: data.id as string,
      groupId: data.group_id as string,
      payerId: data.payer_id as string,
      receiverId: data.receiver_id as string,
      amount: data.amount as number,
      note: data.note as string | undefined,
      status: data.status as Settlement['status'],
      createdAt: data.created_at as string,
    };

    const [payerName, receiverName, groupName] = await Promise.all([
      getUserName(input.payerId),
      getUserName(input.receiverId),
      getGroupName(input.groupId),
    ]);
    const noteSuffix = input.note ? ` — ${input.note}` : '';
    const settlementDesc = `Settlement of ₹${input.amount.toFixed(2)} from ${payerName} to ${receiverName} in ${groupName}${noteSuffix}`;
    await createActivityForGroupMembers(input.groupId, input.payerId, {
      type: 'settlement_made',
      description: settlementDesc,
    });

    return { settlement, error: null };
  } catch (e: any) {
    return { settlement: null, error: e.message || 'Failed to create settlement.' };
  }
}

/**
 * @function deleteSettlement
 * @description Deletes a settlement by ID and notifies group members.
 *
 * @param settlementId — UUID of the settlement to delete
 * @param groupId — Group UUID (required for activity notifications)
 * @param userId — User UUID who deleted (required for activity notifications)
 * @returns Object with error message (null on success)
 */
export async function deleteSettlement(
  settlementId: string,
  groupId?: string,
  userId?: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('id', settlementId);

    if (!error && userId && groupId) {
      const [deleterName, groupName] = await Promise.all([
        getUserName(userId),
        getGroupName(groupId),
      ]);
      const delSettleDesc = `Settlement deleted by ${deleterName} in ${groupName}`;
      await createActivityForGroupMembers(groupId, userId, {
        type: 'settlement_deleted',
        description: delSettleDesc,
      });
    }

    return { error: error?.message || null };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete settlement.' };
  }
}

/**
 * @function fetchSettlements
 * @description Retrieves all settlements for a group, ordered newest first.
 *
 * @param groupId — UUID of the group
 * @returns Object containing array of settlements and error message
 */
export async function fetchSettlements(
  groupId: string
): Promise<{ settlements: Settlement[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      return { settlements: [], error: error.message };
    }

    const settlements: Settlement[] = (data || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      groupId: item.group_id as string,
      payerId: item.payer_id as string,
      receiverId: item.receiver_id as string,
      amount: item.amount as number,
      note: item.note as string | undefined,
      status: item.status as Settlement['status'],
      createdAt: item.created_at as string,
    }));

    return { settlements, error: null };
  } catch (e: any) {
    return { settlements: [], error: e.message || 'Failed to fetch settlements.' };
  }
}

export interface GroupBalanceSummary {
  groupId: string;
  netAmount: number;
}

/**
 * @function fetchGroupBalances
 * @description Computes the current user's net balance per group by considering
 *              all expenses (what others owe user minus what user owes others)
 *              and settlements (what user received minus what user paid).
 *
 *              Positive netAmount = user is owed money (others owe user)
 *              Negative netAmount = user owes money
 *
 * @param userId — UUID of the current user
 * @param groupIds — Array of group UUIDs to compute balances for
 * @returns Object containing array of GroupBalanceSummary and error message
 */
export async function fetchGroupBalances(
  userId: string,
  groupIds: string[]
): Promise<{ balances: GroupBalanceSummary[]; error: string | null }> {
  try {
    if (!groupIds.length) {
      return { balances: [], error: null };
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('id, group_id, paid_by, expense_splits(user_id, owed_amount)')
      .in('group_id', groupIds);

    if (error) {
      return { balances: [], error: error.message };
    }

    const expenseData = data || [];

    const { data: settlementData, error: settlementError } = await supabase
      .from('settlements')
      .select('group_id, payer_id, receiver_id, amount')
      .in('group_id', groupIds);

    if (settlementError) {
      return { balances: [], error: settlementError.message };
    }

    const settleData = settlementData || [];

    const balanceMap = new Map<string, number>();
    for (const gid of groupIds) {
      balanceMap.set(gid, 0);
    }

    for (const expense of expenseData) {
      const gid = expense.group_id as string;
      const paidBy = expense.paid_by as string;
      const splits = (expense.expense_splits || []) as Array<{ user_id: string; owed_amount: number }>;

      if (paidBy === userId) {
        const othersOwed = splits
          .filter((s) => s.user_id !== userId)
          .reduce((sum, s) => sum + (s.owed_amount || 0), 0);
        balanceMap.set(gid, (balanceMap.get(gid) || 0) + othersOwed);
      } else {
        const userSplit = splits.find((s) => s.user_id === userId);
        if (userSplit) {
          balanceMap.set(gid, (balanceMap.get(gid) || 0) - (userSplit.owed_amount || 0));
        }
      }
    }

    for (const settlement of settleData) {
      const gid = settlement.group_id as string;
      const payerId = settlement.payer_id as string;
      const receiverId = settlement.receiver_id as string;
      const amount = settlement.amount as number;

      if (receiverId === userId) {
        balanceMap.set(gid, (balanceMap.get(gid) || 0) + amount);
      }
      if (payerId === userId) {
        balanceMap.set(gid, (balanceMap.get(gid) || 0) - amount);
      }
    }

    const balances: GroupBalanceSummary[] = [];
    for (const [groupId, netAmount] of balanceMap) {
      balances.push({ groupId, netAmount });
    }

    return { balances, error: null };
  } catch (e: any) {
    return { balances: [], error: e.message || 'Failed to fetch group balances.' };
  }
}
