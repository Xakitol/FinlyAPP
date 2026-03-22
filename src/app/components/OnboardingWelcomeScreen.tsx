import { ChevronRight } from 'lucide-react';
import { StarField } from './effects/StarField';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const BG = 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0f1a2e 100%)';

const BLOCKS = [
  {
    heading: '?אז מה נעשה כאן',
    body: 'בפיינלי נעשה סדר עדין ופשוט בכסף שלך. כמה דקות בשבוע יספיקו כדי להבין איפה אתה עומד, מה עוד צפוי לקרות החודש, ואיך להתקרב למטרות שבחרת.',
  },
  {
    heading: '?איך נעבוד ביחד',
    body: 'נשתמש בכמה כלים קבועים: מעקב אחרי תנועות, צפייה בהוצאות קבועות ומשתנות, ותמונה חודשית ברורה. אתה מביא את המספרים, פיינלי מחברת אותם לתמונה שקטה וברורה.',
  },
  {
    heading: '?איך נתעד הוצאה',
    body: 'כל פעם שיש הוצאה או הכנסה משמעותית, פותחים את פיינלי, בוחרים סכום, קטגוריה ותאריך – וזהו. כמה הקשות קצרות, והכל נשמר במקום אחד מסודר ונגיש.',
  },
  {
    heading: '?זה בטוח יעזור לנו',
    body: 'כן. רישום ידני ותיעוד שוטף הופכים בלגן לתבנית. כשתראה את המספרים מול העיניים, תדע בדיוק מה אפשר לשפר, איפה אפשר לחסוך, ואיך לסיים את החודש רגוע יותר.',
  },
];

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
  textAlign: 'right',
  direction: 'rtl',
};

export function OnboardingWelcomeScreen({ onContinue, onBack }: Props) {
  return (
    <div
      dir="rtl"
      className="h-screen w-full relative overflow-hidden finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: BG, textAlign: 'right', direction: 'rtl' }}
    >
      <StarField darkMode={true} />

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

      {/* Scrollable content */}
      <div className="relative z-10 w-full max-w-xs mx-auto px-6 pt-10 pb-28 flex flex-col gap-5 overflow-y-auto">

        <h1 className="text-2xl font-bold text-white" style={{ textAlign: 'right' }}>
          !פיינלי שמח שבאת
        </h1>

        {BLOCKS.map((block) => (
          <div
            key={block.heading}
            className="w-full rounded-2xl px-5 py-4"
            style={cardStyle}
          >
            <p className="font-bold text-[15px] text-white mb-2" style={{ textAlign: 'right' }}>
              {block.heading}
            </p>
            <p className="text-[14px] text-white/65 leading-relaxed" style={{ textAlign: 'right' }}>
              {block.body}
            </p>
          </div>
        ))}
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-center px-6 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, rgba(15,10,30,0.95) 70%, transparent)' }}
      >
        <button
          onClick={onContinue}
          className="w-full max-w-xs rounded-2xl py-4 text-white font-semibold text-[15px] transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 0 rgba(109,40,217,0.40), 0 14px 28px rgba(99,102,241,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)',
          }}
        >
          !פיינלי, דיברנו מספיק – בוא נתחיל כבר
        </button>
      </div>
    </div>
  );
}
