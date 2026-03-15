import type { CSSProperties } from 'react';
import { Plus, List, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface HomeSnapshot {
  statusLabel: string;
  remaining: number;
  income: number;
  expenses: number;
  upcoming: number;
  savingsTarget: number;
  savingsProgress: number;
  daysLeftInMonth: number;
}

interface FloatingCirclesHomeProps {
  darkMode: boolean;
  snapshot: HomeSnapshot;
  onAddClick: () => void;
  onOpenTransactions: () => void;
  onOpenSavingsGoal: () => void;
  onOpenUpcoming: () => void;
  onOpenIncome: () => void;
}

const KEYFRAMES = `
  @keyframes coinFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes coinFloat7 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
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
  onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  },
  onPointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  },
};

export function FloatingCirclesHome({ darkMode, snapshot, onAddClick, onOpenTransactions, onOpenSavingsGoal, onOpenUpcoming, onOpenIncome }: FloatingCirclesHomeProps) {
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';
  const accent = darkMode ? 'text-cyan-300' : 'text-violet-600';
  const glass = glassStyle(darkMode);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="flex w-full flex-col items-center gap-4 pb-8">

        {/* ── Main balance card — wide rounded hero ─────────────── */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col items-center"
          style={{
            ...glass,
            boxShadow: glassBox(darkMode),
            animation: 'coinFloat1 6s ease-in-out infinite',
          }}
        >
          <p className={`text-[11px] font-semibold ${accent}`}>{snapshot.statusLabel}</p>
          <p className={`mt-2 text-[44px] font-bold leading-tight tracking-tight ${text}`}>
            {formatCurrency(snapshot.remaining)}
          </p>
          <p className={`mt-2 text-center text-[12px] leading-relaxed ${muted}`}>
            מה נשאר לכם עד סוף החודש
          </p>
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
            onPointerUp={PRESS_DOWN.onPointerUp}
            onPointerLeave={PRESS_DOWN.onPointerLeave}
          >
            <p className={`text-[11px] ${muted}`}>הכנסות החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>{formatCurrency(snapshot.income)}</p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>לפירוט לחץ כאן</p>
          </button>

          {/* הוצאות */}
          <div className="flex flex-col rounded-2xl p-4" style={{ ...glass, boxShadow: glassBox(darkMode) }}>
            <p className={`text-[11px] ${muted}`}>הוצאות החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>{formatCurrency(snapshot.expenses)}</p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>מה שכבר נרשם</p>
          </div>

          {/* מה עוד צפוי לרדת — opens detail list */}
          <button
            type="button"
            onClick={onOpenUpcoming}
            className="flex flex-col rounded-2xl p-4 text-right"
            style={{
              ...glass,
              boxShadow: tactileBox(darkMode),
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
            onPointerUp={PRESS_DOWN.onPointerUp}
            onPointerLeave={PRESS_DOWN.onPointerLeave}
          >
            <p className={`text-[11px] ${muted}`}>מה עוד צפוי לרדת</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>{formatCurrency(snapshot.upcoming)}</p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>לפירוט לחץ כאן</p>
          </button>

          {/* יעד חיסכון — 3D tactile button */}
          <button
            type="button"
            onClick={onOpenSavingsGoal}
            className="flex flex-col rounded-2xl p-3 text-right"
            style={{
              ...glass,
              boxShadow: tactileBox(darkMode),
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => PRESS_DOWN.onPointerDown(e, darkMode)}
            onPointerUp={PRESS_DOWN.onPointerUp}
            onPointerLeave={PRESS_DOWN.onPointerLeave}
          >
            <div className="flex items-center justify-between mb-1">
              <PiggyBank className={`h-5 w-5 ${accent}`} />
              <p className={`text-[11px] ${muted}`}>יעד חיסכון</p>
            </div>

            {snapshot.savingsTarget === 0 ? (
              <p className={`text-[12px] font-medium ${muted}`}>לא הוגדר יעד</p>
            ) : (
              <>
                <p className={`text-[16px] font-bold ${accent}`}>{Math.round(snapshot.savingsProgress)}%</p>
                <p className={`text-[10px] ${muted}`}>מתוך {formatCurrency(snapshot.savingsTarget)}</p>
                {/* Progress bar */}
                <div className={`mt-1.5 h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200/60'}`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${snapshot.savingsProgress}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
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
          היסטוריית תנועות
        </button>

        {/* ── CTA button — galactic 3D tactile ─────────────────── */}
        <div style={{ animation: 'coinFloat7 7s ease-in-out 0.5s infinite' }}>
          <button
            type="button"
            onClick={onAddClick}
            className="flex flex-col items-center justify-center rounded-full"
            style={{
              width: 116,
              height: 116,
              background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 40%, #a855f7 70%, #ec4899 100%)',
              boxShadow: '0 8px 0 rgba(99,102,241,0.65), 0 16px 36px rgba(99,102,241,0.4), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1.5px 0 rgba(0,0,0,0.2)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'translateY(6px)';
              e.currentTarget.style.boxShadow = '0 2px 0 rgba(99,102,241,0.65), 0 6px 16px rgba(99,102,241,0.3), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1.5px 0 rgba(0,0,0,0.2)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 8px 0 rgba(99,102,241,0.65), 0 16px 36px rgba(99,102,241,0.4), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1.5px 0 rgba(0,0,0,0.2)';
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 8px 0 rgba(99,102,241,0.65), 0 16px 36px rgba(99,102,241,0.4), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1.5px 0 rgba(0,0,0,0.2)';
            }}
          >
            <Plus className="h-6 w-6 text-white" />
            <span className="mt-1 text-[11px] font-medium text-white/90">בואו נעדכן</span>
          </button>
        </div>

      </div>
    </>
  );
}
