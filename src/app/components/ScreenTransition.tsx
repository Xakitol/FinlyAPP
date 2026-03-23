import { useEffect, useRef, useState } from 'react';

interface Props {
  screenKey: string;
  direction?: number;
  children: React.ReactNode;
}

export function ScreenTransition({ screenKey, direction = 1, children }: Props) {
  const [displayKey, setDisplayKey] = useState(screenKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const dirRef = useRef(direction);
  dirRef.current = direction;

  useEffect(() => {
    if (screenKey === displayKey) return;
    setPhase('exit');
    const t1 = setTimeout(() => {
      setDisplayKey(screenKey);
      setDisplayChildren(children);
      setPhase('enter');
    }, 180);
    const t2 = setTimeout(() => setPhase('idle'), 360);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [screenKey]);

  useEffect(() => {
    if (phase === 'idle') setDisplayChildren(children);
  }, [children, phase]);

  const getStyle = (): React.CSSProperties => {
    const d = dirRef.current > 0 ? 1 : -1;
    if (phase === 'exit') return {
      transform: `translateX(${d * -30}%)`,
      opacity: 0,
      transition: 'transform 180ms ease-in, opacity 180ms ease-in',
    };
    if (phase === 'enter') return {
      transform: `translateX(${d * 20}%)`,
      opacity: 0,
      transition: 'none',
    };
    return {
      transform: 'translateX(0)',
      opacity: 1,
      transition: phase === 'idle' && displayKey === screenKey
        ? 'transform 220ms ease-out, opacity 220ms ease-out'
        : 'none',
    };
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      willChange: 'transform',
      transform: 'translateZ(0)',
      ...getStyle(),
    }}>
      {displayChildren}
    </div>
  );
}
