import type { CSSProperties } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface HomeSnapshot {
  statusLabel: string;
  remaining: number;
  income: number;
  expenses: number;
  upcoming: number;
  savingsCurrent: number;
  savingsTarget: number;
  savingsProgress: number;
}

interface FloatingCirclesHomeProps {
  darkMode: boolean;
  snapshot: HomeSnapshot;
  onAddClick: () => void;
}

const KEYFRAMES = `
  @keyframes coinFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes coinFloat7 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
`;

function glassStyle(darkMode: boolean): CSSProperties {
  return darkMode
    ? {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(180,160,255,0.07) 60%, rgba(80,60,130,0.12) 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow:
          '0 10px 28px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2), inset 0 1.5px 0 rgba(255,255,255,0.2), inset 0 -1.5px 0 rgba(0,0,0,0.22)',
        backdropFilter: 'blur(12px)',
        transition: 'transform 0.45s ease',
      }
    : {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(242,236,255,0.50) 50%, rgba(220,210,255,0.40) 100%)',
        border: '1.5px solid rgba(255,255,255,0.88)',
        boxShadow:
          '0 10px 30px rgba(139,92,246,0.18), 0 2px 6px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1.5px 0 rgba(150,130,200,0.14)',
        backdropFilter: 'blur(14px)',
        transition: 'transform 0.45s ease',
      };
}

function handleCircleEnter(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = 'perspective(420px) rotateY(22deg) scale(1.04)';
}

function handleCircleLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = '';
}

export function FloatingCirclesHome({ darkMode, snapshot, onAddClick }: FloatingCirclesHomeProps) {
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';
  const accent = darkMode ? 'text-cyan-300' : 'text-violet-600';
  const glass = glassStyle(darkMode);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="flex w-full flex-col items-center gap-5 pb-8">

        {/* ── Main hero circle — center anchor, floats ─────────── */}
        <div style={{ animation: 'coinFloat1 6s ease-in-out infinite' }}>
          <div
            className="flex flex-col items-center justify-center rounded-full"
            style={{ ...glass, width: 224, height: 224 }}
            onMouseEnter={handleCircleEnter}
            onMouseLeave={handleCircleLeave}
          >
            <p className={`text-[11px] font-semibold ${accent}`}>{snapshot.statusLabel}</p>
            <p className={`mt-1 text-[32px] font-bold leading-tight ${text}`}>
              {formatCurrency(snapshot.remaining)}
            </p>
            <p className={`mt-2 px-6 text-center text-[11px] leading-relaxed ${muted}`}>
              מה נשאר לכם
              <br />
              עד סוף החודש
            </p>
          </div>
        </div>

        {/* ── Info cards — 2×2 glass grid ──────────────────────── */}
        <div className="grid w-full grid-cols-2 gap-3">

          {/* הכנסות */}
          <div
            className="flex flex-col rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={glass}
          >
            <p className={`text-[11px] ${muted}`}>הכנסות החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>
              {formatCurrency(snapshot.income)}
            </p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>מה שכבר נכנס</p>
          </div>

          {/* הוצאות */}
          <div
            className="flex flex-col rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={glass}
          >
            <p className={`text-[11px] ${muted}`}>הוצאות החודש</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>
              {formatCurrency(snapshot.expenses)}
            </p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>מה שכבר נרשם</p>
          </div>

          {/* מה עוד צפוי לרדת */}
          <div
            className="flex flex-col rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={glass}
          >
            <p className={`text-[11px] ${muted}`}>מה עוד צפוי לרדת</p>
            <p className={`mt-1 text-[18px] font-bold ${text}`}>
              {formatCurrency(snapshot.upcoming)}
            </p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>חיובים ידועים</p>
          </div>

          {/* יעד חיסכון */}
          <div
            className="flex flex-col rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={glass}
          >
            <p className={`text-[11px] ${muted}`}>יעד חיסכון</p>
            <p className={`mt-1 text-[18px] font-bold ${accent}`}>
              {Math.round(snapshot.savingsProgress)}%
            </p>
            <p className={`mt-0.5 text-[10px] ${muted}`}>מהיעד</p>
          </div>

        </div>

        {/* ── CTA circle — bottom center, thumb zone, floats ────── */}
        <div style={{ animation: 'coinFloat7 7s ease-in-out 0.5s infinite' }}>
          <button
            type="button"
            onClick={onAddClick}
            className="flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600"
            style={{
              width: 116,
              height: 116,
              boxShadow:
                '0 16px 40px rgba(124,58,237,0.45), inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -1.5px 0 rgba(0,0,0,0.18)',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(420px) rotateY(18deg) scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 22px 50px rgba(124,58,237,0.55), inset 0 1.5px 0 rgba(255,255,255,0.28)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow =
                '0 16px 40px rgba(124,58,237,0.45), inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -1.5px 0 rgba(0,0,0,0.18)';
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
