import type { FinanceEntry } from '../types/finance';

export function getOverduePendingEntries(entries: FinanceEntry[]): FinanceEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return entries.filter(
    (e) => e.recurring === true && e.status === 'upcoming' && e.source === 'system' && e.date <= today,
  );
}
