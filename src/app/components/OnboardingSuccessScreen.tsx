import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
}

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
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes successBounce {
    0%   { opacity: 0; transform: scale(0.3); }
    52%  { opacity: 1; transform: scale(1.2); }
    74%  { transform: scale(0.88); }
    90%  { transform: scale(1.06); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

type Stage = 'loading' | 'logo' | 'title' | 'subtitle' | 'ready';

export function OnboardingSuccessScreen({ onContinue }: Props) {
  const name = localStorage.getItem('finly_user_name') ?? '';
  const [stage, setStage] = useState<Stage>('loading');

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  useEffect(() => {
    const t1 = setTimeout(() => setStage('logo'),     1800);
    const t2 = setTimeout(() => setStage('title'),    2400);
    const t3 = setTimeout(() => setStage('subtitle'), 2800);
    const t4 = setTimeout(() => setStage('ready'),    3400);
    const t5 = setTimeout(() => {
      localStorage.setItem('finly_onboarded_complete', '1');
      onContinue();
    }, 3900);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  const showTitle    = stage === 'title'    || stage === 'subtitle' || stage === 'ready';
  const showSubtitle = stage === 'subtitle' || stage === 'ready';
  const showReady    = stage === 'ready';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col items-center justify-center"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <style>{KEYFRAMES}</style>
      <StarField darkMode={false} />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">

        {/* Spinner / Logo */}
        <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
          {stage === 'loading' ? (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #7c3aed 0%, #ec4899 55%, rgba(221,214,254,0.15) 100%)',
                animation: 'successSpin 1.1s linear infinite',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 7,
                  borderRadius: '50%',
                  background: backgroundGradient,
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
                animation: 'successFadeScale 0.4s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              <Sparkles size={38} color="white" strokeWidth={1.6} />
            </div>
          )}
        </div>

        {/* Title */}
        {showTitle && (
          <h1
            className="text-3xl font-bold text-violet-900"
            style={{ animation: 'successFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            !הכל מוכן, {name}
          </h1>
        )}

        {/* Subtitle */}
        {showSubtitle && (
          <p
            className="text-base font-medium text-violet-500"
            style={{ animation: 'successFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            Finly מוכן לצעוד איתך לחברות פיננסית
          </p>
        )}

        {/* Celebration */}
        {showReady && (
          <p
            className="text-4xl font-bold"
            style={{
              animation: 'successBounce 0.6s cubic-bezier(0.22,1,0.36,1) both',
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
