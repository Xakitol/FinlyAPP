import { useState } from 'react';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { StarField } from './effects/StarField';
import { signUpWithEmail } from '../utils/authEmail';
import { signInWithEmail } from '../utils/authEmail';

interface EmailSignupScreenProps {
  onBack: () => void;
  onContinue: () => void;
  mode?: 'signup' | 'login';
}

const BG = 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0f1a2e 100%)';

const KEYFRAMES = `
  @keyframes emailFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputStyle = {
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
};

export function EmailSignupScreen({ onBack, onContinue, mode = 'signup' }: EmailSignupScreenProps) {
  const isLogin = mode === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nameValid = isLogin || name.trim().length > 0;
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 6;
  const canContinue = nameValid && emailValid && passwordValid;

  async function handleSubmit() {
    if (!canContinue || loading) return;
    setLoading(true);
    setError('');

    if (isLogin) {
      const ok = await signInWithEmail(email.trim().toLowerCase(), password);
      setLoading(false);
      if (ok) {
        onContinue();
      } else {
        setError('משהו השתבש, נסה שוב');
      }
    } else {
      if (name.trim()) localStorage.setItem('finly_user_name', name.trim());
      const result = await signUpWithEmail(email.trim().toLowerCase(), password);
      setLoading(false);
      if (result.ok) {
        onContinue();
      } else if (result.code === 'auth/email-already-in-use') {
        setError('האימייל הזה כבר רשום — נסה להתחבר במקום');
      } else {
        setError('משהו השתבש, נסה שוב');
      }
    }
  }

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: BG }}
    >
      <style>{KEYFRAMES}</style>
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-xs mx-auto px-6 pt-8 pb-10 flex-1 overflow-y-auto">

        {/* Title */}
        <div
          className="w-full text-right mb-8"
          style={{ animation: 'emailFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-white leading-tight tracking-tight">
            {isLogin ? 'כניסה עם אימייל' : 'הרשמה עם אימייל'}
          </h2>
          <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
            {isLogin ? 'הכנס את פרטי החשבון שלך' : 'מלא את הפרטים כדי ליצור את החשבון שלך'}
          </p>
        </div>

        {/* Fields */}
        <div
          className="w-full flex flex-col gap-3 mb-5"
          style={{ animation: 'emailFadeUp 0.45s 0.14s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Full name — signup only */}
          {!isLogin && (
            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl px-5 py-4 text-right text-[16px] text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
              style={inputStyle}
              autoComplete="name"
            />
          )}

          {/* Email */}
          <input
            type="email"
            inputMode="email"
            placeholder="כתובת אימייל"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="w-full rounded-2xl px-5 py-4 text-right text-[16px] text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
            style={inputStyle}
            autoComplete="email"
          />

          {/* Password with show/hide toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה (לפחות 6 תווים)"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-2xl px-5 py-4 text-right text-[16px] text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-violet-400/50 transition-shadow"
              style={inputStyle}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 active:opacity-60 transition-opacity"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-[13px] text-rose-400 text-right font-medium px-1">{error}</p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canContinue || loading}
          className="w-full rounded-2xl py-4 font-semibold text-[16px] transition-all active:scale-[0.97]"
          style={{
            animation: 'emailFadeUp 0.45s 0.22s cubic-bezier(0.22,1,0.36,1) both',
            background: canContinue
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)'
              : 'rgba(255,255,255,0.08)',
            boxShadow: canContinue
              ? '0 8px 0 rgba(109,40,217,0.40), 0 14px 28px rgba(99,102,241,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)'
              : 'none',
            border: canContinue ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.10)',
            cursor: canContinue ? 'pointer' : 'default',
            color: canContinue ? 'white' : 'rgba(255,255,255,0.30)',
          }}
        >
          {loading ? '...' : 'המשך'}
        </button>

        {/* Footer */}
        <p
          className="mt-6 text-white/35 text-xs text-center"
          style={{ animation: 'emailFadeUp 0.45s 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          פרטיך לא ישותפו עם אף גורם חיצוני
        </p>

      </div>
    </div>
  );
}
