import { useRef } from 'react';

interface Props {
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function MonthCarousel({ availableMonths, selectedMonthIndex, onMonthChange }: Props) {
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -30 && selectedMonthIndex < 11) onMonthChange(selectedMonthIndex + 1);
    else if (dx > 30 && selectedMonthIndex > 0) onMonthChange(selectedMonthIndex - 1);
  }

  const translateX = 105 - (selectedMonthIndex * 70 + 35);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: 210,
        overflow: 'hidden',
        marginLeft: 'auto',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
      } as React.CSSProperties}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transform: `translateX(${translateX}px)`,
          transition: 'transform 260ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
                width: 70,
                flexShrink: 0,
                padding: '5px 0',
                borderRadius: 99,
                border: 'none',
                fontFamily: 'Rubik, sans-serif',
                fontSize: isSelected ? 13 : 12,
                fontWeight: isSelected ? 600 : 400,
                background: isSelected ? 'rgba(124,58,237,0.9)' : 'transparent',
                color: 'white',
                opacity: isSelected ? 1 : 0.4,
                cursor: 'pointer',
                textAlign: 'center',
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
