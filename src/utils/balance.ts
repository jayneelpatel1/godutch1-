/**
 * @file Balance computation engine.
 * @description Calculates per-member balances and net balances from expenses and settlements.
 *
 * @remarks
 *   Positive amount for a member = that member owes the current user.
 *   Negative amount for a member = current user owes that member.
 *
 *   The algo iterates over every expense and settlement, which is O(n*m) where
 *   n = number of expenses and m = number of members. Acceptable for typical group sizes.
 */

import type { ExpenseWithSplits } from '@/types/expense';
import type { Settlement } from '@/types/settlement';

export interface MemberBalance {
  userId: string;
  amount: number;
}

/**
 * @function computeBalances
 * @description Computes each member's net balance relative to the current user.
 *              Iterates over expenses (what others owe user minus what user owes others)
 *              and settlements (what user received minus what user paid).
 *
 * @param expenses — Array of expenses with splits
 * @param memberIds — All member IDs in the group (excluding current user)
 * @param currentUserId — The reference user
 * @param settlements — Optional array of settlements to factor in
 * @returns Array of per-member balance amounts
 */
export function computeBalances(
  expenses: ExpenseWithSplits[],
  memberIds: string[],
  currentUserId: string,
  settlements?: Settlement[]
): MemberBalance[] {
  const balances: MemberBalance[] = [];

  for (const memberId of memberIds) {
    if (memberId === currentUserId) continue;

    let amount = 0;

    for (const expense of expenses) {
      const splits = expense.splits || [];

      if (expense.paidBy === currentUserId) {
        const memberSplit = splits.find(s => s.userId === memberId);
        if (memberSplit) {
          amount += memberSplit.owedAmount;
        }
      }

      if (expense.paidBy === memberId) {
        const currentUserSplit = splits.find(s => s.userId === currentUserId);
        if (currentUserSplit) {
          amount -= currentUserSplit.owedAmount;
        }
      }
    }

    if (settlements) {
      for (const s of settlements) {
        if (s.payerId === currentUserId && s.receiverId === memberId) {
          amount += s.amount;
        }
        if (s.payerId === memberId && s.receiverId === currentUserId) {
          amount -= s.amount;
        }
      }
    }

    balances.push({ userId: memberId, amount });
  }

  return balances;
}

/**
 * @function computeNetBalance
 * @description Calculates the current user's overall net balance across all expenses
 *              and settlements. Positive = user is owed money, negative = user owes.
 *
 * @param expenses — Array of expenses with splits
 * @param currentUserId — The reference user
 * @param settlements — Optional array of settlements to factor in
 * @returns Net balance amount
 */
export function computeNetBalance(
  expenses: ExpenseWithSplits[],
  currentUserId: string,
  settlements?: Settlement[]
): number {
  let net = 0;
  for (const expense of expenses) {
    const splits = expense.splits || [];

    if (expense.paidBy === currentUserId) {
      const othersOwed = splits
        .filter(s => s.userId !== currentUserId)
        .reduce((sum, s) => sum + s.owedAmount, 0);
      net += othersOwed;
    } else {
      const userSplit = splits.find(s => s.userId === currentUserId);
      if (userSplit) {
        net -= userSplit.owedAmount;
      }
    }
  }

  if (settlements) {
    for (const s of settlements) {
      if (s.receiverId === currentUserId) {
        net -= s.amount;
      }
      if (s.payerId === currentUserId) {
        net += s.amount;
      }
    }
  }

  return net;
}
