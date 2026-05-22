import { forwardRef } from 'react';
import { cn } from '../utils/format';

const Input = forwardRef(function Input(
  { label, error, className, icon: Icon, id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-gray-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800 px-4 py-2.5 text-sm',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            Icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
