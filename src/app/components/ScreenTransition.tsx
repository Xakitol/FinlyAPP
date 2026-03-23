import { useEffect, useRef, useState } from 'react';

interface Props {
  screenKey: string;
  direction?: number;
  transitionType?: 'slide' | 'fade';
  children: React.ReactNode;
}

export function ScreenTransition({ screenKey, direction = 1, transitionType = 'slide', children }: Props) {
  const [current, setCurrent] = useState({ key: screenKey, children });
  const [next, setNext] = useState<{ key: string; children: React.ReactNode } | null>(null);
  const [nextReady, setNextReady] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dirRef = useRef(direction);
  dirRef.current = direction;
  const transitionCount = useRef(0);

  useEffect(() => {
    if (screenKey === current.key) return;
    transitionCount.current += 1;
    setNext({ key: screenKey, children });
    setNextReady(false);
    setAnimating(true);

    // Double RAF guarantees the browser paints the off-screen position
    // before starting the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setNextReady(true);
      });
    });

    const t = setTimeout(() => {
      setCurrent({ key: screenKey, children });
      setNext(null);
      setNextReady(false);
      setAnimating(false);
    }, 280);

    return () => clearTimeout(t);
  }, [screenKey]);

  useEffect(() => {
    if (!animating) setCurrent(c => ({ ...c, children }));
  }, [children]);

  if (transitionType === 'fade') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: animating ? 0 : 1,
          transition: animating ? 'none' : 'opacity 200ms ease-in-out',
          pointerEvents: animating ? 'none' : 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {current.children}
        </div>
        {next && (
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: nextReady ? 1 : 0,
            transition: nextReady ? 'opacity 200ms ease-in-out' : 'none',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {next.children}
          </div>
        )}
      </div>
    );
  }

  const d = dirRef.current > 0 ? 1 : -1;
  const offScreen = `translateX(${d * -100}%)`;
  const onScreen = 'translateX(0)';

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Exiting screen — hides immediately */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: animating ? 0 : 1,
        transition: 'none',
        pointerEvents: animating ? 'none' : 'auto',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {current.children}
      </div>

      {/* Entering screen — starts off-screen, then slides in */}
      {next && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: nextReady ? onScreen : offScreen,
          transition: nextReady ? 'transform 250ms ease-in-out' : 'none',
          willChange: 'transform',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {next.children}
        </div>
      )}
    </div>
  );
}
