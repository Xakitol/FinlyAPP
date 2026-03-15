import { ArrowDownLeft, ArrowUpRight, CalendarClock } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { GlassCard } from '../cards/GlassCard';

interface SummaryCardsProps {
  darkMode: boolean;
  income: number;
  expenses: number;
  upcoming: number;
}

function SummaryRow({
  darkMode,
  title,
  subtitle,
  amount,
  icon,
  iconClassName,
}: {
  darkMode: boolean;
  title: string;
  subtitle: string;
  amount: number;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
        darkMode ? 'bg-white/5' : 'bg-white/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClassName}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</p>
          <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{subtitle}</p>
        </div>
      </div>

      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

export function SummaryCards({ darkMode, income, expenses, upcoming }: SummaryCardsProps) {
  return (
    <GlassCard className="p-4">
      <div className="mb-3 text-right">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          תמונת מצב
        </h3>
        <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
          מה נכנס, מה יצא, ומה עוד צפוי לרדת
        </p>
      </div>

      <div className="space-y-3">
        <SummaryRow
          darkMode={darkMode}
          title="הכנסות החודש"
          subtitle="מה שכבר נכנס"
          amount={income}
          icon={<ArrowDownLeft className="h-5 w-5 text-cyan-300" />}
          iconClassName="bg-cyan-500/20"
        />

        <SummaryRow
          darkMode={darkMode}
          title="הוצאות החודש"
          subtitle="מה שכבר נרשם"
          amount={expenses}
          icon={<ArrowUpRight className="h-5 w-5 text-violet-300" />}
          iconClassName="bg-violet-500/20"
        />

        <SummaryRow
          darkMode={darkMode}
          title="מה עוד צפוי לרדת"
          subtitle="חיובים ידועים להמשך החודש"
          amount={upcoming}
          icon={<CalendarClock className="h-5 w-5 text-fuchsia-300" />}
          iconClassName="bg-fuchsia-500/20"
        />
      </div>
    </GlassCard>
  );
}
