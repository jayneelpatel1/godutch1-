import { supabase } from './supabase';
import { createActivityForGroupMembers, getUserName, getGroupName } from './activityService';

import type { Settlement, SettlementInput } from '@/types/settlement';

export async function createSettlement(
  input: SettlementInput
): Promise<{ settlement: Settlement | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .insert({
        group_id: input.groupId,
        payer_id: input.payerId,
        receiver_id: input.receiverId,
        amount: input.amount,
        status: 'completed',
      })
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
      status: data.status as Settlement['status'],
      createdAt: data.created_at as string,
    };

    // Notify group members about the settlement
    const [payerName, receiverName, groupName] = await Promise.all([
      getUserName(input.payerId),
      getUserName(input.receiverId),
      getGroupName(input.groupId),
    ]);
    const settlementDesc = `Settlement of ₹${input.amount.toFixed(2)} from ${payerName} to ${receiverName} in ${groupName}`;
    await createActivityForGroupMembers(input.groupId, input.payerId, {
      type: 'settlement_made',
      description: settlementDesc,
    });

    return { settlement, error: null };
  } catch (e: any) {
    console.error('[settlementService] createSettlement exception:', e);
    return { settlement: null, error: e.message || 'Failed to create settlement.' };
  }
}

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
    console.error('[settlementService] deleteSettlement exception:', e);
    return { error: e.message || 'Failed to delete settlement.' };
  }
}

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
      status: item.status as Settlement['status'],
      createdAt: item.created_at as string,
    }));

    return { settlements, error: null };
  } catch (e: any) {
    console.error('[settlementService] fetchSettlements exception:', e);
    return { settlements: [], error: e.message || 'Failed to fetch settlements.' };
  }
}

export interface GroupBalanceSummary {
  groupId: string;
  netAmount: number;
}

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
      .select(`
        id,
        group_id,
        paid_by,
        expense_splits(user_id, owed_amount)
      `)
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
      const splits = (expense.expense_splits || []) as Array<{
        user_id: string;
        owed_amount: number;
      }>;

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
    console.error('[settlementService] fetchGroupBalances exception:', e);
    return { balances: [], error: e.message || 'Failed to fetch group balances.' };
  }
}
