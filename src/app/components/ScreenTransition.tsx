import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 1,
  }),
};

const transition = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1],
};

interface Props {
  screenKey: string;
  direction?: number;
  children: ReactNode;
}

export function ScreenTransition({ screenKey, direction = 1, children }: Props) {
  return (
    <AnimatePresence mode="sync" custom={direction}>
      <motion.div
        key={screenKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' as const,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
