import { AnimatePresence, motion } from 'framer-motion';

const variants = {
  enter:  { x: '100%', opacity: 0 },
  center: { x: 0,      opacity: 1 },
  exit:   { x: '-100%', opacity: 0 },
};

const transition = {
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1],
};

interface Props {
  screenKey: string;
  children: React.ReactNode;
}

export function ScreenTransition({ screenKey, children }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
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
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
