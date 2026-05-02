export type SplitType = 'equal' | 'exact' | 'percentage' | 'ratio';

export type ExpenseCategory = 'food' | 'rent' | 'petrol' | 'travel' | 'shopping' | 'utilities' | 'entertainment' | 'other';

export interface ExpenseSplit {
  userId: string;
  owedAmount: number;
  percentage?: number;
  ratio?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  note: string;
  category: ExpenseCategory;
  splitType: SplitType;
  date: string;
  createdBy: string;
  createdAt: string;
  splits?: ExpenseSplit[];
}

export interface ExpenseInput {
  groupId: string;
  paidBy: string;
  amount: number;
  note: string;
  category: ExpenseCategory;
  splitType: SplitType;
  date: string;
  splits: ExpenseSplit[];
}

export interface ExpenseWithSplits extends Expense {
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
