import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { GlassCard } from '../cards/GlassCard';
import { CircularButton } from '../buttons/CircularButton';


interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function TransactionFormModal({ open, onClose, darkMode = false }: TransactionFormModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ type, amount, category, description });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-2xl p-10 animate-in fade-in zoom-in duration-300"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>הוספת תנועה</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-8 py-3 rounded-full transition-all ${
                type === 'income'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              הכנסה
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-8 py-3 rounded-full transition-all ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              הוצאה
            </button>
          </div>

          {/* Amount Input */}
          <div className="text-right">
            <label className={`block ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 font-medium`}>סכום (₪)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl ${darkMode ? 'text-white' : 'text-gray-800'} placeholder-white/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all`}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category Input */}
          <div className="text-right">
            <label className={`block ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 font-medium`}>קטגוריה</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl ${darkMode ? 'text-white' : 'text-gray-800'} outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-all`}
              required
            >
              <option value="" className="bg-slate-800">בחר קטגוריה</option>
              {type === 'expense' ? (
                <>
                  <option value="food" className="bg-slate-800">מזון</option>
                  <option value="transport" className="bg-slate-800">תחבורה</option>
                  <option value="housing" className="bg-slate-800">דיור</option>
                  <option value="entertainment" className="bg-slate-800">בילויים</option>
                  <option value="health" className="bg-slate-800">בריאות</option>
                  <option value="other" className="bg-slate-800">אחר</option>
                </>
              ) : (
                <>
                  <option value="salary" className="bg-slate-800">משכורת</option>
                  <option value="freelance" className="bg-slate-800">פרילנס</option>
                  <option value="investment" className="bg-slate-800">השקעות</option>
                  <option value="other" className="bg-slate-800">אחר</option>
                </>
              )}
            </select>
          </div>

          {/* Description Input */}
          <div className="text-right">
            <label className={`block ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 font-medium`}>תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl ${darkMode ? 'text-white' : 'text-gray-800'} placeholder-white/40 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none`}
              placeholder="הוסף פרטים נוספים..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
          <CircularButton 
  size="lg"
  variant="gradient"
  type="submit"
>
  <Check className="w-8 h-8 text-white" />
</CircularButton>

          </div>
        </form>
      </GlassCard>
    </div>
  );
}