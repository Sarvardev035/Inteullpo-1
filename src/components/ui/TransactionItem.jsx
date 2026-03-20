import { motion } from 'framer-motion';
import { getCategoryMeta, formatCurrency } from '../../utils/helpers';
import { toReadableDate } from '../../utils/format';
import { itemVariants } from '../../utils/animations';

export default function TransactionItem({ transaction }) {
  const { emoji, label, bg, color } = getCategoryMeta(transaction.category);
  const isExpense = transaction.type === 'EXPENSE';
  const amount = isExpense ? -transaction.amount : transaction.amount;
  const amountColor = isExpense ? 'text-red' : 'text-green';

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-50"
    >
      {/* Category Icon */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg flex-shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-1 truncate">{label}</p>
        <p className="text-xs text-text-3">{toReadableDate(transaction.date)}</p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {isExpense ? '-' : '+'}
          {formatCurrency(Math.abs(amount), transaction.currency || 'UZS')}
        </p>
      </div>
    </motion.div>
  );
}
