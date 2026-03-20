import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ children, content, side = 'top' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!content) return children;

  const getPosition = () => {
    switch (side) {
      case 'right':
        return { top: 0, left: '100%', ml: 8 };
      case 'left':
        return { top: 0, right: '100%', mr: 8 };
      case 'bottom':
        return { top: '100%', left: '50%', mt: 8, ml: '-50%' };
      default: // top
        return { bottom: '100%', left: '50%', mb: 8, ml: '-50%' };
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white pointer-events-none"
            style={getPosition()}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
