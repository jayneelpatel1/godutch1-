export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  note: string;
  category: string;
  splitType: 'equal' | 'exact' | 'percentage' | 'ratio';
  splits: { userId: string; owedAmount: number }[];
  createdAt: Date;
}

export interface Settlement {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  status: 'pending' | 'completed';
  createdAt: Date;
}

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'You',
    phone: '+1234567890',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'user2',
    name: 'Alice',
    phone: '+1234567891',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 'user3',
    name: 'Bob',
    phone: '+1234567892',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 'user4',
    name: 'Charlie',
    phone: '+1234567893',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'Office Lunch',
    createdBy: 'user1',
    members: ['user1', 'user2', 'user3'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'group2',
    name: 'Trip to Bali',
    createdBy: 'user2',
    members: ['user1', 'user2', 'user3', 'user4'],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'group3',
    name: 'Weekend Groceries',
    createdBy: 'user1',
    members: ['user1', 'user4'],
    createdAt: new Date('2024-03-10'),
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp1',
    groupId: 'group1',
    paidBy: 'user1',
    amount: 45.0,
    note: 'Pizza lunch',
    category: 'food',
    splitType: 'equal',
    splits: [
      { userId: 'user1', owedAmount: 15.0 },
      { userId: 'user2', owedAmount: 15.0 },
      { userId: 'user3', owedAmount: 15.0 },
    ],
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'exp2',
    groupId: 'group1',
    paidBy: 'user2',
    amount: 30.0,
    note: 'Coffee and snacks',
    category: 'drinks',
    splitType: 'equal',
    splits: [
      { userId: 'user1', owedAmount: 10.0 },
      { userId: 'user2', owedAmount: 10.0 },
      { userId: 'user3', owedAmount: 10.0 },
    ],
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'exp3',
    groupId: 'group2',
    paidBy: 'user3',
    amount: 200.0,
    note: 'Flight booking',
    category: 'travel',
    splitType: 'equal',
    splits: [
      { userId: 'user1', owedAmount: 50.0 },
      { userId: 'user2', owedAmount: 50.0 },
      { userId: 'user3', owedAmount: 50.0 },
      { userId: 'user4', owedAmount: 50.0 },
    ],
    createdAt: new Date('2024-03-17'),
  },
  {
    id: 'exp4',
    groupId: 'group3',
    paidBy: 'user4',
    amount: 85.5,
    note: 'Weekly groceries',
    category: 'groceries',
    splitType: 'equal',
    splits: [
      { userId: 'user1', owedAmount: 42.75 },
      { userId: 'user4', owedAmount: 42.75 },
    ],
    createdAt: new Date('2024-03-18'),
  },
];

export const mockSettlements: Settlement[] = [
  {
    id: 'set1',
    payerId: 'user2',
    receiverId: 'user1',
    amount: 25.0,
    status: 'completed',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'set2',
    payerId: 'user3',
    receiverId: 'user2',
    amount: 40.0,
    status: 'pending',
    createdAt: new Date('2024-03-18'),
  },
];

export function getBalances(groupId: string): { userId: string; balance: number }[] {
  const group = mockGroups.find((g) => g.id === groupId);
  if (!group) return [];

  const balances: Record<string, number> = {};
  group.members.forEach((m) => (balances[m] = 0));

  mockExpenses
    .filter((e) => e.groupId === groupId)
    .forEach((expense) => {
      const paidBy = expense.paidBy;
      const totalSplit = expense.splits.reduce((sum, s) => sum + s.owedAmount, 0);
      balances[paidBy] = (balances[paidBy] || 0) + totalSplit;
      expense.splits.forEach((split) => {
        balances[split.userId] = (balances[split.userId] || 0) - split.owedAmount;
      });
    });

  return Object.entries(balances).map(([userId, balance]) => ({ userId, balance }));
}

export function getGroupBalance(groupId: string): number {
  const balances = getBalances(groupId);
  const user1Balance = balances.find((b) => b.userId === 'user1');
  return user1Balance?.balance || 0;
}

export const currentUserId = 'user1';