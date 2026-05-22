import { motion } from 'framer-motion';
import { cn } from '../utils/format';

export default function Card({ children, className, hover, onClick, ...props }) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-200 dark:border-slate-700/50',
        'bg-white dark:bg-slate-900 p-6 shadow-card dark:shadow-card-dark',
        hover && 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
