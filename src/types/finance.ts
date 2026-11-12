export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'transfer' | 'cash' | 'ewallet' | 'credit_card';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string; // hex or tailwind class
  defaultBudget?: number; // default budget per month in IDR
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalTarget: number;
  categoryTargets: Record<string, number>; // categoryId -> target amount
}

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercent: number;
  avgDailyExpense: number;
  projectedMonthEndExpense: number;
  daysPassed: number;
  daysInMonth: number;
}
