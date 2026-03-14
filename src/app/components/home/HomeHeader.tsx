import { ChevronDown, Moon, Sparkles, Sun } from 'lucide-react';
import { CircularButton } from '../buttons/CircularButton';
import { GlassCard } from '../cards/GlassCard';

interface HomeHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  monthLabel: string;
}

export function HomeHeader({ darkMode, onToggleDarkMode, monthLabel }: HomeHeaderProps) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CircularButton
          size="sm"
          variant="glass"
          onClick={onToggleDarkMode}
          className="shrink-0"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-yellow-300" />
          ) : (
            <Moon className="h-4 w-4 text-violet-600" />
          )}
        </CircularButton>

        <GlassCard hover={false} className="px-4 py-2">
          <div className="flex items-center gap-2">
            <ChevronDown className={`h-4 w-4 ${darkMode ? 'text-cyan-300' : 'text-violet-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {monthLabel}
            </span>
          </div>
        </GlassCard>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={`text-xs ${darkMode ? 'text-cyan-200/70' : 'text-cyan-700/70'}`}>
            החודש שלכם
          </p>
          <h1
            className={`text-2xl font-bold ${
              darkMode
                ? 'bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
            }`}
          >
            Finly
          </h1>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  );
}
