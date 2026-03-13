import { useState } from 'react';
import { GlassCard } from './components/cards/GlassCard';
import { CircularButton } from './components/buttons/CircularButton';
import { InsightsModal } from './components/modals/InsightsModal';
import { ChartModal } from './components/modals/ChartModal';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { StarField } from './components/effects/StarField';
import {
  ChevronDown,
  Sparkles,
  BarChart3,
  List,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Moon,
  Sun,
  Edit
} from 'lucide-react';


export default function App() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(12000);

  // Background gradient based on mode
  const backgroundGradient = darkMode 
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div 
      dir="rtl" 
      className="min-h-screen w-full overflow-x-hidden relative animate-in fade-in duration-700"
      style={{
        fontFamily: 'Rubik, sans-serif',
        background: backgroundGradient,
      }}
    >
      <StarField darkMode={darkMode} />
      
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <GlassCard hover={false} className="px-6 py-3 flex items-center gap-3">
            <select className={`bg-transparent ${darkMode ? 'text-white' : 'text-gray-800'} outline-none cursor-pointer font-medium`}>
              <option value="march" className="bg-slate-800">מרץ</option>
              <option value="feb" className="bg-slate-800">פברואר</option>
              <option value="jan" className="bg-slate-800">ינואר</option>
            </select>
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-cyan-300' : 'text-violet-600'}`} />
          </GlassCard>

          {/* Dark Mode Toggle */}
          <CircularButton 
            size="md"
            variant="glass"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-violet-600" />
            )}
          </CircularButton>
        </div>

        <div className="flex items-center gap-3">
          <h1 className={`text-4xl font-bold ${darkMode 
            ? 'bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
          }`}>
            Finly
          </h1>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          <GlassCard className="p-8">
            <div className="text-right space-y-2">
              <p className={darkMode ? 'text-cyan-300/70' : 'text-cyan-700/80'}>הכנסות חודשיות</p>
              <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>₪17,704</p>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="text-right space-y-2">
              <p className={darkMode ? 'text-violet-300/70' : 'text-violet-700/80'}>הוצאות חודשיות</p>
              <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>₪6,135.9</p>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="text-right space-y-2">
              <p className={darkMode ? 'text-purple-300/70' : 'text-purple-700/80'}>יתרה נטו</p>
              <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>₪11,568.1</p>
            </div>
          </GlassCard>
        </div>

        {/* Finly Saves Card */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CircularButton 
                size="xl"
                variant="violet"
                onClick={() => setSavingsGoalOpen(true)}
              >
                <span className="text-white text-3xl font-bold">F</span>
              </CircularButton>
              
              <CircularButton 
                size="md"
                variant="glass"
                onClick={() => setSavingsGoalOpen(true)}
              >
                <Edit className="w-5 h-5 text-violet-300" />
              </CircularButton>
            </div>
            
            <div className="text-right flex-1 mr-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>פיינלי חוסך</h2>
              <p className={darkMode ? 'text-cyan-200/70' : 'text-cyan-700/80'}>
                קונגים יעד, עוקבים אחרי ההתקדמות, ועושים סדר גם בחיסכון.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex justify-between items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <p className="text-sm"></p>
              <p className="font-bold">יעד חיסכון: ₪{savingsGoal.toLocaleString()}</p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #0f1729 0%, #6366f1 25%, #8b5cf6 50%, #00d4d4 75%, #00e5ff 100%)',
                  width: '96%',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                }}
              />
            </div>

            <div className={`flex justify-between text-sm ${darkMode ? 'text-cyan-200/70' : 'text-cyan-700/80'}`}>
              <p>כרגע נחסכו: ₪11,568.1</p>
              <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>96%</p>
            </div>
          </div>
        </GlassCard>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-6">
          <GlassCard className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <CircularButton 
              size="lg"
              variant="glass"
              onClick={() => setInsightsOpen(true)}
            >
              <BarChart3 className={`w-8 h-8 ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`} />
            </CircularButton>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>תמונת מצב פיננסית ידידותית</h3>
              <p className={darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}>לחצו את הכפתור שלך. בצורה פשוטה וברור</p>
            </div>
          </GlassCard>

          <GlassCard className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <CircularButton 
              size="lg"
              variant="glass"
              onClick={() => setTableOpen(true)}
            >
              <List className={`w-8 h-8 ${darkMode ? 'text-violet-300' : 'text-violet-600'}`} />
            </CircularButton>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>רשימת תנועות</h3>
              <p className={darkMode ? 'text-violet-200/60' : 'text-violet-700/70'}>ניהול ההיסטוריה</p>
            </div>
          </GlassCard>

          <GlassCard className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <CircularButton 
              size="lg"
              variant="glass"
              onClick={() => setFormOpen(true)}
            >
              <Plus className={`w-8 h-8 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
            </CircularButton>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>הוספת תנועה</h3>
              <p className={darkMode ? 'text-purple-200/60' : 'text-purple-700/70'}>תיעוד הכנסה או הוצאה</p>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Modals */}
      <InsightsModal 
        open={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        onOpenChart={() => setChartOpen(true)}
        darkMode={darkMode}
      />
      <ChartModal open={chartOpen} onClose={() => setChartOpen(false)} darkMode={darkMode} />
      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} darkMode={darkMode} />
      <TransactionTableModal open={tableOpen} onClose={() => setTableOpen(false)} darkMode={darkMode} />
      <SavingsGoalModal 
        open={savingsGoalOpen} 
        onClose={() => setSavingsGoalOpen(false)}
        currentGoal={savingsGoal}
        onSave={setSavingsGoal}
      />
    </div>
  );
}