import { useMemo, useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignupMethodScreen } from './components/SignupMethodScreen';
import { LoginMethodScreen } from './components/LoginMethodScreen';
import { PhoneNumberScreen } from './components/PhoneNumberScreen';
import { EmailSignupScreen } from './components/EmailSignupScreen';
import { OnboardingNameScreen } from './components/OnboardingNameScreen';
import { OnboardingGenderScreen } from './components/OnboardingGenderScreen';
import { OnboardingHouseholdScreen } from './components/OnboardingHouseholdScreen';
import { OnboardingGoalsScreen } from './components/OnboardingGoalsScreen';
import { OnboardingSuccessScreen } from './components/OnboardingSuccessScreen';
import { OnboardingWelcomeScreen } from './components/OnboardingWelcomeScreen';
import { ChartModal } from './components/modals/ChartModal';
import { InsightsModal } from './components/modals/InsightsModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { UpcomingExpensesModal } from './components/modals/UpcomingExpensesModal';
import { IncomeBreakdownModal } from './components/modals/IncomeBreakdownModal';
import { ExpenseBreakdownModal } from './components/modals/ExpenseBreakdownModal';
import { ImportModal } from './components/modals/ImportModal';
import { StarField } from './components/effects/StarField';
import { HomeHeader } from './components/home/HomeHeader';
import { FloatingCirclesHome } from './components/home/FloatingCirclesHome';
import { HEBREW_MONTH_NAMES, YEAR, DEFAULT_MONTH_INDEX } from '../data/mockHome';
import { getHomeSnapshot, projectRecurringRules } from '../utils/homeCalculations';
import { signInWithGoogle } from '../utils/authGoogle';
import { loadDescMemory, saveDescMemory, recordTransaction } from '../utils/descMemory';
import type { ParsedRow } from '../utils/importParser';
import type { FinanceEntry, RecurringRule, SavingsGoal } from '../types/finance';

