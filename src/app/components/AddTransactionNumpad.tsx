import { useState } from 'react';
import { X, ChevronLeft, Delete } from 'lucide-react';

interface Props {
  type: 'income' | 'expense';
  onBack: () => void;
  onContinue: (amount: number, recurring: boolean) => void;
}

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

const CIRCLE_BTN: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.20)',
  backdropFilter: 'blur(8px)',
  flexShrink: 0,
};

export function AddTransactionNumpad({ type, onBack, onContinue }: Props) {
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const isIncome = type === 'income';
  const userName = localStorage.getItem('finly_user_name') ?? '';

  const gradient = isIncome
    ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)';

  const ctaShadow = isIncome
    ? '0 6px 0 rgba(6,182,212,0.50), 0 12px 28px rgba(14,165,233,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)'
    : '0 6px 0 rgba(124,58,237,0.50), 0 12px 28px rgba(124,58,237,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)';

  function handleNumKey(key: string) {
    if (key === '⌫') {
      setAmount((p) => p.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!amount.includes('.')) setAmount((p) => (p === '' ? '0.' : p + '.'));
      return;
    }
    if (amount.replace('.', '').length >= 8) return;
    setAmount((p) => (p === '' || p === '0') ? key : p + key);
  }

  const numericAmount = parseFloat(amount) || 0;
  const displayAmount =
    amount === ''
      ? '0'
      : amount.endsWith('.')
      ? `${parseFloat(amount).toLocaleString('he-IL')}.`
      : numericAmount.toLocaleString('he-IL', { maximumFractionDigits: 2 });

  const canContinue = numericAmount > 0;

  const amountFontSize = displayAmount.length > 7 ? 36 : displayAmount.length > 5 ? 44 : 52;

  return (
    <div
      dir="rtl"
      className="h-screen w-full flex flex-col finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif' }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-3">
        <button
          type="button"
          onClick={() => canContinue && onContinue(numericAmount, isRecurring)}
          disabled={!canContinue}
          style={{ ...CIRCLE_BTN, opacity: canContinue ? 1 : 0.3 }}
          className="transition-opacity"
        >
          <ChevronLeft size={20} className="text-white/70" strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-[11px] text-white/45 font-medium leading-tight">
            {isIncome ? 'הכנסה' : 'הוצאה'}
          </p>
          {userName ? (
            <p className="text-[13px] text-white/70 font-semibold leading-tight">{userName}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onBack}
          style={CIRCLE_BTN}
          className="active:opacity-60 transition-opacity"
        >
          <X size={18} className="text-white/70" strokeWidth={2} />
        </button>
      </div>

      {/* Amount card */}
      <div className="mx-4 rounded-3xl px-5 pt-3 pb-0" style={GLASS}>
        <p className="text-[12px] font-medium text-white/40 text-right mb-1">כמה?</p>
        <div className="flex justify-center pb-4">
          <span style={{ display: 'inline-flex', alignItems: 'baseline', direction: 'ltr' }}>
            <span
              className="font-bold leading-none tracking-tight text-white"
              style={{ fontSize: amountFontSize }}
            >
              {displayAmount}
            </span>
            <span className="text-white/45 font-light" style={{ fontSize: 18, marginLeft: 5 }}>₪</span>
          </span>
        </div>
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.12)', marginLeft: -20, marginRight: -20 }} />
      </div>

      {/* Recurring selector */}
      <div className="flex gap-2.5 px-4 pt-3">
        <button
          type="button"
          onClick={() => setIsRecurring(false)}
          className="flex-1 rounded-2xl py-2.5 font-semibold text-[13px]"
          style={{
            background: !isRecurring ? gradient : 'rgba(255,255,255,0.08)',
            border: !isRecurring ? 'none' : '1px solid rgba(255,255,255,0.12)',
            color: !isRecurring ? 'white' : 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(12px)',
            boxShadow: !isRecurring
              ? (isIncome
                  ? '0 4px 0 rgba(6,182,212,0.40), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : '0 4px 0 rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.25)')
              : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          חד פעמי
        </button>
        <button
          type="button"
          onClick={() => setIsRecurring(true)}
          className="flex-1 rounded-2xl py-2.5 font-semibold text-[13px]"
          style={{
            background: isRecurring ? gradient : 'rgba(255,255,255,0.08)',
            border: isRecurring ? 'none' : '1px solid rgba(255,255,255,0.12)',
            color: isRecurring ? 'white' : 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(12px)',
            boxShadow: isRecurring
              ? (isIncome
                  ? '0 4px 0 rgba(6,182,212,0.40), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : '0 4px 0 rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.25)')
              : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          קבוע בכל חודש
        </button>
      </div>

      {/* CTA */}
      <div className="px-4 pt-3">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(numericAmount, isRecurring)}
          className="w-full rounded-2xl py-3.5 text-white font-bold text-[16px] disabled:opacity-35 transition-opacity"
          style={{
            background: gradient,
            boxShadow: canContinue ? ctaShadow : 'none',
          }}
        >
          המשך
        </button>
      </div>

      {/* iOS-style numpad — no container, keys fill remaining space */}
      <div
        className="grid grid-cols-3 mt-3 flex-1"
        style={{
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '0.5px',
          background: 'rgba(255,255,255,0.08)',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
        }}
        dir="ltr"
      >
        {NUMPAD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleNumKey(key)}
            className="flex items-center justify-center active:bg-white/[0.15] transition-colors"
            style={{
              background: 'rgba(15,10,30,0.92)',
              fontSize: 26,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.90)',
            }}
          >
            {key === '⌫' ? <Delete size={22} className="text-white/60" /> : key}
          </button>
        ))}
      </div>

    </div>
  );
}
