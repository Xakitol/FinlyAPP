import { useState, type CSSProperties } from 'react';
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
// defaultValue pre-fills the picker with the last chosen date.
// onChange only fires when the user actually selects a value (not on dismiss), with a guard against no-change.
function RescheduleDateOverlay({
  currentDate,
  onDatePicked,
}: {
  currentDate: string;
  onDatePicked: (date: string) => void;
}) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <button type="button" style={{ ...actionBtnStyle('rgba(255,255,255,0.15)'), width: '100%' }}>
        תאריך אחר
      </button>
      <input
        type="date"
        defaultValue={currentDate}
        onChange={(e) => {
          const val = e.target.value;
          if (val && val !== currentDate) {
            onDatePicked(val);
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

export function UpcomingScreen({ entries, onMarkAsPaid, onDeleteRule }: Props) {
  // Local overrides: entryId → chosen date. Cleared when "בוצע" is tapped.
  const [datePicks, setDatePicks] = useState<Record<string, string>>({});

  if (!entries)
    return (
      <p style={{ color: 'rgba(255,255,255,0.4)', padding: 16, fontFamily: 'Rubik, sans-serif', background: '#0f0a1e' }}>
        טוען...
      </p>
    );

  const overdue = getOverduePendingEntries(entries);

  const upcomingEntries = entries.filter((e) => e.status === 'upcoming' || e.source === 'system');
  const totalExpenses = upcomingEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const totalIncome  = upcomingEntries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);

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
        overflow: 'hidden',   // outer screen must not scroll
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
      <div style={{ flexShrink: 0 }}>
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
            flexShrink: 0,
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
              {overdue.length === 1
                ? 'יש תנועה שממתינה לאישורך'
                : `יש ${overdue.length} תנועות שממתינות לאישורך`}
            </p>
          </div>

          {/* Scrollable entry list — maxHeight shows ~3 rows (≈100px each) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {overdue.map((entry, i) => {
              const displayDate = datePicks[entry.id] ?? entry.date;
              return (
                <div key={entry.id}>
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

                  {/* Subtitle: label + effective date (updates when user picks a date) */}
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                    קבוע בכל חודש · {shortDayMonth(displayDate)}
                  </p>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const effectiveDate = datePicks[entry.id];
                        const entryToMark = effectiveDate ? { ...entry, date: effectiveDate } : entry;
                        onMarkAsPaid(entryToMark);
                        setDatePicks((prev) => {
                          const next = { ...prev };
                          delete next[entry.id];
                          return next;
                        });
                      }}
                      style={actionBtnStyle('#06b6d4')}
                    >
                      בוצע
                    </button>
                    <RescheduleDateOverlay
                      currentDate={datePicks[entry.id] ?? entry.date}
                      onDatePicked={(date) =>
                        setDatePicks((prev) => ({ ...prev, [entry.id]: date }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteRule(entry)}
                      style={actionBtnStyle('rgba(236,72,153,0.2)')}
                    >
                      הסר כלל
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state — no overdue and no upcoming entries at all */}
      {overdue.length === 0 && totalExpenses === 0 && totalIncome === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'white', textAlign: 'center', maxWidth: 260 }}>
            הכל שקט כאן
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
            כשתוסיפו תנועה קבועה — ארנק, ביטוח, מנוי — היא תופיע פה לפני שהיא יורדת.
          </p>
        </div>
      )}

      {/* Two summary cards side by side */}
      {(totalExpenses > 0 || totalIncome > 0) && (
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {totalExpenses > 0 && (
            <div style={{ ...GLASS, borderRadius: 20, padding: '16px 20px', flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>הוצאות צפויות</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#ec4899', margin: '4px 0 0', lineHeight: 1 }}>
                <span style={{ fontSize: 13, opacity: 0.6, fontWeight: 300 }}>₪</span>
                {formatCurrency(totalExpenses).replace('₪', '')}
              </p>
            </div>
          )}
          {totalIncome > 0 && (
            <div style={{ ...GLASS, borderRadius: 20, padding: '16px 20px', flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>הכנסות צפויות</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#06b6d4', margin: '4px 0 0', lineHeight: 1 }}>
                <span style={{ fontSize: 13, opacity: 0.6, fontWeight: 300 }}>₪</span>
                {formatCurrency(totalIncome).replace('₪', '')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
