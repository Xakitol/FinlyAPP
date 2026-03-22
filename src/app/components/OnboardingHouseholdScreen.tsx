import { User, Users, Home, Baby, ChevronRight, type LucideIcon } from 'lucide-react';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

type HouseholdType = 'solo' | 'partner' | 'family' | 'single-parent';

interface Option {
  value: HouseholdType;
  icon: LucideIcon;
  label: string;
  description: string;
}

const OPTIONS: Option[] = [
  { value: 'solo',          icon: User,  label: 'רק אני',              description: 'מנהל/ת את הכסף לבד' },
  { value: 'partner',       icon: Users, label: 'אני והשותף/ה שלי',    description: 'מתנהלים ביחד' },
  { value: 'family',        icon: Home,  label: 'משפחה עם ילדים',      description: 'כלכלת בית מלאה' },
  { value: 'single-parent', icon: Baby,  label: 'הורה עם ילדים',       description: 'מנהל/ת לבד עם ילדים' },
];


export function OnboardingHouseholdScreen({ onContinue, onBack }: Props) {
  function handleSelect(value: HouseholdType) {
    localStorage.setItem('finly_user_household', value);
    onContinue();
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
  };

  const iconWrapStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(124,58,237,0.20)',
    border: '1px solid rgba(124,58,237,0.25)',
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

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-white">מי מתנהל איתך?</h1>
          <p className="text-base font-medium text-white/55">Finly יזהה איך מתנהל משק הבית שלך ויתאים את עצמו אליך</p>
        </div>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="w-full rounded-2xl px-5 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-right"
                style={cardStyle}
              >
                <div style={iconWrapStyle}>
                  <Icon size={24} strokeWidth={1.8} style={{ color: '#a78bfa' }} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base text-white">{opt.label}</span>
                  <span className="text-sm text-white/55 mt-0.5">{opt.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
