import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../utils/format';

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white',
  outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 dark:text-brand-400',
  ghost: 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  icon: Icon,
  to,
  type = 'button',
  ...props
}) {
  const classes = cn(baseClass, variants[variant], sizes[size], className);

  const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn(classes, (disabled || loading) && 'pointer-events-none opacity-50')}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </motion.button>
  );
}
