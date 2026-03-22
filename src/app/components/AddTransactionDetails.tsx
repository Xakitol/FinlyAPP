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
  e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.5)';
}
function tactileRelease(e: React.PointerEvent<HTMLButtonElement>, shadow: string) {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = shadow;
}

export function AddTransactionDetails({ type, amount, recurring, onBack, onSave }: Props) {
  const isIncome = type === 'income';
  const defaultCats = isIncome ? INCOME_CATS : EXPENSE_CATS;

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [customCats, setCustomCats] = useState<string[]>([]);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());

  const [showAddCat, setShowAddCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');
  const addCatRef = useRef<HTMLInputElement>(null);

  const [showManage, setShowManage] = useState(false);

  const gradient = isIncome
    ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)';

  const ctaShadow = isIncome
    ? '0 6px 0 rgba(6,182,212,0.50), 0 12px 28px rgba(14,165,233,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)'
    : '0 6px 0 rgba(124,58,237,0.50), 0 12px 28px rgba(124,58,237,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)';

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(12px)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.90)',
    fontFamily: 'Rubik, sans-serif',
  };

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
    const entryData = {
      type,
      amount,
      category: finalCategory,
      title,
      date,
      paymentMethod: 'bank' as const,
      recurring,
      status,
      source: 'manual' as const,
      countsTowardRemaining: true,
    };
    setTimeout(() => onSave(entryData), 50);
  }

  const amountDisplay = amount.toLocaleString('he-IL', { maximumFractionDigits: 2 });
  const summaryText = isIncome
    ? `מוסיף הכנסה של ₪${amountDisplay}`
    : `מוסיף הוצאה של ₪${amountDisplay}`;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col finly-safe"
      style={{ fontFamily: 'Rubik, sans-serif', background: '#0f0a1e' }}
    >
      <StarField darkMode={true} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="active:opacity-60 transition-opacity"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 12px)',
          right: '16px',
          zIndex: 20,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.20)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight size={20} className="text-white/70" strokeWidth={2} />
      </button>

      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto px-5 pt-16 pb-6 gap-4">

        {/* Summary line */}
        <p className="text-[17px] font-bold text-center text-white">
          {summaryText}
        </p>

        {/* Date picker */}
        <div className="rounded-2xl px-4 py-3" style={glassCard}>
          <p className="text-[10px] font-semibold mb-1.5 text-white/50">תאריך</p>
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
          <p className="text-[10px] font-semibold mb-2.5 text-white/50">קטגוריה</p>

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
                      : 'rgba(255,255,255,0.06)',
                    border: active
                      ? (isIncome ? '1.5px solid rgba(14,165,233,0.50)' : '1.5px solid rgba(124,58,237,0.50)')
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: active
                      ? (isIncome ? '0 4px 0 rgba(14,165,233,0.20)' : '0 4px 0 rgba(124,58,237,0.20)')
                      : '0 4px 0 rgba(0,0,0,0.30)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon
                    size={22}
                    style={{
                      color: active
                        ? (isIncome ? '#0ea5e9' : '#7c3aed')
                        : 'rgba(255,255,255,0.55)',
                    }}
                    strokeWidth={1.8}
                  />
                  <p
                    className="text-[11px] font-semibold leading-tight"
                    style={{
                      color: active
                        ? (isIncome ? '#0ea5e9' : '#7c3aed')
                        : 'rgba(255,255,255,0.80)',
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
            <button
              type="button"
              onClick={() => {
                setShowAddCat((v) => !v);
                setShowManage(false);
                setTimeout(() => addCatRef.current?.focus(), 50);
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.60)',
              }}
            >
              <Plus size={13} />
              הוסף קטגוריה
            </button>

            <button
              type="button"
              onClick={() => {
                setShowManage((v) => !v);
                setShowAddCat(false);
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.60)',
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
              {customCats.length > 0 && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-white/50">
                    קטגוריות מותאמות
                  </p>
                  {customCats.map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <button
                        type="button"
                        onClick={() => deleteCustomCat(label)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{ background: 'rgba(239,68,68,0.20)', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                      <span className="flex-1 text-right text-[13px] font-medium text-white">
                        {label}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 mt-1 text-white/50">
                קטגוריות ברירת מחדל
              </p>
              {defaultCats.map((cat) => {
                const hidden = hiddenCats.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleHide(cat.id)}
                      className="rounded-lg px-2 py-1 text-[10px] font-semibold shrink-0"
                      style={{
                        background: hidden ? 'rgba(255,255,255,0.10)' : 'rgba(239,68,68,0.15)',
                        color: hidden ? 'rgba(255,255,255,0.60)' : '#ef4444',
                      }}
                    >
                      {hidden ? 'הצג' : 'הסתר'}
                    </button>
                    <span
                      className="flex-1 text-right text-[13px] font-medium"
                      style={{ color: hidden ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.90)', opacity: hidden ? 0.5 : 1 }}
                    >
                      {cat.label}
                    </span>
                  </div>
                );
              })}

              {customCats.length === 0 && (
                <p className="text-center text-[11px] py-1 text-white/55">
                  אין קטגוריות מותאמות עדיין
                </p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-2xl px-4 py-3" style={glassCard}>
          <p className="text-[10px] font-semibold mb-1.5 text-white/50">תיאור</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="תיאור (לא חובה)"
            dir="rtl"
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none placeholder:text-white/30"
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
