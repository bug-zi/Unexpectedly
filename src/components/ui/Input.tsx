import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'px-4 py-2 rounded-xl border',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'border-gray-300 dark:border-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error && 'border-red-500 focus:ring-red-500',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
