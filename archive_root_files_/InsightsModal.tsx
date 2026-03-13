import { X, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { GlassCard } from "../cards/GlassCard";
import { CircularButton } from "../buttons/CircularButton";
interface InsightsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenChart?: () => void;
  darkMode?: boolean;
}

export function InsightsModal({ open, onClose, onOpenChart, darkMode = false }: InsightsModalProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-4xl p-10 animate-in fade-in zoom-in duration-300"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>תובנות פיננסיות</h2>
        </div>

        <p className={`text-right ${darkMode ? 'text-cyan-200/70' : 'text-cyan-700/80'} mb-8`}>
          בחרו את סוג הניתוח שתרצו לראות
        </p>

        <div className="grid grid-cols-3 gap-6">
          <GlassCard 
            className="p-8 flex flex-col items-center text-center space-y-4 cursor-pointer hover:bg-white/15"
            onClick={() => {
              onClose();
              onOpenChart?.();
            }}
          >
            <CircularButton size="lg" variant="gradient">
              <TrendingUp className="w-8 h-8 text-white" />
            </CircularButton>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>מגמות הכנסה</h3>
              <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>ניתוח הכנסות לאורך זמן</p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 flex flex-col items-center text-center space-y-4 cursor-pointer hover:bg-white/15">
            <CircularButton size="lg" variant="gradient">
              <Wallet className="w-8 h-8 text-white" />
            </CircularButton>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>פילוח הוצאות</h3>
              <p className={`text-sm ${darkMode ? 'text-violet-200/60' : 'text-violet-700/70'}`}>לאן הכסף הולך</p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 flex flex-col items-center text-center space-y-4 cursor-pointer hover:bg-white/15">
            <CircularButton size="lg" variant="gradient">
              <PiggyBank className="w-8 h-8 text-white" />
            </CircularButton>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>פוטנציאל חיסכון</h3>
              <p className={`text-sm ${darkMode ? 'text-purple-200/60' : 'text-purple-700/70'}`}>המלצות לחיסכון</p>
            </div>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
}