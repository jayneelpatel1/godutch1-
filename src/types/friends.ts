/**
 * @file Friend balance type definitions.
 * @description Types for the Friends tab — aggregates per-friend balances across all groups.
 */

export interface GroupFriendBalance {
  groupId: string;
  groupName: string;
  amount: number;
}

export interface FriendBalance {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalAmount: number;
  groupBalances: GroupFriendBalance[];
}
