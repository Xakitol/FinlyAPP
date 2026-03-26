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
    // Ignore swipes that started inside a data-no-swipe element
    let el = e.target as HTMLElement | null;
    while (el) {
      if (el.dataset?.noSwipe) return;
      el = el.parentElement;
    }
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    // RTL: swipe right (dx > 0) = next screen, swipe left (dx < 0) = prev screen
    if (dx > 0 && activeIndex < screens.length - 1) onIndexChange(activeIndex + 1);
    else if (dx < 0 && activeIndex > 0) onIndexChange(activeIndex - 1);
  }

  const n = screens.length;
  const pct = 100 / n;

  const offset = activeIndex * pct;

  return (
    <div
      style={{
        overflow: 'hidden',
        flex: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: `${n * 100}%`,
          height: '100%',
          transform: `translateX(${offset}%) translateZ(0)`,
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
              flexShrink: 0,
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {screen}
          </div>
        ))}
      </div>
    </div>
  );
}
