interface Props {
  availableMonths: string[];
  selectedMonthIndex: number;
  onMonthChange: (index: number) => void;
}

export function MonthCarousel({ availableMonths, selectedMonthIndex, onMonthChange }: Props) {
  const last = availableMonths.length - 1;
  const prevIdx = selectedMonthIndex > 0 ? selectedMonthIndex - 1 : null;
  const nextIdx = selectedMonthIndex < last ? selectedMonthIndex + 1 : null;

  const slots: (number | null)[] = [prevIdx, selectedMonthIndex, nextIdx];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 210,
        overflow: 'hidden',
        marginLeft: 'auto',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {slots.map((idx, slotPos) => {
          if (idx === null) {
            return <div key={slotPos} style={{ width: 64, flexShrink: 0 }} />;
          }
          const isSelected = idx === selectedMonthIndex;
          return (
            <button
              key={slotPos}
              type="button"
              onClick={() => onMonthChange(idx)}
              style={{
                flexShrink: 0,
                width: 70,
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
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              {availableMonths[idx]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
