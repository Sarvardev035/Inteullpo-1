import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  disabled = false,
  required = false,
  className,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-1">
          {label}
          {required && <span className="ml-1 text-red">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3">
            <Icon size={18} />
          </div>
        )}

        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={type}
          disabled={disabled}
          className={clsx(
            'w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-1 placeholder-text-3 transition-colors',
            'focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20',
            'disabled:bg-slate-50 disabled:text-text-3 disabled:cursor-not-allowed',
            error && 'border-red focus:ring-red/20 focus:border-red',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
