import type { CSSProperties } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import type { ForwardViewSummary } from '../../../types/finance';

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

function formatHebrewDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`;
}

interface ForwardViewCardProps {
  darkMode: boolean;
  summary: ForwardViewSummary;
}

export function ForwardViewCard({ darkMode, summary }: ForwardViewCardProps) {
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
  const divider = darkMode ? 'border-white/10' : 'border-violet-100';

  return (
    <div className="w-full rounded-2xl p-5" style={glass}>
      {/* Header */}
      <div className="mb-4">
        <p className={`text-[12px] font-semibold ${accent}`}>פיינלי מביט קדימה</p>
        <p className={`mt-0.5 text-[11px] ${muted}`}>מה שכבר ידוע על שארית החודש</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Next known charge */}
        {summary.nextKnownCharge && (
          <div className={`flex items-center justify-between border-b pb-3 ${divider}`}>
            <div>
              <p className={`text-[12px] font-medium ${text}`}>
                {summary.nextKnownCharge.title}
              </p>
              <p className={`text-[10px] ${muted}`}>
                {formatHebrewDate(summary.nextKnownChargeDate!)}
              </p>
            </div>
            <p className={`text-[14px] font-bold ${text}`}>
              {formatCurrency(summary.nextKnownCharge.amount)}
            </p>
          </div>
        )}

        {/* Total upcoming obligations */}
        <div className={`flex items-center justify-between border-b pb-3 ${divider}`}>
          <p className={`text-[12px] ${muted}`}>סה״כ חיובים ידועים</p>
          <p className={`text-[14px] font-semibold ${text}`}>
            {formatCurrency(summary.knownUpcomingTotal)}
          </p>
        </div>

        {/* Projected month-end remaining */}
        <div className="flex items-center justify-between">
          <p className={`text-[12px] ${muted}`}>צפי לסוף חודש</p>
          <p className={`text-[16px] font-bold ${accent}`}>
            {formatCurrency(summary.projectedMonthEndRemaining)}
          </p>
        </div>
      </div>
    </div>
  );
}
