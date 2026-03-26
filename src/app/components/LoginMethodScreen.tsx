import { useState, type CSSProperties } from 'react';
import { ChevronRight, Phone, ChevronDown, Mail } from 'lucide-react';
import { signInWithGoogle } from '../utils/authGoogle';
import { signInWithApple } from '../utils/authApple';

interface LoginMethodScreenProps {
  onBack: () => void;
  onPhone: () => void;
  onBiometric: () => void;
  onGoogle: () => void;
  onApple: () => void;
  onEmail: () => void;
}


const KEYFRAMES = `
  @keyframes loginFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
`;

function glassOption(): CSSProperties {
  return {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
  };
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function BiometricIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
      <path d="M2 12a10 10 0 0 1 18-6"/>
      <path d="M2 17c3.5-1 6.5-4 6.5-4"/>
      <path d="M2.5 19.5A10 10 0 0 0 7 20"/>
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
    </svg>
  );
}

export function LoginMethodScreen({ onBack, onPhone, onBiometric, onGoogle, onApple, onEmail }: LoginMethodScreenProps) {
  const [showMore, setShowMore] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

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
          className="w-full text-right mb-8"
          style={{ animation: 'loginFadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h2 className="text-[24px] font-bold text-white leading-tight tracking-tight">
            ברוך הבא חזרה
          </h2>
          <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
            התחבר כדי להמשיך
          </p>
        </div>

        {/* Primary actions */}
        <div
          className="w-full flex flex-col gap-3"
          style={{ animation: 'loginFadeUp 0.45s 0.14s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Phone OTP — primary gradient */}
          <button
            onClick={onPhone}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #a78bfa)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 0 rgba(167,139,250,0.45), 0 14px 28px rgba(167,139,250,0.30), inset 0 1.5px 0 rgba(255,255,255,0.22)',
            }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              <Phone className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 text-right">
              <p className="text-[15px] font-semibold text-white leading-tight">כניסה עם מספר טלפון</p>
              <p className="text-[11px] text-white/65 mt-0.5">קוד אימות ישלח ב-SMS</p>
            </div>
          </button>

          {/* Biometric — secondary glass */}
          <button
            onClick={onBiometric}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-right active:scale-[0.97] transition-transform"
            style={glassOption()}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-violet-400"
              style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.22)' }}
            >
              <BiometricIcon />
            </div>
            <div className="flex-1 text-right">
              <p className="text-[15px] font-semibold text-white leading-tight">מזהה פנים / טביעת אצבע</p>
              <p className="text-[11px] text-white/45 mt-0.5">אם הופעל בעבר במכשיר זה</p>
            </div>
          </button>
        </div>

        {/* Expandable more options */}
        <div
          className="w-full mt-5"
          style={{ animation: 'loginFadeUp 0.45s 0.26s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1.5 text-violet-400 text-[13px] font-medium active:opacity-70 transition-opacity mx-auto"
            style={{ display: 'flex' }}
          >
            <span>עוד אפשרויות</span>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-200"
              style={{ transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Animated reveal */}
          <div
            style={{
              maxHeight: showMore ? 280 : 0,
              opacity: showMore ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.22s ease, opacity 0.18s ease',
            }}
          >
            <div className="flex flex-col gap-3 pt-3">

              {/* Gmail */}
              <button
                onClick={handleGoogle}
                disabled={loadingProvider !== null}
                className="w-full flex items-center gap-4 rounded-2xl px-5 py-3.5 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
                style={glassOption()}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.20)' }}
                >
                  {loadingProvider === 'google'
                    ? <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    : <GoogleIcon />}
                </div>
                <span className="flex-1 text-[14px] font-semibold text-white">כניסה עם Gmail</span>
              </button>

              {/* Apple */}
              <button
                onClick={handleApple}
                disabled={loadingProvider !== null}
                className="w-full flex items-center gap-4 rounded-2xl px-5 py-3.5 text-right active:scale-[0.97] transition-transform disabled:opacity-70 text-white"
                style={glassOption()}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)' }}
                >
                  {loadingProvider === 'apple'
                    ? <div className="h-4 w-4 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
                    : <AppleIcon />}
                </div>
                <span className="flex-1 text-[14px] font-semibold text-white">כניסה עם Apple</span>
              </button>

              {/* Email */}
              <button
                onClick={onEmail}
                disabled={loadingProvider !== null}
                className="w-full flex items-center gap-4 rounded-2xl px-5 py-3.5 text-right active:scale-[0.97] transition-transform disabled:opacity-70"
                style={glassOption()}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.20)' }}
                >
                  <Mail className="h-4 w-4 text-indigo-400" strokeWidth={2} />
                </div>
                <span className="flex-1 text-[14px] font-semibold text-white">כניסה עם אימייל</span>
              </button>

            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className="mt-8 text-white/35 text-xs text-center"
          style={{ animation: 'loginFadeUp 0.45s 0.36s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          מתחבר לחשבון הקיים שלך ב-Finly
        </p>

      </div>
    </div>
  );
}
