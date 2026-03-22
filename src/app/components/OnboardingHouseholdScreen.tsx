import { User, Users, Home, Baby, ChevronRight, type LucideIcon } from 'lucide-react';
import { StarField } from './effects/StarField';

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

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.48) 0%, rgba(200,180,255,0.22) 100%)',
    border: '1.5px solid rgba(255,255,255,0.65)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
  };

  const iconWrapStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.10) 100%)',
    border: '1px solid rgba(124,58,237,0.15)',
  };

  return (
    <div
      dir="rtl"
      className="h-screen w-full relative flex flex-col items-center justify-center finly-screen finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={false} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full active:opacity-60 transition-opacity"
        style={{
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.50)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-violet-700" strokeWidth={2} />
      </button>

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-violet-900">מי מתנהל איתך?</h1>
          <p className="text-base font-medium text-violet-500">Finly יזהה איך מתנהל משק הבית שלך ויתאים את עצמו אליך</p>
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
                  <Icon size={24} strokeWidth={1.8} style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base text-violet-900">{opt.label}</span>
                  <span className="text-sm text-violet-500 mt-0.5">{opt.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
