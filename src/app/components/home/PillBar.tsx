import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onGoHome: () => void;
}

function pressDown(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(2px)';
}
function pressUp(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
}

export function PillBar({ onAddIncome, onAddExpense, onGoHome }: Props) {
  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 6,
        background: 'rgba(15,10,30,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 999,
      }}
    >
      {/* Right — income (in RTL, first in DOM = right) */}
      <button
        type="button"
        onClick={onAddIncome}
        onPointerDown={pressDown}
        onPointerUp={pressUp}
        onPointerLeave={pressUp}
        style={{
          height: 44,
          padding: '0 20px',
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          color: 'white',
          fontFamily: 'Rubik, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'transform 0.1s ease',
        }}
      >
        <TrendingUp size={16} color="white" />
        הכנסה
      </button>

      {/* Center — home/logo */}
      <button
        type="button"
        onClick={onGoHome}
        onPointerDown={pressDown}
        onPointerUp={pressUp}
        onPointerLeave={pressUp}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          boxShadow: '0 0 20px rgba(124,58,237,0.5)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.1s ease',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} color="white" />
      </button>

      {/* Left — expense */}
      <button
        type="button"
        onClick={onAddExpense}
        onPointerDown={pressDown}
        onPointerUp={pressUp}
        onPointerLeave={pressUp}
        style={{
          height: 44,
          padding: '0 20px',
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: 'white',
          fontFamily: 'Rubik, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'transform 0.1s ease',
        }}
      >
        <TrendingDown size={16} color="white" />
        הוצאה
      </button>
    </div>
  );
}
