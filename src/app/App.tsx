import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ScreenTransition } from './components/ScreenTransition';
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
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { AddTransactionNumpad } from './components/AddTransactionNumpad';
import { AddTransactionDetails } from './components/AddTransactionDetails';
import { UpcomingExpensesModal } from './components/modals/UpcomingExpensesModal';
import { IncomeBreakdownModal } from './components/modals/IncomeBreakdownModal';
import { ExpenseBreakdownModal } from './components/modals/ExpenseBreakdownModal';
import { ImportModal } from './components/modals/ImportModal';
import { FloatingCirclesHome } from './components/home/FloatingCirclesHome';
import { MonthCarousel } from './components/home/MonthCarousel';
import { SwipeableScreens } from './components/home/SwipeableScreens';
import { PillBar } from './components/home/PillBar';
import { UpcomingScreen } from './components/home/UpcomingScreen';
import { TransactionsScreen } from './components/home/TransactionsScreen';
import { HEBREW_MONTH_NAMES, YEAR, DEFAULT_MONTH_INDEX } from '../data/mockHome';
import { getHomeSnapshot, projectRecurringRules } from '../utils/homeCalculations';
import { signInWithGoogle } from '../utils/authGoogle';
import { loadDescMemory, saveDescMemory, recordTransaction } from '../utils/descMemory';
import type { ParsedRow } from '../utils/importParser';
import type { FinanceEntry, RecurringRule, SavingsGoal } from '../types/finance';
import { getOverduePendingEntries } from '../utils/recurringPrompt';

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
    if (!localStorage.getItem('finly_onboarded_complete')) return 'login-method';
    return 'home';
  });

  // ── Modal open state ────────────────────────────────────────────────────────
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // ── Home swipe screen index ──────────────────────────────────────────────────
  const [homeScreenIdx, setHomeScreenIdx] = useState(0);

  // ── Add transaction flow ─────────────────────────────────────────────────────
  const [addStep, setAddStep] = useState<'numpad-income' | 'numpad-expense' | 'details' | null>(null);
  const [pendingType, setPendingType] = useState<'income' | 'expense'>('expense');
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingRecurring, setPendingRecurring] = useState(false);
  const [direction, setDirection] = useState(1);

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

  // Show one-per-day prompt when transitioning to home screen
  useEffect(() => {
    if (appScreen !== 'home') return;
    const timer = setTimeout(() => {
      const overdue = getOverduePendingEntries(homeDataRef.current.entries);
      if (overdue.length === 0) return;
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('finly_prompt_shown_date') === today) return;
      setHomeSheetEntries(overdue);
      setHomeSheetOpen(true);
      requestAnimationFrame(() => setHomeSheetVisible(true));
    }, 1500);
    return () => clearTimeout(timer);
  }, [appScreen]);

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

  // Keep ref up-to-date for the home-prompt effect (avoids stale closure)
  const homeDataRef = useRef(homeData);
  homeDataRef.current = homeData;

  // One-per-day home prompt sheet
  const [homeSheetEntries, setHomeSheetEntries] = useState<FinanceEntry[]>([]);
  const [homeSheetOpen, setHomeSheetOpen] = useState(false);
  const [homeSheetVisible, setHomeSheetVisible] = useState(false);

  // ── Routing helpers ───────────────────────────────────────────────────────────
  function navigate(screen: typeof appScreen, dir: number = 1) {
    setDirection(dir);
    setAppScreen(screen);
  }

  // ── Routing handlers ─────────────────────────────────────────────────────────
  function enterHome() {
    localStorage.setItem('finly_onboarded', '1');
    localStorage.setItem('finly_last_active', String(Date.now()));
    navigate('home', 1);
  }

  // Used by Google signup — name already saved, skip to gender screen
  function enterHomeAfterSignupSkipName() {
    localStorage.setItem('finly_onboarded', '1');
    localStorage.setItem('finly_last_active', String(Date.now()));
    if (!localStorage.getItem('finly_onboarded_complete')) {
      navigate('onboarding-gender', 1);
    } else {
      navigate('home', 1);
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
      navigate('onboarding-name', 1);
    } else {
      navigate('home', 1);
    }
  }

  // Dev-only: reset all auth state and return to Welcome without reload
  function handleDevReset() {
    localStorage.removeItem('finly_onboarded');
    localStorage.removeItem('finly_last_active');
    navigate('welcome', -1);
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleMonthChange(index: number) {
    setSelectedMonthIndex(index);
  }

  function handleSaveEntry(data: Omit<FinanceEntry, 'id'>, existingId?: string) {
    const entryId = existingId ?? `entry-${Date.now()}`;
    const savedEntry: FinanceEntry = { ...data, id: entryId };
    const entryMonth = new Date(data.date).getMonth();

    setMonthEntriesMap((prev) => {
      if (existingId) {
        // Update in whichever month the entry currently lives
        const updated = { ...prev };
        for (const [mi, arr] of Object.entries(updated)) {
          if (arr.some((e) => e.id === existingId)) {
            updated[Number(mi)] = arr.map((e) => (e.id === existingId ? savedEntry : e));
            return updated;
          }
        }
        // Fallback: put in entry's month
        return { ...prev, [entryMonth]: [...(prev[entryMonth] ?? []), savedEntry] };
      }
      return { ...prev, [entryMonth]: [...(prev[entryMonth] ?? []), savedEntry] };
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

  }

  function handleDeleteEntry(id: string) {
    setMonthEntriesMap((prev) => {
      const updated = { ...prev };
      for (const [mi, arr] of Object.entries(updated)) {
        if (arr.some((e) => e.id === id)) {
          updated[Number(mi)] = arr.filter((e) => e.id !== id);
          return updated;
        }
      }
      return prev;
    });
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

  function handleAddIncome() {
    setPendingType('income');
    setDirection(1);
    setAddStep('numpad-income');
  }

  function handleAddExpense() {
    setPendingType('expense');
    setDirection(1);
    setAddStep('numpad-expense');
  }

  function handleNumpadContinue(amount: number, recurring: boolean) {
    setPendingAmount(amount);
    setPendingRecurring(recurring);
    setDirection(1);
    setAddStep('details');
  }

  function handleDetailsSave(data: Omit<FinanceEntry, 'id'>) {
    handleSaveEntry(data);
    setDirection(1);
    setAddStep(null);
  }

  function handleDeleteRule(entry: FinanceEntry) {
    setRecurringRules((prev) => prev.filter((r) => !(r.type === entry.type && r.title === entry.title)));
  }

  function handleRescheduleEntry(entry: FinanceEntry, newDate: string) {
    const targetMonth = new Date(newDate).getMonth();
    if (entry.source === 'system') {
      const rescheduled: FinanceEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
        date: newDate,
        status: 'upcoming',
        source: 'manual',
      };
      setMonthEntriesMap((prev) => ({
        ...prev,
        [targetMonth]: [...(prev[targetMonth] ?? []), rescheduled],
      }));
    } else {
      setMonthEntriesMap((prev) => ({
        ...prev,
        [selectedMonthIndex]: (prev[selectedMonthIndex] ?? []).map((e) =>
          e.id === entry.id ? { ...e, date: newDate } : e,
        ),
      }));
    }
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

  // ── Screen routing ────────────────────────────────────────────────────────────
  const authAndOnboardingScreens = [
    'welcome', 'signup-method', 'login-method', 'phone-number',
    'login-phone', 'email-signup', 'login-email',
    'onboarding-name', 'onboarding-gender', 'onboarding-household',
    'onboarding-goals', 'onboarding-welcome', 'onboarding-success',
  ];

  const currentScreenKey = addStep ?? appScreen;
  const transitionType = authAndOnboardingScreens.includes(appScreen) ? 'fade' : 'slide';
  const screenKey = currentScreenKey;
  let screenContent: React.ReactNode;

  if (appScreen === 'welcome') {
    screenContent = (
      <WelcomeScreen
        onLogin={() => navigate('login-method', 1)}
        onSignup={() => navigate('signup-method', 1)}
      />
    );
  } else if (appScreen === 'signup-method') {
    screenContent = (
      <SignupMethodScreen
        onBack={() => navigate('welcome', -1)}
        onGoogle={handleGoogleSignup}
        onPhone={() => navigate('phone-number', 1)}
        onApple={enterHomeAfterSignup}
        onEmail={() => navigate('email-signup', 1)}
      />
    );
  } else if (appScreen === 'phone-number') {
    screenContent = (
      <PhoneNumberScreen
        onBack={() => navigate('signup-method', -1)}
        onContinue={enterHomeAfterSignup}
      />
    );
  } else if (appScreen === 'email-signup') {
    screenContent = (
      <EmailSignupScreen
        onBack={() => navigate('signup-method', -1)}
        onContinue={enterHomeAfterSignup}
      />
    );
  } else if (appScreen === 'onboarding-name') {
    screenContent = <OnboardingNameScreen onContinue={() => navigate('onboarding-gender', 1)} onBack={() => navigate('signup-method', -1)} />;
  } else if (appScreen === 'onboarding-gender') {
    screenContent = <OnboardingGenderScreen onContinue={() => navigate('onboarding-household', 1)} onBack={() => navigate('onboarding-name', -1)} />;
  } else if (appScreen === 'onboarding-household') {
    screenContent = <OnboardingHouseholdScreen onContinue={() => navigate('onboarding-goals', 1)} onBack={() => navigate('onboarding-gender', -1)} />;
  } else if (appScreen === 'onboarding-goals') {
    screenContent = <OnboardingGoalsScreen onContinue={() => navigate('onboarding-welcome', 1)} onBack={() => navigate('onboarding-household', -1)} />;
  } else if (appScreen === 'onboarding-welcome') {
    screenContent = <OnboardingWelcomeScreen onContinue={() => navigate('onboarding-success', 1)} onBack={() => navigate('onboarding-goals', -1)} />;
  } else if (appScreen === 'onboarding-success') {
    screenContent = <OnboardingSuccessScreen onContinue={() => navigate('home', 1)} />;
  } else if (appScreen === 'login-method') {
    screenContent = (
      <LoginMethodScreen
        onBack={() => navigate('welcome', -1)}
        onPhone={() => navigate('login-phone', 1)}
        onBiometric={enterHome}
        onGoogle={enterHome}
        onApple={enterHome}
        onEmail={() => navigate('login-email', 1)}
      />
    );
  } else if (appScreen === 'login-email') {
    screenContent = (
      <EmailSignupScreen
        mode="login"
        onBack={() => navigate('login-method', -1)}
        onContinue={enterHome}
      />
    );
  } else if (appScreen === 'login-phone') {
    screenContent = (
      <PhoneNumberScreen
        onBack={() => navigate('login-method', -1)}
        onContinue={enterHome}
      />
    );
  } else if (addStep === 'numpad-income' || addStep === 'numpad-expense') {
    screenContent = (
      <AddTransactionNumpad
        type={addStep === 'numpad-income' ? 'income' : 'expense'}
        onBack={() => { setDirection(-1); setAddStep(null); }}
        onContinue={handleNumpadContinue}
      />
    );
  } else if (addStep === 'details') {
    screenContent = (
      <AddTransactionDetails
        type={pendingType}
        amount={pendingAmount}
        recurring={pendingRecurring}
        onBack={() => { setDirection(-1); setAddStep(pendingType === 'income' ? 'numpad-income' : 'numpad-expense'); }}
        onSave={handleDetailsSave}
      />
    );
  } else {
    // ── Home screen ────────────────────────────────────────────────────────────
    screenContent = (
      <div
        dir="rtl"
        style={{
          fontFamily: 'Rubik, sans-serif',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {/* ── Fixed header: logo + month carousel ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: 6,
          paddingLeft: 16,
          paddingRight: 16,
          flexShrink: 0,
        }}>
          {/* Month carousel — left side (in RTL: visually right of logo) */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MonthCarousel
              availableMonths={HEBREW_MONTH_NAMES}
              selectedMonthIndex={selectedMonthIndex}
              onMonthChange={handleMonthChange}
            />
          </div>
          {/* Logo — right side in RTL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 4, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1,
                background: 'linear-gradient(90deg, #67e8f9, #a78bfa, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Finly</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>כסף, בשקט</p>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={15} color="#67e8f9" />
            </div>
          </div>
        </div>

        {/* ── Swipeable screens ── */}
        <SwipeableScreens
          screens={[
            <FloatingCirclesHome snapshot={snapshot} />,
            <UpcomingScreen
              entries={homeData.entries}
              onMarkAsPaid={handleMarkAsPaid}
              onDeleteRule={handleDeleteRule}
              onRescheduleEntry={handleRescheduleEntry}
            />,
            <TransactionsScreen
              entries={homeData.entries}
              onEdit={(entry) => console.log('edit', entry)}
              onDelete={(entry) => handleDeleteEntry(entry.id)}
              onMarkAsPaid={handleMarkAsPaid}
            />,
          ]}
          activeIndex={homeScreenIdx}
          onIndexChange={setHomeScreenIdx}
        />

        {/* ── Pill bar — all home screens ── */}
        <PillBar
          onAddIncome={handleAddIncome}
          onAddExpense={handleAddExpense}
          onGoHome={() => setHomeScreenIdx(0)}
        />

        {/* ── DEV reset ── */}
        {import.meta.env.DEV && (
          <button
            onClick={handleDevReset}
            style={{
              position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
              zIndex: 50, padding: '6px 16px', borderRadius: 99, fontSize: 11,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.30)',
              color: 'rgba(109,40,217,0.70)', cursor: 'pointer',
            }}
          >
            ← חזרה למסך פתיחה (dev)
          </button>
        )}

        {/* ── Modals (unchanged) ── */}
        <InsightsModal
          open={insightsOpen}
          onClose={() => setInsightsOpen(false)}
          onOpenChart={() => setChartOpen(true)}
        />
        <ChartModal open={chartOpen} onClose={() => setChartOpen(false)} />
        <TransactionTableModal
          open={tableOpen}
          onClose={() => setTableOpen(false)}
          entries={homeData.entries}
          onEdit={() => {}}
          onDelete={handleDeleteEntry}
          onDeleteMultiple={handleDeleteMultiple}
          onMarkAsPaid={handleMarkAsPaid}
          onDeleteRule={handleDeleteRule}
          onOpenImport={() => setImportOpen(true)}
        />
        <UpcomingExpensesModal
          open={upcomingOpen}
          onClose={() => setUpcomingOpen(false)}
          entries={homeData.entries.filter((e) => e.status === 'upcoming' && e.type === 'expense').sort((a, b) => a.date.localeCompare(b.date))}
          onMarkAsPaid={handleMarkAsPaid}
          onDeleteRule={handleDeleteRule}
        />
        <ExpenseBreakdownModal
          open={expensesOpen}
          onClose={() => setExpensesOpen(false)}
          entries={homeData.entries.filter((e) => e.type === 'expense').sort((a, b) => a.date.localeCompare(b.date))}
          onMarkAsPaid={handleMarkAsPaid}
        />
        <IncomeBreakdownModal
          open={incomeOpen}
          onClose={() => setIncomeOpen(false)}
          entries={homeData.entries.filter((e) => e.type === 'income').sort((a, b) => a.date.localeCompare(b.date))}
          onMarkAsPaid={handleMarkAsPaid}
        />
        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
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

  return (
    <ScreenTransition screenKey={screenKey} direction={direction} transitionType={transitionType}>
      {screenContent}
    </ScreenTransition>
  );
}
