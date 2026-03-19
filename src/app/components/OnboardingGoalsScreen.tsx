import { useState } from 'react';
import { Check } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
}

interface GoalOption {
  id: string;
  emoji: string;
  label: string;
}

const GOALS: GoalOption[] = [
  { id: 'end-plus', emoji: '📈', label: 'לסיים כל חודש בפלוס' },
  { id: 'understand-spending', emoji: '🔍', label: 'להבין לאן הכסף שלי הולך' },
  { id: 'build-savings', emoji: '🏦', label: 'לבנות חיסכון יציב' },
  { id: 'no-surprises', emoji: '📅', label: 'להפסיק עם ההפתעות בסוף החודש' },
  { id: 'feel-safe', emoji: '🕊️', label: 'שקט נפשי עם הכסף שלי' },
];

export function OnboardingGoalsScreen({ onContinue }: Props) {
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
    boxShadow: '0 4px 20px rgba(124,58,237,0.22), 0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.55)',
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative flex flex-col items-center justify-center animate-in fade-in duration-500"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={false} />

      <div className="relative z-10 w-full max-w-xs px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-violet-900">מה חשוב לך השנה?</h1>
          <p className="text-sm font-medium text-violet-500">אפשר לסמן כמה שרוצים — Finly יתאים את עצמו</p>
        </div>

        <div className="flex flex-col gap-3">
          {GOALS.map((goal) => {
            const isSelected = selected.has(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className="w-full rounded-2xl px-5 py-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-right"
                style={isSelected ? selectedCardStyle : baseCardStyle}
              >
                <span className="text-2xl flex-shrink-0">{goal.emoji}</span>
                <span className="flex-1 font-semibold text-base text-violet-900 text-right">{goal.label}</span>
                {isSelected && (
                  <Check
                    size={20}
                    className="flex-shrink-0 text-violet-600"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full rounded-2xl py-4 text-white font-semibold text-base transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 28px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          בואו נתחיל
        </button>
      </div>
    </div>
  );
}
