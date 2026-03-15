import type { FinanceEntry } from '../../../types/finance';
import { formatCurrency, formatShortDate } from '../../../utils/formatters';
import { GlassCard } from '../cards/GlassCard';

interface UpcomingListProps {
  darkMode: boolean;
  items: FinanceEntry[];
}

export function UpcomingList({ darkMode, items }: UpcomingListProps) {
  return (
    <GlassCard className="p-4">
      <div className="mb-3 text-right">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          מה עוד צפוי לרדת
        </h3>
        <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
          רק מה שרלוונטי להמשך החודש
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-left">
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {formatCurrency(item.amount)}
                </p>
                <p className={`mt-1 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  {item.category}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {item.title}
                </p>
                <p className={`mt-1 text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  {formatShortDate(item.dueDate ?? item.date)}
                  {item.note ? ` · ${item.note}` : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
