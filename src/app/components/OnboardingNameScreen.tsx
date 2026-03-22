import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const BG = 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0f1a2e 100%)';

export function OnboardingNameScreen({ onContinue, onBack }: Props) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const isValid = name.trim().length >= 2;

  function handleContinue() {
    if (!isValid) return;
    localStorage.setItem('finly_user_name', name.trim());
    onContinue();
  }

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: BG }}
    >
      <StarField darkMode={true} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="active:opacity-60 transition-opacity"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 12px)',
          right: '16px',
          zIndex: 20,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.20)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-white/70" strokeWidth={2} />
      </button>

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-white">איך קוראים לך?</h1>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          placeholder="השם שלך"
          className="w-full text-xl text-center rounded-2xl px-5 py-4 outline-none text-white placeholder-white/35 font-medium focus:ring-2 focus:ring-violet-400/50"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        />

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full rounded-2xl py-4 text-white font-semibold text-base transition-transform active:scale-[0.97]"
          style={{
            background: isValid
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)'
              : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: isValid ? '0 8px 28px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.22)' : 'none',
            opacity: isValid ? 1 : 0.5,
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
