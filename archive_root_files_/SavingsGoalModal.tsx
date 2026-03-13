import { useState } from 'react';
import { X, Target, Check } from 'lucide-react';
import { GlassCard } from "../cards/GlassCard";
import { CircularButton } from "../buttons/CircularButton";


interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  currentGoal?: number;
  onSave?: (goal: number) => void;
}

export function SavingsGoalModal({ open, onClose, currentGoal = 12000, onSave }: SavingsGoalModalProps) {
  const [goalAmount, setGoalAmount] = useState(currentGoal.toString());

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(goalAmount);
    if (!isNaN(amount) && amount > 0) {
      onSave?.(amount);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-xl p-10 animate-in fade-in zoom-in duration-300"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-3xl font-bold text-white">הגדרת יעד חיסכון</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <CircularButton size="xl" variant="violet">
              <Target className="w-8 h-8 text-white" />
            </CircularButton>
          </div>

          <div className="text-right">
            <label className="block text-white mb-2 font-medium">סכום יעד (₪)</label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-all text-center text-2xl font-bold"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          <p className="text-center text-cyan-200/70 text-sm">
            קבעו יעד חיסכון ועקבו אחרי ההתקדמות שלכם
          </p>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
          <CircularButton
  size="lg"
  variant="gradient"
  type="submit"
>
  <Check className="w-8 h-8 text-white" />
</CircularButton>

          </div>
        </form>
      </GlassCard>
    </div>
  );
}
