import { X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

interface UpcomingExpensesModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  entries: FinanceEntry[]; // upcoming expenses only, sorted by date
  onMarkAsPaid: (entry: FinanceEntry) => void;
  onDeleteRule: (entry: FinanceEntry) => void;
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

export function UpcomingExpensesModal({
  open,
  onClose,
  darkMode = false,
  entries,
  onMarkAsPaid,
  onDeleteRule,
}: UpcomingExpensesModalProps) {
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
        background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(245,240,255,0.98) 100%)',
        border: '1.5px solid rgba(200,190,255,0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(139,92,246,0.2)',
      };

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

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
            <h2 className={`text-lg font-bold ${text}`}>מה עוד צפוי לרדת</h2>
            {entries.length > 0 && (
              <p className={`text-[11px] ${muted}`}>סה״כ {formatCurrency(total)}</p>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {entries.length === 0 ? (
            <p className={`py-12 text-center text-sm ${muted}`}>אין חיובים ידועים לחודש זה</p>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                    darkMode ? 'bg-white/5' : 'bg-violet-50/60'
                  }`}
                >
                  {/* Entry info */}
                  <div className="text-right flex-1 min-w-0 pr-3">
                    <p className={`text-[14px] font-semibold truncate ${text}`}>{entry.title}</p>
                    <p className={`text-[11px] ${muted}`}>
                      {entry.category} · {entry.date}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className={`text-[16px] font-bold shrink-0 ml-3 ${darkMode ? 'text-purple-300' : 'text-violet-600'}`}>
                    {formatCurrency(entry.amount)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mr-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(entry)}
                      className="flex h-8 items-center justify-center rounded-xl px-2 text-[10px] font-semibold text-white leading-tight text-center"
                      style={{
                        ...tactileBtn,
                        background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                        boxShadow: '0 3px 0 rgba(99,102,241,0.45)',
                        maxWidth: 68,
                      }}
                      onPointerDown={onPress}
                      onPointerUp={onRelease}
                      onPointerLeave={onRelease}
                    >
                      סמן אם כבר יצא
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRule(entry)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                      style={{ ...tactileBtn, boxShadow: darkMode ? '0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(0,0,0,0.08)' }}
                      onPointerDown={onPress}
                      onPointerUp={onRelease}
                      onPointerLeave={onRelease}
                      title="מחק קבוע"
                    >
                      <Trash2 className={`h-3.5 w-3.5 ${darkMode ? 'text-red-400/70' : 'text-red-400'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
