import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { X, Search, Pencil, Trash2, FileSpreadsheet, FileText, ArrowUpDown, RotateCcw, TrendingUp, TrendingDown, Upload, CheckSquare, Square } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FinanceEntry } from '../../../types/finance';

type SortKey = 'date' | 'amount' | 'alpha';

interface TransactionTableModalProps {
  open: boolean;
  onClose: () => void;
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
    <td style="color:${e.type === 'income' ? '#0284c7' : '#7c3aed'}">${e.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
    <td style="font-weight:600;color:${e.type === 'income' ? '#0284c7' : '#7c3aed'}">${e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString('he-IL')} ₪</td>
    <td>${e.status === 'upcoming' ? 'צפוי' : 'מאושר'}</td>
  </tr>`).join('');
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>Finly — תנועות</title>
  <style>body{font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#111}h1{font-size:22px;color:#7c3aed;margin-bottom:4px}p{color:#6b7280;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#7c3aed;color:#fff;padding:8px 10px;text-align:right}td{padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:right}tr:nth-child(even) td{background:#f9fafb}</style></head><body>
  <h1>Finly — ייצוא תנועות</h1><p>${entries.length} תנועות · ${new Date().toLocaleDateString('he-IL')}</p>
  <table><thead><tr><th>תאריך</th><th>תיאור</th><th>קטגוריה</th><th>סוג</th><th>סכום</th><th>סטטוס</th></tr></thead><tbody>${rowsHtml}</tbody></table>
  <script>window.onload=()=>{window.print();}<\/script></body></html>`);
  win.document.close();
}

const tb: React.CSSProperties = { transition: 'transform 0.1s ease' };
function onPress(e: React.PointerEvent<HTMLButtonElement>) { e.currentTarget.style.transform = 'translateY(2px)'; }
function onRelease(e: React.PointerEvent<HTMLButtonElement>) { e.currentTarget.style.transform = ''; }

const modalBg: React.CSSProperties = {
  background: 'rgba(15,10,30,0.97)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
};

