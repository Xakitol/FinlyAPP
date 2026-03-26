import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface PhoneNumberScreenProps {
  onBack: () => void;
  onContinue: (phone: string) => void;
}


const KEYFRAMES = `
  @keyframes phoneFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
`;

export function PhoneNumberScreen({ onBack, onContinue }: PhoneNumberScreenProps) {
  const [phone, setPhone] = useState('');

  const canContinue = phone.replace(/\D/g, '').length >= 9;

  function handleSubmit() {
    if (!canContinue) return;
    onContinue(phone.trim());
  }

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif' }}
    >
      <style>{KEYFRAMES}</style>

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

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-xs mx-auto px-6 pt-8 pb-10 flex-1 overflow-y-auto">

        {/* Title */}
        <div
          className="w-full text-right mb-10"
          style={{ animation: 'phoneFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-white leading-tight tracking-tight">
            מה מספר הטלפון שלך?
          </h2>
          <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
            נשלח קוד אימות כדי לאבטח את הגישה לחשבון שלך
          </p>
        </div>

        {/* Phone input */}
        <div
          className="w-full mb-5"
          style={{ animation: 'phoneFadeUp 0.45s 0.14s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <input
            type="tel"
            inputMode="numeric"
            placeholder="050 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            className="w-full rounded-2xl px-5 py-4 text-right text-[18px] font-semibold text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              letterSpacing: '0.06em',
            }}
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full rounded-2xl py-4 text-white font-semibold text-[16px] transition-all active:scale-[0.97]"
          style={{
            animation: 'phoneFadeUp 0.45s 0.22s cubic-bezier(0.22,1,0.36,1) both',
            background: canContinue
              ? 'linear-gradient(135deg, #06b6d4, #a78bfa)'
              : 'rgba(255,255,255,0.08)',
            boxShadow: canContinue
              ? '0 8px 0 rgba(167,139,250,0.45), 0 14px 28px rgba(167,139,250,0.30), inset 0 1.5px 0 rgba(255,255,255,0.22)'
              : 'none',
            border: canContinue ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.10)',
            cursor: canContinue ? 'pointer' : 'default',
            color: canContinue ? 'white' : 'rgba(255,255,255,0.30)',
          }}
        >
          המשך
        </button>

        {/* Footer note */}
        <p
          className="mt-6 text-white/35 text-xs text-center"
          style={{ animation: 'phoneFadeUp 0.45s 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          המספר שלך לא ישותף עם אף גורם חיצוני
        </p>

      </div>
    </div>
  );
}
