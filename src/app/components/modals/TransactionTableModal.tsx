import { useState, useMemo } from 'react';
import { X, Search, Pencil, Trash2, FileSpreadsheet, FileText, ArrowUpDown, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../cards/GlassCard';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

type SortKey = 'date' | 'amount' | 'alpha';

interface TransactionTableModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  entries: FinanceEntry[];
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (id: string) => void;
}

function exportToCSV(entries: FinanceEntry[]) {
  const header = 'תאריך,כותרת,קטגוריה,סוג,שיטת תשלום,סכום\n';
  const rows = entries
    .map((e) =>
      [e.date, e.title, e.category, e.type === 'income' ? 'הכנסה' : 'הוצאה', e.paymentMethod, e.amount].join(','),
    )
    .join('\n');
  const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'finly-transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function TransactionTableModal({
  open,
  onClose,
  darkMode = false,
  entries,
  onEdit,
  onDelete,
}: TransactionTableModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!open) return null;

  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return entries.filter(
      (e) => !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q),
    );
  }, [entries, searchTerm]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === 'date') return b.date.localeCompare(a.date);
        if (sortKey === 'amount') return b.amount - a.amount;
        if (sortKey === 'alpha') return a.title.localeCompare(b.title, 'he');
        return 0;
      }),
    [filtered, sortKey],
  );

  const isDirty = searchTerm !== '' || sortKey !== 'date';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard
        className="flex w-full max-w-lg flex-col rounded-t-3xl sm:max-w-2xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ maxHeight: '92vh' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <h2 className={`text-lg font-bold ${text}`}>רשימת תנועות</h2>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 px-5 pb-3">
          <button
            type="button"
            onClick={() => exportToCSV(sorted)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            ייצוא Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            <FileText className="h-3.5 w-3.5" />
            ייצוא PDF
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border border-white/20 bg-white/10 py-2 pl-3 pr-9 text-[13px] ${text} placeholder-white/30 outline-none focus:border-violet-400`}
              placeholder="חפש תנועה"
              dir="rtl"
            />
          </div>

          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
            {(['date', 'amount', 'alpha'] as SortKey[]).map((key) => {
              const labels: Record<SortKey, string> = { date: 'תאריך', amount: 'סכום', alpha: 'א-ב' };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    sortKey === key
                      ? 'bg-violet-600 text-white'
                      : darkMode
                        ? 'bg-white/8 text-white/50 hover:bg-white/15'
                        : 'bg-white/30 text-gray-500 hover:bg-white/50'
                  }`}
                >
                  {labels[key]}
                </button>
              );
            })}
            {isDirty && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSortKey('date'); }}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-white/40 hover:text-white/70"
                title="איפוס"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto px-3 pb-5">
          {sorted.length === 0 ? (
            <p className={`py-10 text-center text-sm ${muted}`}>
              {searchTerm ? 'לא נמצאו תנועות' : 'אין תנועות לחודש זה'}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {sorted.map((entry) => (
                <div key={entry.id}>
                  <div
                    className={`flex items-center rounded-xl px-3 py-3 transition-colors ${
                      darkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'
                    }`}
                  >
                    {/* Edit / Delete */}
                    <div className="flex shrink-0 items-center gap-1.5 pl-3">
                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                        title="ערוך"
                      >
                        <Pencil className="h-3 w-3 text-white/60" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-red-500/30"
                        title="מחק"
                      >
                        <Trash2 className="h-3 w-3 text-white/60" />
                      </button>
                    </div>

                    {/* Entry info */}
                    <div className="flex flex-1 items-center justify-between text-right">
                      <div className="flex items-center gap-1.5">
                        {entry.type === 'income' ? (
                          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                        )}
                        <span
                          className={`text-[14px] font-bold ${entry.type === 'income' ? 'text-cyan-300' : 'text-purple-300'}`}
                        >
                          {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </span>
                      </div>

                      <div>
                        <p className={`text-[13px] font-medium ${text}`}>{entry.title}</p>
                        <p className={`text-[10px] ${muted}`}>
                          {entry.category} · {entry.date}
                          {entry.recurring && (
                            <span className={`mr-1 ${darkMode ? 'text-violet-300' : 'text-violet-500'}`}>· קבוע</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inline delete confirm */}
                  {confirmDeleteId === entry.id && (
                    <div className="mx-2 mb-1 flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { onDelete(entry.id); setConfirmDeleteId(null); }}
                          className="rounded-lg bg-red-500 px-3 py-1 text-[11px] font-semibold text-white"
                        >
                          מחק
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg bg-white/10 px-3 py-1 text-[11px] text-white/70"
                        >
                          ביטול
                        </button>
                      </div>
                      <p className="text-[11px] text-red-300">למחוק את הרשומה?</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
