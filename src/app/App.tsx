import { useMemo, useState } from 'react';
import { ChartModal } from './components/modals/ChartModal';
import { InsightsModal } from './components/modals/InsightsModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { StarField } from './components/effects/StarField';
import { HomeHeader } from './components/home/HomeHeader';
import { FloatingCirclesHome } from './components/home/FloatingCirclesHome';
import { mockHomeData } from '../data/mockHome';
import { getHomeSnapshot } from '../utils/homeCalculations';


export default function App() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(mockHomeData.savingsGoal.targetAmount);

  const homeData = useMemo(
    () => ({
      ...mockHomeData,
      savingsGoal: {
        ...mockHomeData.savingsGoal,
        targetAmount: savingsGoal,
      },
    }),
    [savingsGoal],
  );

  const snapshot = useMemo(() => getHomeSnapshot(homeData), [homeData]);

  const backgroundGradient = darkMode
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-hidden relative animate-in fade-in duration-700"
      style={{
        fontFamily: 'Rubik, sans-serif',
        background: backgroundGradient,
      }}
    >
      <StarField darkMode={darkMode} />

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-4 sm:px-5">
        <HomeHeader
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          monthLabel={snapshot.monthLabel}
        />

        <FloatingCirclesHome
          darkMode={darkMode}
          snapshot={snapshot}
          onAddClick={() => setFormOpen(true)}
        />
      </div>

      <InsightsModal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        onOpenChart={() => setChartOpen(true)}
        darkMode={darkMode}
      />
      <ChartModal open={chartOpen} onClose={() => setChartOpen(false)} darkMode={darkMode} />
      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} darkMode={darkMode} />
      <TransactionTableModal open={tableOpen} onClose={() => setTableOpen(false)} darkMode={darkMode} />
      <SavingsGoalModal
        open={savingsGoalOpen}
        onClose={() => setSavingsGoalOpen(false)}
        currentGoal={savingsGoal}
        onSave={setSavingsGoal}
      />
    </div>
  );
}
