import { useState, useEffect } from 'react';
import { X, Check, PiggyBank } from 'lucide-react';

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  currentGoal?: number;
  onSave?: (goal: number) => void;
}

const tactileBtn: React.CSSProperties = {
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
};

function onPress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.3)';
}
function onRelease(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '';
}

const modalBg: React.CSSProperties = {
  background: 'rgba(15,10,30,0.97)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
};

export function SavingsGoalModal({
  open,
  onClose,
  currentGoal = 0,
  onSave,
}: SavingsGoalModalProps) {
  const [goalAmount, setGoalAmount] = useState(currentGoal > 0 ? currentGoal.toString() : '');

  useEffect(() => {
    if (open) setGoalAmount(currentGoal > 0 ? currentGoal.toString() : '');
  }, [open, currentGoal]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(goalAmount);
    if (!isNaN(amount) && amount >= 0) {
      onSave?.(amount);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl animate-in fade-in zoom-in-95 duration-300"
        style={modalBg}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
            style={{
              ...tactileBtn,
              boxShadow: '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
            onPointerDown={onPress}
            onPointerUp={onRelease}
            onPointerLeave={onRelease}
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">יעד חיסכון</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 pt-4 space-y-5">
          {/* Piggy bank icon */}
          <div className="flex justify-center py-2">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 45%, #a855f7 100%)',
                boxShadow: '0 8px 0 rgba(99,102,241,0.5), 0 16px 32px rgba(99,102,241,0.3), inset 0 1.5px 0 rgba(255,255,255,0.35)',
              }}
            >
              <PiggyBank className="h-9 w-9 text-white" />
            </div>
          </div>

          {/* Current goal display */}
          {currentGoal > 0 && (
            <p className="text-center text-[12px] text-white/55">
              יעד נוכחי: ₪{currentGoal.toLocaleString()}
            </p>
          )}

          {/* Amount input */}
          <div className="text-right">
            <label className="block mb-1.5 text-[12px] font-medium text-white/70">סכום יעד (₪)</label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full rounded-2xl border px-5 py-4 text-center text-[22px] font-bold outline-none transition-all focus:ring-2 focus:ring-violet-400/40 border-white/20 bg-white/10 text-white placeholder-white/30 focus:border-violet-400"
              placeholder="0"
              required
              min="0"
              step="1"
              dir="ltr"
            />
          </div>

          <p className="text-center text-[11px] text-white/55">
            קבעו יעד ועקבו אחרי ההתקדמות שלכם
          </p>

          {/* Reset — only shown if a goal exists */}
          {currentGoal > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => { onSave?.(0); onClose(); }}
                className="rounded-xl px-4 py-2 text-[12px] font-medium bg-white/10 text-white/50"
                style={{ ...tactileBtn, boxShadow: '0 3px 0 rgba(0,0,0,0.1)' }}
                onPointerDown={onPress}
                onPointerUp={onRelease}
                onPointerLeave={onRelease}
              >
                איפוס יעד
              </button>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-center pt-1">
            <button
              type="submit"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 45%, #a855f7 100%)',
                boxShadow: '0 6px 0 rgba(99,102,241,0.6), 0 12px 28px rgba(99,102,241,0.35), inset 0 1.5px 0 rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                border: 'none',
                cursor: 'pointer',
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.transform = 'translateY(5px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(99,102,241,0.6), 0 4px 12px rgba(99,102,241,0.25), inset 0 1.5px 0 rgba(255,255,255,0.3)';
              }}
              onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <Check className="h-7 w-7 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
