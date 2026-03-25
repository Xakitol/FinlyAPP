import { Edit, PiggyBank } from 'lucide-react';
import { CircularButton } from '../buttons/CircularButton';
import { GlassCard } from '../cards/GlassCard';
import { formatCurrency } from '../../../utils/formatters';

interface SavingsMiniCardProps {
  darkMode: boolean;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  onEdit: () => void;
}

export function SavingsMiniCard({
  darkMode,
  currentAmount,
  targetAmount,
  progress,
  onEdit,
}: SavingsMiniCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CircularButton
            size="sm"
            variant="glass"
            onClick={onEdit}
            className="shrink-0"
          >
            <Edit className="h-4 w-4 text-violet-300" />
          </CircularButton>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex-1 text-right">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            יעד חיסכון
          </h3>
          <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
            יעד: {formatCurrency(targetAmount)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
          <p>{Math.round(progress)}%</p>
          <p>כרגע נחסכו {formatCurrency(currentAmount)}</p>
        </div>

        <div className="relative h-3 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
          <div
            className="absolute inset-y-0 right-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #0f1729 0%, #6366f1 25%, #8b5cf6 50%, #00d4d4 75%, #00e5ff 100%)',
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
