import { useState } from 'react';
import { ChevronDown, Moon, Sparkles, Sun } from 'lucide-react';
import { CircularButton } from '../buttons/CircularButton';
import { GlassCard } from '../cards/GlassCard';

interface HomeHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function HomeHeader({
  darkMode,
  onToggleDarkMode,
  availableMonths,
  selectedMonthIndex,
  onMonthChange,
}: HomeHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const monthLabel = availableMonths[selectedMonthIndex] ?? '';
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const accent = darkMode ? 'text-cyan-300' : 'text-violet-600';

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

        {/* Month selector */}
        <div className="relative">
          <GlassCard
            hover={false}
            className="cursor-pointer px-4 py-2"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${accent} ${dropdownOpen ? 'rotate-180' : ''}`}
              />
              <span className={`text-sm font-medium ${text}`}>{monthLabel}</span>
            </div>
          </GlassCard>

          {dropdownOpen && (
            <>
              {/* Click-outside overlay — closes dropdown when tapping anywhere else */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className={`absolute right-0 top-full z-50 mt-1 min-w-[7rem] overflow-hidden rounded-xl shadow-lg ${
                  darkMode
                    ? 'border border-white/15 bg-[#1a1f3a]/95 backdrop-blur-md'
                    : 'border border-white/70 bg-white/90 backdrop-blur-md'
                }`}
              >
                {availableMonths.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={`w-full px-4 py-2.5 text-right text-sm transition-colors ${
                      i === selectedMonthIndex
                        ? darkMode
                          ? 'bg-violet-500/30 font-semibold text-cyan-300'
                          : 'bg-violet-100 font-semibold text-violet-700'
                        : darkMode
                          ? 'text-white/80 hover:bg-white/10'
                          : 'text-gray-700 hover:bg-violet-50'
                    }`}
                    onClick={() => {
                      onMonthChange(i);
                      setDropdownOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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
