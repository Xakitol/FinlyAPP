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
    // Full-width fixed footer: gradient fills the safe-area gap with the app's background color
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'linear-gradient(to top, #0f0a1e 60%, transparent)',
        pointerEvents: 'none', // let taps through the gradient area
      }}
    >
      {/* Pill container */}
      <div
        dir="rtl"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 8px',
          marginBottom: 12,
          background: 'rgba(15,10,30,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 36,
          pointerEvents: 'auto',
        }}
      >
        {/* Right — income */}
        <button
          type="button"
          onClick={onAddIncome}
          onPointerDown={pressDown}
          onPointerUp={pressUp}
          onPointerLeave={pressUp}
          style={{
            height: 56,
            padding: '0 28px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            color: 'white',
            fontFamily: 'Rubik, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'transform 0.1s ease',
          }}
        >
          <TrendingUp size={18} color="white" />
          הכנסה
        </button>

        {/* Center — home/logo, pops above the pill via negative margin */}
        <button
          type="button"
          onClick={onGoHome}
          onPointerDown={pressDown}
          onPointerUp={pressUp}
          onPointerLeave={pressUp}
          style={{
            width: 68,
            height: 68,
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
            marginTop: -14,
            marginBottom: -14,
          }}
        >
          <Sparkles size={22} color="white" />
        </button>

        {/* Left — expense */}
        <button
          type="button"
          onClick={onAddExpense}
          onPointerDown={pressDown}
          onPointerUp={pressUp}
          onPointerLeave={pressUp}
          style={{
            height: 56,
            padding: '0 28px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            color: 'white',
            fontFamily: 'Rubik, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'transform 0.1s ease',
          }}
        >
          <TrendingDown size={18} color="white" />
          הוצאה
        </button>
      </div>
    </div>
  );
}
