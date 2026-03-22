import { Mars, Venus, ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function OnboardingGenderScreen({ onContinue, onBack }: Props) {
  const name = localStorage.getItem('finly_user_name') ?? '';

  function handleSelect(gender: 'male' | 'female') {
    localStorage.setItem('finly_user_gender', gender);
    onContinue();
  }

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.48) 0%, rgba(200,180,255,0.22) 100%)',
    border: '1.5px solid rgba(255,255,255,0.65)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
  };

  const backBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.35)',
    border: '1px solid rgba(255,255,255,0.50)',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col items-center justify-center finly-screen"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={false} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full active:opacity-60 transition-opacity"
        style={backBtnStyle}
      >
        <ChevronRight size={20} className="text-violet-700" strokeWidth={2} />
      </button>

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-violet-900">באיזה לשון לפנות אליך?</h1>
          <p className="text-base font-medium text-violet-500">איך נוח לך שנפנה אליך?</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSelect('male')}
            className="flex-1 rounded-3xl py-10 flex flex-col items-center justify-center gap-3 font-semibold text-lg text-violet-800 active:scale-[0.97] transition-transform"
            style={cardStyle}
          >
            <Mars size={28} style={{ color: '#7c3aed' }} strokeWidth={1.8} />
            בלשון זכר
          </button>
          <button
            onClick={() => handleSelect('female')}
            className="flex-1 rounded-3xl py-10 flex flex-col items-center justify-center gap-3 font-semibold text-lg text-violet-800 active:scale-[0.97] transition-transform"
            style={cardStyle}
          >
            <Venus size={28} style={{ color: '#ec4899' }} strokeWidth={1.8} />
            בלשון נקבה
          </button>
        </div>
      </div>
    </div>
  );
}
