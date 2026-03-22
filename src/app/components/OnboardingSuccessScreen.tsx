import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onContinue: () => void;
}

const BG = 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0f1a2e 100%)';

const KEYFRAMES = `
  @keyframes successSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes successFadeScale {
    from { opacity: 0; transform: scale(0.65); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes successFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes successBounce {
    0%   { opacity: 0; transform: scale(0.3); }
    55%  { opacity: 1; transform: scale(1.15); }
    75%  { transform: scale(0.92); }
    90%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes successFadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
`;

type Stage = 'loading' | 'logo' | 'title' | 'subtitle' | 'ready' | 'fading';

export function OnboardingSuccessScreen({ onContinue }: Props) {
  const name = localStorage.getItem('finly_user_name') ?? '';
  const [stage, setStage] = useState<Stage>('loading');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('logo'),     1800);
    const t2 = setTimeout(() => setStage('title'),    2700);
    const t3 = setTimeout(() => setStage('subtitle'), 3500);
    const t4 = setTimeout(() => setStage('ready'),    4400);
    const t5 = setTimeout(() => setStage('fading'),   5400);
    const t6 = setTimeout(() => {
      localStorage.setItem('finly_onboarded_complete', '1');
      onContinue();
    }, 5800);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  const showTitle    = stage === 'title'    || stage === 'subtitle' || stage === 'ready' || stage === 'fading';
  const showSubtitle = stage === 'subtitle' || stage === 'ready'    || stage === 'fading';
  const showReady    = stage === 'ready'    || stage === 'fading';
  const isFading     = stage === 'fading';

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-safe"
      style={{
        fontFamily: 'Rubik, sans-serif',
        animation: isFading ? 'successFadeOut 0.4s ease-out forwards' : undefined,
      }}
    >
      <style>{KEYFRAMES}</style>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">

        {/* Spinner / Logo */}
        <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
          {stage === 'loading' ? (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #7c3aed 0%, #ec4899 55%, rgba(124,58,237,0.10) 100%)',
                animation: 'successSpin 1.1s linear infinite',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 7,
                  borderRadius: '50%',
                  background: BG,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                boxShadow: '0 12px 32px rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'successFadeScale 0.8s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              <Sparkles size={38} color="white" strokeWidth={1.6} />
            </div>
          )}
        </div>

        {/* Title */}
        {showTitle && (
          <h1
            className="text-3xl font-bold text-white"
            style={{ animation: 'successFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            !הכל מוכן, {name}
          </h1>
        )}

        {/* Subtitle */}
        {showSubtitle && (
          <p
            className="text-base font-medium text-white/60"
            style={{ animation: 'successFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            Finly מוכן לצעוד איתך לחברות פיננסית
          </p>
        )}

        {/* Celebration */}
        {showReady && (
          <p
            className="text-4xl font-bold"
            style={{
              animation: 'successBounce 0.9s cubic-bezier(0.22,1,0.36,1) both',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            !מתחילים
          </p>
        )}

      </div>
    </div>
  );
}
