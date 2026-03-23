import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      autoResize = false,
      className,
      ...props
    },
    ref
  ) => {
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    };

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
        <textarea
          ref={ref}
          onInput={handleInput}
          className={clsx(
            'px-4 py-3 rounded-xl border resize-none',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'border-gray-300 dark:border-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error && 'border-red-500 focus:ring-red-500',
            fullWidth && 'w-full',
            'min-h-[120px]',
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

TextArea.displayName = 'TextArea';
