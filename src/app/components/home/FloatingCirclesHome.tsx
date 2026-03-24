import { useState, useRef, type CSSProperties } from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
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
}

const KEYFRAMES = `
  @keyframes insightFromRight { 0%{opacity:0;transform:translateX(-28px)} 100%{opacity:1;transform:translateX(0)} }
  @keyframes insightFromLeft  { 0%{opacity:0;transform:translateX(28px)}  100%{opacity:1;transform:translateX(0)} }
`;

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
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

export function FloatingCirclesHome({ snapshot, onAddIncome, onAddExpense }: FloatingCirclesHomeProps) {
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

  function handleInsightTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleInsightTouchEnd(e: React.TouchEvent) {
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

      <div
        style={{
          fontFamily: 'Rubik, sans-serif',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px 16px 16px',
          boxSizing: 'border-box',
          gap: 12,
        }}
      >

        {/* ── Balance card — static, no animation ─────────────── */}
        <div
          className="w-full rounded-3xl"
          style={{
            ...GLASS,
            paddingTop: 28,
            paddingBottom: 28,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Income — right side in RTL */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)', margin: 0 }}>הכנסות</p>
              <p style={{ fontSize: 19, fontWeight: 700, color: '#06b6d4', margin: '2px 0 0', lineHeight: 1 }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.income).replace('₪', '')}
              </p>
            </div>
            {/* Remaining — center */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
              <p style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.55)', margin: 0 }}>נותר</p>
              <p style={{
                fontWeight: 700, lineHeight: 1, color: 'white', margin: '4px 0 0',
                fontSize: formatCurrency(snapshot.remaining).length > 10 ? 32
                  : formatCurrency(snapshot.remaining).length > 8 ? 40 : 52,
              }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.remaining).replace('₪', '')}
              </p>
            </div>
            {/* Expenses — left side in RTL */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)', margin: 0 }}>הוצאות</p>
              <p style={{ fontSize: 19, fontWeight: 700, color: '#f472b6', margin: '2px 0 0', lineHeight: 1 }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>₪</span>
                {formatCurrency(snapshot.expenses).replace('₪', '')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Insight card ──────────────── */}
        <div
          className="w-full rounded-2xl"
          style={{ ...GLASS, padding: '16px 16px 12px', overflow: 'hidden' }}
          onTouchStart={handleInsightTouchStart}
          onTouchEnd={handleInsightTouchEnd}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'right', ...insightAnimStyle }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#67e8f9', margin: 0 }}>Finly אומר</p>
              <p style={{ fontSize: 14, color: 'white', margin: '4px 0 0', lineHeight: 1.5 }}>{insights[cardIdx]}</p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={15} color="white" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
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
                  border: 'none', padding: 0, cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Add buttons ─────────────── */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginTop: 'auto' }}>
          <button
            type="button"
            onClick={onAddIncome}
            className="flex-1 rounded-2xl"
            style={{
              flex: 1,
              paddingTop: 20,
              paddingBottom: 20,
              fontSize: 17,
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 16,
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
            <TrendingUp size={18} color="white" />
            הכנסה
          </button>
          <button
            type="button"
            onClick={onAddExpense}
            style={{
              flex: 1,
              paddingTop: 20,
              paddingBottom: 20,
              fontSize: 17,
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 16,
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
            <TrendingDown size={18} color="white" />
            הוצאה
          </button>
        </div>

      </div>
    </>
  );
}
