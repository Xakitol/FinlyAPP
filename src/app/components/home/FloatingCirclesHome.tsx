import { useState, useRef, type CSSProperties } from 'react';
import { List, PiggyBank, Sparkles, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';
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

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

const TACTILE_SHADOW = '0 6px 0 rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.25), inset 0 1.5px 0 rgba(255,255,255,0.15)';
const TACTILE_SHADOW_PRESSED = '0 2px 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2), inset 0 1.5px 0 rgba(255,255,255,0.15)';

const PRESS_DOWN = {
  onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = 'translateY(4px)';
    e.currentTarget.style.boxShadow = TACTILE_SHADOW_PRESSED;
  },
  onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = TACTILE_SHADOW;
  },
  onPointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = TACTILE_SHADOW;
  },
};

export function FloatingCirclesHome({ snapshot, onAddIncome, onAddExpense, onOpenTransactions, onOpenSavingsGoal, onOpenIncome, onOpenExpenses }: FloatingCirclesHomeProps) {
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

      {/* Change 1 — fill screen height, space-between distribution */}
      <div
        className="flex w-full flex-col items-center"
        style={{ height: '100%', justifyContent: 'space-between' }}
      >

        {/* ── Main balance card ─────────────── */}
        {/* Change 2 — taller card, larger fonts */}
        <div
          className="w-full rounded-3xl px-5 flex flex-col items-center"
          style={{
            ...GLASS,
            paddingTop: 28,
            paddingBottom: 28,
            animation: 'coinFloat1 6s ease-in-out infinite',
          }}
        >
          <div className="flex w-full items-center pt-1">
            {/* Income — right side in RTL */}
            <div className="flex-1 text-right min-w-0">
              <p className="text-[11px] font-medium mb-0.5 text-white/55">הכנסות</p>
              <p className="font-bold leading-none text-cyan-300" style={{ fontSize: 19 }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.income).replace('₪', '')}
              </p>
            </div>
            {/* Main remaining — center */}
            <div className="flex flex-col items-center px-2 shrink-0">
              <p className="text-[9px] font-medium mb-1 text-white/55">נותר</p>
              <p
                className="font-bold leading-none tracking-tight text-white"
                style={{
                  fontSize: formatCurrency(snapshot.remaining).length > 10
                    ? 32
                    : formatCurrency(snapshot.remaining).length > 8
                    ? 40
                    : 52,
                }}
              >
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.remaining).replace('₪', '')}
              </p>
            </div>
            {/* Expenses — left side in RTL */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-[11px] font-medium mb-0.5 text-white/55">הוצאות</p>
              <p className="font-bold leading-none text-pink-400" style={{ fontSize: 19 }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.expenses).replace('₪', '')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Finly insight card ──────────────── */}
        {/* Change 3 — larger padding and text */}
        <div
          className="w-full rounded-2xl px-4 overflow-hidden"
          style={{ ...GLASS, paddingTop: 20, paddingBottom: 16 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 text-right min-w-0" style={insightAnimStyle}>
              <p className="text-[10px] font-semibold text-cyan-300">Finly אומר</p>
              <p className="mt-0.5 text-[15px] leading-relaxed text-white">{insights[cardIdx]}</p>
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
                    : 'rgba(255,255,255,0.25)',
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
          {/* Change 4 — taller cards, larger amount, ChevronLeft instead of text hint */}
          <button
            type="button"
            onClick={onOpenIncome}
            className="flex flex-col rounded-2xl text-right"
            style={{
              ...GLASS,
              paddingTop: 20,
              paddingBottom: 20,
              paddingLeft: 16,
              paddingRight: 16,
              boxShadow: TACTILE_SHADOW,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            {...PRESS_DOWN}
          >
            <p className="text-[10px] leading-tight text-white/55">Finly צופה שייכנס החודש</p>
            <p className="mt-1 font-bold text-white" style={{ fontSize: 22 }}>{formatCurrency(snapshot.pendingIncome)}</p>
            <ChevronLeft size={14} className="text-white/40 mt-auto" />
          </button>

          {/* הוצאות */}
          <button
            type="button"
            onClick={onOpenExpenses}
            className="flex flex-col rounded-2xl text-right"
            style={{
              ...GLASS,
              paddingTop: 20,
              paddingBottom: 20,
              paddingLeft: 16,
              paddingRight: 16,
              boxShadow: TACTILE_SHADOW,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            {...PRESS_DOWN}
          >
            <p className="text-[10px] leading-tight text-white/55">Finly צופה שייצא החודש</p>
            <p className="mt-1 font-bold text-white" style={{ fontSize: 22 }}>{formatCurrency(snapshot.upcoming)}</p>
            <ChevronLeft size={14} className="text-white/40 mt-auto" />
          </button>

          {/* יעד חיסכון */}
          {/* Change 5 — larger padding, percentage, progress bar */}
          <button
            type="button"
            onClick={onOpenSavingsGoal}
            className="col-span-2 rounded-2xl text-right"
            style={{
              ...GLASS,
              padding: 16,
              boxShadow: TACTILE_SHADOW,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            {...PRESS_DOWN}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PiggyBank className="h-4 w-4 text-cyan-300" />
                {snapshot.savingsTarget > 0 && (
                  <p className="font-bold text-cyan-300" style={{ fontSize: 20 }}>{Math.round(snapshot.savingsProgress)}%</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/55">יעד חיסכון</p>
                {snapshot.savingsTarget > 0 && (
                  <p className="text-[10px] text-white/55">מתוך {formatCurrency(snapshot.savingsTarget)}</p>
                )}
              </div>
            </div>

            {snapshot.savingsTarget === 0 ? (
              <p className="text-[12px] font-medium text-white/55">לא הוגדר יעד — לחץ להגדרה</p>
            ) : (
              <>
                <div className="h-2 w-full rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${snapshot.savingsProgress}%`,
                      background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                    }}
                  />
                </div>
                <p className="mt-1 text-[9px] text-white/55">{snapshot.daysLeftInMonth} ימים לסוף החודש</p>
              </>
            )}
          </button>

        </div>

        {/* ── Transactions history button ──────────── */}
        {/* Change 6 — taller button, larger text */}
        <button
          type="button"
          onClick={onOpenTransactions}
          className="flex w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white/90"
          style={{
            ...GLASS,
            paddingTop: 16,
            paddingBottom: 16,
            fontSize: 15,
            boxShadow: TACTILE_SHADOW,
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          {...PRESS_DOWN}
        >
          <List className="h-4 w-4 text-cyan-300" />
          התנועות החודשיות שלך עם Finly
        </button>

        {/* ── Add transaction buttons ─────────── */}
        {/* Change 7 — taller buttons, larger text */}
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onAddIncome}
            className="flex-1 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              fontSize: 17,
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
            className="flex-1 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              fontSize: 17,
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
