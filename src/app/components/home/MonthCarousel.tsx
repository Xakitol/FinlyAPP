import { useRef, useEffect } from 'react';

interface Props {
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function MonthCarousel({ availableMonths, selectedMonthIndex, onMonthChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const item = itemRefs.current[selectedMonthIndex];
    const container = containerRef.current;
    if (!item || !container) return;
    container.scrollTo({
      left: item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2,
      behavior: 'smooth',
    });
  }, [selectedMonthIndex]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        gap: 4,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        paddingLeft: 4,
        paddingRight: 4,
      } as React.CSSProperties}
    >
      {availableMonths.map((month, i) => (
        <button
          key={month}
          ref={(el) => { itemRefs.current[i] = el; }}
          type="button"
          onClick={() => onMonthChange(i)}
          style={{
            scrollSnapAlign: 'center',
            flexShrink: 0,
            padding: '5px 13px',
            borderRadius: 99,
            border: 'none',
            fontFamily: 'Rubik, sans-serif',
            fontSize: 13,
            fontWeight: i === selectedMonthIndex ? 600 : 400,
            background: i === selectedMonthIndex ? 'rgba(124,58,237,0.8)' : 'transparent',
            color: i === selectedMonthIndex ? 'white' : 'rgba(255,255,255,0.38)',
            cursor: 'pointer',
            transition: 'background 0.2s ease, color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {month}
        </button>
      ))}
    </div>
  );
}
