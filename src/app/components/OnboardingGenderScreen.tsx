import { Mars, Venus, ChevronRight } from 'lucide-react';

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

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
  };

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif' }}
    >

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

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-white">באיזה לשון לפנות אליך?</h1>
          <p className="text-base font-medium text-white/55">{name ? `${name}, ` : ''}איך נוח לך שנפנה אליך?</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSelect('male')}
            className="flex-1 rounded-3xl py-10 flex flex-col items-center justify-center gap-3 font-semibold text-lg text-white active:scale-[0.97] transition-transform"
            style={cardStyle}
          >
            <Mars size={28} style={{ color: '#a78bfa' }} strokeWidth={1.8} />
            בלשון זכר
          </button>
          <button
            onClick={() => handleSelect('female')}
            className="flex-1 rounded-3xl py-10 flex flex-col items-center justify-center gap-3 font-semibold text-lg text-white active:scale-[0.97] transition-transform"
            style={cardStyle}
          >
            <Venus size={28} style={{ color: '#f472b6' }} strokeWidth={1.8} />
            בלשון נקבה
          </button>
        </div>
      </div>
    </div>
  );
}
