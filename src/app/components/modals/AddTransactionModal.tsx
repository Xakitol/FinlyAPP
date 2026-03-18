import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { FinanceEntry, PaymentMethod } from '../../../types/finance';
import {
  loadDescMemory,
  saveDescMemory,
  recordTransaction,
  getSuggestions,
  autoClassify,
  type DescMemory,
} from '../../../utils/descMemory';
import {
  X, Check, ChevronDown, TrendingUp, TrendingDown, ArrowRight, Plus, Repeat,
  ShoppingCart, Utensils, Car, Home, Heart, Music, Smartphone, Shield,
  Zap, ShoppingBag, BookOpen, Dumbbell, Gift, MoreHorizontal,
  Briefcase, Laptop, Building, Sparkles, Dog, type LucideIcon,
} from 'lucide-react';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onSave: (data: Omit<FinanceEntry, 'id'>, existingId?: string) => void;
}

type Step = 1 | 2 | 3;

// ── Categories ─────────────────────────────────────────────────────────────────

interface CategoryDef {
  id: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  kind: 'expense' | 'income';
}

const EXPENSE_CATS: CategoryDef[] = [
  { id: 'מזון',       label: 'מזון',        desc: 'סופר, מינימרקט',    Icon: ShoppingCart, kind: 'expense' },
  { id: 'מסעדות',     label: 'מסעדות',      desc: 'קפה, מסעדה, פיצה',  Icon: Utensils,     kind: 'expense' },
  { id: 'תחבורה',     label: 'תחבורה',      desc: 'דלק, חניה, תחבורה', Icon: Car,          kind: 'expense' },
  { id: 'דיור',       label: 'דיור',        desc: 'שכ"ד, ועד, ארנונה',  Icon: Home,         kind: 'expense' },
  { id: 'בריאות',     label: 'בריאות',      desc: 'תרופות, רופא',       Icon: Heart,        kind: 'expense' },
  { id: 'בילויים',    label: 'בילויים',     desc: 'קולנוע, הופעות',     Icon: Music,        kind: 'expense' },
  { id: 'מנויים',     label: 'מנויים',      desc: 'נטפליקס, ספוטיפיי',  Icon: Smartphone,   kind: 'expense' },
  { id: 'ביטוחים',    label: 'ביטוחים',     desc: 'ביטוח רכב, בריאות',  Icon: Shield,       kind: 'expense' },
  { id: 'חשבונות',    label: 'חשבונות',     desc: 'חשמל, מים, אינטרנט', Icon: Zap,          kind: 'expense' },
  { id: 'קניות',      label: 'קניות',       desc: 'בגדים, אלקטרוניקה',  Icon: ShoppingBag,  kind: 'expense' },
  { id: 'חינוך',      label: 'חינוך',       desc: 'קורסים, ספרים, חוגים', Icon: BookOpen,  kind: 'expense' },
  { id: 'ספורט',      label: 'ספורט',       desc: 'חדר כושר, ציוד',     Icon: Dumbbell,     kind: 'expense' },
  { id: 'חיות מחמד',  label: 'חיות מחמד',  desc: 'מזון, וטרינר',       Icon: Dog,          kind: 'expense' },
  { id: 'מתנות',      label: 'מתנות',       desc: 'מתנות ותרומות',      Icon: Gift,         kind: 'expense' },
  { id: 'אחר',        label: 'אחר',         desc: 'הוצאות שונות',       Icon: MoreHorizontal, kind: 'expense' },
];

