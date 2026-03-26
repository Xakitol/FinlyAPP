import { useRef } from 'react';

interface Props {
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function MonthCarousel({ availableMonths, selectedMonthIndex, onMonthChange }: Props) {
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    e.stopPropagation();
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    e.stopPropagation();
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy < -20 && selectedMonthIndex < 11) onMonthChange(selectedMonthIndex + 1);
    else if (dy > 20 && selectedMonthIndex > 0) onMonthChange(selectedMonthIndex - 1);
  }

  const translateY = 32 - selectedMonthIndex * 32;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: 80,
        height: 96,
        overflow: 'hidden',
        marginLeft: 'auto',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      } as React.CSSProperties}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${translateY}px)`,
          transition: 'transform 240ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        {availableMonths.map((month, idx) => {
          const isSelected = idx === selectedMonthIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onMonthChange(idx)}
              style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: '4px 14px',
                borderRadius: 99,
                border: 'none',
                fontFamily: 'Rubik, sans-serif',
                fontSize: isSelected ? 14 : 12,
                fontWeight: isSelected ? 700 : 400,
                background: isSelected ? 'linear-gradient(135deg, #06b6d4, #a78bfa)' : 'transparent',
                color: 'white',
                opacity: isSelected ? 1 : 0.4,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s, font-size 0.2s',
              }}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
}
