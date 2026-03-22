import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

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

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-screen finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={false} />

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
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.50)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-violet-700" strokeWidth={2} />
      </button>

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-violet-900">איך קוראים לך?</h1>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          placeholder="השם שלך"
          className="w-full text-xl text-center rounded-2xl px-5 py-4 outline-none text-violet-900 placeholder-violet-300 font-medium"
          style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1.5px solid rgba(255,255,255,0.70)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60)',
          }}
        />

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full rounded-2xl py-4 text-white font-semibold text-base transition-transform active:scale-[0.97]"
          style={{
            background: isValid
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)'
              : 'linear-gradient(135deg, #c4b5fd 0%, #a5b4fc 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: isValid ? '0 8px 28px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.22)' : 'none',
            opacity: isValid ? 1 : 0.6,
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
