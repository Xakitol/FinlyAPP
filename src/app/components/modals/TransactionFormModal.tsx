import { useEffect, useRef, useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import type { FinanceEntry, PaymentMethod } from '../../../types/finance';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  initialEntry?: FinanceEntry | null;
  onSave: (data: Omit<FinanceEntry, 'id'>, existingId?: string) => void;
}

const EXPENSE_CATEGORIES = ['מזון', 'תחבורה', 'דיור', 'בילויים', 'בריאות', 'מנויים', 'ביטוחים', 'חשבונות', 'אחר'];
const INCOME_CATEGORIES = ['משכורת', 'פרילנס', 'השקעות', 'שכר דירה', 'מתנה', 'אחר'];

type DescMemory = Record<string, { type: 'income' | 'expense'; category: string }>;

const tactileBtn: React.CSSProperties = { transition: 'transform 0.1s ease, box-shadow 0.1s ease' };

function pressDown(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
}
function pressUp(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '';
}

export function TransactionFormModal({
  open,
  onClose,
  darkMode = false,
  initialEntry,
  onSave,
}: TransactionFormModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descMemory, setDescMemory] = useState<DescMemory>(() => {
    try { return JSON.parse(localStorage.getItem('finly_desc_memory') ?? 'null') ?? {}; } catch { return {}; }
  });

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initialEntry) {
      setType(initialEntry.type);
      setAmount(String(initialEntry.amount));
      setCategory(initialEntry.category);
      setTitle(initialEntry.title);
      setDate(initialEntry.date);
      setPaymentMethod(initialEntry.paymentMethod);
      setIsRecurring(initialEntry.recurring);
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('bank');
      setIsRecurring(false);
    }
    setShowSuggestions(false);
  }, [open, initialEntry]);

  if (!open) return null;

  const isEdit = !!initialEntry;
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const suggestions = title.trim().length >= 1
    ? Object.entries(descMemory).filter(([desc]) =>
        desc.includes(title.trim())
      ).slice(0, 4)
    : [];

  function handleSelectSuggestion(desc: string, data: { type: 'income' | 'expense'; category: string }) {
    setTitle(desc);
    setType(data.type);
    setCategory(data.category);
    setShowSuggestions(false);
  }

  function handleRemoveSuggestion(desc: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = { ...descMemory };
    delete next[desc];
    setDescMemory(next);
    localStorage.setItem('finly_desc_memory', JSON.stringify(next));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Save to description memory
    const trimmed = title.trim();
    if (trimmed) {
      const next = { ...descMemory, [trimmed]: { type, category } };
      setDescMemory(next);
      localStorage.setItem('finly_desc_memory', JSON.stringify(next));
    }
    onSave(
      {
        type,
        amount: parseFloat(amount),
        category,
        title: trimmed || title,
        date,
        paymentMethod,
        recurring: isRecurring,
        status: 'recorded',
        source: 'manual',
        countsTowardRemaining: true,
      },
      initialEntry?.id,
    );
  }

  const text = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-white/60' : 'text-gray-500';
  const labelCls = `block mb-1.5 text-[11px] font-semibold uppercase tracking-wide ${muted}`;
  const inputCls = `w-full px-3 py-2.5 rounded-xl text-[14px] outline-none transition-all ${
    darkMode
      ? 'bg-white/10 border border-white/20 text-white placeholder-white/30 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30'
      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-300/40'
  }`;

  const modalBg: React.CSSProperties = darkMode
    ? {
        background: 'linear-gradient(145deg, rgba(26,31,58,0.97) 0%, rgba(15,20,40,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }
    : {
        background: 'linear-gradient(145deg, rgba(255,255,255,0.68) 0%, rgba(245,240,255,0.62) 100%)',
        border: '1.5px solid rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 24px 60px rgba(139,92,246,0.15)',
      };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden"
        style={modalBg}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/15' : 'bg-gray-100'}`}
            style={{
              ...tactileBtn,
              boxShadow: darkMode
                ? '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 4px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
            onPointerDown={pressDown}
            onPointerUp={pressUp}
            onPointerLeave={pressUp}
          >
            <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <h2 className={`text-lg font-bold ${text}`}>
            {isEdit ? 'עריכת תנועה' : 'הוספת תנועה'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-3">

          {/* 1. Type toggle — compact */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 rounded-xl py-2 text-[13px] font-semibold ${
                type === 'income' ? 'text-white' : darkMode ? 'text-white/50' : 'text-gray-400'
              }`}
              style={{
                ...tactileBtn,
                background: type === 'income' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                boxShadow: type === 'income'
                  ? '0 4px 0 rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : darkMode ? '0 3px 0 rgba(0,0,0,0.2)' : '0 3px 0 rgba(0,0,0,0.08)',
              }}
              onPointerDown={pressDown}
              onPointerUp={pressUp}
              onPointerLeave={pressUp}
            >
              הכנסה
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 rounded-xl py-2 text-[13px] font-semibold ${
                type === 'expense' ? 'text-white' : darkMode ? 'text-white/50' : 'text-gray-400'
              }`}
              style={{
                ...tactileBtn,
                background: type === 'expense' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                boxShadow: type === 'expense'
                  ? '0 4px 0 rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : darkMode ? '0 3px 0 rgba(0,0,0,0.2)' : '0 3px 0 rgba(0,0,0,0.08)',
              }}
              onPointerDown={pressDown}
              onPointerUp={pressUp}
              onPointerLeave={pressUp}
            >
              הוצאה
            </button>
          </div>

          {/* 2. Amount + decorative icon */}
          <div className="flex items-end gap-3">
            <div className="flex-1 text-right">
              <label className={labelCls}>סכום (₪)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputCls}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl mb-0.5"
              style={{
                background: type === 'income'
                  ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                  : 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: type === 'income'
                  ? '0 4px 0 rgba(6,182,212,0.4)'
                  : '0 4px 0 rgba(124,58,237,0.4)',
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* 3. Description + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-right relative">
              <label className={labelCls}>תיאור</label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className={inputCls}
                placeholder="לדוגמה: סופר"
                required
                dir="rtl"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute right-0 left-0 top-full z-10 mt-1 rounded-xl overflow-hidden shadow-lg`}
                  style={{
                    background: darkMode ? 'rgba(26,31,58,0.98)' : 'rgba(255,255,255,0.98)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  {suggestions.map(([desc, data]) => (
                    <div
                      key={desc}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer ${darkMode ? 'hover:bg-white/8' : 'hover:bg-violet-50'}`}
                      onMouseDown={() => handleSelectSuggestion(desc, data)}
                    >
                      <button
                        type="button"
                        className={`text-[10px] ${darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}
                        onMouseDown={(e) => handleRemoveSuggestion(desc, e)}
                      >
                        ×
                      </button>
                      <div className="text-right min-w-0 flex-1 mx-2">
                        <p className={`text-[12px] font-medium truncate ${text}`}>{desc}</p>
                        <p className={`text-[10px] ${muted}`}>{data.type === 'income' ? 'הכנסה' : 'הוצאה'} · {data.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <label className={labelCls}>תאריך</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* 4. Category + Payment method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-right">
              <label className={labelCls}>קטגוריה</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
                required
                dir="rtl"
              >
                <option value="" className={darkMode ? 'bg-slate-800' : 'bg-white'}>בחר</option>
                {categories.map((c) => (
                  <option key={c} value={c} className={darkMode ? 'bg-slate-800' : 'bg-white'}>{c}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className={labelCls}>תשלום</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className={inputCls}
                dir="rtl"
              >
                <option value="bank" className={darkMode ? 'bg-slate-800' : 'bg-white'}>בנק</option>
                <option value="credit" className={darkMode ? 'bg-slate-800' : 'bg-white'}>אשראי</option>
                <option value="cash" className={darkMode ? 'bg-slate-800' : 'bg-white'}>מזומן</option>
              </select>
            </div>
          </div>

          {/* 5. Frequency toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsRecurring(false)}
              className={`flex-1 rounded-xl py-2 text-[12px] font-medium ${
                !isRecurring ? (darkMode ? 'text-white' : 'text-gray-800') : (darkMode ? 'text-white/40' : 'text-gray-400')
              }`}
              style={{
                ...tactileBtn,
                background: !isRecurring ? (darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.07)') : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                boxShadow: !isRecurring
                  ? darkMode ? '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 4px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'
                  : darkMode ? '0 2px 0 rgba(0,0,0,0.2)' : '0 2px 0 rgba(0,0,0,0.05)',
              }}
              onPointerDown={pressDown}
              onPointerUp={pressUp}
              onPointerLeave={pressUp}
            >
              חד פעמי
            </button>
            <button
              type="button"
              onClick={() => setIsRecurring(true)}
              className={`flex-1 rounded-xl py-2 text-[12px] font-medium ${
                isRecurring ? 'text-white' : darkMode ? 'text-white/40' : 'text-gray-400'
              }`}
              style={{
                ...tactileBtn,
                background: isRecurring ? 'linear-gradient(135deg, #6366f1, #a855f7)' : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                boxShadow: isRecurring
                  ? '0 4px 0 rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : darkMode ? '0 2px 0 rgba(0,0,0,0.2)' : '0 2px 0 rgba(0,0,0,0.05)',
              }}
              onPointerDown={pressDown}
              onPointerUp={pressUp}
              onPointerLeave={pressUp}
            >
              קבועה / עומדת
            </button>
          </div>

          {/* 6. Submit — galactic 3D */}
          <div className="flex justify-center pt-1">
            <button
              type="submit"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 45%, #a855f7 100%)',
                boxShadow: '0 6px 0 rgba(99,102,241,0.6), 0 12px 28px rgba(99,102,241,0.35), inset 0 1.5px 0 rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                border: 'none',
                cursor: 'pointer',
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.transform = 'translateY(5px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(99,102,241,0.6), 0 4px 12px rgba(99,102,241,0.25), inset 0 1.5px 0 rgba(255,255,255,0.3)';
              }}
              onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <Check className="h-7 w-7 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
