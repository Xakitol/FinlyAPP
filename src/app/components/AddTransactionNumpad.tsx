import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  type: 'income' | 'expense';
  darkMode: boolean;
  onBack: () => void;
  onContinue: (amount: number, recurring: boolean) => void;
}

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

function tactilePress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.3)';
}
function tactileRelease(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '';
}

export function AddTransactionNumpad({ type, darkMode, onBack, onContinue }: Props) {
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const isIncome = type === 'income';

  const gradient = isIncome
    ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)';

  const ctaShadow = isIncome
    ? '0 6px 0 rgba(6,182,212,0.50), 0 12px 28px rgba(14,165,233,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)'
    : '0 6px 0 rgba(124,58,237,0.50), 0 12px 28px rgba(124,58,237,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)';

  const backgroundGradient = darkMode
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const textColor = darkMode ? 'rgba(255,255,255,0.90)' : '#111';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.50)' : '#6b7280';

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

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col finly-screen"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={darkMode} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
        style={{
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.50)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-violet-700" strokeWidth={2} />
      </button>

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-16 pb-6 gap-4">

        {/* Title */}
        <h1
          className="text-2xl font-bold text-center"
          style={{ color: textColor }}
        >
          {isIncome ? ':סכום ההכנסה' : ':סכום ההוצאה'}
        </h1>

        {/* Amount display */}
        <div
          className="flex items-center justify-center rounded-3xl py-6"
          style={{
            background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: darkMode ? '1px solid rgba(255,255,255,0.10)' : '1.5px solid rgba(255,255,255,0.70)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[20px] font-light" style={{ color: mutedColor }}>₪</span>
          <span
            className="text-[52px] font-bold leading-none tracking-tight mx-2"
            style={{ color: textColor, minWidth: 80, textAlign: 'center' }}
          >
            {displayAmount}
          </span>
        </div>

        {/* Recurring choice buttons */}
        <div className="flex gap-2.5">
          {/* חד פעמי — right in RTL = first in JSX */}
          <button
            type="button"
            onClick={() => setIsRecurring(false)}
            className="flex-1 rounded-2xl py-3 font-semibold text-[14px]"
            style={{
              background: !isRecurring
                ? gradient
                : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
              border: !isRecurring
                ? 'none'
                : darkMode ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(255,255,255,0.70)',
              color: !isRecurring ? 'white' : mutedColor,
              opacity: !isRecurring ? 1 : 0.5,
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

          {/* קבוע בכל חודש — left in RTL = second in JSX */}
          <button
            type="button"
            onClick={() => setIsRecurring(true)}
            className="flex-1 rounded-2xl py-3 font-semibold text-[14px]"
            style={{
              background: isRecurring
                ? gradient
                : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
              border: isRecurring
                ? 'none'
                : darkMode ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(255,255,255,0.70)',
              color: isRecurring ? 'white' : mutedColor,
              opacity: isRecurring ? 1 : 0.5,
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

        {/* Numpad — ltr keeps 1-2-3 left-to-right */}
        <div className="grid grid-cols-3 gap-2.5" dir="ltr">
          {NUMPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNumKey(key)}
              className="h-14 rounded-2xl flex items-center justify-center font-semibold"
              style={{
                fontSize: key === '⌫' ? 18 : 22,
                color: key === '⌫' ? mutedColor : textColor,
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
                border: darkMode
                  ? '1px solid rgba(255,255,255,0.10)'
                  : '1px solid rgba(200,190,255,0.40)',
                boxShadow: darkMode
                  ? '0 4px 0 rgba(0,0,0,0.40)'
                  : '0 4px 0 rgba(180,170,220,0.30)',
                backdropFilter: 'blur(8px)',
                transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              }}
              onPointerDown={tactilePress}
              onPointerUp={tactileRelease}
              onPointerLeave={tactileRelease}
            >
              {key === '⌫' ? <X size={18} /> : key}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(numericAmount, isRecurring)}
          className="w-full rounded-2xl py-4 text-white font-bold text-[16px] disabled:opacity-40"
          style={{
            background: gradient,
            boxShadow: canContinue ? ctaShadow : 'none',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            marginTop: 'auto',
          }}
          onPointerDown={canContinue ? tactilePress : undefined}
          onPointerUp={canContinue ? tactileRelease : undefined}
          onPointerLeave={canContinue ? tactileRelease : undefined}
        >
          המשך
        </button>

      </div>
    </div>
  );
}
