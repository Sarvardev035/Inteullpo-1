import { motion } from 'framer-motion';
import clsx from 'clsx';

const buttonStyles = {
  base: 'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
  variants: {
    primary: 'bg-blue text-white hover:bg-blue-dark focus:ring-blue',
    secondary: 'bg-slate-200 text-text-1 hover:bg-slate-300 focus:ring-blue',
    danger: 'bg-red text-white hover:bg-red-600 focus:ring-red',
    ghost: 'text-blue hover:bg-blue-soft focus:ring-blue',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled = false,
  className,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={clsx(
        buttonStyles.base,
        buttonStyles.sizes[size],
        buttonStyles.variants[variant],
        className
      )}
      {...props}
    >
      {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </motion.button>
  );
}
