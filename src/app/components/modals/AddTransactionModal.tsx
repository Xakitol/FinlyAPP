import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { FinanceEntry, PaymentMethod } from '../../../types/finance';
import {
  loadDescMemory, saveDescMemory, recordTransaction,
  getSuggestions, autoClassify, type DescMemory,
} from '../../../utils/descMemory';
import {
  X, Check, ChevronDown, TrendingUp, TrendingDown, ArrowRight, Plus, Repeat,
  ShoppingCart, Utensils, Car, Home, Heart, Music, Smartphone, Shield,
  Zap, ShoppingBag, BookOpen, Dumbbell, Gift, MoreHorizontal,
  Briefcase, Laptop, Building, Sparkles, Dog, Pencil, RotateCcw,
  Settings, type LucideIcon,
} from 'lucide-react';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onSave: (data: Omit<FinanceEntry, 'id'>, existingId?: string) => void;
}

type Step = 1 | 2 | 3;

interface CategoryDef {
  id: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  kind: 'expense' | 'income';
}

const EXPENSE_CATS: CategoryDef[] = [
  { id: 'מזון',       label: 'מזון',        desc: 'סופר, מינימרקט',     Icon: ShoppingCart,   kind: 'expense' },
  { id: 'מסעדות',     label: 'מסעדות',      desc: 'קפה, מסעדה, פיצה',   Icon: Utensils,       kind: 'expense' },
  { id: 'תחבורה',     label: 'תחבורה',      desc: 'דלק, חניה, תחבורה',  Icon: Car,            kind: 'expense' },
  { id: 'דיור',       label: 'דיור',        desc: 'שכ"ד, ועד, ארנונה',  Icon: Home,           kind: 'expense' },
  { id: 'בריאות',     label: 'בריאות',      desc: 'תרופות, רופא',        Icon: Heart,          kind: 'expense' },
  { id: 'בילויים',    label: 'בילויים',     desc: 'קולנוע, הופעות',      Icon: Music,          kind: 'expense' },
  { id: 'מנויים',     label: 'מנויים',      desc: 'נטפליקס, ספוטיפיי',   Icon: Smartphone,     kind: 'expense' },
  { id: 'ביטוחים',    label: 'ביטוחים',     desc: 'ביטוח רכב, בריאות',   Icon: Shield,         kind: 'expense' },
  { id: 'חשבונות',    label: 'חשבונות',     desc: 'חשמל, מים, אינטרנט',  Icon: Zap,            kind: 'expense' },
  { id: 'קניות',      label: 'קניות',       desc: 'בגדים, אלקטרוניקה',   Icon: ShoppingBag,    kind: 'expense' },
  { id: 'חינוך',      label: 'חינוך',       desc: 'קורסים, ספרים, חוגים', Icon: BookOpen,      kind: 'expense' },
  { id: 'ספורט',      label: 'ספורט',       desc: 'חדר כושר, ציוד',      Icon: Dumbbell,       kind: 'expense' },
  { id: 'חיות מחמד',  label: 'חיות מחמד',  desc: 'מזון, וטרינר',        Icon: Dog,            kind: 'expense' },
  { id: 'מתנות',      label: 'מתנות',       desc: 'מתנות ותרומות',       Icon: Gift,           kind: 'expense' },
  { id: 'אחר',        label: 'אחר',         desc: 'הוצאות שונות',        Icon: MoreHorizontal, kind: 'expense' },
];

