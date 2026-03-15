import { useMemo, useState } from 'react';
import { ChartModal } from './components/modals/ChartModal';
import { InsightsModal } from './components/modals/InsightsModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { StarField } from './components/effects/StarField';
import { HomeHeader } from './components/home/HomeHeader';
import { FloatingCirclesHome } from './components/home/FloatingCirclesHome';
import { HEBREW_MONTH_NAMES, YEAR, DEFAULT_MONTH_INDEX } from '../data/mockHome';
import { getHomeSnapshot, projectRecurringRules } from '../utils/homeCalculations';
import type { FinanceEntry, RecurringRule, SavingsGoal } from '../types/finance';

export default function App() {
  // ── Modal open state ────────────────────────────────────────────────────────
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  // ── Month selection ─────────────────────────────────────────────────────────
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(DEFAULT_MONTH_INDEX);

  // ── Per-month entries (start empty — user builds from scratch) ───────────────
  const [monthEntriesMap, setMonthEntriesMap] = useState<Record<number, FinanceEntry[]>>({});
  const [savingsGoalsMap, setSavingsGoalsMap] = useState<Record<number, SavingsGoal>>({});

  // ── Recurring rules — created only by manual user action in the form ─────────
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);

  // ── Derived home data ───────────────────────────────────────────────────────
  const homeData = useMemo(() => {
    const baseEntries = monthEntriesMap[selectedMonthIndex] ?? [];
    const projected = projectRecurringRules(recurringRules, selectedMonthIndex, YEAR, baseEntries);
    const savingsGoal = savingsGoalsMap[selectedMonthIndex] ?? { currentAmount: 0, targetAmount: 0 };
    return {
      monthLabel: HEBREW_MONTH_NAMES[selectedMonthIndex],
      entries: [...baseEntries, ...projected],
      savingsGoal,
    };
  }, [selectedMonthIndex, monthEntriesMap, savingsGoalsMap, recurringRules]);

  const snapshot = useMemo(() => getHomeSnapshot(homeData), [homeData]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleMonthChange(index: number) {
    setSelectedMonthIndex(index);
  }

  function handleSaveEntry(data: Omit<FinanceEntry, 'id'>, existingId?: string) {
    const entryId = existingId ?? `entry-${Date.now()}`;
    const savedEntry: FinanceEntry = { ...data, id: entryId };

    setMonthEntriesMap((prev) => {
      const current = prev[selectedMonthIndex] ?? [];
      if (existingId) {
        return { ...prev, [selectedMonthIndex]: current.map((e) => (e.id === existingId ? savedEntry : e)) };
      }
      return { ...prev, [selectedMonthIndex]: [...current, savedEntry] };
    });

    // Sync recurring rule: add/update if recurring expense, remove if not
    const ruleId = `rule-${entryId}`;
    if (data.recurring && data.type === 'expense') {
      const rule: RecurringRule = {
        id: ruleId,
        title: data.title,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        dayOfMonth: new Date(data.date).getDate(),
      };
      setRecurringRules((prev) => [...prev.filter((r) => r.id !== ruleId), rule]);
    } else if (existingId) {
      setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));
    }

    setEditingEntry(null);
    setFormOpen(false);
  }

  function handleDeleteEntry(id: string) {
    setMonthEntriesMap((prev) => ({
      ...prev,
      [selectedMonthIndex]: (prev[selectedMonthIndex] ?? []).filter((e) => e.id !== id),
    }));
    setRecurringRules((prev) => prev.filter((r) => r.id !== `rule-${id}`));
  }

  function handleEditEntry(entry: FinanceEntry) {
    setEditingEntry(entry);
    setTableOpen(false);
    setFormOpen(true);
  }

  function handleSaveSavingsGoal(targetAmount: number) {
    setSavingsGoalsMap((prev) => ({
      ...prev,
      [selectedMonthIndex]: {
        currentAmount: prev[selectedMonthIndex]?.currentAmount ?? 0,
        targetAmount,
      },
    }));
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const backgroundGradient = darkMode
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative animate-in fade-in duration-700"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={darkMode} />

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-4 pb-8 sm:px-5">
        <HomeHeader
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          availableMonths={HEBREW_MONTH_NAMES}
          selectedMonthIndex={selectedMonthIndex}
          onMonthChange={handleMonthChange}
        />

        <FloatingCirclesHome
          darkMode={darkMode}
          snapshot={snapshot}
          onAddClick={() => { setEditingEntry(null); setFormOpen(true); }}
          onOpenTransactions={() => setTableOpen(true)}
        />
      </div>

      <InsightsModal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        onOpenChart={() => setChartOpen(true)}
        darkMode={darkMode}
      />
      <ChartModal open={chartOpen} onClose={() => setChartOpen(false)} darkMode={darkMode} />

      <TransactionFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingEntry(null); }}
        darkMode={darkMode}
        initialEntry={editingEntry}
        onSave={handleSaveEntry}
      />

      <TransactionTableModal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        darkMode={darkMode}
        entries={homeData.entries.filter((e) => e.status === 'recorded')}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />

      <SavingsGoalModal
        open={savingsGoalOpen}
        onClose={() => setSavingsGoalOpen(false)}
        currentGoal={savingsGoalsMap[selectedMonthIndex]?.targetAmount ?? 0}
        onSave={handleSaveSavingsGoal}
      />
    </div>
  );
}
