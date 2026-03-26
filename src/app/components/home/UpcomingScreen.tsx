import { type CSSProperties } from 'react';
import { Bell } from 'lucide-react';
import type { FinanceEntry } from '../../../types/finance';
import { formatCurrency } from '../../../utils/formatters';
import { getOverduePendingEntries } from '../../../utils/recurringPrompt';

interface Props {
  entries: FinanceEntry[];
  onMarkAsPaid: (entry: FinanceEntry) => void;
  onDeleteRule: (entry: FinanceEntry) => void;
  onRescheduleEntry: (entry: FinanceEntry, newDate: string) => void;
}

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

function actionBtnStyle(bg: string): CSSProperties {
  return {
    flex: 1,
    height: 36,
    borderRadius: 10,
    border: 'none',
    background: bg,
    color: 'white',
    fontFamily: 'Rubik, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function shortDayMonth(isoDate: string): string {
  const [, m, d] = isoDate.split('-');
  return `${d}.${m}`;
}

// Invisible date input overlaid on the visible button.
// Uses onBlur so the value is read only after the user confirms and dismisses the picker (fixes iOS early-fire).
function RescheduleDateOverlay({
  entry,
  onRescheduleEntry,
}: {
  entry: FinanceEntry;
  onRescheduleEntry: (entry: FinanceEntry, newDate: string) => void;
}) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Visible decorative button */}
      <button type="button" style={{ ...actionBtnStyle('rgba(255,255,255,0.15)'), width: '100%' }}>
        תאריך אחר
      </button>
      {/* Invisible date input covers full button area — iOS Safari opens native picker on tap */}
      <input
        type="date"
        onBlur={(e) => {
          if (e.target.value) {
            onRescheduleEntry(entry, e.target.value);
            e.target.value = '';
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

export function UpcomingScreen({ entries, onMarkAsPaid, onDeleteRule, onRescheduleEntry }: Props) {
  if (!entries)
    return (
      <p style={{ color: 'rgba(255,255,255,0.4)', padding: 16, fontFamily: 'Rubik, sans-serif', background: '#0f0a1e' }}>
        טוען...
      </p>
    );

  const overdue = getOverduePendingEntries(entries);

  const totalOutgoing = entries
    .filter((e) => (e.status === 'upcoming' || e.source === 'system') && e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: 'Rubik, sans-serif',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 16px 24px',
        gap: 14,
        boxSizing: 'border-box',
        background: '#0f0a1e',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @keyframes finly-bell {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-6deg); }
          75% { transform: rotate(4deg); }
        }
      `}</style>

      {/* Header */}
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>מה מחכה לך?</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
          תנועות צפויות לחודש הזה
        </p>
      </div>

      {/* Overdue confirmation card */}
      {overdue.length > 0 && (
        <div
          style={{
            ...GLASS,
            borderRadius: 20,
            padding: '16px 18px',
            border: '1px solid rgba(245,158,11,0.35)',
            background: 'rgba(245,158,11,0.08)',
          }}
        >
          {/* Shared header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell
              size={16}
              color="#a78bfa"
              style={{ animation: 'finly-bell 3s ease-in-out infinite', flexShrink: 0 }}
            />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>
              {overdue.length === 1 ? 'יש תנועה שממתינה לאישורך' : `יש ${overdue.length} תנועות שממתינות לאישורך`}
            </p>
          </div>

          {/* One row per overdue entry, separated by thin lines */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
            }}
          >
            {overdue.map((entry, i) => (
              <div key={entry.id}>
                {/* Separator between rows */}
                {i > 0 && (
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
                )}

                {/* Title + amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {entry.title}
                  </p>
                  <p style={{
                    margin: '0 0 0 8px', fontSize: 14, fontWeight: 700, flexShrink: 0,
                    color: entry.type === 'income' ? '#06b6d4' : '#ec4899',
                  }}>
                    {entry.type === 'expense' ? '−' : '+'}{formatCurrency(entry.amount)}
                  </p>
                </div>

                {/* Subtitle: recurring label + date */}
                <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                  קבוע בכל חודש · {shortDayMonth(entry.date)}
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onMarkAsPaid(entry)}
                    style={actionBtnStyle('#06b6d4')}
                  >
                    בוצע
                  </button>
                  <RescheduleDateOverlay entry={entry} onRescheduleEntry={onRescheduleEntry} />
                  <button
                    type="button"
                    onClick={() => onDeleteRule(entry)}
                    style={actionBtnStyle('rgba(236,72,153,0.2)')}
                  >
                    הסר כלל
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary card */}
      {totalOutgoing > 0 && (
        <div style={{ ...GLASS, borderRadius: 20, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>סה"כ הוצאות צפויות</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#ec4899', margin: '4px 0 0', lineHeight: 1 }}>
            <span style={{ fontSize: 14, opacity: 0.6, fontWeight: 300 }}>₪</span>
            {formatCurrency(totalOutgoing).replace('₪', '')}
          </p>
        </div>
      )}
    </div>
  );
}