const INCOME_CATS: CategoryDef[] = [
  { id: 'משכורת',     label: 'משכורת',  desc: 'עבודה שכירה',    Icon: Briefcase,      kind: 'income' },
  { id: 'פרילנס',     label: 'פרילנס',  desc: 'עבודה עצמאית',   Icon: Laptop,         kind: 'income' },
  { id: 'השקעות',     label: 'השקעות',  desc: 'דיבידנד, ריבית',  Icon: TrendingUp,     kind: 'income' },
  { id: 'שכר דירה',   label: 'שכ"ד',   desc: 'הכנסות מנכס',    Icon: Building,       kind: 'income' },
  { id: 'מתנה',       label: 'מתנה',    desc: 'כסף שקיבלתי',    Icon: Gift,           kind: 'income' },
  { id: 'הכנסה אחרת', label: 'אחר',    desc: 'הכנסות שונות',    Icon: MoreHorizontal, kind: 'income' },
];

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

// Stable tactile helpers — outside component prevents new references on re-render
function tactilePress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.3)';
}
function tactileRelease(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '';
}

// IMPORTANT: No inner function components. All JSX is inlined in a single return.
// Inner function components defined inside parent → new type each render → unmount/remount → keyboard closes.
export function AddTransactionModal({ open, onClose, darkMode = false, onSave }: AddTransactionModalProps) {
  const [step, setStep]       = useState<Step>(1);
  const [fading, setFading]   = useState(false);
  const [closing, setClosing] = useState(false);

  // Step 1
  const [amount, setAmount]         = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [date, setDate]             = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');

  // Step 2
  const [description, setDescription]         = useState('');
  const [category, setCategory]               = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descMemory, setDescMemory]           = useState<DescMemory>({});

  // Add expense custom cat
  const [showAddExp, setShowAddExp]   = useState(false);
  const [addExpInput, setAddExpInput] = useState('');
  // Add income custom cat
  const [showAddInc, setShowAddInc]   = useState(false);
  const [addIncInput, setAddIncInput] = useState('');

  // Step 3
  const [type, setType]               = useState<'income' | 'expense'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);

  // Custom expense categories (backward-compat key: 'finly_custom_cats')
  const [customExpCats, setCustomExpCats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('finly_custom_cats') ?? '[]'); } catch { return []; }
  });
  // Custom income categories
  const [customIncCats, setCustomIncCats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('finly_custom_inc_cats') ?? '[]'); } catch { return []; }
  });
  // Hidden built-in category IDs
  const [hiddenCats, setHiddenCats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('finly_hidden_cats') ?? '[]'); } catch { return []; }
  });
  // Usage counts for sorting
  const [catUsage, setCatUsage] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('finly_cat_usage') ?? '{}'); } catch { return {}; }
  });

  // Category management mode
  const [manageMode, setManageMode]     = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatKind, setEditingCatKind] = useState<'expense' | 'income'>('expense');
  const [editingCatValue, setEditingCatValue] = useState('');

  const descInputRef    = useRef<HTMLInputElement>(null);
  const addExpInputRef  = useRef<HTMLInputElement>(null);
  const addIncInputRef  = useRef<HTMLInputElement>(null);
  const editCatInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setStep(1); setFading(false); setClosing(false);
    setAmount(''); setShowExtras(false);
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('bank');
    setDescription(''); setCategory('');
    setShowAddExp(false); setAddExpInput('');
    setShowAddInc(false); setAddIncInput('');
    setShowSuggestions(false);
    setType('expense'); setIsRecurring(false);
    setManageMode(false); setEditingCatId(null);
    setDescMemory(loadDescMemory());
  }, [open]);

  if (!open) return null;

  // ── Theme ─────────────────────────────────────────────────────────────────
  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';

  const modalBg: CSSProperties = darkMode
    ? { background: 'linear-gradient(145deg,rgba(20,24,50,0.99) 0%,rgba(15,18,40,1) 100%)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)' }
    : { background: 'linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(248,245,255,0.99) 100%)', border: '1.5px solid rgba(200,190,255,0.5)', backdropFilter: 'blur(24px)' };

  const inputStyle: CSSProperties = {
    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(99,102,241,0.25)',
    color: darkMode ? 'white' : '#111', fontFamily: 'Rubik, sans-serif',
  };

  const galaxyBtn: CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    boxShadow: '0 5px 0 rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  };

  const contentStyle: CSSProperties = { transition: 'opacity 0.14s ease', opacity: fading ? 0 : 1 };

  // ── Navigation ────────────────────────────────────────────────────────────
  function goTo(next: Step) {
    setFading(true);
    setTimeout(() => { setStep(next); setFading(false); }, 150);
  }

  function requestClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  }

  // ── Numpad ────────────────────────────────────────────────────────────────
  function handleNumKey(key: string) {
    if (key === '⌫') { setAmount((p) => p.slice(0, -1)); return; }
    if (key === '.') { if (!amount.includes('.')) setAmount((p) => p + '.'); return; }
    if (amount.replace('.', '').length >= 8) return;
    setAmount((p) => (p === '0' ? key : p + key));
  }

  const numericAmount = parseFloat(amount) || 0;
  const displayAmount = amount === ''
    ? '0'
    : amount.endsWith('.') ? `${parseFloat(amount || '0').toLocaleString('he-IL')}.`
    : numericAmount.toLocaleString('he-IL', { maximumFractionDigits: 2 });

  // ── Category helpers ──────────────────────────────────────────────────────
  function sortedCats(cats: CategoryDef[]): CategoryDef[] {
    return [...cats].sort((a, b) => (catUsage[b.id] ?? 0) - (catUsage[a.id] ?? 0));
  }

  const visibleExpCats = EXPENSE_CATS.filter((c) => !hiddenCats.includes(c.id));
  const visibleIncCats = INCOME_CATS.filter((c) => !hiddenCats.includes(c.id));
  const customExpDefs: CategoryDef[] = customExpCats.map((l) => ({ id: l, label: l, desc: 'קטגוריה מותאמת', Icon: Sparkles, kind: 'expense' as const }));
  const customIncDefs: CategoryDef[] = customIncCats.map((l) => ({ id: l, label: l, desc: 'קטגוריה מותאמת', Icon: Sparkles, kind: 'income' as const }));

  function selectCategory(id: string, kind: 'expense' | 'income') { setCategory(id); setType(kind); }

  function addExpCategory() {
    const t = addExpInput.trim();
    if (!t || customExpCats.includes(t)) return;
    const next = [...customExpCats, t];
    setCustomExpCats(next); localStorage.setItem('finly_custom_cats', JSON.stringify(next));
    setCategory(t); setType('expense'); setAddExpInput(''); setShowAddExp(false);
  }

  function addIncCategory() {
    const t = addIncInput.trim();
    if (!t || customIncCats.includes(t)) return;
    const next = [...customIncCats, t];
    setCustomIncCats(next); localStorage.setItem('finly_custom_inc_cats', JSON.stringify(next));
    setCategory(t); setType('income'); setAddIncInput(''); setShowAddInc(false);
  }

  // ── Category management ───────────────────────────────────────────────────
  function deleteCustomCat(label: string, kind: 'expense' | 'income') {
    if (kind === 'expense') {
      const next = customExpCats.filter((c) => c !== label);
      setCustomExpCats(next); localStorage.setItem('finly_custom_cats', JSON.stringify(next));
    } else {
      const next = customIncCats.filter((c) => c !== label);
      setCustomIncCats(next); localStorage.setItem('finly_custom_inc_cats', JSON.stringify(next));
    }
    if (category === label) setCategory('');
  }

  function startEditCat(label: string, kind: 'expense' | 'income') {
    setEditingCatId(label); setEditingCatKind(kind); setEditingCatValue(label);
    setTimeout(() => editCatInputRef.current?.focus(), 50);
  }

  function saveEditCat() {
    const newLabel = editingCatValue.trim();
    if (!newLabel || !editingCatId) return;
    if (editingCatKind === 'expense') {
      const next = customExpCats.map((c) => (c === editingCatId ? newLabel : c));
      setCustomExpCats(next); localStorage.setItem('finly_custom_cats', JSON.stringify(next));
    } else {
      const next = customIncCats.map((c) => (c === editingCatId ? newLabel : c));
      setCustomIncCats(next); localStorage.setItem('finly_custom_inc_cats', JSON.stringify(next));
    }
    if (editingCatId !== newLabel) {
      const { [editingCatId]: old, ...rest } = catUsage;
      const finalUsage = { ...rest, [newLabel]: old ?? 0 };
      setCatUsage(finalUsage); localStorage.setItem('finly_cat_usage', JSON.stringify(finalUsage));
      if (category === editingCatId) setCategory(newLabel);
    }
    setEditingCatId(null);
  }

  function hideBuiltinCat(id: string) {
    const next = [...hiddenCats, id];
    setHiddenCats(next); localStorage.setItem('finly_hidden_cats', JSON.stringify(next));
    if (category === id) setCategory('');
  }

  function restoreBuiltinCat(id: string) {
    const next = hiddenCats.filter((c) => c !== id);
    setHiddenCats(next); localStorage.setItem('finly_hidden_cats', JSON.stringify(next));
  }

  // ── Suggestions ───────────────────────────────────────────────────────────
  const suggestions = description.trim().length >= 1 ? getSuggestions(descMemory, description.trim()).slice(0, 4) : [];

  function applySuggestion(desc: string) {
    setDescription(desc);
    const c = autoClassify(descMemory, desc);
    if (c && c.confidence !== 'ambiguous') { setType(c.type); if (c.category) setCategory(c.category); }
    setShowSuggestions(false);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!numericAmount || !category) return;
    const title = description.trim() || category;
    const mem = loadDescMemory();
    saveDescMemory(recordTransaction(mem, title, type, category));
    const newUsage = { ...catUsage, [category]: (catUsage[category] ?? 0) + 1 };
    setCatUsage(newUsage); localStorage.setItem('finly_cat_usage', JSON.stringify(newUsage));
    onSave({ type, amount: numericAmount, category, title, date, paymentMethod, recurring: isRecurring, status: 'recorded', source: 'manual', countsTowardRemaining: true });
    requestClose();
  }

  const step1CanNext = numericAmount > 0;
  const step2CanNext = category !== '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(6px)', opacity: closing ? 0 : 1, transition: 'opacity 0.2s ease' }}
    >
      <div
        className={`flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden ${closing ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-250'}`}
        style={{
          ...modalBg, maxHeight: '92vh', minHeight: '70vh',
          opacity: closing ? 0 : 1,
          transform: closing ? 'translateY(14px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
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
          ) : <div className="w-10" />}

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {([1, 2, 3] as Step[]).map((s) => (
                <div key={s} style={{
                  height: 5, width: s === step ? 20 : 5, borderRadius: 99,
                  background: s === step ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                    : s < step ? (darkMode ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.4)')
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
            type="button" onClick={requestClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${darkMode ? 'bg-white/12' : 'bg-gray-100'}`}
            style={{ boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(0,0,0,0.1)', transition: 'transform 0.1s ease' }}
            onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
          >
            <X className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* ── STEP 1 — Amount ────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 px-5 pb-6 gap-3" style={contentStyle}>
            <div
              className="flex flex-col items-center justify-center rounded-3xl py-5"
              style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)' }}
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
                  key={key} type="button" onClick={() => handleNumKey(key)}
                  className="h-14 rounded-2xl flex items-center justify-center font-semibold"
                  style={{
                    fontSize: key === '⌫' ? 20 : 22,
                    color: key === '⌫' ? (darkMode ? 'rgba(255,255,255,0.5)' : '#9ca3af') : (darkMode ? 'white' : '#111'),
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)',
                    boxShadow: darkMode ? '0 4px 0 rgba(0,0,0,0.4)' : '0 4px 0 rgba(180,170,220,0.3)',
                    transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              type="button" onClick={() => setShowExtras((v) => !v)}
              className={`flex items-center justify-center gap-1 text-[12px] font-medium ${darkMode ? 'text-white/40' : 'text-gray-400'}`}
            >
              <ChevronDown className="h-3.5 w-3.5" style={{ transform: showExtras ? 'rotate(180deg)' : '', transition: 'transform 0.2s ease' }} />
              {showExtras ? 'פחות פרטים' : 'תאריך ואמצעי תשלום'}
            </button>

            <div style={{ maxHeight: showExtras ? 140 : 0, opacity: showExtras ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
              <div className="flex gap-3">
                <div className="flex-1 text-right">
                  <p className={`text-[10px] font-semibold mb-1 ${muted}`}>תאריך</p>
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)', border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(99,102,241,0.25)', color: darkMode ? 'white' : '#111', direction: 'ltr', fontFamily: 'Rubik, sans-serif' }}
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
                          key={pm} type="button" onClick={() => setPaymentMethod(pm)}
                          className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold ${active ? 'text-white' : (darkMode ? 'text-white/50' : 'text-gray-500')}`}
                          style={{ background: active ? 'linear-gradient(135deg, #6366f1, #a855f7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'), boxShadow: active ? '0 3px 0 rgba(124,58,237,0.4)' : 'none', transition: 'background 0.15s ease' }}
                        >
                          {labels[pm]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button" disabled={!step1CanNext} onClick={() => goTo(2)}
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

        {/* ── STEP 2 — Description + Category ───────────────────── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden" style={contentStyle}>

            {/* Description input — optional */}
            <div className="px-5 pb-3 relative shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className={`text-[9px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>(לא חובה)</p>
                <p className={`text-[10px] font-semibold ${muted}`}>שם התנועה</p>
              </div>
              <input
                ref={descInputRef} type="text" value={description}
                onChange={(e) => { setDescription(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="לדוגמה: קניות בסופר..." dir="rtl"
                className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none" style={inputStyle}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute right-5 left-5 top-full z-20 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: darkMode ? 'rgba(20,24,50,0.98)' : 'rgba(255,255,255,0.98)', border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(139,92,246,0.2)' }}
                >
                  {suggestions.map(({ description: d }) => (
                    <div key={d} className={`px-3 py-2.5 cursor-pointer text-[13px] ${darkMode ? 'hover:bg-white/8 text-white/90' : 'hover:bg-violet-50 text-gray-800'}`} onMouseDown={() => applySuggestion(d)}>
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category header + manage toggle */}
            <div className="flex items-center justify-between px-5 mb-2 shrink-0">
              <button
                type="button"
                onClick={() => { setManageMode((v) => !v); setEditingCatId(null); }}
                className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
                  manageMode
                    ? (darkMode ? 'text-violet-300' : 'text-violet-600')
                    : (darkMode ? 'text-white/35' : 'text-gray-400')
                }`}
              >
                <Settings className="h-3 w-3" />
                {manageMode ? 'סגור ניהול' : 'ניהול'}
              </button>
              <p className={`text-[10px] font-semibold ${muted}`}>קטגוריה</p>
            </div>

            {/* ── Normal category selection ── */}
            {!manageMode && (
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-fuchsia-400/70' : 'text-fuchsia-600/70'}`}>הוצאות</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[...sortedCats(visibleExpCats), ...customExpDefs].map((cat) => {
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id} type="button" onClick={() => selectCategory(cat.id, cat.kind)}
                        className="flex flex-col items-center justify-center rounded-2xl py-3 px-1 gap-1 text-center"
                        style={{
                          background: active ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.18))' : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'),
                          border: active ? '1.5px solid rgba(168,85,247,0.5)' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,190,255,0.35)'),
                          boxShadow: active ? '0 4px 0 rgba(168,85,247,0.25)' : (darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(180,170,220,0.2)'),
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <cat.Icon className="h-5 w-5" style={{ color: active ? '#a855f7' : (darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280') }} />
                        <p className={`text-[11px] font-semibold leading-tight ${active ? 'text-purple-500' : (darkMode ? 'text-white/80' : 'text-gray-700')}`}>{cat.label}</p>
                        <p className={`text-[9px] leading-tight ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{cat.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Add expense cat */}
                {!showAddExp ? (
                  <button type="button" onClick={() => { setShowAddExp(true); setTimeout(() => addExpInputRef.current?.focus(), 50); }} className={`flex items-center gap-1.5 mb-4 text-[11px] font-medium ${darkMode ? 'text-white/35 hover:text-white/55' : 'text-gray-400 hover:text-gray-500'}`}>
                    <Plus className="h-3.5 w-3.5" /> קטגוריה חדשה
                  </button>
                ) : (
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={addExpCategory} className="flex items-center justify-center h-9 w-9 rounded-xl text-white shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 3px 0 rgba(124,58,237,0.4)' }}>
                      <Check className="h-4 w-4" />
                    </button>
                    <input ref={addExpInputRef} type="text" value={addExpInput} onChange={(e) => setAddExpInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addExpCategory()} placeholder="שם קטגוריה..." dir="rtl" className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none" style={inputStyle} />
                  </div>
                )}

                <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-sky-400/70' : 'text-sky-600/70'}`}>הכנסות</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[...sortedCats(visibleIncCats), ...customIncDefs].map((cat) => {
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id} type="button" onClick={() => selectCategory(cat.id, cat.kind)}
                        className="flex flex-col items-center justify-center rounded-2xl py-3 px-1 gap-1 text-center"
                        style={{
                          background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(99,102,241,0.18))' : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'),
                          border: active ? '1.5px solid rgba(14,165,233,0.5)' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,190,255,0.35)'),
                          boxShadow: active ? '0 4px 0 rgba(14,165,233,0.2)' : (darkMode ? '0 4px 0 rgba(0,0,0,0.3)' : '0 4px 0 rgba(180,170,220,0.2)'),
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <cat.Icon className="h-5 w-5" style={{ color: active ? '#0ea5e9' : (darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280') }} />
                        <p className={`text-[11px] font-semibold leading-tight ${active ? 'text-sky-500' : (darkMode ? 'text-white/80' : 'text-gray-700')}`}>{cat.label}</p>
                        <p className={`text-[9px] leading-tight ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{cat.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Add income cat */}
                {!showAddInc ? (
                  <button type="button" onClick={() => { setShowAddInc(true); setTimeout(() => addIncInputRef.current?.focus(), 50); }} className={`flex items-center gap-1.5 text-[11px] font-medium ${darkMode ? 'text-white/35 hover:text-white/55' : 'text-gray-400 hover:text-gray-500'}`}>
                    <Plus className="h-3.5 w-3.5" /> קטגוריית הכנסה חדשה
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={addIncCategory} className="flex items-center justify-center h-9 w-9 rounded-xl text-white shrink-0" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 3px 0 rgba(14,165,233,0.35)' }}>
                      <Check className="h-4 w-4" />
                    </button>
                    <input ref={addIncInputRef} type="text" value={addIncInput} onChange={(e) => setAddIncInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addIncCategory()} placeholder="שם קטגוריה..." dir="rtl" className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none" style={inputStyle} />
                  </div>
                )}
              </div>
            )}

            {/* ── Category management mode ── */}
            {manageMode && (
              <div className="flex-1 overflow-y-auto px-5 pb-4">

                {/* Custom expense cats */}
                {customExpCats.length > 0 && (
                  <>
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-fuchsia-400/70' : 'text-fuchsia-600/70'}`}>קטגוריות מותאמות — הוצאות</p>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {customExpCats.map((label) => (
                        <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${darkMode ? 'bg-white/6' : 'bg-gray-50'}`}>
                          {editingCatId === label && editingCatKind === 'expense' ? (
                            <>
                              <button type="button" onClick={saveEditCat} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <input ref={editCatInputRef} type="text" value={editingCatValue} onChange={(e) => setEditingCatValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditCat()} dir="rtl" className="flex-1 rounded-lg px-2 py-1 text-[13px] outline-none" style={inputStyle} />
                              <button type="button" onClick={() => setEditingCatId(null)} className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>ביטול</button>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-1 shrink-0">
                                <button type="button" onClick={() => deleteCustomCat(label, 'expense')} className={`flex h-7 w-7 items-center justify-center rounded-lg ${darkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-500'}`}>
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => startEditCat(label, 'expense')} className={`flex h-7 w-7 items-center justify-center rounded-lg ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                              <span className={`flex-1 text-right text-[13px] font-medium ${text}`}>{label}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Custom income cats */}
                {customIncCats.length > 0 && (
                  <>
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-sky-400/70' : 'text-sky-600/70'}`}>קטגוריות מותאמות — הכנסות</p>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {customIncCats.map((label) => (
                        <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${darkMode ? 'bg-white/6' : 'bg-gray-50'}`}>
                          {editingCatId === label && editingCatKind === 'income' ? (
                            <>
                              <button type="button" onClick={saveEditCat} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <input ref={editCatInputRef} type="text" value={editingCatValue} onChange={(e) => setEditingCatValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditCat()} dir="rtl" className="flex-1 rounded-lg px-2 py-1 text-[13px] outline-none" style={inputStyle} />
                              <button type="button" onClick={() => setEditingCatId(null)} className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>ביטול</button>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-1 shrink-0">
                                <button type="button" onClick={() => deleteCustomCat(label, 'income')} className={`flex h-7 w-7 items-center justify-center rounded-lg ${darkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-500'}`}>
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => startEditCat(label, 'income')} className={`flex h-7 w-7 items-center justify-center rounded-lg ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                              <span className={`flex-1 text-right text-[13px] font-medium ${text}`}>{label}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Hidden built-in cats — restore */}
                {hiddenCats.length > 0 && (
                  <>
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-amber-400/70' : 'text-amber-600/70'}`}>קטגוריות מוסתרות — שחזור</p>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {hiddenCats.map((id) => {
                        const cat = [...EXPENSE_CATS, ...INCOME_CATS].find((c) => c.id === id);
                        if (!cat) return null;
                        return (
                          <div key={id} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${darkMode ? 'bg-white/6' : 'bg-gray-50'}`}>
                            <button type="button" onClick={() => restoreBuiltinCat(id)} className={`flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold ${darkMode ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}`}>
                              <RotateCcw className="h-3 w-3" /> שחזר
                            </button>
                            <span className={`flex-1 text-right text-[13px] font-medium ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{cat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Hide built-in cats */}
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>הסתרת קטגוריות מובנות</p>
                <div className="flex flex-col gap-1.5">
                  {[...EXPENSE_CATS, ...INCOME_CATS].filter((c) => !hiddenCats.includes(c.id)).map((cat) => (
                    <div key={cat.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${darkMode ? 'bg-white/4' : 'bg-gray-50/60'}`}>
                      <button type="button" onClick={() => hideBuiltinCat(cat.id)} className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[9px] font-semibold ${darkMode ? 'bg-white/8 text-white/40' : 'bg-gray-100 text-gray-400'}`}>
                        הסתר
                      </button>
                      <span className={`flex-1 text-right text-[12px] ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{cat.label}</span>
                    </div>
                  ))}
                </div>

                {customExpCats.length === 0 && customIncCats.length === 0 && hiddenCats.length === 0 && (
                  <p className={`text-center text-[12px] mt-6 ${muted}`}>אין קטגוריות מותאמות עדיין</p>
                )}
              </div>
            )}

            {/* Next button */}
            <div className="px-5 pb-6 pt-2 shrink-0">
              <button
                type="button" disabled={!step2CanNext} onClick={() => goTo(3)}
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

        {/* ── STEP 3 — Type + Recurrence ─────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col flex-1 px-5 pb-6 gap-4" style={contentStyle}>
            <div className="flex items-center justify-between rounded-2xl px-4 py-2.5" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)', border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.1)' }}>
              <span className={`text-[13px] font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>{category || '—'}</span>
              <span className={`text-[17px] font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₪{numericAmount.toLocaleString('he-IL', { maximumFractionDigits: 2 })}</span>
            </div>

            <div>
              <p className={`text-[10px] font-semibold mb-2 text-right ${muted}`}>סוג תנועה</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { t: 'expense' as const, label: 'הוצאה', Icon: TrendingDown, grad: 'linear-gradient(135deg, #8b5cf6, #ec4899)', shadow: '0 5px 0 rgba(168,85,247,0.4)', col: (a: boolean) => a ? 'text-white' : (darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600') },
                  { t: 'income'  as const, label: 'הכנסה',  Icon: TrendingUp,   grad: 'linear-gradient(135deg, #0ea5e9, #6366f1)', shadow: '0 5px 0 rgba(14,165,233,0.4)',  col: (a: boolean) => a ? 'text-white' : (darkMode ? 'text-sky-400' : 'text-sky-600') },
                ] as const).map(({ t, label, Icon, grad, shadow, col }) => {
                  const active = type === t;
                  return (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                      style={{ background: active ? grad : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'), border: active ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'), boxShadow: active ? shadow : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'), transition: 'all 0.15s ease' }}
                      onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                    >
                      <Icon className={`h-6 w-6 ${col(active)}`} />
                      <span className={`text-[14px] font-bold ${active ? 'text-white' : (darkMode ? 'text-white/70' : 'text-gray-700')}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className={`text-[10px] font-semibold mb-2 text-right ${muted}`}>תדירות</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setIsRecurring(false)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{ background: !isRecurring ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'), border: !isRecurring ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'), boxShadow: !isRecurring ? '0 5px 0 rgba(2,132,199,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'), transition: 'all 0.15s ease' }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <span className={`text-[13px] font-bold ${!isRecurring ? 'text-white' : (darkMode ? 'text-white/60' : 'text-gray-600')}`}>חד פעמי</span>
                  <span className={`text-[10px] ${!isRecurring ? 'text-white/70' : (darkMode ? 'text-white/30' : 'text-gray-400')}`}>תנועה בודדת</span>
                </button>
                <button type="button" onClick={() => setIsRecurring(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5"
                  style={{ background: isRecurring ? 'linear-gradient(135deg, #6366f1, #a855f7)' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'), border: isRecurring ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,255,0.4)'), boxShadow: isRecurring ? '0 5px 0 rgba(124,58,237,0.4)' : (darkMode ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(180,170,220,0.25)'), transition: 'all 0.15s ease' }}
                  onPointerDown={tactilePress} onPointerUp={tactileRelease} onPointerLeave={tactileRelease}
                >
                  <Repeat className={`h-5 w-5 ${isRecurring ? 'text-white' : (darkMode ? 'text-violet-400' : 'text-violet-600')}`} />
                  <span className={`text-[13px] font-bold ${isRecurring ? 'text-white' : (darkMode ? 'text-white/60' : 'text-gray-600')}`}>קבועה</span>
                  <span className={`text-[10px] ${isRecurring ? 'text-white/70' : (darkMode ? 'text-white/30' : 'text-gray-400')}`}>חוזרת כל חודש</span>
                </button>
              </div>
            </div>

            <button
              type="button" onClick={handleSave}
              className="mt-auto w-full rounded-2xl py-4 text-[15px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)', boxShadow: '0 6px 0 rgba(99,102,241,0.55), inset 0 1.5px 0 rgba(255,255,255,0.25)', transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
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
