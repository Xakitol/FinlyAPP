/**
 * Rule-based recurring detection for "פיינלי מביט קדימה".
 *
 * No AI, no ML. A deterministic similarity engine that compares this month's
 * non-recurring expenses against the previous month to surface candidates.
 *
 * Confidence levels:
 *  high   — title match + same category + amount within tolerance
 *  medium — same category + amount within tolerance + similar day of month
 */
import type { FinanceEntry, RecurringCandidate } from '../types/finance';

// ── Similarity helpers ────────────────────────────────────────────────────────

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isTitleSimilar(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}

function isAmountSimilar(a: number, b: number, tolerancePercent = 0.25): boolean {
  const max = Math.max(a, b);
  if (max === 0) return true;
  return Math.abs(a - b) / max <= tolerancePercent;
}

function getDayOfMonth(dateStr: string): number {
  return new Date(dateStr).getDate();
}

function isDaySimilar(a: string, b: string, toleranceDays = 7): boolean {
  return Math.abs(getDayOfMonth(a) - getDayOfMonth(b)) <= toleranceDays;
}

// ── Main detection function ───────────────────────────────────────────────────

/**
 * Compare current-month non-recurring expenses against previous-month entries.
 * Returns a list of candidates the user might want to mark as recurring.
 *
 * @param referenceDate  Determines which month is "current". Defaults to today.
 *                       Override in tests / dev simulations to control month scope.
 */
export function detectRecurringCandidates(
  currentEntries: FinanceEntry[],
  previousEntries: FinanceEntry[],
  referenceDate: Date = new Date(),
): RecurringCandidate[] {
  const candidates: RecurringCandidate[] = [];

  const refMonth = referenceDate.getMonth();
  const refYear = referenceDate.getFullYear();

  // Only look at non-recurring recorded expenses within the reference month
  const currentCandidates = currentEntries.filter((e) => {
    const d = new Date(e.date);
    return (
      e.type === 'expense' &&
      e.status === 'recorded' &&
      !e.recurring &&
      d.getMonth() === refMonth &&
      d.getFullYear() === refYear
    );
  });

  const prevExpenses = previousEntries.filter((e) => e.type === 'expense');

  for (const current of currentCandidates) {
    // Stop after we've already matched this entry (first match wins)
    if (candidates.find((c) => c.currentEntry.id === current.id)) continue;

    for (const prev of prevExpenses) {
      const titleMatch = isTitleSimilar(current.title, prev.title);
      const categoryMatch = current.category === prev.category;
      const amountMatch = isAmountSimilar(current.amount, prev.amount);
      const dayMatch = isDaySimilar(current.date, prev.date);

      let confidence: 'high' | 'medium' | null = null;

      if (titleMatch && categoryMatch && amountMatch) {
        confidence = 'high';
      } else if (categoryMatch && amountMatch && dayMatch) {
        confidence = 'medium';
      }

      if (confidence) {
        candidates.push({
          currentEntry: current,
          matchedEntry: prev,
          confidence,
          suggestionText: 'פיינלי מזהה הוצאה שחוזרת על עצמה?',
          actionText: 'לשמור את זה כהוצאה קבועה?',
        });
        break; // first match per current entry is enough
      }
    }
  }

  // Surface high-confidence first
  return candidates.sort((a, b) => (a.confidence === 'high' ? -1 : b.confidence === 'high' ? 1 : 0));
}
