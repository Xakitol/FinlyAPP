import { Sparkles } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
}

export function OnboardingSuccessScreen({ onContinue }: Props) {
  const name = localStorage.getItem('finly_user_name') ?? '';

  function handleContinue() {
    localStorage.setItem('finly_onboarded_complete', '1');
    onContinue();
  }

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col items-center justify-center animate-in fade-in duration-500"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={false} />

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col items-center gap-8 text-center">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            boxShadow: '0 12px 32px rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.24)',
          }}
        >
          <Sparkles size={38} color="white" strokeWidth={1.6} />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-violet-900">הכל מוכן, {name}! 💜</h1>
          <p className="text-base font-medium text-violet-500">Finly מוכן לצעוד איתך לחברות פיננסית</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full rounded-2xl py-4 text-white font-semibold text-base transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 28px rgba(124,58,237,0.42), 0 2px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          יאללה נתחיל
        </button>
      </div>
    </div>
  );
}
