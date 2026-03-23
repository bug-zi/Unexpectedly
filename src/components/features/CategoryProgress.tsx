import { motion } from 'framer-motion';
import { CategoryConfig } from '@/types';

interface CategoryProgressProps {
  category: CategoryConfig;
  count: number;
  total: number;
  percentage: number;
}

export function CategoryProgress({
  category,
  count,
  total,
  percentage,
}: CategoryProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {category.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">
            {count}个
          </span>
          <span className="text-gray-500 dark:text-gray-500">
            ({percentage.toFixed(0)}%)
          </span>
        </div>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: category.color }}
        />
      </div>
    </div>
  );
}
