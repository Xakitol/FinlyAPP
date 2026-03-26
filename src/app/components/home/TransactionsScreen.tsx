import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { FinanceEntry } from '../../../types/finance';
import { formatCurrency, formatShortDate } from '../../../utils/formatters';

interface Props {
  entries: FinanceEntry[];
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (entry: FinanceEntry) => void;
  onMarkAsPaid: (entry: FinanceEntry) => void;
}

type Filter = 'all' | 'income' | 'expense';

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

const today = new Date().toISOString().slice(0, 10);

function isOverdue(entry: FinanceEntry): boolean {
  return entry.recurring === true && entry.status === 'upcoming' && entry.date <= today;
}

function CategoryBadge({
  category,
  type,
  overdue,
}: {
  category: string;
  type: FinanceEntry['type'];
  overdue: boolean;
}) {
  const bg = type === 'income' ? 'rgba(6,182,212,0.18)' : 'rgba(236,72,153,0.18)';
  const color = type === 'income' ? '#06b6d4' : '#ec4899';
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {category ? category[0] : '?'}
      </div>
      {overdue && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            border: '1.5px solid #0f0a1e',
          }}
        />
      )}
    </div>
  );
}

function sheetBtnStyle(bg: string, color: string): CSSProperties {
  return {
    width: '100%',
    height: 56,
    borderRadius: 14,
    border: 'none',
    background: bg,
    color,
    fontFamily: 'Rubik, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function TransactionSheet({
  entry,
  visible,
  onClose,
  onEdit,
  onDelete,
  onMarkAsPaid,
}: {
  entry: FinanceEntry;
  visible: boolean;
  onClose: () => void;
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (entry: FinanceEntry) => void;
  onMarkAsPaid: (entry: FinanceEntry) => void;
}) {
  const markColor = entry.type === 'income' ? '#06b6d4' : '#ec4899';
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 220ms ease-out',
        }}
      />
      {/* Sheet */}
      <div
        dir="rtl"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(15,10,30,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 16px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 220ms ease-out',
          fontFamily: 'Rubik, sans-serif',
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.2)',
            margin: '-8px auto 16px',
          }}
        />
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'white' }}>{entry.title}</p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          {entry.category} · {formatShortDate(entry.date)}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => { onEdit(entry); onClose(); }}
            style={sheetBtnStyle('rgba(255,255,255,0.08)', 'white')}
          >
            עריכה
          </button>
          {entry.status === 'upcoming' && (
            <button
              type="button"
              onClick={() => { onMarkAsPaid(entry); onClose(); }}
              style={sheetBtnStyle(markColor + '22', markColor)}
            >
              סמן כבוצע
            </button>
          )}
          <button
            type="button"
            onClick={() => { onDelete(entry); onClose(); }}
            style={sheetBtnStyle('rgba(236,72,153,0.12)', '#ec4899')}
          >
            מחיקה
          </button>
        </div>
      </div>
    </>
  );
}

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'income', label: 'הכנסות' },
  { key: 'expense', label: 'הוצאות' },
];

export function TransactionsScreen({ entries, onEdit, onDelete, onMarkAsPaid }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedEntry, setSelectedEntry] = useState<FinanceEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  function openSheet(entry: FinanceEntry) {
    setSelectedEntry(entry);
    requestAnimationFrame(() => setSheetVisible(true));
  }

  function closeSheet() {
    setSheetVisible(false);
    setTimeout(() => setSelectedEntry(null), 220);
  }

  if (!entries)
    return (
      <p style={{ color: 'rgba(255,255,255,0.4)', padding: 16, fontFamily: 'Rubik, sans-serif', background: '#0f0a1e' }}>
        טוען...
      </p>
    );

  const filtered = entries
    .filter((e) => filter === 'all' || e.type === filter)
    .filter((e) => e.status === 'recorded' || e.source === 'manual')
    .sort((a, b) => b.date.localeCompare(a.date));

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
        background: '#0f0a1e',
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 120px' }}>
        {dates.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>אין תנועות לחודש זה</p>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 6px', fontWeight: 500 }}>
                {formatShortDate(date)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {grouped[date].map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => openSheet(entry)}
                    style={{
                      ...GLASS,
                      borderRadius: 14,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                    }}
                  >
                    <CategoryBadge category={entry.category} type={entry.type} overdue={isOverdue(entry)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'white',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {entry.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                        {entry.category}
                      </p>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 700,
                        flexShrink: 0,
                        color: entry.type === 'income' ? '#06b6d4' : '#ec4899',
                      }}
                    >
                      {entry.type === 'expense' ? '−' : '+'}
                      {formatCurrency(entry.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom sheet — rendered via portal so it escapes overflow:hidden containers */}
      {selectedEntry && createPortal(
        <TransactionSheet
          entry={selectedEntry}
          visible={sheetVisible}
          onClose={closeSheet}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
        />,
        document.body,
      )}
    </div>
  );
}
