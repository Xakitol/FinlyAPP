import { useState, useRef, type LucideIcon } from 'react';
import {
  ChevronRight, Plus, Settings, Trash2,
  UtensilsCrossed, Home, Car, Music, Shield, Tv, Zap, Heart, MoreHorizontal,
  Briefcase, Laptop, Gift, RotateCcw,
} from 'lucide-react';
import { StarField } from './effects/StarField';
import type { FinanceEntry } from '../../types/finance';

interface Props {
  type: 'income' | 'expense';
  amount: number;
  recurring: boolean;
  darkMode: boolean;
  onBack: () => void;
  onSave: (data: Omit<FinanceEntry, 'id'>) => void;
}

interface CatDef {
  id: string;
  label: string;
  Icon: LucideIcon;
}

const EXPENSE_CATS: CatDef[] = [
  { id: 'מזון',      label: 'מזון',      Icon: UtensilsCrossed },
  { id: 'דיור',      label: 'דיור',      Icon: Home            },
  { id: 'תחבורה',    label: 'תחבורה',    Icon: Car             },
  { id: 'בילויים',   label: 'בילויים',   Icon: Music           },
  { id: 'ביטוחים',   label: 'ביטוחים',   Icon: Shield          },
  { id: 'מנויים',    label: 'מנויים',    Icon: Tv              },
  { id: 'חשבונות',   label: 'חשבונות',   Icon: Zap             },
  { id: 'בריאות',    label: 'בריאות',    Icon: Heart           },
  { id: 'אחר',       label: 'אחר',       Icon: MoreHorizontal  },
];

const INCOME_CATS: CatDef[] = [
  { id: 'משכורת',    label: 'משכורת',    Icon: Briefcase       },
  { id: 'עבודה',     label: 'עבודה',     Icon: Laptop          },
  { id: 'מתנה',      label: 'מתנה',      Icon: Gift            },
  { id: 'החזר',      label: 'החזר',      Icon: RotateCcw       },
  { id: 'אחר',       label: 'אחר',       Icon: MoreHorizontal  },
];

function tactilePress(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.25)';
}
function tactileRelease(e: React.PointerEvent<HTMLButtonElement>, shadow: string) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = shadow;
}

