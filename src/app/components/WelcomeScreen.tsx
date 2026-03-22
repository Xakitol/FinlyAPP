import { useState, useEffect, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { StarField } from './effects/StarField';

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

const BG = 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0f1a2e 100%)';

const KEYFRAMES = `
  @keyframes welcomeFadeUp {
    0%  { opacity: 0; transform: translateY(24px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
  @keyframes welcomeLogoIn {
    0%  { opacity: 0; transform: scale(0.88) translateY(16px); }
    100%{ opacity: 1; transform: scale(1) translateY(0); }
  }
`;

function glassBtn(primary: boolean): CSSProperties {
  if (primary) {
    return {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 8px 28px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.22)',
    };
  }
  return {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
  };
}

export function WelcomeScreen({ onLogin, onSignup }: WelcomeScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: BG }}
    >
      <style>{KEYFRAMES}</style>
      <StarField darkMode={true} />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-xs px-6"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      >
        {/* Logo area */}
        <div
          className="flex flex-col items-center mb-10"
          style={{ animation: 'welcomeLogoIn 0.55s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Icon mark */}
          <div
            className="mb-4 flex items-center justify-center rounded-2xl"
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: '0 12px 32px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.24)',
            }}
          >
            <Sparkles size={34} color="white" strokeWidth={1.6} />
          </div>

          {/* Wordmark */}
          <h1
            className="font-bold tracking-tight"
            style={{
              fontSize: 42,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Finly
          </h1>

          {/* Promise line */}
          <p
            className="mt-3 text-center font-medium text-white/60"
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              animation: 'welcomeFadeUp 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            כסף שקט. בחירות ברורות.
          </p>
        </div>

        {/* CTA buttons */}
        <div
          className="w-full flex flex-col gap-3"
          style={{ animation: 'welcomeFadeUp 0.5s 0.28s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Primary: new user */}
          <button
            onClick={onSignup}
            className="w-full rounded-2xl py-4 text-white font-semibold text-base active:scale-[0.97] transition-transform"
            style={glassBtn(true)}
          >
            מתחילים
          </button>

          {/* Secondary: existing user */}
          <button
            onClick={onLogin}
            className="w-full rounded-2xl py-4 text-white/80 font-medium text-base active:scale-[0.97] transition-transform"
            style={glassBtn(false)}
          >
            אני כבר חבר ב-Finly
          </button>
        </div>

        {/* Subtle footer note */}
        <p
          className="mt-8 text-white/35 text-xs text-center"
          style={{ animation: 'welcomeFadeUp 0.5s 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          הנתונים שלך נשמרים רק במכשיר שלך
        </p>

      </div>
    </div>
  );
}