export function TransactionTableModal({
  open, onClose, entries, onEdit, onDelete, onDeleteMultiple,
  onMarkAsPaid, onDeleteRule, onOpenImport,
}: TransactionTableModalProps) {
  const [searchTerm, setSearchTerm]     = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('date');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectMode, setSelectMode]     = useState(false);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk]   = useState(false);

  // Reset selection state every time the modal opens
  useEffect(() => {
    if (!open) return;
    setSelectMode(false);
    setSelectedIds(new Set());
    setConfirmBulk(false);
    setConfirmDeleteId(null);
    setSearchTerm('');
    setSortKey('date');
  }, [open]);

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
  const selectableIds = sorted.filter((e) => e.status !== 'upcoming').map((e) => e.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setConfirmBulk(false);
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(selectableIds));
    setConfirmBulk(false);
  }

  function handleBulkDelete() {
    onDeleteMultiple([...selectedIds]);
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmBulk(false);
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
    setConfirmBulk(false);
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
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
            style={{ ...tb, boxShadow: '0 4px 0 rgba(0,0,0,0.3)' }}
            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">רשימת תנועות</h2>
        </div>

        {/* ── Import / Export ───────────────────────────────────────── */}
        <div className="px-5 pb-3 flex gap-3 shrink-0">
          {/* Import */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenImport?.()}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-semibold text-white"
              style={{ ...tb, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 0 rgba(2,132,199,0.4)' }}
              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
            >
              <Upload className="h-3.5 w-3.5" />
              ייבוא
            </button>
            <p className="text-[9px] text-white/30">.xlsx · .csv</p>
          </div>
          {/* Export */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex w-full gap-1.5">
              <button
                type="button"
                onClick={() => exportToExcel(sorted)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-white"
                style={{ ...tb, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 0 rgba(139,92,246,0.35)' }}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                <FileSpreadsheet className="h-3 w-3" /> Excel
              </button>
              <button
                type="button"
                onClick={() => exportToPrintPDF(sorted)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-white"
                style={{ ...tb, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 0 rgba(139,92,246,0.35)' }}
                onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
              >
                <FileText className="h-3 w-3" /> PDF
              </button>
            </div>
            <p className="text-[9px] text-white/30">ייצוא</p>
          </div>
        </div>

        {/* ── Search + Sort ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 px-5 pb-3 shrink-0">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border py-2 pl-3 pr-9 text-[13px] outline-none focus:border-violet-400 border-white/20 bg-white/10 text-white placeholder-white/30"
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
                  style={tb}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                    sortKey === key ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60'
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
                className="flex items-center rounded-lg px-2 py-1.5 text-[11px] text-white/40"
                title="איפוס"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── List header row ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pb-2 shrink-0">
          <p className="text-[11px] text-white/60">
            {selectMode && selectedIds.size > 0
              ? `${selectedIds.size} נבחרו`
              : `${sorted.length} תנועות`}
          </p>
          <button
            type="button"
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
              selectMode ? 'text-red-400' : 'text-white/45'
            }`}
          >
            {selectMode
              ? <><X className="h-3 w-3" /> ביטול בחירה</>
              : <><Square className="h-3 w-3" /> בחר</>
            }
          </button>
        </div>

        {/* ── Selection action bar ──────────────────────────────────── */}
        <div
          className="shrink-0 overflow-hidden"
          style={{
            maxHeight: selectMode ? 96 : 0,
            opacity: selectMode ? 1 : 0,
            transition: 'max-height 0.18s ease, opacity 0.16s ease',
          }}
        >
          {/* Normal select bar */}
          <div
            className="overflow-hidden"
            style={{
              maxHeight: !confirmBulk ? 52 : 0,
              opacity: !confirmBulk ? 1 : 0,
              transition: 'max-height 0.14s ease, opacity 0.12s ease',
            }}
          >
            <div className="flex items-center justify-between px-5 pb-3 gap-3">
              <button
                type="button"
                onClick={() => setConfirmBulk(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-30"
                style={{ ...tb, background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: selectedIds.size > 0 ? '0 3px 0 rgba(185,28,28,0.45)' : 'none' }}
                onPointerDown={selectedIds.size > 0 ? onPress : undefined}
                onPointerUp={selectedIds.size > 0 ? onRelease : undefined}
                onPointerLeave={selectedIds.size > 0 ? onRelease : undefined}
              >
                <Trash2 className="h-3.5 w-3.5" />
                מחק {selectedIds.size > 0 ? selectedIds.size : ''}
              </button>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] font-medium text-white/55"
              >
                {allSelected ? 'בטל הכל' : 'בחר הכל'}
              </button>
            </div>
          </div>

          {/* Confirm bar */}
          <div
            className="overflow-hidden"
            style={{
              maxHeight: confirmBulk ? 52 : 0,
              opacity: confirmBulk ? 1 : 0,
              transition: 'max-height 0.14s ease, opacity 0.12s ease',
            }}
          >
            <div
              className="mx-5 mb-3 flex items-center justify-between rounded-2xl px-4 py-2.5"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="rounded-xl bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white"
                  style={{ ...tb, boxShadow: '0 3px 0 rgba(185,28,28,0.45)' }}
                  onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                >
                  מחק {selectedIds.size}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBulk(false)}
                  className="rounded-xl px-3 py-1.5 text-[11px] bg-white/10 text-white/70"
                  style={tb}
                  onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                >
                  ביטול
                </button>
              </div>
              <p className="text-[11px] text-red-400">למחוק?</p>
            </div>
          </div>
        </div>

        {/* ── Transaction list ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 pb-5">
          {sorted.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">
              {searchTerm ? 'לא נמצאו תנועות' : 'אין תנועות לחודש זה'}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {sorted.map((entry) => {
                const isUpcoming = entry.status === 'upcoming';
                const isSelected = selectedIds.has(entry.id);

                const upcomingBg = entry.type === 'income'
                  ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                  : 'linear-gradient(135deg, #8b5cf6, #ec4899)';
                const upcomingShadow = entry.type === 'income'
                  ? '0 3px 0 rgba(2,132,199,0.4)'
                  : '0 3px 0 rgba(139,92,246,0.35)';

                return (
                  <div key={entry.id}>
                    <div
                      className={`flex items-center rounded-xl px-3 py-3 transition-colors duration-100 ${
                        isSelected
                          ? 'bg-red-500/10'
                          : isUpcoming
                          ? 'bg-white/3 opacity-75'
                          : ''
                      }`}
                      onClick={selectMode && !isUpcoming ? () => toggleSelect(entry.id) : undefined}
                      style={selectMode && !isUpcoming ? { cursor: 'pointer' } : undefined}
                    >
                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1.5 pl-3">
                        {selectMode && !isUpcoming ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8">
                            {isSelected
                              ? <CheckSquare className="h-4 w-4 text-red-500" />
                              : <Square className="h-4 w-4 text-white/35" />
                            }
                          </div>
                        ) : isUpcoming ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onMarkAsPaid(entry)}
                              className="flex h-8 items-center justify-center rounded-xl px-2 text-[10px] font-semibold text-white leading-tight text-center"
                              style={{ ...tb, background: upcomingBg, boxShadow: upcomingShadow, maxWidth: 72 }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              {entry.type === 'income' ? 'סמן אם כבר נכנס' : 'סמן אם כבר יצא'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRule(entry)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10"
                              style={{ ...tb, boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                              title="מחק קבוע"
                            >
                              <Trash2 className="h-3 w-3 text-red-400/70" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
                              style={{ ...tb, boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              <Pencil className="h-3 w-3 text-white/60" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry.id); }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
                              style={{ ...tb, boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}
                              onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                            >
                              <Trash2 className="h-3 w-3 text-white/60" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Entry info */}
                      <div className="flex flex-1 items-center justify-between text-right">
                        <div className="flex items-center gap-1.5">
                          {entry.type === 'income'
                            ? <TrendingUp className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                            : <TrendingDown className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                          }
                          <span className={`text-[14px] font-bold ${
                            entry.type === 'income' ? 'text-sky-300' : 'text-violet-300'
                          }`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-end gap-1.5">
                            {isUpcoming && (
                              <span className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold bg-violet-500/20 text-violet-300">
                                בהמשך החודש
                              </span>
                            )}
                            <p className="text-[13px] font-semibold text-white">{entry.title}</p>
                          </div>
                          <p className="text-[11px] text-white/60">
                            {entry.category} · {entry.date}
                            {entry.recurring && (
                              <span className="mr-1 text-violet-300">· קבוע</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Single delete confirm */}
                    {!isUpcoming && !selectMode && confirmDeleteId === entry.id && (
                      <div className="mx-2 mb-1 flex items-center justify-between rounded-xl bg-red-500/15 px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { onDelete(entry.id); setConfirmDeleteId(null); }}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white"
                            style={{ ...tb, boxShadow: '0 3px 0 rgba(185,28,28,0.45)' }}
                            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                          >
                            מחק
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg px-3 py-1.5 text-[11px] bg-white/10 text-white/70"
                            style={tb}
                            onPointerDown={onPress} onPointerUp={onRelease} onPointerLeave={onRelease}
                          >
                            ביטול
                          </button>
                        </div>
                        <p className="text-[11px] text-red-400">למחוק?</p>
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
