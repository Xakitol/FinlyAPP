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
  /** Entries from the previous month — used for recurring detection only */
  previousMonthEntries?: FinanceEntry[];
}

// ── Output shapes for "פיינלי מביט קדימה" ──────────────────────────────────

export type RecurringConfidence = 'high' | 'medium';

export interface RecurringCandidate {
  currentEntry: FinanceEntry;
  matchedEntry: FinanceEntry;
  confidence: RecurringConfidence;
  /** Hebrew UI suggestion line */
  suggestionText: string;
  /** Hebrew UI action prompt */
  actionText: string;
}

export interface ForwardViewSummary {
  /** Sum of upcoming obligations that count toward remaining (no double-count) */
  knownUpcomingTotal: number;
  /** Next upcoming item by due date, null if none */
  nextKnownCharge: FinanceEntry | null;
  /** ISO date string of the next charge, null if none */
  nextKnownChargeDate: string | null;
  /** income − recorded expenses − all known upcoming (end-of-month projection) */
  projectedMonthEndRemaining: number;
  /** Calendar days left in the current month */
  remainingDaysInMonth: number;
  /** Upcoming items sorted by due date (display list) */
  upcomingItems: FinanceEntry[];
}

export interface SavingsProgressSummary {
  currentAmount: number;
  targetAmount: number;
  /** 0–100 */
  savingsProgressPercent: number;
  /** targetAmount − currentAmount, clamped to 0 */
  savingsGap: number;
  isSavingsGoalMet: boolean;
}

/** A user-approved recurring expense that projects into future months */
export interface RecurringRule {
  id: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  /** Day of the month this expense recurs on (1–31) */
  dayOfMonth: number;
  note?: string;
}