export function AddTransactionDetails({ type, amount, recurring, darkMode, onBack, onSave }: Props) {
  const isIncome = type === 'income';
  const defaultCats = isIncome ? INCOME_CATS : EXPENSE_CATS;

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Custom categories
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());

  // Add category panel
  const [showAddCat, setShowAddCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');
  const addCatRef = useRef<HTMLInputElement>(null);

  // Manage panel
  const [showManage, setShowManage] = useState(false);

  const gradient = isIncome
    ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)';

  const ctaShadow = isIncome
    ? '0 6px 0 rgba(6,182,212,0.50), 0 12px 28px rgba(14,165,233,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)'
    : '0 6px 0 rgba(124,58,237,0.50), 0 12px 28px rgba(124,58,237,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)';

  const backgroundGradient = darkMode
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  const textColor = darkMode ? 'rgba(255,255,255,0.90)' : '#111';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.50)' : '#6b7280';

  const glassCard: React.CSSProperties = {
    background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
    border: darkMode ? '1px solid rgba(255,255,255,0.10)' : '1.5px solid rgba(255,255,255,0.70)',
    backdropFilter: 'blur(12px)',
  };

  const inputStyle: React.CSSProperties = {
    background: darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.85)',
    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(200,190,255,0.50)',
    color: textColor,
    fontFamily: 'Rubik, sans-serif',
  };

  // Visible cats = default (non-hidden) + custom (non-hidden)
  const customCatDefs: CatDef[] = customCats
    .filter((l) => !hiddenCats.has(l))
    .map((l) => ({ id: l, label: l, Icon: MoreHorizontal }));
  const visibleCats: CatDef[] = [
    ...defaultCats.filter((c) => !hiddenCats.has(c.id)),
    ...customCatDefs,
  ];

  function addCustomCat() {
    const t = customCatInput.trim();
    if (!t || customCats.includes(t) || defaultCats.some((c) => c.id === t)) return;
    setCustomCats((prev) => [...prev, t]);
    setCategory(t);
    setCustomCatInput('');
    setShowAddCat(false);
  }

  function deleteCustomCat(label: string) {
    setCustomCats((prev) => prev.filter((c) => c !== label));
    if (category === label) setCategory('');
  }

  function toggleHide(id: string) {
    setHiddenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (category === id) setCategory('');
      }
      return next;
    });
  }

  function handleSave() {
    const today = new Date().toISOString().slice(0, 10);
    const status: 'recorded' | 'upcoming' = date > today ? 'upcoming' : 'recorded';
    const finalCategory = category || 'אחר';
    const title = description.trim() || finalCategory;
    onSave({
      type,
      amount,
      category: finalCategory,
      title,
      date,
      paymentMethod: 'bank',
      recurring,
      status,
      source: 'manual',
      countsTowardRemaining: true,
    });
  }

  const amountDisplay = amount.toLocaleString('he-IL', { maximumFractionDigits: 2 });
  const summaryText = isIncome
    ? `מוסיף הכנסה של ₪${amountDisplay}`
    : `מוסיף הוצאה של ₪${amountDisplay}`;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col finly-screen finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: backgroundGradient }}
    >
      <StarField darkMode={darkMode} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
        style={{
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.50)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-violet-700" strokeWidth={2} />
      </button>

      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto px-5 pt-16 pb-6 gap-4">

        {/* Summary line */}
        <p className="text-[17px] font-bold text-center" style={{ color: textColor }}>
          {summaryText}
        </p>

        {/* Date picker */}
        <div className="rounded-2xl px-4 py-3" style={glassCard}>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: mutedColor }}>תאריך</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-[14px] outline-none"
            style={{ ...inputStyle, direction: 'ltr' }}
          />
        </div>

        {/* Category grid */}
        <div className="rounded-2xl px-4 py-3" style={glassCard}>
          <p className="text-[10px] font-semibold mb-2.5" style={{ color: mutedColor }}>קטגוריה</p>

          <div className="grid grid-cols-3 gap-2">
            {visibleCats.map((cat) => {
              const active = category === cat.id;
              const { Icon } = cat;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(active ? '' : cat.id)}
                  className="flex flex-col items-center justify-center rounded-2xl py-3 px-1 gap-1 text-center"
                  style={{
                    background: active
                      ? (isIncome
                          ? 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(6,182,212,0.18))'
                          : 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(236,72,153,0.18))')
                      : darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.80)',
                    border: active
                      ? (isIncome ? '1.5px solid rgba(14,165,233,0.50)' : '1.5px solid rgba(124,58,237,0.50)')
                      : darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,190,255,0.35)',
                    boxShadow: active
                      ? (isIncome ? '0 4px 0 rgba(14,165,233,0.20)' : '0 4px 0 rgba(124,58,237,0.20)')
                      : darkMode ? '0 4px 0 rgba(0,0,0,0.30)' : '0 4px 0 rgba(180,170,220,0.20)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon
                    size={22}
                    style={{
                      color: active
                        ? (isIncome ? '#0ea5e9' : '#7c3aed')
                        : darkMode ? 'rgba(255,255,255,0.55)' : '#6b7280',
                    }}
                    strokeWidth={1.8}
                  />
                  <p
                    className="text-[11px] font-semibold leading-tight"
                    style={{
                      color: active
                        ? (isIncome ? '#0ea5e9' : '#7c3aed')
                        : darkMode ? 'rgba(255,255,255,0.80)' : '#374151',
                    }}
                  >
                    {cat.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Action buttons row */}
          <div className="flex gap-2 mt-3">
            {/* הוסף קטגוריה */}
            <button
              type="button"
              onClick={() => {
                setShowAddCat((v) => !v);
                setShowManage(false);
                setTimeout(() => addCatRef.current?.focus(), 50);
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(200,190,255,0.25)',
                border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,190,255,0.40)',
                color: darkMode ? 'rgba(255,255,255,0.60)' : '#7c3aed',
              }}
            >
              <Plus size={13} />
              הוסף קטגוריה
            </button>

            {/* ניהול קטגוריות */}
            <button
              type="button"
              onClick={() => {
                setShowManage((v) => !v);
                setShowAddCat(false);
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(200,190,255,0.25)',
                border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,190,255,0.40)',
                color: darkMode ? 'rgba(255,255,255,0.60)' : '#7c3aed',
              }}
            >
              <Settings size={13} />
              ניהול קטגוריות
            </button>
          </div>

          {/* Add category inline input */}
          {showAddCat && (
            <div className="flex gap-2 mt-2.5">
              <button
                type="button"
                onClick={addCustomCat}
                className="rounded-xl px-3 py-2 text-[12px] font-semibold text-white shrink-0"
                style={{ background: gradient }}
              >
                אשר
              </button>
              <input
                ref={addCatRef}
                type="text"
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomCat()}
                placeholder="שם קטגוריה..."
                dir="rtl"
                className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Manage panel */}
          {showManage && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {/* Custom cats — deletable */}
              {customCats.length > 0 && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
                    קטגוריות מותאמות
                  </p>
                  {customCats.map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{ background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(200,190,255,0.15)' }}
                    >
                      <button
                        type="button"
                        onClick={() => deleteCustomCat(label)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{ background: darkMode ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                      <span className="flex-1 text-right text-[13px] font-medium" style={{ color: textColor }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Built-in cats — hide/show toggle */}
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 mt-1" style={{ color: mutedColor }}>
                קטגוריות ברירת מחדל
              </p>
              {defaultCats.map((cat) => {
                const hidden = hiddenCats.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(200,190,255,0.10)' }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleHide(cat.id)}
                      className="rounded-lg px-2 py-1 text-[10px] font-semibold shrink-0"
                      style={{
                        background: hidden
                          ? (darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(200,190,255,0.30)')
                          : (darkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.10)'),
                        color: hidden ? (darkMode ? 'rgba(255,255,255,0.60)' : '#7c3aed') : '#ef4444',
                      }}
                    >
                      {hidden ? 'הצג' : 'הסתר'}
                    </button>
                    <span
                      className="flex-1 text-right text-[13px] font-medium"
                      style={{ color: hidden ? mutedColor : textColor, opacity: hidden ? 0.5 : 1 }}
                    >
                      {cat.label}
                    </span>
                  </div>
                );
              })}

              {customCats.length === 0 && (
                <p className="text-center text-[11px] py-1" style={{ color: mutedColor }}>
                  אין קטגוריות מותאמות עדיין
                </p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-2xl px-4 py-3" style={glassCard}>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: mutedColor }}>תיאור</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="תיאור (לא חובה)"
            dir="rtl"
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none"
            style={inputStyle}
          />
        </div>

        {/* Save CTA */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl py-4 text-white font-bold text-[16px]"
          style={{
            background: gradient,
            boxShadow: ctaShadow,
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            marginTop: 'auto',
          }}
          onPointerDown={tactilePress}
          onPointerUp={(e) => tactileRelease(e, ctaShadow)}
          onPointerLeave={(e) => tactileRelease(e, ctaShadow)}
        >
          שמור
        </button>

      </div>
    </div>
  );
}
