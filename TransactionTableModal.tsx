import { X, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { GlassCard } from "../cards/GlassCard";
import { useState } from 'react';

interface TransactionTableModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
}

const mockTransactions: Transaction[] = [
  { id: 1, date: '2026-03-10', type: 'income', category: 'משכורת', description: 'משכורת חודש מרץ', amount: 17704 },
  { id: 2, date: '2026-03-09', type: 'expense', category: 'מזון', description: 'קניות בסופר', amount: 450 },
  { id: 3, date: '2026-03-08', type: 'expense', category: 'תחבורה', description: 'דלק', amount: 350 },
  { id: 4, date: '2026-03-07', type: 'expense', category: 'בילויים', description: 'מסעדה', amount: 280 },
  { id: 5, date: '2026-03-06', type: 'income', category: 'פרילנס', description: 'פרויקט צד', amount: 2500 },
  { id: 6, date: '2026-03-05', type: 'expense', category: 'דיור', description: 'שכר דירה', amount: 4000 },
  { id: 7, date: '2026-03-04', type: 'expense', category: 'בריאות', description: 'ביקור רופא', amount: 150 },
  { id: 8, date: '2026-03-03', type: 'expense', category: 'מזון', description: 'הזמנת אוכל', amount: 120 },
];

export function TransactionTableModal({ open, onClose, darkMode = false }: TransactionTableModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!open) return null;

  const filteredTransactions = mockTransactions.filter(t =>
    t.description.includes(searchTerm) || t.category.includes(searchTerm)
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-6xl p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>רשימת תנועות</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-6 py-4 pl-12 bg-white/10 border border-white/20 rounded-2xl ${darkMode ? 'text-white' : 'text-gray-800'} placeholder-white/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all`}
            placeholder="חיפוש תנועות..."
          />
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg">
              <tr>
                <th className={`px-6 py-4 ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} font-bold`}>סכום</th>
                <th className={`px-6 py-4 ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} font-bold`}>תיאור</th>
                <th className={`px-6 py-4 ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} font-bold`}>קטגוריה</th>
                <th className={`px-6 py-4 ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} font-bold`}>סוג</th>
                <th className={`px-6 py-4 ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} font-bold`}>תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-cyan-300' : 'text-purple-300'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₪{transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transaction.description}</td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{transaction.category}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {transaction.type === 'income' ? (
                        <><TrendingUp className="w-4 h-4" /> הכנסה</>
                      ) : (
                        <><TrendingDown className="w-4 h-4" /> הוצאה</>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-white/40">
              לא נמצאו תנועות
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}