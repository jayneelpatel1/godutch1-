export type SplitType = 'equal' | 'exact' | 'percentage' | 'ratio';

export interface ExpenseSplit {
  userId: string;
  owedAmount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  note: string;
  category: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  createdAt: string;
}

export interface ExpenseInput {
  groupId: string;
  paidBy: string;
  amount: number;
  note: string;
  category: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearExpenses: () => void;
}
