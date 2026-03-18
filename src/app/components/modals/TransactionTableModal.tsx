import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { X, Search, Pencil, Trash2, FileSpreadsheet, FileText, ArrowUpDown, RotateCcw, TrendingUp, TrendingDown, Upload, Download, CheckSquare, Square } from 'lucide-react';
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
  onDeleteMultiple: (ids: string[]) => void;
  onMarkAsPaid: (entry: FinanceEntry) => void;
  onDeleteRule: (entry: FinanceEntry) => void;
  onOpenImport?: () => void;
}

function exportToExcel(entries: FinanceEntry[]) {
  const rows = [
    ['תאריך', 'תיאור', 'קטגוריה', 'סוג', 'שיטת תשלום', 'סכום', 'סטטוס'],
    ...entries.map((e) => [
      e.date, e.title, e.category,
      e.type === 'income' ? 'הכנסה' : 'הוצאה',
      e.paymentMethod === 'bank' ? 'בנק' : e.paymentMethod === 'credit' ? 'אשראי' : 'מזומן',
      e.type === 'income' ? e.amount : -e.amount,
      e.status === 'upcoming' ? 'צפוי' : 'מאושר',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'תנועות');
  XLSX.writeFile(wb, 'finly-transactions.xlsx');
}

function exportToPrintPDF(entries: FinanceEntry[]) {
  const win = window.open('', '_blank', 'width=820,height=680');
  if (!win) return;
  const rowsHtml = entries.map((e) => `<tr>
    <td>${e.date}</td><td>${e.title}</td><td>${e.category}</td>
    <td style="color:${e.type === 'income' ? '#0284c7' : '#9333ea'}">${e.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
    <td style="font-weight:600;color:${e.type === 'income' ? '#0284c7' : '#9333ea'}">${e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString('he-IL')} ₪</td>
    <td>${e.status === 'upcoming' ? 'צפוי' : 'מאושר'}</td>
  </tr>`).join('');
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>Finly — תנועות</title>
  <style>body{font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#111}h1{font-size:22px;color:#7c3aed;margin-bottom:4px}p{color:#6b7280;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#7c3aed;color:#fff;padding:8px 10px;text-align:right}td{padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:right}tr:nth-child(even) td{background:#f9fafb}</style></head><body>
  <h1>Finly — ייצוא תנועות</h1><p>${entries.length} תנועות · ${new Date().toLocaleDateString('he-IL')}</p>
  <table><thead><tr><th>תאריך</th><th>תיאור</th><th>קטגוריה</th><th>סוג</th><th>סכום</th><th>סטטוס</th></tr></thead><tbody>${rowsHtml}</tbody></table>
  <script>window.onload=()=>{window.print();}<\/script></body></html>`);
  win.document.close();
}

const tactileBtn: React.CSSProperties = { transition: 'transform 0.1s ease, box-shadow 0.1s ease' };
function onPress(e: React.PointerEvent<HTMLButtonElement>) { e.currentTarget.style.transform = 'translateY(2px)'; }
function onRelease(e: React.PointerEvent<HTMLButtonElement>) { e.currentTarget.style.transform = ''; }

export function TransactionTableModal({
  open, onClose, darkMode = false, entries, onEdit, onDelete, onDeleteMultiple,
  onMarkAsPaid, onDeleteRule, onOpenImport,
}: TransactionTableModalProps) {
  const [searchTerm, setSearchTerm]         = useState('');
  const [sortKey, setSortKey]               = useState<SortKey>('date');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectMode, setSelectMode]         = useState(false);
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-white/60' : 'text-gray-600';

  const modalBg: React.CSSProperties = darkMode
    ? { background: 'linear-gradient(145deg, rgba(26,31,58,0.97) 0%, rgba(15,20,40,0.98) 100%)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }
    : { background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(245,240,255,0.98) 100%)', border: '1.5px solid rgba(200,190,255,0.6)', backdropFilter: 'blur(20px)' };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return entries.filter((e) => !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }, [entries, searchTerm]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      if (sortKey === 'date')   return b.date.localeCompare(a.date);
      if (sortKey === 'amount') return b.amount - a.amount;
      if (sortKey === 'alpha')  return a.title.localeCompare(b.title, 'he');
      return 0;
    }),
    [filtered, sortKey],
  );

  const isDirty = searchTerm !== '' || sortKey !== 'date';

  // Selectable entries = recorded only (not upcoming)
  const selectableIds = sorted.filter((e) => e.status !== 'upcoming').map((e) => e.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  }

  function handleBulkDelete() {
    onDeleteMultiple([...selectedIds]);
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmBulkDelete(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-t-3xl sm:max-w-2xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden shadow-2xl"
        style={{ ...modalBg, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
              style={{ ...tactileBtn, boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)' }}
              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
            >
              <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            {/* Select mode toggle */}
            <button
              type="button"
              onClick={toggleSelectMode}
              className={`flex items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors ${
                selectMode
                  ? 'bg-red-500/20 text-red-500'
                  : darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
              }`}
              style={tactileBtn}
              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
            >
              {selectMode ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
              {selectMode ? 'ביטול' : 'בחר'}
            </button>
          </div>
          <h2 className={`text-lg font-bold ${text}`}>רשימת תנועות</h2>
        </div>

        {/* Bulk delete bar */}
        {selectMode && (
          <div className="px-5 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmBulkDelete(true)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-white"
                  style={{ ...tactileBtn, background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 0 rgba(185,28,28,0.5)' }}
                  onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  מחק {selectedIds.size}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`text-[11px] font-medium ${darkMode ? 'text-white/60' : 'text-gray-500'}`}
            >
              {allSelected ? 'בטל הכל' : 'בחר הכל'}
            </button>
          </div>
        )}

        {/* Bulk delete confirm */}
        {confirmBulkDelete && (
          <div className="mx-5 mb-3 flex items-center justify-between rounded-xl bg-red-500/15 px-4 py-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="rounded-lg bg-red-500 px-4 py-1.5 text-[12px] font-semibold text-white"
                style={{ ...tactileBtn, boxShadow: '0 3px 0 rgba(185,28,28,0.5)' }}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                מחק {selectedIds.size} תנועות
              </button>
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(false)}
                className={`rounded-lg px-3 py-1.5 text-[12px] ${darkMode ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'}`}
                style={tactileBtn}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                ביטול
              </button>
            </div>
            <p className={`text-[11px] ${darkMode ? 'text-red-400' : 'text-red-500'}`}>למחוק את הנבחרים?</p>
          </div>
        )}

        {/* Import / Export — two compact static buttons */}
        <div className="px-5 pb-3 flex gap-3">
          {/* Import */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenImport?.()}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-semibold text-white"
              style={{ ...tactileBtn, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 0 rgba(2,132,199,0.45)' }}
              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
            >
              <Upload className="h-3.5 w-3.5" />
              ייבוא
            </button>
            <p className={`text-[9px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>.xlsx · .csv · .pdf</p>
          </div>
          {/* Export */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex w-full gap-1.5">
              <button
                type="button"
                onClick={() => exportToExcel(sorted)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-white"
                style={{ ...tactileBtn, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 0 rgba(139,92,246,0.4)' }}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                <FileSpreadsheet className="h-3 w-3" /> Excel
              </button>
              <button
                type="button"
                onClick={() => exportToPrintPDF(sorted)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-white"
                style={{ ...tactileBtn, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 0 rgba(139,92,246,0.4)' }}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                <FileText className="h-3 w-3" /> PDF
              </button>
            </div>
            <p className={`text-[9px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
              <Download className="inline h-2.5 w-2.5 mr-0.5" />ייצוא
            </p>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          <div className="relative min-w-0 flex-1">
            <Search className={`absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-3 pr-9 text-[13px] outline-none focus:border-violet-400 ${
                darkMode
                  ? 'border-white/20 bg-white/10 text-white placeholder-white/30'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="חפש תנועה"
              dir="rtl"
            />
          </div>
          <div className="flex items-center gap-1">
            <ArrowUpDown className={`h-3.5 w-3.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`} />
            {(['date', 'amount', 'alpha'] as SortKey[]).map((key) => {
              const labels: Record<SortKey, string> = { date: 'תאריך', amount: 'סכום', alpha: 'א-ב' };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  style={tactileBtn}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                    sortKey === key ? 'bg-violet-600 text-white' : darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'
                  }`}
                  onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                >
                  {labels[key]}
                </button>
              );
            })}
            {isDirty && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSortKey('date'); }}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}
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
              {sorted.map((entry) => {
                const isUpcoming = entry.status === 'upcoming';
                const isSelectable = !isUpcoming && selectMode;
                const isSelected = selectedIds.has(entry.id);
                return (
                  <div key={entry.id}>
                    <div
                      className={`flex items-center rounded-xl px-3 py-3 transition-colors ${
                        isSelected
                          ? (darkMode ? 'bg-red-500/10' : 'bg-red-50')
                          : isUpcoming
                          ? (darkMode ? 'bg-white/3 opacity-75' : 'bg-violet-50/60 opacity-85')
                          : ''
                      }`}
                    >
                      {/* Actions / select */}
                      <div className="flex shrink-0 items-center gap-1.5 pl-3">
                        {selectMode && !isUpcoming ? (
                          <button
                            type="button"
                            onClick={() => toggleSelect(entry.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                            style={tactileBtn}
                            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                          >
                            {isSelected
                              ? <CheckSquare className="h-4 w-4 text-red-500" />
                              : <Square className={`h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                            }
                          </button>
                        ) : isUpcoming ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onMarkAsPaid(entry)}
                              className="flex h-8 items-center justify-center rounded-xl px-2 text-[10px] font-semibold text-white leading-tight text-center"
                              style={{ ...tactileBtn, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 3px 0 rgba(99,102,241,0.45)', maxWidth: 72 }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              {entry.type === 'income' ? 'סמן אם כבר נכנס' : 'סמן אם כבר יצא'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRule(entry)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                              style={{ ...tactileBtn, boxShadow: darkMode ? '0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(0,0,0,0.08)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                              title="מחק קבוע"
                            >
                              <Trash2 className={`h-3 w-3 ${darkMode ? 'text-red-400/70' : 'text-red-400'}`} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                              style={{ ...tactileBtn, boxShadow: darkMode ? '0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(0,0,0,0.08)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              <Pencil className={`h-3 w-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(entry.id)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                              style={{ ...tactileBtn, boxShadow: darkMode ? '0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(0,0,0,0.08)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              <Trash2 className={`h-3 w-3 ${darkMode ? 'text-white/60' : 'text-red-400'}`} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Entry info */}
                      <div
                        className="flex flex-1 items-center justify-between text-right"
                        onClick={isSelectable ? () => toggleSelect(entry.id) : undefined}
                        style={isSelectable ? { cursor: 'pointer' } : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {entry.type === 'income' ? (
                            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                          )}
                          <span className={`text-[14px] font-bold ${entry.type === 'income' ? (darkMode ? 'text-sky-300' : 'text-sky-600') : (darkMode ? 'text-purple-300' : 'text-violet-600')}`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-end gap-1.5">
                            {isUpcoming && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                                בהמשך החודש
                              </span>
                            )}
                            <p className={`text-[13px] font-semibold ${text}`}>{entry.title}</p>
                          </div>
                          <p className={`text-[11px] ${muted}`}>
                            {entry.category} · {entry.date}
                            {entry.recurring && (
                              <span className={`mr-1 ${darkMode ? 'text-violet-300' : 'text-violet-500'}`}>· קבוע</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Single delete confirm */}
                    {!isUpcoming && !selectMode && confirmDeleteId === entry.id && (
                      <div className="mx-2 mb-1 flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { onDelete(entry.id); setConfirmDeleteId(null); }}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white"
                            style={{ ...tactileBtn, boxShadow: '0 3px 0 rgba(185,28,28,0.5)' }}
                            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                          >
                            מחק
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className={`rounded-lg px-3 py-1.5 text-[11px] ${darkMode ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'}`}
                            style={tactileBtn}
                            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                          >
                            ביטול
                          </button>
                        </div>
                        <p className="text-[11px] text-red-400">למחוק את הרשומה?</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
