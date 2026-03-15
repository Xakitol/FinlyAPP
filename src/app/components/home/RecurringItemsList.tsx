import type { CSSProperties } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

interface RecurringItemsListProps {
  darkMode: boolean;
  entries: FinanceEntry[];
}

export function RecurringItemsList({ darkMode, entries }: RecurringItemsListProps) {
  const recurringItems = entries.filter(
    (e) => e.recurring && e.type === 'expense' && e.status === 'recorded',
  );

  if (recurringItems.length === 0) return null;

  const glass: CSSProperties = darkMode
    ? {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(180,160,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
      }
    : {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.65) 0%, rgba(242,236,255,0.45) 100%)',
        border: '1.5px solid rgba(255,255,255,0.85)',
        boxShadow: '0 8px 24px rgba(139,92,246,0.14)',
        backdropFilter: 'blur(14px)',
      };

  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/50' : 'text-gray-500';
  const accent = darkMode ? 'text-cyan-300' : 'text-violet-600';
  const divider = darkMode ? 'border-white/8' : 'border-violet-50';
  const tagBg = darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600';

  return (
    <div className="w-full rounded-2xl p-5" style={glass}>
      <p className={`mb-3 text-[12px] font-semibold ${accent}`}>הוצאות קבועות החודש</p>

      <div className="flex flex-col gap-0">
        {recurringItems.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center justify-between py-2.5 ${
              i < recurringItems.length - 1 ? `border-b ${divider}` : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-3 w-3 flex-shrink-0 ${muted}`} />
              <div>
                <p className={`text-[12px] font-medium ${text}`}>{item.title}</p>
                <p className={`text-[10px] ${muted}`}>{item.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${tagBg}`}>
                קבוע
              </span>
              <p className={`text-[13px] font-semibold ${text}`}>
                {formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
