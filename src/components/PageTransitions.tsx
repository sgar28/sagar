import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  isVisible?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate';
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  rotate: {
    initial: { rotate: -10, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 10, opacity: 0 },
  },
};

const transition = {
  duration: 0.3,
  ease: [0.43, 0.13, 0.23, 0.96],
};

export const PageTransition = ({ 
  children, 
  isVisible = true, 
  animation = 'fade' 
}: PageTransitionProps) => {
  const animationVariants = animations[animation];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animationVariants}
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const FadeIn = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export const Bounce = ({ children }: { children: ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {children}
  </motion.div>
); 