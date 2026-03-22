import { useState, type CSSProperties } from 'react';
import { ChevronRight, Phone, Mail } from 'lucide-react';
import { StarField } from './effects/StarField';
import { signInWithGoogle } from '../utils/authGoogle';
import { signInWithApple } from '../utils/authApple';

interface SignupMethodScreenProps {
  onBack: () => void;
  onGoogle: () => void;   // called on success
  onPhone: () => void;
  onApple: () => void;    // called on success
  onEmail: () => void;
}

const KEYFRAMES = `
  @keyframes signupFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
`;

function glassOption(): CSSProperties {
  return {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.78) 0%, rgba(242,236,255,0.55) 100%)',
    border: '1.5px solid rgba(255,255,255,0.90)',
    backdropFilter: 'blur(14px)',
  };
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function SignupMethodScreen({ onBack, onGoogle, onPhone, onApple, onEmail }: SignupMethodScreenProps) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const backgroundGradient =
    'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const shadowNeutral =
    '0 6px 0 rgba(0,0,0,0.08), 0 10px 24px rgba(0,0,0,0.07), inset 0 1.5px 0 rgba(255,255,255,0.95)';

  async function handleGoogle() {
    setLoadingProvider('google');
    const result = await signInWithGoogle();
    setLoadingProvider(null);
    if (result !== null) onGoogle();
  }

  async function handleApple() {
    setLoadingProvider('apple');
    const result = await signInWithApple();
    setLoadingProvider(null);
    if (result.success) onApple();
  }

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col finly-screen finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <style>{KEYFRAMES}</style>
      <StarField darkMode={false} />

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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto px-6 pt-8 pb-10 flex-1 overflow-y-auto">

        {/* Title */}
        <div
          className="w-full text-right mb-8"
          style={{ animation: 'signupFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-violet-900 leading-tight tracking-tight">
            ניצור לך חשבון
          </h2>
          <p className="mt-2 text-[14px] text-violet-500 leading-relaxed">
            בחר איך להירשם ל-Finly
          </p>
        </div>

        {/* Options — Gmail → Phone → Apple → Email */}
        <div className="w-full flex flex-col gap-3">

          {/* Gmail */}
          <button
            onClick={handleGoogle}
            disabled={loadingProvider !== null}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
            style={{ ...glassOption(), boxShadow: shadowNeutral, animation: 'signupFadeUp 0.45s 0.14s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.14)' }}>
              {loadingProvider === 'google'
                ? <div className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                : <GoogleIcon />}
            </div>
            <span className="flex-1 text-[15px] font-semibold text-gray-800">הרשמה עם Gmail</span>
          </button>

          {/* Phone */}
          <button
            onClick={onPhone}
            disabled={loadingProvider !== null}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
            style={{ ...glassOption(), boxShadow: '0 6px 0 rgba(109,40,217,0.14), 0 10px 24px rgba(139,92,246,0.10), inset 0 1.5px 0 rgba(255,255,255,0.95)', animation: 'signupFadeUp 0.45s 0.22s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.16)' }}>
              <Phone className="h-5 w-5 text-violet-600" strokeWidth={2} />
            </div>
            <span className="flex-1 text-[15px] font-semibold text-gray-800">טלפון</span>
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={loadingProvider !== null}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
            style={{ ...glassOption(), boxShadow: shadowNeutral, animation: 'signupFadeUp 0.45s 0.30s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-900" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
              {loadingProvider === 'apple'
                ? <div className="h-5 w-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
                : <AppleIcon />}
            </div>
            <span className="flex-1 text-[15px] font-semibold text-gray-800">הרשמה עם Apple</span>
          </button>

          {/* Email */}
          <button
            onClick={onEmail}
            disabled={loadingProvider !== null}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
            style={{ ...glassOption(), boxShadow: shadowNeutral, animation: 'signupFadeUp 0.45s 0.38s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.14)' }}>
              <Mail className="h-5 w-5 text-indigo-500" strokeWidth={2} />
            </div>
            <span className="flex-1 text-[15px] font-semibold text-gray-800">הרשמה עם אימייל</span>
          </button>

        </div>

        {/* Footer */}
        <p
          className="mt-8 text-violet-400 text-xs text-center"
          style={{ animation: 'signupFadeUp 0.45s 0.48s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          ההרשמה מאובטחת ופרטית
        </p>
      </div>
    </div>
  );
}
