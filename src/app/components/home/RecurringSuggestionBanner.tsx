import type { CSSProperties } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { RecurringCandidate } from '../../../types/finance';

interface RecurringSuggestionBannerProps {
  darkMode: boolean;
  candidate: RecurringCandidate;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function RecurringSuggestionBanner({
  darkMode,
  candidate,
  onApprove,
  onDismiss,
}: RecurringSuggestionBannerProps) {
  const glass: CSSProperties = darkMode
    ? {
        background:
          'linear-gradient(145deg, rgba(139,92,246,0.2) 0%, rgba(80,60,130,0.15) 100%)',
        border: '1px solid rgba(139,92,246,0.35)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
      }
    : {
        background:
          'linear-gradient(145deg, rgba(237,233,254,0.85) 0%, rgba(221,214,254,0.65) 100%)',
        border: '1.5px solid rgba(167,139,250,0.5)',
        boxShadow: '0 6px 18px rgba(124,58,237,0.12)',
        backdropFilter: 'blur(10px)',
      };

  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';
  const accent = darkMode ? 'text-violet-300' : 'text-violet-600';
  const iconBg = darkMode ? 'bg-violet-500/30' : 'bg-violet-100';

  return (
    <div className="w-full rounded-2xl p-4" style={glass}>
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${accent}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[12px] font-semibold ${accent}`}>
            {candidate.suggestionText}
          </p>
          <p className={`mt-0.5 text-[13px] font-medium ${text}`}>
            {candidate.currentEntry.title}
            <span className={`mr-1.5 text-[11px] font-normal ${muted}`}>
              {formatCurrency(candidate.currentEntry.amount)}
            </span>
          </p>
          <p className={`mt-0.5 text-[11px] ${muted}`}>{candidate.actionText}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onApprove(candidate.currentEntry.id)}
          className={`flex-1 rounded-xl py-2 text-[12px] font-semibold transition-opacity active:opacity-75 ${
            darkMode ? 'bg-violet-500 text-white' : 'bg-violet-600 text-white'
          }`}
        >
          כן, שמור
        </button>
        <button
          type="button"
          onClick={() => onDismiss(candidate.currentEntry.id)}
          className={`flex-1 rounded-xl py-2 text-[12px] font-medium transition-opacity active:opacity-75 ${
            darkMode ? 'bg-white/10 text-white/70' : 'bg-white/60 text-gray-500'
          }`}
        >
          לא עכשיו
        </button>
      </div>
    </div>
  );
}
