import { motion } from 'framer-motion';
import { CountUp } from 'react-countup';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cardVariants } from '../../utils/animations';

export default function StatCard({
  label,
  value,
  change,
  changeType = 'increase',
  prefix = '',
  suffix = '',
  loading = false,
  color = 'blue',
}) {
  const isPositive = changeType === 'increase';
  const changeColor = isPositive ? 'text-green' : 'text-red';
  const bgColor = isPositive ? 'bg-green-soft' : 'bg-red-soft';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="rounded-xl bg-surface p-5 shadow-sm"
    >
      <p className="text-sm font-medium text-text-3">{label}</p>

      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
      ) : (
        <div className="mt-2 flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-text-1">
            {prefix}
            <CountUp
              end={typeof value === 'number' ? value : 0}
              decimals={typeof value === 'number' && value % 1 !== 0 ? 2 : 0}
              duration={0.8}
              preserveValue
            />
            {suffix}
          </h3>
        </div>
      )}

      {change !== undefined && change !== null && (
        <div className={`mt-3 inline-flex items-center gap-1 rounded px-2 py-1 ${bgColor}`}>
          {isPositive ? (
            <TrendingUp size={14} className={changeColor} />
          ) : (
            <TrendingDown size={14} className={changeColor} />
          )}
          <span className={`text-xs font-semibold ${changeColor}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
