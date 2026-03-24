import type { CSSProperties } from 'react';
import type { FinanceEntry } from '../../../../types/finance';
import { formatCurrency, formatShortDate } from '../../../utils/formatters';

interface Props {
  entries: FinanceEntry[];
}

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

function CategoryBadge({ category, type }: { category: string; type: FinanceEntry['type'] }) {
  const bg = type === 'income' ? 'rgba(6,182,212,0.18)' : 'rgba(236,72,153,0.18)';
  const color = type === 'income' ? '#06b6d4' : '#ec4899';
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700,
    }}>
      {category ? category[0] : '?'}
    </div>
  );
}

export function UpcomingScreen({ entries }: Props) {
  const upcoming = entries
    .filter((e) => e.status === 'upcoming' || e.source === 'system')
    .sort((a, b) => (a.dueDate ?? a.date).localeCompare(b.dueDate ?? b.date));

  const totalOutgoing = upcoming
    .filter((e) => e.type === 'expense')
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
      }}
    >
      {/* Header */}
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>מה מחכה לך?</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
          תנועות צפויות לחודש הזה
        </p>
      </div>

      {/* Summary card */}
      {totalOutgoing > 0 && (
        <div
          style={{
            ...GLASS,
            borderRadius: 20,
            padding: '16px 20px',
          }}
        >
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>סה"כ הוצאות צפויות</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#ec4899', margin: '4px 0 0', lineHeight: 1 }}>
            <span style={{ fontSize: 14, opacity: 0.6, fontWeight: 300 }}>₪</span>
            {formatCurrency(totalOutgoing).replace('₪', '')}
          </p>
        </div>
      )}

      {/* List */}
      {upcoming.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
            עדיין לא הוגדרו תנועות קבועות
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
            הוסיפו תנועה כ"קבוע בכל חודש" ותופיע כאן
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {upcoming.map((entry) => (
            <div
              key={entry.id}
              style={{
                ...GLASS,
                borderRadius: 16,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <CategoryBadge category={entry.category} type={entry.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.title}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {entry.recurring ? 'קבוע בכל חודש' : 'צפוי'} · {formatShortDate(entry.dueDate ?? entry.date)}
                </p>
              </div>
              <p style={{
                margin: 0, fontSize: 15, fontWeight: 700,
                color: entry.type === 'income' ? '#06b6d4' : '#ec4899',
                flexShrink: 0,
              }}>
                {entry.type === 'expense' ? '−' : '+'}{formatCurrency(entry.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
