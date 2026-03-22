import { useState, useRef, type CSSProperties } from 'react';
import { List, PiggyBank, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { getInsightCards } from '../../../utils/finlyInsights';

interface HomeSnapshot {
  statusLabel: string;
  remaining: number;
  income: number;
  expenses: number;
  upcoming: number;
  pendingIncome: number;
  savingsTarget: number;
  savingsProgress: number;
  daysLeftInMonth: number;
  daysIntoMonth: number;
  previousMonthRemaining?: number;
}

interface FloatingCirclesHomeProps {
  darkMode: boolean;
  snapshot: HomeSnapshot;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onOpenTransactions: () => void;
  onOpenSavingsGoal: () => void;
  onOpenUpcoming: () => void;
  onOpenIncome: () => void;
  onOpenExpenses: () => void;
  onOpenImport: () => void;
}

const KEYFRAMES = `
  @keyframes coinFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes coinFloat7 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes insightFromRight { 0%{opacity:0;transform:translateX(-28px)} 100%{opacity:1;transform:translateX(0)} }
  @keyframes insightFromLeft  { 0%{opacity:0;transform:translateX(28px)}  100%{opacity:1;transform:translateX(0)} }
  @keyframes insightFadeIn    { 0%{opacity:0}                              100%{opacity:1} }
`;

function glassStyle(darkMode: boolean): CSSProperties {
  return darkMode
    ? {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(180,160,255,0.07) 60%, rgba(80,60,130,0.12) 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(12px)',
      }
    : {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(242,236,255,0.50) 50%, rgba(220,210,255,0.40) 100%)',
        border: '1.5px solid rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
      };
}

function glassBox(darkMode: boolean): string {
  return darkMode
    ? '0 10px 28px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2), inset 0 1.5px 0 rgba(255,255,255,0.2), inset 0 -1.5px 0 rgba(0,0,0,0.22)'
    : '0 10px 30px rgba(139,92,246,0.18), 0 2px 6px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1.5px 0 rgba(150,130,200,0.14)';
}

function tactileBox(darkMode: boolean): string {
  return darkMode
    ? '0 6px 0 rgba(0,0,0,0.5), 0 10px 24px rgba(0,0,0,0.3), inset 0 1.5px 0 rgba(255,255,255,0.2)'
    : '0 6px 0 rgba(109,40,217,0.22), 0 10px 24px rgba(139,92,246,0.12), inset 0 1.5px 0 rgba(255,255,255,0.95)';
}

function tactileBoxPressed(darkMode: boolean): string {
  return darkMode
    ? '0 2px 0 rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.2), inset 0 1.5px 0 rgba(255,255,255,0.2)'
    : '0 2px 0 rgba(109,40,217,0.18), 0 4px 8px rgba(139,92,246,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)';
}

const PRESS_DOWN = {
  onPointerDown(e: React.PointerEvent<HTMLButtonElement>, dm: boolean) {
    e.currentTarget.style.transform = 'translateY(4px)';
    e.currentTarget.style.boxShadow = tactileBoxPressed(dm);
  },
  onPointerUp(e: React.PointerEvent<HTMLButtonElement>, dm: boolean) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = tactileBox(dm);
  },
  onPointerLeave(e: React.PointerEvent<HTMLButtonElement>, dm: boolean) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = tactileBox(dm);
  },
};

