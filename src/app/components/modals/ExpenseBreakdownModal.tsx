import { X } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

interface ExpenseBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  entries: FinanceEntry[]; // all expense entries (recorded + upcoming), sorted by date
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

export function ExpenseBreakdownModal({
  open,
  onClose,
  darkMode = false,
  entries,
  onMarkAsPaid,
}: ExpenseBreakdownModalProps) {
  if (!open) return null;

  const text = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-white/60' : 'text-gray-500';

  const modalBg: React.CSSProperties = darkMode
    ? {
        background: 'linear-gradient(145deg, rgba(26,31,58,0.97) 0%, rgba(15,20,40,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }
    : {
        background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.98) 100%)',
        border: '1.5px solid rgba(139,92,246,0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(139,92,246,0.15)',
      };

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
            className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
            style={{
              ...tactileBtn,
              boxShadow: darkMode
                ? '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 4px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
            onPointerDown={onPress}
            onPointerUp={onRelease}
            onPointerLeave={onRelease}
          >
            <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <div className="text-right">
            <h2 className={`text-lg font-bold ${text}`}>Finly צופה שיצא החודש</h2>
            {upcoming.length > 0 && (
              <p className={`text-[11px] ${muted}`}>סה״כ צפוי {formatCurrency(total)}</p>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {upcoming.length === 0 ? (
            <p className={`py-12 text-center text-sm ${muted}`}>אין הוצאות צפויות לחודש זה</p>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {/* Upcoming (projected) expenses */}
              {upcoming.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 opacity-80 ${
                    darkMode ? 'bg-violet-500/10' : 'bg-violet-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(entry)}
                      className="flex h-8 items-center justify-center rounded-xl px-2 text-[10px] font-semibold text-white shrink-0"
                      style={{
                        ...tactileBtn,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        boxShadow: '0 3px 0 rgba(124,58,237,0.45)',
                        maxWidth: 72,
                      }}
                      onPointerDown={onPress}
                      onPointerUp={onRelease}
                      onPointerLeave={onRelease}
                    >
                      סמן אם כבר יצא
                    </button>
                    <div className="text-right min-w-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                          בהמשך החודש
                        </span>
                        <p className={`text-[13px] font-semibold truncate ${text}`}>{entry.title}</p>
                      </div>
                      <p className={`text-[10px] ${muted}`}>{entry.category} · {entry.date}</p>
                    </div>
                  </div>
                  <p className={`text-[16px] font-bold shrink-0 mr-3 ${darkMode ? 'text-purple-300/70' : 'text-violet-500'}`}>
                    -{formatCurrency(entry.amount)}
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
