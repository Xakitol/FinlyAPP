import { useRef, type ReactNode } from 'react';

interface Props {
  screens: ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

export function SwipeableScreens({ screens, activeIndex, onIndexChange }: Props) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignore if primarily vertical or too short
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    // RTL: swipe right = forward, swipe left = back
    if (dx > 0 && activeIndex < screens.length - 1) onIndexChange(activeIndex + 1);
    else if (dx < 0 && activeIndex > 0) onIndexChange(activeIndex - 1);
  }

  const pct = 100 / screens.length;

  return (
    <div
      style={{ overflow: 'hidden', flex: 1, position: 'relative', minHeight: 0 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          display: 'flex',
          width: `${screens.length * 100}%`,
          height: '100%',
          transform: `translateX(${-activeIndex * pct}%) translateZ(0)`,
          transition: 'transform 280ms ease-in-out',
          willChange: 'transform',
        }}
      >
        {screens.map((screen, i) => (
          <div
            key={i}
            style={{
              width: `${pct}%`,
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            {screen}
          </div>
        ))}
      </div>
    </div>
  );
}
