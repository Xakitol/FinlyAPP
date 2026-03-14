export type EntryType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'bank' | 'credit';
export type EntryStatus = 'recorded' | 'upcoming';

export interface FinanceEntry {
  id: string;
  type: EntryType;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  status: EntryStatus;
  recurring: boolean;
  dueDate?: string;
  source: 'manual' | 'system';
  title: string;
  category: string;
  note?: string;
  countsTowardRemaining?: boolean;
}

export interface SavingsGoal {
  currentAmount: number;
  targetAmount: number;
}

export interface HomeMonthData {
  monthLabel: string;
  entries: FinanceEntry[];
  savingsGoal: SavingsGoal;
}
