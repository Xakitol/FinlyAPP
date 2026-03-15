import type { FinanceEntry, ForwardViewSummary, HomeMonthData, RecurringRule, SavingsProgressSummary } from '../types/finance';

function sumAmounts(entries: FinanceEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

export function getRecordedIncome(entries: FinanceEntry[]) {
  return sumAmounts(entries.filter((entry) => entry.type === 'income' && entry.status === 'recorded'));
}

export function getRecordedExpenses(entries: FinanceEntry[]) {
  return sumAmounts(
    entries.filter(
      (entry) =>
        entry.type === 'expense' &&
        entry.status === 'recorded' &&
        entry.countsTowardRemaining !== false,
    ),
  );
}

export function getUpcomingObligations(entries: FinanceEntry[]) {
  return sumAmounts(
    entries.filter(
      (entry) =>
        entry.type === 'expense' &&
        entry.status === 'upcoming' &&
        entry.countsTowardRemaining !== false,
    ),
  );
}

export function getUpcomingDisplayItems(entries: FinanceEntry[]) {
  return entries
    .filter((entry) => entry.status === 'upcoming')
    .sort((a, b) => new Date(a.dueDate ?? a.date).getTime() - new Date(b.dueDate ?? b.date).getTime())
    .slice(0, 5);
}

export function getRemainingThisMonth(entries: FinanceEntry[]) {
  const income = getRecordedIncome(entries);
  const expenses = getRecordedExpenses(entries);
  const upcoming = getUpcomingObligations(entries);
  return income - expenses - upcoming;
}

export function getMonthlyStatus(remaining: number) {
  if (remaining >= 5000) {
    return 'אתם בשליטה';
  }

  if (remaining >= 1500) {
    return 'כדאי לשים לב';
  }

  return 'השבוע צפוף';
}

export function getHomeSnapshot(data: HomeMonthData) {
  const income = getRecordedIncome(data.entries);
  const expenses = getRecordedExpenses(data.entries);
  const upcoming = getUpcomingObligations(data.entries);
  const remaining = getRemainingThisMonth(data.entries);
  const upcomingItems = getUpcomingDisplayItems(data.entries);
  const savingsProgress =
    data.savingsGoal.targetAmount === 0
      ? 0
      : Math.min((data.savingsGoal.currentAmount / data.savingsGoal.targetAmount) * 100, 100);

  return {
    monthLabel: data.monthLabel,
    income,
    expenses,
    upcoming,
    remaining,
    upcomingItems,
    savingsCurrent: data.savingsGoal.currentAmount,
    savingsTarget: data.savingsGoal.targetAmount,
    savingsProgress,
    statusLabel: getMonthlyStatus(remaining),
  };
}

// ── "פיינלי מביט קדימה" helpers ──────────────────────────────────────────────

/**
 * Forward-looking summary based only on what is already known:
 * recorded income/expenses + upcoming obligations.
 * No predictions. No double-counting.
 *
 * @param today  Injected for testability; defaults to now.
 */
export function getForwardViewSummary(data: HomeMonthData, today: Date = new Date()): ForwardViewSummary {
  const upcomingItems = data.entries
    .filter(
      (e) =>
        e.type === 'expense' &&
        e.status === 'upcoming' &&
        e.countsTowardRemaining !== false,
    )
    .sort((a, b) => new Date(a.dueDate ?? a.date).getTime() - new Date(b.dueDate ?? b.date).getTime());

  const knownUpcomingTotal = sumAmounts(upcomingItems);
  const nextKnownCharge = upcomingItems[0] ?? null;
  const nextKnownChargeDate = nextKnownCharge ? (nextKnownCharge.dueDate ?? nextKnownCharge.date) : null;

  // projectedMonthEndRemaining == getRemainingThisMonth — same formula, surfaced
  // under a forward-view label so callers understand the intent.
  const projectedMonthEndRemaining = getRemainingThisMonth(data.entries);

  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remainingDaysInMonth = Math.max(lastDayOfMonth - today.getDate(), 0);

  return {
    knownUpcomingTotal,
    nextKnownCharge,
    nextKnownChargeDate,
    projectedMonthEndRemaining,
    remainingDaysInMonth,
    upcomingItems,
  };
}

export function getSavingsProgressSummary(data: HomeMonthData): SavingsProgressSummary {
  const { currentAmount, targetAmount } = data.savingsGoal;
  return {
    currentAmount,
    targetAmount,
    savingsProgressPercent:
      targetAmount === 0 ? 0 : Math.min((currentAmount / targetAmount) * 100, 100),
    savingsGap: Math.max(targetAmount - currentAmount, 0),
    isSavingsGoalMet: currentAmount >= targetAmount,
  };
}

/**
 * Generate projected upcoming entries for a target month from recurring rules.
 * Skips rules where an entry with the same title already exists in that month
 * (recorded or upcoming) to prevent double-counting.
 */
export function projectRecurringRules(
  rules: RecurringRule[],
  targetMonth: number,
  targetYear: number,
  existingEntries: FinanceEntry[],
): FinanceEntry[] {
  return rules
    .filter((rule) => {
      return !existingEntries.some(
        (e) =>
          e.recurring &&
          e.type === 'expense' &&
          e.title === rule.title &&
          new Date(e.date).getMonth() === targetMonth &&
          new Date(e.date).getFullYear() === targetYear,
      );
    })
    .map((rule) => {
      const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
      const day = Math.min(rule.dayOfMonth, lastDay);
      const mm = String(targetMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return {
        id: `projected-${rule.id}-${targetYear}-${targetMonth}`,
        type: 'expense' as const,
        amount: rule.amount,
        date: `${targetYear}-${mm}-${dd}`,
        paymentMethod: rule.paymentMethod,
        status: 'upcoming' as const,
        recurring: true,
        source: 'system' as const,
        title: rule.title,
        category: rule.category,
        countsTowardRemaining: true,
        note: rule.note,
      };
    });
}
