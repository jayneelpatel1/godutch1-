/**
 * @file Settlement type definitions.
 * @description Types for settlement records — one person pays another to settle up.
 *              Status is always 'completed' on creation (no pending settlements in v1).
 */

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface SettlementInput {
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
}
