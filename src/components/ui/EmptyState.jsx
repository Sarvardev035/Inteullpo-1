import { motion } from 'framer-motion';
import { fadeInVariants } from '../../utils/animations';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center rounded-xl bg-surface p-8 text-center shadow-sm"
    >
      {Icon && (
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-soft">
          <Icon size={32} className="text-blue" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-text-1">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-text-3 max-w-sm">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
