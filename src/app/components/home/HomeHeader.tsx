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
      {/* Left: dark mode toggle + month selector */}
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

      {/* Right: logo + brand line */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <h1
            className={`text-2xl font-bold leading-tight ${
              darkMode
                ? 'bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
            }`}
          >
            Finly
          </h1>
          <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400/80'}`}>
            כסף, בשקט
          </p>
        </div>

        {/* Glass logo icon — unified with screen glass language */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md shadow-lg ${
            darkMode
              ? 'border border-white/15 bg-white/10'
              : 'border border-white/70 bg-white/40'
          }`}
        >
          <Sparkles className={`h-5 w-5 ${darkMode ? 'text-cyan-300' : 'text-violet-500'}`} />
        </div>
      </div>
    </header>
  );
}
