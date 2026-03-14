import type { FinanceEntry, HomeMonthData } from '../types/finance';

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
  const savingsProgress = Math.min(
    (data.savingsGoal.currentAmount / data.savingsGoal.targetAmount) * 100,
    100,
  );

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
