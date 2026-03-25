import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { GlassCard } from '../cards/GlassCard';

interface HomeHeaderProps {
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function HomeHeader({
  availableMonths,
  selectedMonthIndex,
  onMonthChange,
}: HomeHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const monthLabel = availableMonths[selectedMonthIndex] ?? '';

  return (
    <header className="mb-4 flex items-center justify-between">
      {/* Left: month selector */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <GlassCard
            hover={false}
            className="cursor-pointer px-4 py-2"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 text-cyan-300 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
              <span className="text-sm font-medium text-white">{monthLabel}</span>
            </div>
          </GlassCard>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[7rem] overflow-hidden rounded-xl shadow-lg border border-white/15 bg-[#1a1f3a]/95 backdrop-blur-md">
                {availableMonths.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={`w-full px-4 py-2.5 text-right text-sm transition-colors ${
                      i === selectedMonthIndex
                        ? 'bg-violet-500/30 font-semibold text-cyan-300'
                        : 'text-white/80 hover:bg-white/10'
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
          <h1 className="text-2xl font-bold leading-tight bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
            Finly
          </h1>
          <p className="text-[10px] text-white/40">
            כסף, בשקט
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md shadow-lg border border-white/15 bg-white/10">
          <Sparkles className="h-5 w-5 text-cyan-300" />
        </div>
      </div>
    </header>
  );
}
