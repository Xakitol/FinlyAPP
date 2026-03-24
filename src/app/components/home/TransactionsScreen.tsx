import { useState, type CSSProperties } from 'react';
import type { FinanceEntry } from '../../../types/finance';
import { formatCurrency, formatShortDate } from '../../../utils/formatters';

interface Props {
  entries: FinanceEntry[];
}

type Filter = 'all' | 'income' | 'expense';

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
      width: 36, height: 36, borderRadius: '50%',
      background: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700,
    }}>
      {category ? category[0] : '?'}
    </div>
  );
}

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'income', label: 'הכנסות' },
  { key: 'expense', label: 'הוצאות' },
];

export function TransactionsScreen({ entries }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  if (!entries) return <p style={{ color: 'rgba(255,255,255,0.4)', padding: 16, fontFamily: 'Rubik, sans-serif' }}>טוען...</p>;

  const filtered = entries
    .filter((e) => filter === 'all' || e.type === filter)
    .filter((e) => e.status === 'recorded' || e.source === 'manual')
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const grouped: Record<string, FinanceEntry[]> = {};
  for (const entry of filtered) {
    (grouped[entry.date] ??= []).push(entry);
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: 'Rubik, sans-serif',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 8px', flexShrink: 0 }}>
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 16px',
              borderRadius: 99,
              border: 'none',
              fontFamily: 'Rubik, sans-serif',
              fontSize: 13,
              fontWeight: filter === key ? 600 : 400,
              background: filter === key ? 'rgba(124,58,237,0.8)' : 'rgba(255,255,255,0.08)',
              color: filter === key ? 'white' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {dates.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              אין תנועות לחודש זה
            </p>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date} style={{ marginBottom: 16 }}>
              {/* Date header */}
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                margin: '0 0 6px', fontWeight: 500,
              }}>
                {formatShortDate(date)}
              </p>
              {/* Entries for this date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {grouped[date].map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      ...GLASS,
                      borderRadius: 14,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <CategoryBadge category={entry.category} type={entry.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 14, fontWeight: 500, color: 'white',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {entry.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                        {entry.category}
                      </p>
                    </div>
                    <p style={{
                      margin: 0, fontSize: 15, fontWeight: 700, flexShrink: 0,
                      color: entry.type === 'income' ? '#06b6d4' : '#ec4899',
                    }}>
                      {entry.type === 'expense' ? '−' : '+'}{formatCurrency(entry.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
