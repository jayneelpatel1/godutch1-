import type { ExpenseWithSplits } from '@/types/expense';
import type { Settlement } from '@/types/settlement';

export interface MemberBalance {
  userId: string;
  amount: number;
}

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
