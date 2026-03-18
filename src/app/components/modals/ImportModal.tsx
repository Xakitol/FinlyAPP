import { useRef, useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { loadDescMemory } from '../../../utils/descMemory';
import { parseFile, type ParsedRow } from '../../../utils/importParser';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onImport: (rows: ParsedRow[], targetMonth: number) => void;
}

type Stage = 'idle' | 'parsing' | 'month-confirm' | 'preview' | 'done';

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const CONFIDENCE_LABELS: Record<ParsedRow['confidence'], string> = {
  high: 'מובטח', suggestion: 'מוצע', ambiguous: 'לבחירה', inferred: 'ניחוש', unknown: 'לבדיקה',
};

const CONFIDENCE_COLORS: Record<ParsedRow['confidence'], { badge: string; dot: string }> = {
  high:       { badge: 'bg-sky-500/20 text-sky-600',     dot: 'bg-sky-500' },
  suggestion: { badge: 'bg-violet-500/20 text-violet-600', dot: 'bg-violet-400' },
  ambiguous:  { badge: 'bg-amber-500/20 text-amber-600',  dot: 'bg-amber-400' },
  inferred:   { badge: 'bg-orange-400/20 text-orange-600', dot: 'bg-orange-400' },
  unknown:    { badge: 'bg-gray-400/20 text-gray-500',    dot: 'bg-gray-400' },
};

const CONFIDENCE_COLORS_DARK: Record<ParsedRow['confidence'], { badge: string }> = {
  high:       { badge: 'bg-sky-500/20 text-sky-300' },
  suggestion: { badge: 'bg-violet-500/20 text-violet-300' },
  ambiguous:  { badge: 'bg-amber-500/20 text-amber-300' },
  inferred:   { badge: 'bg-orange-400/20 text-orange-300' },
  unknown:    { badge: 'bg-white/10 text-white/50' },
};

function ConfidenceIcon({ confidence }: { confidence: ParsedRow['confidence'] }) {
  if (confidence === 'high')      return <CheckCircle className="h-3.5 w-3.5 text-sky-500" />;
  if (confidence === 'ambiguous') return <HelpCircle className="h-3.5 w-3.5 text-amber-500" />;
  return <AlertCircle className="h-3.5 w-3.5 text-violet-400" />;
}

/** Finds the most common calendar month (0-11) from parsed row dates */
function detectMostCommonMonth(rows: ParsedRow[]): number {
  const counts: Record<number, number> = {};
  for (const row of rows) {
    if (row.date) {
      const m = new Date(row.date).getMonth();
      if (!isNaN(m)) counts[m] = (counts[m] ?? 0) + 1;
    }
  }
  const entries = Object.entries(counts);
  if (entries.length === 0) return new Date().getMonth();
  return parseInt(entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]);
}

