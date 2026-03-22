import { useState } from 'react';
import { Check, TrendingUp, PieChart, PiggyBank, BellOff, Heart, Eye, ChevronRight, type LucideIcon } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

interface GoalOption {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle: string;
}

const GOALS: GoalOption[] = [
  { id: 'end-plus',           icon: TrendingUp, label: 'לסיים את החודש בפלוס',                                          subtitle: 'מסלול להתנהלות חודשית נכונה' },
  { id: 'understand-spending',icon: PieChart,   label: 'לראות לאן הכסף זורם',                                          subtitle: 'מה נתיבי הכסף שיוצא ונכנס' },
  { id: 'build-savings',      icon: PiggyBank,  label: 'להתחיל חיסכון יציב ושקט, גם כשמרגיש צפוף',                   subtitle: 'לבנות כרית ביטחון קטנה-קטנה' },
  { id: 'no-surprises',       icon: BellOff,    label: 'להפסיק עם ההפתעות בסוף החודש',                               subtitle: 'לדעת מה מחכה לפני שהוא קורה' },
  { id: 'feel-safe',          icon: Heart,      label: 'שקט נפשי עם הכסף שלי',                                        subtitle: 'להרגיש בשליטה, גם כשיש אילוצים' },
  { id: 'no-fear',            icon: Eye,        label: 'להסתכל לכסף שלי בלבן של העיניים בלי פחד', subtitle: 'להתיידד עם פיינלי ולהפסיק לברוח מהמספרים' },
];

const iconColor = 'linear-gradient(135deg, #7c3aed, #ec4899)';

export function OnboardingGoalsScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleGoal(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleContinue() {
    localStorage.setItem('finly_user_goals', JSON.stringify([...selected]));
    onContinue();
  }

  const backgroundGradient = 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const baseCardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.48) 0%, rgba(200,180,255,0.22) 100%)',
    border: '1.5px solid rgba(255,255,255,0.65)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
  };

  const selectedCardStyle: React.CSSProperties = {
    background: 'linear-gradient(rgba(237,233,254,0.62), rgba(252,231,255,0.50)) padding-box, linear-gradient(135deg, #7c3aed, #ec4899) border-box',
    border: '2px solid transparent',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(124,58,237,0.22), inset 0 1px 0 rgba(255,255,255,0.55)',
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative finly-screen"
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

      <div className="relative z-10 w-full max-w-xs mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold text-violet-900">איזה מטרות תרצה להשיג איתי?</h1>
          <p className="text-sm font-medium text-violet-500">בחר את המטרות שמדויקות לך</p>
        </div>

        <div className="flex flex-col gap-3">
          {GOALS.map((goal) => {
            const isSelected = selected.has(goal.id);
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className="w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform text-right"
                style={isSelected ? selectedCardStyle : baseCardStyle}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.10) 100%)',
                    border: '1px solid rgba(124,58,237,0.15)',
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    style={{
                      stroke: 'url(#goal-icon-grad)',
                      color: '#7c3aed',
                    }}
                  />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold text-[14px] text-violet-900 leading-snug">{goal.label}</p>
                  <p className="text-[12px] text-violet-500 mt-0.5 leading-snug">{goal.subtitle}</p>
                </div>
                {isSelected && (
                  <Check size={18} className="flex-shrink-0 text-violet-600" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>

        {/* SVG gradient definition for icons */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="goal-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <button
          onClick={handleContinue}
          className="w-full rounded-2xl py-4 text-white font-semibold text-base transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 28px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          המשך, עוד קצת...
        </button>
      </div>
    </div>
  );
}