const INCOME_CATS: CategoryDef[] = [
  { id: 'משכורת',     label: 'משכורת',  desc: 'עבודה שכירה',    Icon: Briefcase,     kind: 'income' },
  { id: 'פרילנס',     label: 'פרילנס',  desc: 'עבודה עצמאית',   Icon: Laptop,        kind: 'income' },
  { id: 'השקעות',     label: 'השקעות',  desc: 'דיבידנד, ריבית',  Icon: TrendingUp,    kind: 'income' },
  { id: 'שכר דירה',   label: 'שכ"ד',   desc: 'הכנסות מנכס',    Icon: Building,      kind: 'income' },
  { id: 'מתנה',       label: 'מתנה',    desc: 'כסף שקיבלתי',    Icon: Gift,          kind: 'income' },
  { id: 'הכנסה אחרת', label: 'אחר',    desc: 'הכנסות שונות',    Icon: MoreHorizontal, kind: 'income' },
];

// ── Constants ──────────────────────────────────────────────────────────────────

// IMPORTANT: dir="ltr" on the numpad grid keeps keys 1-2-3 left-to-right in RTL layout
const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

// ── Tactile helpers — defined outside component to keep stable references ──────
function tactilePress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.3)';
}
function tactileRelease(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '';
}

// ── Component ──────────────────────────────────────────────────────────────────
// IMPORTANT: All JSX is inlined in a single return — no inner function components.
// Inner function components (Step1, Step2, Step3...) defined inside a parent cause
// React to see a new component type on every render → unmount/remount → keyboard closes.