export function ImportModal({ open, onClose, darkMode = false, onImport }: ImportModalProps) {
  const [stage, setStage]           = useState<Stage>('idle');
  const [rows, setRows]             = useState<ParsedRow[]>([]);
  const [error, setError]           = useState('');
  const [fileName, setFileName]     = useState('');
  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const text   = darkMode ? 'text-white' : 'text-gray-900';
  const muted  = darkMode ? 'text-white/60' : 'text-gray-500';
  const accent = darkMode ? 'text-sky-300' : 'text-violet-600';

  const modalBg: React.CSSProperties = darkMode
    ? { background: 'linear-gradient(145deg, rgba(26,31,58,0.97) 0%, rgba(15,20,40,0.98) 100%)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }
    : { background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.98) 100%)', border: '1.5px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(139,92,246,0.15)' };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setStage('parsing');
    try {
      const memory = loadDescMemory();
      const parsed = await parseFile(file, memory);
      if (parsed.length === 0) {
        setError('לא נמצאו שורות לייבוא. ודאו שהקובץ מכיל נתונים בפורמט הנכון.');
        setStage('idle');
        return;
      }
      setRows(parsed);
      const detected = detectMostCommonMonth(parsed);
      setTargetMonth(detected);
      setStage('month-confirm');
    } catch (err) {
      console.error('Import parse error:', err);
      setError('שגיאה בפתיחת הקובץ. ודאו שהקובץ תקין ונסו שוב.');
      setStage('idle');
    }
    e.target.value = '';
  }

  function updateRowType(id: string, type: 'income' | 'expense') {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, type, confidence: 'suggestion', needsReview: false } : r),
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function handleConfirm() {
    onImport(rows, targetMonth);
    setStage('done');
  }

  function handleClose() {
    setStage('idle');
    setRows([]);
    setError('');
    setFileName('');
    onClose();
  }

  const reviewCount    = rows.filter((r) => r.needsReview).length;
  const ambiguousCount = rows.filter((r) => r.confidence === 'ambiguous').length;

  // ── Idle / Parsing ─────────────────────────────────────────────────────────
  if (stage === 'idle' || stage === 'parsing') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div
          className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={modalBg}
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
              style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)' }}
            >
              <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <div className="text-right">
              <h2 className={`text-lg font-bold ${text}`}>ייבוא תנועות</h2>
              <p className={`text-[11px] ${muted}`}>Excel, CSV או PDF מהבנק</p>
            </div>
          </div>

          <div className="px-5 pb-6">
            {stage === 'parsing' ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="h-10 w-10 animate-spin rounded-full" style={{ border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
                <p className={`text-[13px] ${muted}`}>מנתח את {fileName}…</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-2xl border-2 border-dashed py-10 flex flex-col items-center gap-3 transition-colors ${
                    darkMode
                      ? 'border-white/20 hover:border-violet-400/60 hover:bg-white/5'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-semibold ${text}`}>בחרו קובץ לייבוא</p>
                    <p className={`mt-0.5 text-[11px] ${muted}`}>.xlsx, .csv, .pdf</p>
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" onChange={handleFileChange} />

                {error && (
                  <p className={`mt-3 text-center text-[12px] ${darkMode ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>{error}</p>
                )}

                <div className={`mt-4 rounded-xl px-4 py-3 text-right ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-[11px] font-semibold ${accent} mb-1`}>טיפ</p>
                  <p className={`text-[11px] ${muted} leading-relaxed`}>
                    Excel ו-CSV עובדים הכי טוב. PDF נתמך, אבל ייתכנו שגיאות הכרה שיש לאשר ידנית.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Month Confirmation ─────────────────────────────────────────────────────
  if (stage === 'month-confirm') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div
          className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={modalBg}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
              style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)' }}
            >
              <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <div className="text-right">
              <h2 className={`text-lg font-bold ${text}`}>לאיזה חודש לייבא?</h2>
              <p className={`text-[11px] ${muted}`}>{rows.length} תנועות זוהו · {fileName}</p>
            </div>
          </div>

          <div className="px-5 pb-6">
            {/* Detected month highlight */}
            <div
              className="mb-4 rounded-2xl px-4 py-3 text-right"
              style={{
                background: darkMode ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)',
                border: darkMode ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(14,165,233,0.2)',
              }}
            >
              <p className={`text-[11px] font-semibold mb-0.5 ${darkMode ? 'text-sky-300' : 'text-sky-600'}`}>חודש מזוהה מהקובץ</p>
              <p className={`text-[15px] font-bold ${text}`}>{HEBREW_MONTHS[targetMonth]}</p>
              <p className={`text-[10px] mt-0.5 ${muted}`}>אפשר לשנות למטה</p>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {HEBREW_MONTHS.map((name, idx) => {
                const active = targetMonth === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetMonth(idx)}
                    className={`rounded-xl py-2 text-[12px] font-semibold transition-all ${active ? 'text-white' : (darkMode ? 'text-white/60' : 'text-gray-600')}`}
                    style={{
                      background: active
                        ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                        : darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)',
                      border: active
                        ? 'none'
                        : darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)',
                      boxShadow: active
                        ? '0 3px 0 rgba(99,102,241,0.4)'
                        : darkMode ? '0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(180,170,220,0.2)',
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Confirm */}
            <button
              type="button"
              onClick={() => setStage('preview')}
              className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                boxShadow: '0 6px 0 rgba(99,102,241,0.5)',
              }}
            >
              סקירה לפני ייבוא
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div
          className="flex w-full max-w-lg flex-col items-center rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 py-10"
          style={modalBg}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
          <p className={`mt-4 text-[17px] font-bold ${text}`}>יובאו {rows.length} תנועות</p>
          <p className={`mt-1 text-[12px] ${muted}`}>נשמרו לחודש {HEBREW_MONTHS[targetMonth]}</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 rounded-xl px-8 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            סגור
          </button>
        </div>
      </div>
    );
  }

  // ── Preview ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden"
        style={{ ...modalBg, maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
          <button
            type="button"
            onClick={() => setStage('month-confirm')}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
            style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)' }}
          >
            <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <div className="text-right">
            <h2 className={`text-lg font-bold ${text}`}>סקירה לפני ייבוא</h2>
            <p className={`text-[11px] ${muted}`}>
              {rows.length} שורות · {HEBREW_MONTHS[targetMonth]}
              {reviewCount > 0 ? ` · ${reviewCount} לבדיקה` : ''}
              {ambiguousCount > 0 ? ` · ${ambiguousCount} דורשות בחירה` : ''}
            </p>
          </div>
        </div>

        {/* Summary badge */}
        {(reviewCount > 0 || ambiguousCount > 0) && (
          <div className={`mx-5 mb-3 rounded-xl px-4 py-2.5 text-right shrink-0 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
            <p className={`text-[11px] ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              {ambiguousCount > 0
                ? `${ambiguousCount} תנועות מסומנות כ"לבחירה" — בחרו כניסה או יציאה לפני הייבוא.`
                : `${reviewCount} תנועות מסומנות לבדיקה — וודאו שהפרטים נכונים.`}
            </p>
          </div>
        )}

        {/* Row list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const confColor = darkMode
                ? CONFIDENCE_COLORS_DARK[row.confidence].badge
                : CONFIDENCE_COLORS[row.confidence].badge;
              const isAmbiguous = row.confidence === 'ambiguous';
              return (
                <div
                  key={row.id}
                  className={`rounded-2xl px-4 py-3 ${
                    isAmbiguous
                      ? darkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200/60'
                      : darkMode ? 'bg-white/5' : 'bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[15px] font-bold shrink-0 ${row.type === 'income' ? (darkMode ? 'text-sky-300' : 'text-sky-600') : (darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600')}`}>
                      {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                    </p>
                    <p className={`text-[13px] font-semibold text-right truncate flex-1 ${text}`}>{row.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${confColor}`}>
                        <ConfidenceIcon confidence={row.confidence} />
                        {CONFIDENCE_LABELS[row.confidence]}
                      </span>
                      {row.isPdfRow && (
                        <span className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] ${darkMode ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                          <FileText className="h-2.5 w-2.5" />PDF
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] ${muted}`}>
                      {row.date && <span>{row.date}</span>}
                      {row.category && <span>· {row.category}</span>}
                    </div>
                  </div>

                  {isAmbiguous && (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => updateRowType(row.id, 'expense')}
                        className={`flex-1 rounded-xl py-1.5 text-[11px] font-semibold transition-all ${row.type === 'expense' ? 'text-white' : darkMode ? 'text-white/40' : 'text-gray-400'}`}
                        style={{ background: row.type === 'expense' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                      >
                        הוצאה
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRowType(row.id, 'income')}
                        className={`flex-1 rounded-xl py-1.5 text-[11px] font-semibold transition-all ${row.type === 'income' ? 'text-white' : darkMode ? 'text-white/40' : 'text-gray-400'}`}
                        style={{ background: row.type === 'income' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                      >
                        הכנסה
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className={`mt-2 text-[9px] ${darkMode ? 'text-white/30 hover:text-white/60' : 'text-gray-300 hover:text-gray-500'}`}
                  >
                    הסר שורה זו
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm bar */}
        <div
          className="shrink-0 px-5 py-4"
          style={{ borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(139,92,246,0.1)' }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={rows.length === 0}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
              boxShadow: '0 6px 0 rgba(99,102,241,0.5)',
            }}
          >
            ייבא {rows.length} תנועות לחודש {HEBREW_MONTHS[targetMonth]}
          </button>
        </div>
      </div>
    </div>
  );
}
