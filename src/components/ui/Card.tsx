import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'rounded-2xl',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
