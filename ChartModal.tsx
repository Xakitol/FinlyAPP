import { X } from 'lucide-react';
import { GlassCard } from "../cards/GlassCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const monthlyData = [
  { month: 'ינו', income: 15000, expenses: 5500 },
  { month: 'פבר', income: 16500, expenses: 6200 },
  { month: 'מרץ', income: 17704, expenses: 6135.9 },
  { month: 'אפר', income: 16000, expenses: 5800 },
  { month: 'מאי', income: 18000, expenses: 6500 },
  { month: 'יונ', income: 17200, expenses: 6000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <GlassCard className="p-3">
        <p className="text-white font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ₪{entry.value.toLocaleString()}
          </p>
        ))}
      </GlassCard>
    );
  }
  return null;
};

export function ChartModal({ open, onClose, darkMode = false }: ChartModalProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      style={{ backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-6xl p-10 animate-in fade-in zoom-in duration-300"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>גרפים פיננסיים</h2>
        </div>

        <div className="space-y-8">
          {/* Line Chart */}
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 text-right`}>מגמות הכנסות והוצאות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#a5f3fc" />
                <YAxis stroke="#a5f3fc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#00e5ff" 
                  strokeWidth={3}
                  name="הכנסות"
                  dot={{ fill: '#00e5ff', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  name="הוצאות"
                  dot={{ fill: '#a855f7', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 text-right`}>השוואת הכנסות והוצאות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#a5f3fc" />
                <YAxis stroke="#a5f3fc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#00d4d4" name="הכנסות" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#8b5cf6" name="הוצאות" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}