export default function App() {
  // ── App screen routing ───────────────────────────────────────────────────────
  // NOTE: must be declared before all other hooks — no early return allowed with hooks below
  const [appScreen, setAppScreen] = useState<
    'welcome' | 'signup-method' | 'login-method' | 'phone-number' | 'login-phone' | 'email-signup' | 'login-email' | 'home' |
    'onboarding-name' | 'onboarding-gender' | 'onboarding-household' | 'onboarding-goals' | 'onboarding-welcome' | 'onboarding-success'
  >(() => {
    if (!localStorage.getItem('finly_onboarded')) return 'welcome';
    const lastActive = parseInt(localStorage.getItem('finly_last_active') ?? '0', 10);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastActive >= thirtyDaysMs) return 'login-method';
    if (!localStorage.getItem('finly_onboarded_complete')) return 'onboarding-name';
    return 'home';
  });

  // ── Modal open state ────────────────────────────────────────────────────────
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // ── Month selection ─────────────────────────────────────────────────────────
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(DEFAULT_MONTH_INDEX);

  // ── Per-month entries (persisted) ───────────────────────────────────────────
  const [monthEntriesMap, setMonthEntriesMap] = useState<Record<number, FinanceEntry[]>>(() => {
    try { return JSON.parse(localStorage.getItem('finly_entries') ?? 'null') ?? {}; } catch { return {}; }
  });
  const [savingsGoalsMap, setSavingsGoalsMap] = useState<Record<number, SavingsGoal>>(() => {
    try { return JSON.parse(localStorage.getItem('finly_goals') ?? 'null') ?? {}; } catch { return {}; }
  });

  // ── Recurring rules (persisted) ──────────────────────────────────────────────
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(() => {
    try { return JSON.parse(localStorage.getItem('finly_rules') ?? 'null') ?? []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('finly_entries', JSON.stringify(monthEntriesMap)); }, [monthEntriesMap]);
  useEffect(() => { localStorage.setItem('finly_goals', JSON.stringify(savingsGoalsMap)); }, [savingsGoalsMap]);
  useEffect(() => { localStorage.setItem('finly_rules', JSON.stringify(recurringRules)); }, [recurringRules]);

  // ── Derived home data ───────────────────────────────────────────────────────
  const homeData = useMemo(() => {
    const baseEntries = monthEntriesMap[selectedMonthIndex] ?? [];
    const projected = projectRecurringRules(recurringRules, selectedMonthIndex, YEAR, baseEntries);
    const savingsGoal = savingsGoalsMap[selectedMonthIndex] ?? { currentAmount: 0, targetAmount: 0 };
    const prevIndex = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
    const previousMonthEntries = monthEntriesMap[prevIndex] ?? [];
    return {
      monthLabel: HEBREW_MONTH_NAMES[selectedMonthIndex],
      entries: [...baseEntries, ...projected],
      savingsGoal,
      previousMonthEntries,
    };
  }, [selectedMonthIndex, monthEntriesMap, savingsGoalsMap, recurringRules]);

  const snapshot = useMemo(() => getHomeSnapshot(homeData), [homeData]);

  // ── Routing handlers ─────────────────────────────────────────────────────────
  function enterHome() {
    localStorage.setItem('finly_onboarded', '1');
    localStorage.setItem('finly_last_active', String(Date.now()));
    setAppScreen('home');
  }

  // Used by Google signup — name already saved, skip to gender screen
  function enterHomeAfterSignupSkipName() {
    localStorage.setItem('finly_onboarded', '1');
    localStorage.setItem('finly_last_active', String(Date.now()));
    if (!localStorage.getItem('finly_onboarded_complete')) {
      setAppScreen('onboarding-gender');
    } else {
      setAppScreen('home');
    }
  }

  async function handleGoogleSignup() {
    const name = await signInWithGoogle();
    if (name) {
      enterHomeAfterSignupSkipName();
    }
    // if null — do nothing, stay on signup screen
  }

  // Used by signup paths only — routes to onboarding if not yet completed
  function enterHomeAfterSignup() {
    localStorage.setItem('finly_onboarded', '1');
    localStorage.setItem('finly_last_active', String(Date.now()));
    if (!localStorage.getItem('finly_onboarded_complete')) {
      setAppScreen('onboarding-name');
    } else {
      setAppScreen('home');
    }
  }

  // Dev-only: reset all auth state and return to Welcome without reload
  function handleDevReset() {
    localStorage.removeItem('finly_onboarded');
    localStorage.removeItem('finly_last_active');
    setAppScreen('welcome');
  }

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

    // Sync recurring rule: add/update if recurring, remove if not
    const ruleId = `rule-${entryId}`;
    if (data.recurring) {
      const rule: RecurringRule = {
        id: ruleId,
        type: data.type,
        title: data.title,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        dayOfMonth: new Date(data.date).getDate(),
        startMonth: selectedMonthIndex,
        startYear: YEAR,
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

  function handleMarkAsPaid(entry: FinanceEntry) {
    if (entry.source === 'system') {
      // Projected entry — add as recorded to the month's entries
      const paid: FinanceEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
        status: 'recorded',
        source: 'manual',
      };
      setMonthEntriesMap((prev) => ({
        ...prev,
        [selectedMonthIndex]: [...(prev[selectedMonthIndex] ?? []), paid],
      }));
    } else {
      // Manual upcoming entry — update status in place
      setMonthEntriesMap((prev) => ({
        ...prev,
        [selectedMonthIndex]: (prev[selectedMonthIndex] ?? []).map((e) =>
          e.id === entry.id ? { ...e, status: 'recorded' as const } : e,
        ),
      }));
    }
  }

  function handleEditEntry(entry: FinanceEntry) {
    setEditingEntry(entry);
    setTableOpen(false);
    setFormOpen(true);
  }

  function handleDeleteRule(entry: FinanceEntry) {
    setRecurringRules((prev) => prev.filter((r) => !(r.type === entry.type && r.title === entry.title)));
  }

  function handleImport(rows: ParsedRow[], targetMonth: number) {
    const ts = Date.now();
    let memory = loadDescMemory();
    const newEntries: FinanceEntry[] = rows.map((row, i) => {
      memory = recordTransaction(memory, row.description, row.type, row.category);
      return {
        id: `entry-${ts}-${i}`,
        date: row.date || new Date().toISOString().slice(0, 10),
        title: row.description,
        amount: row.amount,
        type: row.type,
        category: row.category,
        paymentMethod: 'bank',
        status: 'recorded' as const,
        source: 'manual' as const,
        recurring: false,
        countsTowardRemaining: true,
      };
    });
    saveDescMemory(memory);
    setMonthEntriesMap((prev) => ({
      ...prev,
      [targetMonth]: [...(prev[targetMonth] ?? []), ...newEntries],
    }));
  }

  function handleDeleteMultiple(ids: string[]) {
    const idSet = new Set(ids);
    setMonthEntriesMap((prev) => ({
      ...prev,
      [selectedMonthIndex]: (prev[selectedMonthIndex] ?? []).filter((e) => !idSet.has(e.id)),
    }));
    setRecurringRules((prev) => prev.filter((r) => !ids.some((id) => r.id === `rule-${id}`)));
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

  // ── Welcome screen ───────────────────────────────────────────────────────────
  if (appScreen === 'welcome') {
    return (
      <WelcomeScreen
        onLogin={() => setAppScreen('login-method')}
        onSignup={() => setAppScreen('signup-method')}
      />
    );
  }

  // ── Signup method screen ──────────────────────────────────────────────────────
  if (appScreen === 'signup-method') {
    return (
      <SignupMethodScreen
        onBack={() => setAppScreen('welcome')}
        onGoogle={handleGoogleSignup}
        onPhone={() => setAppScreen('phone-number')}
        onApple={enterHomeAfterSignup}
        onEmail={() => setAppScreen('email-signup')}
      />
    );
  }

  // ── Signup phone number screen ────────────────────────────────────────────────
  if (appScreen === 'phone-number') {
    return (
      <PhoneNumberScreen
        onBack={() => setAppScreen('signup-method')}
        onContinue={enterHomeAfterSignup}
      />
    );
  }

  // ── Email signup screen ───────────────────────────────────────────────────────
  if (appScreen === 'email-signup') {
    return (
      <EmailSignupScreen
        onBack={() => setAppScreen('signup-method')}
        onContinue={enterHomeAfterSignup}
      />
    );
  }

  // ── Onboarding screens ────────────────────────────────────────────────────────
  if (appScreen === 'onboarding-name') {
    return <OnboardingNameScreen onContinue={() => setAppScreen('onboarding-gender')} onBack={() => setAppScreen('signup-method')} />;
  }

  if (appScreen === 'onboarding-gender') {
    return <OnboardingGenderScreen onContinue={() => setAppScreen('onboarding-household')} onBack={() => setAppScreen('onboarding-name')} />;
  }

  if (appScreen === 'onboarding-household') {
    return <OnboardingHouseholdScreen onContinue={() => setAppScreen('onboarding-goals')} onBack={() => setAppScreen('onboarding-gender')} />;
  }

  if (appScreen === 'onboarding-goals') {
    return <OnboardingGoalsScreen onContinue={() => setAppScreen('onboarding-welcome')} onBack={() => setAppScreen('onboarding-household')} />;
  }

  if (appScreen === 'onboarding-welcome') {
    return <OnboardingWelcomeScreen onContinue={() => setAppScreen('onboarding-success')} onBack={() => setAppScreen('onboarding-goals')} />;
  }

  if (appScreen === 'onboarding-success') {
    return <OnboardingSuccessScreen onContinue={() => setAppScreen('home')} />;
  }

  // ── Login method screen ───────────────────────────────────────────────────────
  if (appScreen === 'login-method') {
    return (
      <LoginMethodScreen
        onBack={() => setAppScreen('welcome')}
        onPhone={() => setAppScreen('login-phone')}
        onBiometric={enterHome}
        onGoogle={enterHome}
        onApple={enterHome}
        onEmail={() => setAppScreen('login-email')}
      />
    );
  }

  // ── Login email screen ────────────────────────────────────────────────────────
  if (appScreen === 'login-email') {
    return (
      <EmailSignupScreen
        mode="login"
        onBack={() => setAppScreen('login-method')}
        onContinue={enterHome}
      />
    );
  }

  // ── Login phone number screen ─────────────────────────────────────────────────
  if (appScreen === 'login-phone') {
    return (
      <PhoneNumberScreen
        onBack={() => setAppScreen('login-method')}
        onContinue={enterHome}
      />
    );
  }

  // ── Home screen ──────────────────────────────────────────────────────────────
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

      {import.meta.env.DEV && (
        <button
          onClick={handleDevReset}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-medium active:scale-95 transition-transform"
          style={{
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.30)',
            color: 'rgba(109,40,217,0.70)',
          }}
        >
          ← חזרה למסך פתיחה (dev)
        </button>
      )}

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
          onAddClick={() => setAddOpen(true)}
          onOpenTransactions={() => setTableOpen(true)}
          onOpenSavingsGoal={() => setSavingsGoalOpen(true)}
          onOpenUpcoming={() => setUpcomingOpen(true)}
          onOpenIncome={() => setIncomeOpen(true)}
          onOpenExpenses={() => setExpensesOpen(true)}
          onOpenImport={() => setImportOpen(true)}
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

      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        darkMode={darkMode}
        onSave={handleSaveEntry}
      />

      <TransactionTableModal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        darkMode={darkMode}
        entries={homeData.entries}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onDeleteMultiple={handleDeleteMultiple}
        onMarkAsPaid={handleMarkAsPaid}
        onDeleteRule={handleDeleteRule}
        onOpenImport={() => setImportOpen(true)}
      />

      <UpcomingExpensesModal
        open={upcomingOpen}
        onClose={() => setUpcomingOpen(false)}
        darkMode={darkMode}
        entries={homeData.entries.filter((e) => e.status === 'upcoming' && e.type === 'expense').sort((a, b) => a.date.localeCompare(b.date))}
        onMarkAsPaid={handleMarkAsPaid}
        onDeleteRule={handleDeleteRule}
      />

      <ExpenseBreakdownModal
        open={expensesOpen}
        onClose={() => setExpensesOpen(false)}
        darkMode={darkMode}
        entries={homeData.entries.filter((e) => e.type === 'expense').sort((a, b) => a.date.localeCompare(b.date))}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <IncomeBreakdownModal
        open={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        darkMode={darkMode}
        entries={homeData.entries.filter((e) => e.type === 'income').sort((a, b) => a.date.localeCompare(b.date))}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        darkMode={darkMode}
        onImport={handleImport}
      />

      <SavingsGoalModal
        open={savingsGoalOpen}
        onClose={() => setSavingsGoalOpen(false)}
        darkMode={darkMode}
        currentGoal={savingsGoalsMap[selectedMonthIndex]?.targetAmount ?? 0}
        onSave={handleSaveSavingsGoal}
      />
    </div>
  );
}
