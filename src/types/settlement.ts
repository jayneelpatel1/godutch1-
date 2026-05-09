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