export function AddTransactionModal({ open, onClose, darkMode = false, onSave }: AddTransactionModalProps) {
  const [step, setStep]           = useState<Step>(1);
  const [fading, setFading]       = useState(false);
  const [closing, setClosing]     = useState(false);

  // Step 1
  const [amount, setAmount]           = useState('');
  const [showExtras, setShowExtras]   = useState(false);
  const [date, setDate]               = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');

  // Step 2
  const [description, setDescription]         = useState('');
  const [category, setCategory]               = useState('');
  const [showCustom, setShowCustom]           = useState(false);
  const [customInput, setCustomInput]         = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descMemory, setDescMemory]           = useState<DescMemory>({});

  // Step 3
  const [type, setType]               = useState<'income' | 'expense'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);

  const [customCats, setCustomCats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('finly_custom_cats') ?? '[]'); } catch { return []; }
  });
  const [catUsage, setCatUsage] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('finly_cat_usage') ?? '{}'); } catch { return {}; }
  });

  const customInputRef = useRef<HTMLInputElement>(null);
  const descInputRef   = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setFading(false);
    setClosing(false);
    setAmount('');
    setShowExtras(false);
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('bank');
    setDescription('');
    setCategory('');
    setShowCustom(false);
    setCustomInput('');
    setShowSuggestions(false);
    setType('expense');
    setIsRecurring(false);
    setDescMemory(loadDescMemory());
  }, [open]);

  if (!open) return null;

  // ── Theme ────────────────────────────────────────────────────────────────────
  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';

  const modalBg: CSSProperties = darkMode
    ? { background: 'linear-gradient(145deg,rgba(20,24,50,0.99) 0%,rgba(15,18,40,1) 100%)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)' }
    : { background: 'linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(248,245,255,0.99) 100%)', border: '1.5px solid rgba(200,190,255,0.5)', backdropFilter: 'blur(24px)' };

  const inputStyle: CSSProperties = {
    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(99,102,241,0.25)',
    color: darkMode ? 'white' : '#111',
    fontFamily: 'Rubik, sans-serif',
  };

  const galaxyBtn: CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    boxShadow: '0 5px 0 rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  };

  // Fade step content on transition
  const contentStyle: CSSProperties = { transition: 'opacity 0.15s ease', opacity: fading ? 0 : 1 };

  // ── Navigation ───────────────────────────────────────────────────────────────
  function goTo(next: Step) {
    setFading(true);
    setTimeout(() => { setStep(next); setFading(false); }, 160);
  }

  // Fade-out then call onClose
  function requestClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 220);
  }

  // ── Numpad ───────────────────────────────────────────────────────────────────
  function handleNumKey(key: string) {
    if (key === '⌫') {
      setAmount((p) => p.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((p) => p + '.');
    } else {
      if (amount.replace('.', '').length >= 8) return;
      if (amount === '0') setAmount(key);
      else setAmount((p) => p + key);
    }
  }

  const numericAmount = parseFloat(amount) || 0;
  const displayAmount = amount === ''
    ? '0'
    : amount.endsWith('.')
    ? `${parseFloat(amount || '0').toLocaleString('he-IL')}.`
    : numericAmount.toLocaleString('he-IL', { maximumFractionDigits: 2 });

  // ── Category helpers ─────────────────────────────────────────────────────────
  function sortedCats(cats: CategoryDef[]): CategoryDef[] {
    return [...cats].sort((a, b) => (catUsage[b.id] ?? 0) - (catUsage[a.id] ?? 0));
  }

  const customCatDefs: CategoryDef[] = customCats.map((label) => ({
    id: label, label, desc: 'קטגוריה מותאמת', Icon: Sparkles, kind: 'expense' as const,
  }));

  function addCustomCategory() {
    const trimmed = customInput.trim();
    if (!trimmed || customCats.includes(trimmed)) return;
    const next = [...customCats, trimmed];
    setCustomCats(next);
    localStorage.setItem('finly_custom_cats', JSON.stringify(next));
    setCategory(trimmed);
    setCustomInput('');
    setShowCustom(false);
  }

  function selectCategory(id: string, kind: 'expense' | 'income') {
    setCategory(id);
    setType(kind);
  }

  // ── Suggestions ──────────────────────────────────────────────────────────────
  const suggestions = description.trim().length >= 1
    ? getSuggestions(descMemory, description.trim()).slice(0, 4)
    : [];

  function applySuggestion(desc: string) {
    setDescription(desc);
    const classified = autoClassify(descMemory, desc);
    if (classified && classified.confidence !== 'ambiguous') {
      setType(classified.type);
      if (classified.category) setCategory(classified.category);
    }
    setShowSuggestions(false);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!numericAmount || !category) return;
    const title = description.trim() || category;
    const mem = loadDescMemory();
    const updated = recordTransaction(mem, title, type, category);
    saveDescMemory(updated);
    const newUsage = { ...catUsage, [category]: (catUsage[category] ?? 0) + 1 };
    setCatUsage(newUsage);
    localStorage.setItem('finly_cat_usage', JSON.stringify(newUsage));
    onSave({
      type, amount: numericAmount, category, title, date, paymentMethod,
      recurring: isRecurring, status: 'recorded', source: 'manual', countsTowardRemaining: true,
    });
    requestClose();
  }

  // ── Derived can-next flags ───────────────────────────────────────────────────
  const step1CanNext = numericAmount > 0;
  const step2CanNext = category !== '';   // description is optional

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{
        backdropFilter: 'blur(6px)',
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.22s ease',
      }}
    >
      <div
        className={`flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden ${closing ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-300'}`}
        style={{
          ...modalBg,
          maxHeight: '92vh',
          minHeight: '70vh',
          opacity: closing ? 0 : 1,
          transform: closing ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goTo((step - 1) as Step)}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/12' : 'bg-gray-100'}`}
              style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)', transition: 'transform 0.1s ease' }}
              onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
            >
              <ArrowRight className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <div className="text-center">
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-1">
              {([1, 2, 3] as Step[]).map((s) => (
                <div key={s} style={{
                  height: 5,
                  width: s === step ? 20 : 5,
                  borderRadius: 99,
                  background: s === step
                    ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                    : s < step
                    ? (darkMode ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.4)')
                    : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
                  transition: 'width 0.2s ease, background 0.2s ease',
                }} />
              ))}
            </div>
            <h2 className={`text-[16px] font-bold ${text}`}>
              {step === 1 ? 'כמה?' : step === 2 ? 'מה ולאיפה?' : 'איזה סוג?'}
            </h2>
          </div>

          <button
            type="button"
            onClick={requestClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/12' : 'bg-gray-100'}`}
            style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)', transition: 'transform 0.1s ease' }}
            onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
          >
            <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* ── STEP 1 — Amount ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 px-5 pb-6 gap-3" style={contentStyle}>

            {/* Amount display */}
            <div
              className="flex flex-col items-center justify-center rounded-3xl py-5"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
              }}
            >
              <p className={`text-[11px] font-semibold tracking-wide mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>כמה?</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-[20px] font-light ${muted}`}>₪</span>
                <span className={`text-[52px] font-bold leading-none tracking-tight ${text}`} style={{ minWidth: 80, textAlign: 'center' }}>
                  {displayAmount}
                </span>
              </div>
            </div>

            {/* Numpad — dir="ltr" keeps 1-2-3 left-to-right inside RTL layout */}
            <div className="grid grid-cols-3 gap-2" dir="ltr">
              {NUMPAD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNumKey(key)}
                  className="h-14 rounded-2xl flex items-center justify-center font-semibold"
                  style={{
                    fontSize: key === '⌫' ? 20 : 22,
                    color: key === '⌫'
                      ? (darkMode ? 'rgba(255,255,255,0.5)' : '#9ca3af')
                      : (darkMode ? 'white' : '#111'),
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)',
                    boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.4)' : '0 4px 0 rgba(180,170,220,0.3)',
                    transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  }}
                  onPointerDown={tactilePress}
                  onPointerUp={tactileRelease}
                  onPointerLeave={tactileRelease}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Extras toggle */}
            <button
              type="button"
              onClick={() => setShowExtras((v) => !v)}
              className={`flex items-center justify-center gap-1 text-[12px] font-medium ${darkMode ? 'text-white/40' : 'text-gray-400'}`}
            >
              <ChevronDown
                className="h-3.5 w-3.5"
                style={{ transform: showExtras ? 'rotate(180deg)' : '', transition: 'transform 0.2s ease' }}
              />
              {showExtras ? 'פחות פרטים' : 'תאריך ואמצעי תשלום'}
            </button>

            {/* Extras panel */}
            <div style={{ maxHeight: showExtras ? 140 : 0, opacity: showExtras ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
              <div className="flex gap-3">
                <div className="flex-1 text-right">
                  <p className={`text-[10px] font-semibold mb-1 ${muted}`}>תאריך</p>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(99,102,241,0.25)',
                      color: darkMode ? 'white' : '#111',
                      direction: 'ltr',
                      fontFamily: 'Rubik, sans-serif',
                    }}
                  />
                </div>
                <div className="flex-1 text-right">
                  <p className={`text-[10px] font-semibold mb-1 ${muted}`}>אמצעי תשלום</p>
                  <div className="flex gap-1">
                    {(['bank', 'credit', 'cash'] as PaymentMethod[]).map((pm) => {
                      const labels: Record<PaymentMethod, string> = { bank: 'בנק', credit: 'אשראי', cash: 'מזומן' };
                      const active = paymentMethod === pm;
                      return (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setPaymentMethod(pm)}
                          className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold ${active ? 'text-white' : (darkMode ? 'text-white/50' : 'text-gray-500')}`}
                          style={{
                            background: active ? 'linear-gradient(135deg, #6366f1, #a855f7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                            boxShadow: active ? '0 3px 0 rgba(124,58,237,0.4)' : 'none',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {labels[pm]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={!step1CanNext}
              onClick={() => goTo(2)}
              className="w-full rounded-2xl py-4 text-[15px] font-bold text-white disabled:opacity-35"
              style={{ ...galaxyBtn, marginTop: 'auto' }}
              onPointerDown={step1CanNext ? tactilePress : undefined}
              onPointerUp={step1CanNext ? tactileRelease : undefined}
              onPointerLeave={step1CanNext ? tactileRelease : undefined}
            >
              הבא ←
            </button>
          </div>
        )}

        {/* ── STEP 2 — Description + Category ──────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden" style={contentStyle}>

            {/* Description input — optional */}
            <div className="px-5 pb-3 relative">
              <div className="flex items-center justify-between mb-1.5">
                <p className={`text-[9px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>(לא חובה)</p>
                <p className={`text-[10px] font-semibold ${muted}`}>שם התנועה</p>
              </div>
              <input
                ref={descInputRef}
                type="text"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="לדוגמה: קניות בסופר..."
                dir="rtl"
                className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none"
                style={inputStyle}
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute right-5 left-5 top-full z-20 rounded-xl overflow-hidden shadow-xl"
                  style={{
                    background: darkMode ? 'rgba(20,24,50,0.98)' : 'rgba(255,255,255,0.98)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  {suggestions.map(({ description: d }) => (
                    <div
                      key={d}
                      className={`px-3 py-2.5 cursor-pointer text-[13px] ${darkMode ? 'hover:bg-white/8 text-white/90' : 'hover:bg-violet-50 text-gray-800'}`}
                      onMouseDown={() => applySuggestion(d)}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className={`px-5 text-[10px] font-semibold mb-2 ${muted}`}>קטגוריה</p>

            {/* Scrollable category grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">

              {/* Expense categories */}
              <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-fuchsia-400/70' : 'text-fuchsia-600/70'}`}>הוצאות</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[...sortedCats(EXPENSE_CATS), ...customCatDefs].map((cat) => {
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id, cat.kind)}
                      className="flex flex-col items-center justify-center rounded-2xl py-3 px-1 gap-1 text-center"
                      style={{
                        background: active
                          ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.18))'
                          : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'),
                        border: active
                          ? '1.5px solid rgba(168,85,247,0.5)'
                          : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,190,255,0.35)'),
                        boxShadow: active
                          ? '0 4px 0 rgba(168,85,247,0.25)'
                          : (darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(180,170,220,0.2)'),
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <cat.Icon className="h-5 w-5" style={{ color: active ? '#a855f7' : (darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280') }} />
                      <p className={`text-[11px] font-semibold leading-tight ${active ? 'text-purple-500' : (darkMode ? 'text-white/80' : 'text-gray-700')}`}>
                        {cat.label}
                      </p>
                      <p className={`text-[9px] leading-tight ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{cat.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Income categories */}
              <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-sky-400/70' : 'text-sky-600/70'}`}>הכנסות</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {sortedCats(INCOME_CATS).map((cat) => {
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id, cat.kind)}
                      className="flex flex-col items-center justify-center rounded-2xl py-3 px-1 gap-1 text-center"
                      style={{
                        background: active
                          ? 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(99,102,241,0.18))'
                          : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'),
                        border: active
                          ? '1.5px solid rgba(14,165,233,0.5)'
                          : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,190,255,0.35)'),
                        boxShadow: active
                          ? '0 4px 0 rgba(14,165,233,0.2)'
                          : (darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(180,170,220,0.2)'),
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <cat.Icon className="h-5 w-5" style={{ color: active ? '#0ea5e9' : (darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280') }} />
                      <p className={`text-[11px] font-semibold leading-tight ${active ? 'text-sky-500' : (darkMode ? 'text-white/80' : 'text-gray-700')}`}>
                        {cat.label}
                      </p>
                      <p className={`text-[9px] leading-tight ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{cat.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Add custom category */}
              {!showCustom ? (
                <button
                  type="button"
                  onClick={() => { setShowCustom(true); setTimeout(() => customInputRef.current?.focus(), 50); }}
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${darkMode ? 'text-white/35 hover:text-white/55' : 'text-gray-400 hover:text-gray-500'}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  קטגוריה מותאמת
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="flex items-center justify-center h-9 w-9 rounded-xl text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 3px 0 rgba(124,58,237,0.4)' }}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                    placeholder="שם קטגוריה..."
                    dir="rtl"
                    className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {/* Next */}
            <div className="px-5 pb-6 pt-2 shrink-0">
              <button
                type="button"
                disabled={!step2CanNext}
                onClick={() => goTo(3)}
                className="w-full rounded-2xl py-4 text-[15px] font-bold text-white disabled:opacity-35"
                style={galaxyBtn}
                onPointerDown={step2CanNext ? tactilePress : undefined}
                onPointerUp={step2CanNext ? tactileRelease : undefined}
                onPointerLeave={step2CanNext ? tactileRelease : undefined}
              >
                הבא ←
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Type + Recurrence ────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col flex-1 px-5 pb-6 gap-4" style={contentStyle}>

            {/* Summary pill */}
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-2.5"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.1)',
              }}
            >
              <span className={`text-[13px] font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>{category || '—'}</span>
              <span className={`text-[17px] font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ₪{numericAmount.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Type selection */}
            <div>
              <p className={`text-[10px] font-semibold mb-2 text-right ${muted}`}>סוג תנועה</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{
                    background: type === 'expense' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'),
                    border: type === 'expense' ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'),
                    boxShadow: type === 'expense' ? '0 5px 0 rgba(168,85,247,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'),
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <TrendingDown className={`h-6 w-6 ${type === 'expense' ? 'text-white' : (darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600')}`} />
                  <span className={`text-[14px] font-bold ${type === 'expense' ? 'text-white' : (darkMode ? 'text-white/70' : 'text-gray-700')}`}>הוצאה</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{
                    background: type === 'income' ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'),
                    border: type === 'income' ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'),
                    boxShadow: type === 'income' ? '0 5px 0 rgba(14,165,233,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'),
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <TrendingUp className={`h-6 w-6 ${type === 'income' ? 'text-white' : (darkMode ? 'text-sky-400' : 'text-sky-600')}`} />
                  <span className={`text-[14px] font-bold ${type === 'income' ? 'text-white' : (darkMode ? 'text-white/70' : 'text-gray-700')}`}>הכנסה</span>
                </button>
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <p className={`text-[10px] font-semibold mb-2 text-right ${muted}`}>תדירות</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecurring(false)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{
                    background: !isRecurring ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'),
                    border: !isRecurring ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'),
                    boxShadow: !isRecurring ? '0 5px 0 rgba(2,132,199,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'),
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <span className={`text-[13px] font-bold ${!isRecurring ? 'text-white' : (darkMode ? 'text-white/60' : 'text-gray-600')}`}>חד פעמי</span>
                  <span className={`text-[10px] ${!isRecurring ? 'text-white/70' : (darkMode ? 'text-white/30' : 'text-gray-400')}`}>תנועה בודדת</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecurring(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{
                    background: isRecurring ? 'linear-gradient(135deg, #6366f1, #a855f7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'),
                    border: isRecurring ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'),
                    boxShadow: isRecurring ? '0 5px 0 rgba(124,58,237,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'),
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <Repeat className={`h-5 w-5 ${isRecurring ? 'text-white' : (darkMode ? 'text-violet-400' : 'text-violet-600')}`} />
                  <span className={`text-[13px] font-bold ${isRecurring ? 'text-white' : (darkMode ? 'text-white/60' : 'text-gray-600')}`}>קבועה</span>
                  <span className={`text-[10px] ${isRecurring ? 'text-white/70' : (darkMode ? 'text-white/30' : 'text-gray-400')}`}>חוזרת כל חודש</span>
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              className="mt-auto w-full rounded-2xl py-4 text-[15px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                boxShadow: '0 6px 0 rgba(99,102,241,0.55), inset 0 1.5px 0 rgba(255,255,255,0.25)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
              onPointerDown={(e) => { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(99,102,241,0.55)'; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <Check className="inline h-5 w-5 ml-1.5" />
              שמור תנועה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
