import { formatCurrency } from '../../../utils/formatters';
import { GlassCard } from '../cards/GlassCard';

interface MonthlyHeroCardProps {
  darkMode: boolean;
  statusLabel: string;
  remaining: number;
  upcoming: number;
}

export function MonthlyHeroCard({
  darkMode,
  statusLabel,
  remaining,
  upcoming,
}: MonthlyHeroCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="text-right">
        <p className={`mb-2 text-sm font-medium ${darkMode ? 'text-cyan-200/80' : 'text-cyan-700/80'}`}>
          {statusLabel}
        </p>

        <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
          מה נשאר לכם עד סוף החודש
        </p>

        <h2 className={`mt-2 text-4xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {formatCurrency(remaining)}
        </h2>

        <p className={`mt-3 text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
          הסכום כבר כולל את מה שעוד צפוי לרדת החודש: {formatCurrency(upcoming)}
        </p>
      </div>
    </GlassCard>
  );
}
