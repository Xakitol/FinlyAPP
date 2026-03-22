import { X } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

interface IncomeBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  entries: FinanceEntry[]; // all income entries — only upcoming will be shown
  onMarkAsPaid: (entry: FinanceEntry) => void;
}

const tactileBtn: React.CSSProperties = {
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
};

function onPress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(2px)';
}
function onRelease(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
}

const modalBg: React.CSSProperties = {
  background: 'rgba(15,10,30,0.97)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
};

export function IncomeBreakdownModal({
  open,
  onClose,
  entries,
  onMarkAsPaid,
}: IncomeBreakdownModalProps) {
  if (!open) return null;

  const upcoming = entries.filter((e) => e.status === 'upcoming');
  const total = upcoming.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden"
        style={{ ...modalBg, maxHeight: '82vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
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
          <div className="text-right">
            <h2 className="text-lg font-bold text-white">Finly צופה שייכנס החודש</h2>
            {upcoming.length > 0 && (
              <p className="text-[11px] text-white/60">סה״כ צפוי {formatCurrency(total)}</p>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {upcoming.length === 0 ? (
            <p className="py-12 text-center text-sm text-white/60">אין הכנסות צפויות לחודש זה</p>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {upcoming.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 bg-cyan-500/10"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(entry)}
                      className="flex h-8 items-center justify-center rounded-xl px-2 text-[10px] font-semibold text-white shrink-0"
                      style={{
                        ...tactileBtn,
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        boxShadow: '0 3px 0 rgba(8,145,178,0.45)',
                        maxWidth: 72,
                      }}
                      onPointerDown={onPress}
                      onPointerUp={onRelease}
                      onPointerLeave={onRelease}
                    >
                      סמן אם כבר נכנס
                    </button>
                    <div className="text-right min-w-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold bg-cyan-500/20 text-cyan-300">
                          בהמשך החודש
                        </span>
                        <p className="text-[13px] font-semibold truncate text-white">{entry.title}</p>
                      </div>
                      <p className="text-[10px] text-white/60">{entry.category} · {entry.date}</p>
                    </div>
                  </div>
                  <p className="text-[16px] font-bold shrink-0 mr-3 text-cyan-300/70">
                    +{formatCurrency(entry.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
