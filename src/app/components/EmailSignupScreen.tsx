import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

interface EmailSignupScreenProps {
  onBack: () => void;
  onContinue: (name: string, email: string) => void;
}

const KEYFRAMES = `
  @keyframes emailFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputStyle = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(242,236,255,0.65) 100%)',
  border: '1.5px solid rgba(255,255,255,0.90)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 4px 16px rgba(139,92,246,0.10), inset 0 1.5px 0 rgba(255,255,255,0.95)',
};

export function EmailSignupScreen({ onBack, onContinue }: EmailSignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const nameValid = name.trim().length > 0;
  const emailValid = EMAIL_RE.test(email.trim());
  const canContinue = nameValid && emailValid;

  function handleSubmit() {
    if (!canContinue) return;
    onContinue(name.trim(), email.trim().toLowerCase());
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col"
      style={{ fontFamily: 'Rubik, sans-serif', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)' }}
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
          className="w-full text-right mb-8"
          style={{ animation: 'emailFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-violet-900 leading-tight tracking-tight">
            הרשמה עם אימייל
          </h2>
          <p className="mt-2 text-[14px] text-violet-500 leading-relaxed">
            מלא את הפרטים כדי ליצור את החשבון שלך
          </p>
        </div>

        {/* Fields */}
        <div
          className="w-full flex flex-col gap-3 mb-5"
          style={{ animation: 'emailFadeUp 0.45s 0.14s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Full name */}
          <input
            type="text"
            placeholder="שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 text-right text-[16px] text-violet-900 placeholder:text-violet-300 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
            style={inputStyle}
            autoComplete="name"
          />
          {/* Email */}
          <input
            type="email"
            inputMode="email"
            placeholder="כתובת אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-2xl px-5 py-4 text-right text-[16px] text-violet-900 placeholder:text-violet-300 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
            style={inputStyle}
            autoComplete="email"
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full rounded-2xl py-4 font-semibold text-[16px] transition-all active:scale-[0.97]"
          style={{
            animation: 'emailFadeUp 0.45s 0.22s cubic-bezier(0.22,1,0.36,1) both',
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

        {/* Footer */}
        <p
          className="mt-6 text-violet-400 text-xs text-center"
          style={{ animation: 'emailFadeUp 0.45s 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          פרטיך לא ישותפו עם אף גורם חיצוני
        </p>

      </div>
    </div>
  );
}
