import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { GlassCard } from '../cards/GlassCard';
import { CircularButton } from '../buttons/CircularButton';
import type { FinanceEntry, PaymentMethod } from '../../../types/finance';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  initialEntry?: FinanceEntry | null;
  onSave: (data: Omit<FinanceEntry, 'id'>, existingId?: string) => void;
}

const EXPENSE_CATEGORIES = ['מזון', 'תחבורה', 'דיור', 'בילויים', 'בריאות', 'מנויים', 'ביטוחים', 'חשבונות', 'אחר'];
const INCOME_CATEGORIES = ['משכורת', 'פרילנס', 'השקעות', 'מתנה', 'אחר'];

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
  }, [open, initialEntry]);

  if (!open) return null;

  const isEdit = !!initialEntry;
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const labelCls = `block mb-1.5 text-[12px] font-medium ${darkMode ? 'text-white/70' : 'text-gray-600'}`;
  const inputCls = `w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl ${text} placeholder-white/30 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 transition-all text-[14px]`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        type,
        amount: parseFloat(amount),
        category,
        title,
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

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <h2 className={`text-lg font-bold ${text}`}>
            {isEdit ? 'עריכת תנועה' : 'הוספת תנועה'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all ${
                type === 'income'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              הכנסה
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              הוצאה
            </button>
          </div>

          {/* Title */}
          <div className="text-right">
            <label className={labelCls}>שם / תיאור</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="לדוגמה: קניות בסופר"
              required
              dir="rtl"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-right">
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

          {/* Category + Payment method */}
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
                <option value="" className="bg-slate-800">בחר</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-800">{c}</option>
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
                <option value="bank" className="bg-slate-800">בנק</option>
                <option value="credit" className="bg-slate-800">אשראי</option>
                <option value="cash" className="bg-slate-800">מזומן</option>
              </select>
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="text-right">
            <label className={labelCls}>תדירות</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 rounded-xl py-2.5 text-[12px] font-medium transition-all ${
                  !isRecurring
                    ? darkMode ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                    : 'bg-white/8 text-white/50 hover:bg-white/15'
                }`}
              >
                חד פעמי
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 rounded-xl py-2.5 text-[12px] font-medium transition-all ${
                  isRecurring
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/8 text-white/50 hover:bg-white/15'
                }`}
              >
                קבועה / עומדת
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <CircularButton size="lg" variant="gradient" type="submit">
              <Check className="h-7 w-7 text-white" />
            </CircularButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
