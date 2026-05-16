/**
 * @function getSettlementsBetweenUsers
 * @description Fetches all settlements between two users across all their shared groups.
 *
 * @param userId — UUID of the current user
 * @param friendId — UUID of the friend
 * @returns Settlements with group name, sorted by newest first
 */
import { supabase } from './supabase';

import type { Settlement } from '@/types/settlement';
import type { FriendBalance, GroupFriendBalance } from '@/types/friends';

/**
 * @function fetchFriendBalances
 * @description Computes per-friend balance aggregated across all groups
 *              the current user shares with each person.
 *
 *              Positive totalAmount = friend owes the current user.
 *              Negative totalAmount = current user owes the friend.
 *
 * @param userId — UUID of the current user
 * @returns Array of FriendBalance (one per unique friend)
 */
export async function fetchFriendBalances(
  userId: string
): Promise<{ friends: FriendBalance[]; error: string | null }> {
  try {
    const { data: memberships, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (membershipError) {
      return { friends: [], error: membershipError.message };
    }

    const groupIds: string[] = [...new Set((memberships || []).map((m) => m.group_id as string))];

    if (groupIds.length === 0) {
      return { friends: [], error: null };
    }

    const [membersRes, expensesRes, settlementsRes, groupsRes] = await Promise.all([
      supabase.from('group_members').select('group_id, user_id').in('group_id', groupIds),
      supabase
        .from('expenses')
        .select('id, group_id, paid_by, expense_splits(user_id, owed_amount)')
        .in('group_id', groupIds),
      supabase
        .from('settlements')
        .select('group_id, payer_id, receiver_id, amount')
        .in('group_id', groupIds),
      supabase.from('groups').select('id, name').in('id', groupIds),
    ]);

    if (membersRes.error) return { friends: [], error: membersRes.error.message };
    if (expensesRes.error) return { friends: [], error: expensesRes.error.message };
    if (settlementsRes.error) return { friends: [], error: settlementsRes.error.message };
    if (groupsRes.error) return { friends: [], error: groupsRes.error.message };

    const groupMembers = membersRes.data || [];
    const expenseData = expensesRes.data || [];
    const settleData = settlementsRes.data || [];
    const groupData = groupsRes.data || [];

    const groupNameMap = new Map<string, string>();
    for (const g of groupData) {
      groupNameMap.set(g.id as string, g.name as string);
    }

    const friendIds: string[] = [];
    const seenFriends = new Set<string>();
    for (const gm of groupMembers) {
      const uid = gm.user_id as string;
      if (uid !== userId && !seenFriends.has(uid)) {
        seenFriends.add(uid);
        friendIds.push(uid);
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, avatar')
      .in('id', friendIds);

    if (userError) {
      return { friends: [], error: userError.message };
    }

    const userNameMap = new Map<string, { name: string; avatar?: string }>();
    for (const u of userData || []) {
      userNameMap.set(u.id as string, { name: u.name as string, avatar: u.avatar as string | undefined });
    }

    interface PerGroupBalance {
      groupId: string;
      amount: number;
    }

    const friendGroupBalances = new Map<string, PerGroupBalance[]>();

    const groupFriendIds = new Map<string, string[]>();
    for (const gm of groupMembers) {
      const gid = gm.group_id as string;
      const uid = gm.user_id as string;
      if (uid === userId) continue;
      if (!groupFriendIds.has(gid)) groupFriendIds.set(gid, []);
      const arr = groupFriendIds.get(gid)!;
      if (!arr.includes(uid)) arr.push(uid);
    }

    for (const expense of expenseData) {
      const gid = expense.group_id as string;
      const paidBy = expense.paid_by as string;
      const splits = (expense.expense_splits || []) as Array<{ user_id: string; owed_amount: number }>;

      for (const split of splits) {
        const splitUserId = split.user_id as string;
        if (splitUserId === userId || splitUserId === paidBy) continue;

        if (paidBy === userId) {
          const key = `${gid}:${splitUserId}`;
          const entry = friendGroupBalances.get(key);
          const amount = (split.owed_amount || 0);
          if (entry) {
            entry[0].amount += amount;
          } else {
            friendGroupBalances.set(key, [{ groupId: gid, amount }]);
          }
        }
      }

      if (paidBy !== userId) {
        const userSplit = splits.find((s) => s.user_id === userId);
        if (userSplit) {
          const key = `${gid}:${paidBy}`;
          const entry = friendGroupBalances.get(key);
          const amount = (userSplit.owed_amount || 0);
          if (entry) {
            entry[0].amount -= amount;
          } else {
            friendGroupBalances.set(key, [{ groupId: gid, amount: -amount }]);
          }
        }
      }
    }

    for (const settle of settleData) {
      const gid = settle.group_id as string;
      const payerId = settle.payer_id as string;
      const receiverId = settle.receiver_id as string;
      const amount = settle.amount as number;

      if (receiverId === userId && payerId !== userId) {
        const key = `${gid}:${payerId}`;
        const entry = friendGroupBalances.get(key);
        if (entry) {
          entry[0].amount -= amount;
        } else {
          friendGroupBalances.set(key, [{ groupId: gid, amount: -amount }]);
        }
      }

      if (payerId === userId && receiverId !== userId) {
        const key = `${gid}:${receiverId}`;
        const entry = friendGroupBalances.get(key);
        if (entry) {
          entry[0].amount += amount;
        } else {
          friendGroupBalances.set(key, [{ groupId: gid, amount }]);
        }
      }

      if (payerId !== userId && receiverId !== userId) {
        if (payerId === receiverId) continue;
        const friendId = payerId === userId ? receiverId : payerId;
        if (friendId === userId) continue;
      }
    }

    const friendMap = new Map<
      string,
      { totalAmount: number; groups: Map<string, number> }
    >();

    for (const friendId of friendIds) {
      friendMap.set(friendId, { totalAmount: 0, groups: new Map() });
    }

    for (const [key, balances] of friendGroupBalances) {
      const [gid, fid] = key.split(':');
      const amount = balances[0].amount;
      if (!friendMap.has(fid)) continue;
      const entry = friendMap.get(fid)!;
      entry.totalAmount += amount;
      entry.groups.set(gid, (entry.groups.get(gid) || 0) + amount);
    }

    const friends: FriendBalance[] = [];
    for (const friendId of friendIds) {
      const entry = friendMap.get(friendId);
      if (!entry) continue;

      const userInfo = userNameMap.get(friendId) || { name: friendId.slice(0, 8) };
      const groupBalances: GroupFriendBalance[] = [];
      for (const [gid, amount] of entry.groups) {
        if (amount === 0) continue;
        groupBalances.push({
          groupId: gid,
          groupName: groupNameMap.get(gid) || 'Unknown',
          amount,
        });
      }
      groupBalances.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

      friends.push({
        userId: friendId,
        userName: userInfo.name,
        userAvatar: userInfo.avatar,
        totalAmount: entry.totalAmount,
        groupBalances,
      });
    }

    friends.sort((a, b) => {
      const aNonZero = a.totalAmount !== 0 ? 0 : 1;
      const bNonZero = b.totalAmount !== 0 ? 0 : 1;
      if (aNonZero !== bNonZero) return aNonZero - bNonZero;
      return Math.abs(b.totalAmount) - Math.abs(a.totalAmount);
    });

    return { friends, error: null };
  } catch (e: any) {
    return { friends: [], error: e.message || 'Failed to fetch friend balances.' };
  }
}

/**
 * @function fetchSettlementsBetweenUsers
 * @description Fetches all settlements between two users across all groups,
 *              along with the group name for display context.
 *
 * @param userId — UUID of the current user
 * @param friendId — UUID of the friend
 * @returns Array of settlements with group name, newest first
 */
export async function fetchSettlementsBetweenUsers(
  userId: string,
  friendId: string
): Promise<{ settlements: (Settlement & { groupName: string })[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .or(`and(payer_id.eq.${userId},receiver_id.eq.${friendId}),and(payer_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false });

    if (error) {
      return { settlements: [], error: error.message };
    }

    const groupIds = [...new Set((data || []).map((s) => s.group_id as string))];
    const groupNameMap = new Map<string, string>();

    if (groupIds.length > 0) {
      const { data: groups } = await supabase
        .from('groups')
        .select('id, name')
        .in('id', groupIds);
      for (const g of groups || []) {
        groupNameMap.set(g.id as string, g.name as string);
      }
    }

    const settlements: (Settlement & { groupName: string })[] = (data || []).map(
      (item: Record<string, unknown>) => ({
        id: item.id as string,
        groupId: item.group_id as string,
        payerId: item.payer_id as string,
        receiverId: item.receiver_id as string,
        amount: item.amount as number,
        note: item.note as string | undefined,
        status: item.status as Settlement['status'],
        createdAt: item.created_at as string,
        groupName: groupNameMap.get(item.group_id as string) || 'Unknown',
      })
    );

    return { settlements, error: null };
  } catch (e: any) {
    return { settlements: [], error: e.message || 'Failed to fetch settlements.' };
  }
}
