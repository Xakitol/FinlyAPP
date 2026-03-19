import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

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

  const backgroundGradient =
    'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const canContinue = phone.replace(/\D/g, '').length >= 9;

  function handleSubmit() {
    if (!canContinue) return;
    onContinue(phone.trim());
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col animate-in fade-in duration-500"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <style>{KEYFRAMES}</style>
      <StarField darkMode={false} />

      {/* Back button */}
      <div className="relative z-10 px-4 pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-violet-600 text-[14px] font-medium active:opacity-70 transition-opacity"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-xs mx-auto px-6 pt-8 pb-10 flex-1">

        {/* Title */}
        <div
          className="w-full text-right mb-10"
          style={{ animation: 'phoneFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-violet-900 leading-tight tracking-tight">
            מה מספר הטלפון שלך?
          </h2>
          <p className="mt-2 text-[14px] text-violet-500 leading-relaxed">
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
            className="w-full rounded-2xl px-5 py-4 text-right text-[18px] font-semibold text-violet-900 placeholder:text-violet-300 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(242,236,255,0.65) 100%)',
              border: '1.5px solid rgba(255,255,255,0.90)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 4px 16px rgba(139,92,246,0.10), inset 0 1.5px 0 rgba(255,255,255,0.95)',
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
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)'
              : 'rgba(196,181,253,0.55)',
            boxShadow: canContinue
              ? '0 8px 0 rgba(109,40,217,0.40), 0 14px 28px rgba(99,102,241,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)'
              : 'none',
            border: canContinue ? '1px solid rgba(255,255,255,0.18)' : 'none',
            cursor: canContinue ? 'pointer' : 'default',
            color: canContinue ? 'white' : 'rgba(109,40,217,0.45)',
          }}
        >
          המשך
        </button>

        {/* Footer note */}
        <p
          className="mt-6 text-violet-400 text-xs text-center"
          style={{ animation: 'phoneFadeUp 0.45s 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          המספר שלך לא ישותף עם אף גורם חיצוני
        </p>

      </div>
    </div>
  );
}
