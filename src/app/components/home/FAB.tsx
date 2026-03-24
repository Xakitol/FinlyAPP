import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

const KEYFRAMES = `
  @keyframes fabPopIn {
    from { opacity: 0; transform: scale(0.5) translateZ(0); }
    to   { opacity: 1; transform: scale(1) translateZ(0); }
  }
`;

interface Props {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function FAB({ onAddIncome, onAddExpense }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Backdrop to close on outside tap */}
      {expanded && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 39 }}
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          left: 20,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Income button */}
        {expanded && (
          <button
            type="button"
            onClick={() => { setExpanded(false); onAddIncome(); }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              boxShadow: '0 4px 16px rgba(14,165,233,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              animation: 'fabPopIn 0.18s ease both',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <TrendingUp size={20} color="white" />
          </button>
        )}

        {/* Expense button */}
        {expanded && (
          <button
            type="button"
            onClick={() => { setExpanded(false); onAddExpense(); }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              animation: 'fabPopIn 0.14s ease both',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <TrendingDown size={20} color="white" />
          </button>
        )}

        {/* Main FAB */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: expanded
              ? 'rgba(255,255,255,0.15)'
              : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
            boxShadow: expanded
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 6px 20px rgba(124,58,237,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: `rotate(${expanded ? 45 : 0}deg) translateZ(0)`,
            transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
            willChange: 'transform',
          }}
        >
          <Plus size={24} color="white" />
        </button>
      </div>
    </>
  );
}
