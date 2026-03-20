import { motion } from 'framer-motion';

export default function ProgressBar({ percent = 0, color = 'green', animate = true }) {
  // Determine bar color based on health
  let barColor = 'bg-green';
  if (percent > 90) {
    barColor = 'bg-red';
  } else if (percent >= 75) {
    barColor = 'bg-amber';
  } else {
    barColor = 'bg-green';
  }

  const containerColor =
    percent > 90 ? 'bg-red-soft' : percent >= 75 ? 'bg-amber-soft' : 'bg-green-soft';

  return (
    <div className={`h-2 w-full rounded-full ${containerColor} overflow-hidden`}>
      <motion.div
        className={`h-full ${barColor} rounded-full`}
        initial={animate ? { width: 0 } : { width: `${percent}%` }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={animate ? { duration: 0.6, ease: 'easeOut' } : { duration: 0 }}
      />
    </div>
  );
}