export function FloatingCirclesHome({ darkMode, snapshot, onAddIncome, onAddExpense, onOpenTransactions, onOpenSavingsGoal, onOpenUpcoming, onOpenIncome, onOpenExpenses, onOpenImport }: FloatingCirclesHomeProps) {
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';
  const accent = darkMode ? 'text-sky-300' : 'text-violet-600';
  const glass = glassStyle(darkMode);

  const [cardIdx, setCardIdx] = useState(0);
  const [swipeAnim, setSwipeAnim] = useState<'fromRight' | 'fromLeft' | null>(null);
  const touchStartX = useRef<number | null>(null);

  const insights = getInsightCards({
    remaining: snapshot.remaining,
    income: snapshot.income,
    expenses: snapshot.expenses,
    pendingIncome: snapshot.pendingIncome,
    upcomingExpenses: snapshot.upcoming,
    savingsTarget: snapshot.savingsTarget,
    daysIntoMonth: snapshot.daysIntoMonth,
    daysLeftInMonth: snapshot.daysLeftInMonth,
    previousMonthRemaining: snapshot.previousMonthRemaining,
  });

  function goToCard(next: number) {
    if (next === cardIdx) return;
    setSwipeAnim(next > cardIdx ? 'fromLeft' : 'fromRight');
    setCardIdx(next);
    setTimeout(() => setSwipeAnim(null), 320);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    // Swipe right (delta > 0) = next card; swipe left (delta < 0) = prev card
    if (delta > 0 && cardIdx < 2) goToCard(cardIdx + 1);
    else if (delta < 0 && cardIdx > 0) goToCard(cardIdx - 1);
  }

  const insightAnimStyle: CSSProperties = swipeAnim === 'fromRight'
    ? { animation: 'insightFromRight 0.28s ease' }
    : swipeAnim === 'fromLeft'
    ? { animation: 'insightFromLeft 0.28s ease' }
    : {};

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="flex w-full flex-col items-center gap-4 pb-8">

        {/* ── Main balance card — wide rounded hero ─────────────── */}
        <div
          className="w-full rounded-3xl px-5 pt-4 pb-5 flex flex-col items-center"
          style={{
            ...glass,
            boxShadow: glassBox(darkMode),
            animation: 'coinFloat1 6s ease-in-out infinite',
          }}
        >
          {/* Three-column balance row — no status copy, no helper text */}
          <div className="flex w-full items-center pt-1">
            {/* Income — right side in RTL */}
            <div className="flex-1 text-right min-w-0">
              <p className={`text-[9px] font-medium mb-0.5 ${muted}`}>הכנסות</p>
              <p
                className={`font-bold leading-none ${darkMode ? 'text-sky-300' : 'text-sky-700'}`}
                style={{ fontSize: formatCurrency(snapshot.income).length > 8 ? 13 : 15 }}
              >
                +{formatCurrency(snapshot.income)}
              </p>
            </div>
            {/* Main remaining — center */}
            <div className="flex flex-col items-center px-2 shrink-0">
              <p className={`text-[9px] font-medium mb-1 ${muted}`}>נותר</p>
              <p
                className={`font-bold leading-none tracking-tight ${
                  snapshot.remaining > 50
                    ? darkMode ? 'text-sky-300' : 'text-sky-700'
                    : snapshot.remaining < -50
                    ? darkMode ? 'text-violet-300' : 'text-violet-700'
                    : text
                }`}
                style={{
                  fontSize: formatCurrency(snapshot.remaining).length > 10
                    ? 26
                    : formatCurrency(snapshot.remaining).length > 8
                    ? 32
                    : 40,
                }}
              >
                {formatCurrency(snapshot.remaining)}
              </p>
            </div>
            {/* Expenses — left side in RTL */}
            <div className="flex-1 text-left min-w-0">
              <p className={`text-[9px] font-medium mb-0.5 ${muted}`}>הוצאות</p>
              <p
                className={`font-bold leading-none ${darkMode ? 'text-violet-300' : 'text-violet-600'}`}
                style={{ fontSize: formatCurrency(snapshot.expenses).length > 8 ? 13 : 15 }}
              >
                -{formatCurrency(snapshot.expenses)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Finly insight card — swipeable 3-card ──────────────── */}
        <div
          className="w-full rounded-2xl px-4 pt-3.5 pb-3 overflow-hidden"
          style={{ ...glass, boxShadow: glassBox(darkMode) }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 text-right min-w-0" style={insightAnimStyle}>
              <p className={`text-[10px] font-semibold ${accent}`}>Finly אומר</p>
              <p className={`mt-0.5 text-[13px] leading-relaxed ${text}`}>{insights[cardIdx]}</p>
            </div>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {([0, 1, 2] as const).map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`כרטיס ${i + 1}`}
                onClick={() => goToCard(i)}
                style={{
                  height: 5,
                  width: i === cardIdx ? 18 : 5,
                  borderRadius: 99,
                  background: i === cardIdx
                    ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                    : darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.25)',
                  transition: 'width 0.25s ease, background 0.25s ease',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Info cards — 2×2 glass grid ──────────────────────── */}
        <div className="grid w-full grid-cols-2 gap-3">

          {/* הכנסות */}
          <button
            type="button"
            onClick={onOpenIncome}
            className="flex flex-col rounded-2xl p-4 text-right"
            style={{
              ...glass,
              boxShadow: tactileBox(darkMode),
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
            onPointerUp={(e) => PRESS_DOWN.onPointerUp(e, darkMode)}
            onPointerLeave={(e) => PRESS_DOWN.onPointerLeave(e, darkMode)}
          >
            <p className={`text-[10px] leading-tight ${muted}`}>Finly צופה שייכנס החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>{formatCurrency(snapshot.pendingIncome)}</p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>לפירוט לחץ כאן</p>
          </button>

          {/* הוצאות */}
          <button
            type="button"
            onClick={onOpenExpenses}
            className="flex flex-col rounded-2xl p-4 text-right"
            style={{
              ...glass,
              boxShadow: tactileBox(darkMode),
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
            onPointerUp={(e) => PRESS_DOWN.onPointerUp(e, darkMode)}
            onPointerLeave={(e) => PRESS_DOWN.onPointerLeave(e, darkMode)}
          >
            <p className={`text-[10px] leading-tight ${muted}`}>Finly צופה שייצא החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>{formatCurrency(snapshot.upcoming)}</p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>לפירוט לחץ כאן</p>
          </button>

          {/* יעד חיסכון — full-width 3D tactile button */}
          <button
            type="button"
            onClick={onOpenSavingsGoal}
            className="col-span-2 rounded-2xl p-3 text-right"
            style={{
              ...glass,
              boxShadow: tactileBox(darkMode),
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
            onPointerUp={(e) => PRESS_DOWN.onPointerUp(e, darkMode)}
            onPointerLeave={(e) => PRESS_DOWN.onPointerLeave(e, darkMode)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PiggyBank className={`h-4 w-4 ${accent}`} />
                {snapshot.savingsTarget > 0 && (
                  <p className={`text-[16px] font-bold ${accent}`}>{Math.round(snapshot.savingsProgress)}%</p>
                )}
              </div>
              <div className="text-right">
                <p className={`text-[11px] ${muted}`}>יעד חיסכון</p>
                {snapshot.savingsTarget > 0 && (
                  <p className={`text-[10px] ${muted}`}>מתוך {formatCurrency(snapshot.savingsTarget)}</p>
                )}
              </div>
            </div>

            {snapshot.savingsTarget === 0 ? (
              <p className={`text-[12px] font-medium ${muted}`}>לא הוגדר יעד — לחץ להגדרה</p>
            ) : (
              <>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200/60'}`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${snapshot.savingsProgress}%`,
                      background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                    }}
                  />
                </div>
                <p className={`mt-1 text-[9px] ${muted}`}>{snapshot.daysLeftInMonth} ימים לסוף החודש</p>
              </>
            )}
          </button>

        </div>

        {/* ── Transactions history button — 3D tactile ──────────── */}
        <button
          type="button"
          onClick={onOpenTransactions}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-semibold ${
            darkMode ? 'text-white/90' : 'text-gray-700'
          }`}
          style={{
            ...glass,
            boxShadow: tactileBox(darkMode),
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
          onPointerUp={PRESS_DOWN.onPointerUp}
          onPointerLeave={PRESS_DOWN.onPointerLeave}
        >
          <List className={`h-4 w-4 ${accent}`} />
          התנועות החודשיות שלך עם Finly
        </button>

        {/* ── Add transaction buttons — income + expense ─────────── */}
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onAddIncome}
            className="flex-1 rounded-2xl py-4 text-white font-bold text-[15px] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              boxShadow: '0 6px 0 rgba(6,182,212,0.45), 0 10px 24px rgba(14,165,233,0.30), inset 0 1.5px 0 rgba(255,255,255,0.30)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'translateY(5px)';
              e.currentTarget.style.boxShadow = '0 1px 0 rgba(6,182,212,0.45), 0 3px 8px rgba(14,165,233,0.20), inset 0 1.5px 0 rgba(255,255,255,0.30)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 6px 0 rgba(6,182,212,0.45), 0 10px 24px rgba(14,165,233,0.30), inset 0 1.5px 0 rgba(255,255,255,0.30)';
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 6px 0 rgba(6,182,212,0.45), 0 10px 24px rgba(14,165,233,0.30), inset 0 1.5px 0 rgba(255,255,255,0.30)';
            }}
          >
            <TrendingUp size={18} className="text-white" />
            הכנסה
          </button>
          <button
            type="button"
            onClick={onAddExpense}
            className="flex-1 rounded-2xl py-4 text-white font-bold text-[15px] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              boxShadow: '0 6px 0 rgba(124,58,237,0.45), 0 10px 24px rgba(124,58,237,0.30), inset 0 1.5px 0 rgba(255,255,255,0.25)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'translateY(5px)';
              e.currentTarget.style.boxShadow = '0 1px 0 rgba(124,58,237,0.45), 0 3px 8px rgba(124,58,237,0.20), inset 0 1.5px 0 rgba(255,255,255,0.25)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 6px 0 rgba(124,58,237,0.45), 0 10px 24px rgba(124,58,237,0.30), inset 0 1.5px 0 rgba(255,255,255,0.25)';
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 6px 0 rgba(124,58,237,0.45), 0 10px 24px rgba(124,58,237,0.30), inset 0 1.5px 0 rgba(255,255,255,0.25)';
            }}
          >
            <TrendingDown size={18} className="text-white" />
            הוצאה
          </button>
        </div>

      </div>
    </>
  );
}
