import { motion } from 'framer-motion';
import { PrimaryCategory, ThinkingDimension, LifeScenario } from '@/types';
import { THINKING_DIMENSIONS, LIFE_SCENARIOS } from '@/constants/categories';
import { CategoryIcon } from '@/components/ui/Icon';

interface CategoryGridProps {
  type: 'thinking' | 'scenario';
  onSelect: (id: string) => void;
}

export function CategoryGrid({ type, onSelect }: CategoryGridProps) {
  const categories =
    type === 'thinking' ? THINKING_DIMENSIONS : LIFE_SCENARIOS;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
    >
      {Object.values(categories).map((category) => (
        <motion.button
          key={category.id}
          variants={item}
          whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(category.id)}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-left transition-all border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800 group"
        >
          <CategoryIcon
            iconName={category.iconName || category.icon}
            color={category.color}
            size={40}
            className="mb-4 group-hover:scale-110 transition-transform"
          />
          <span className="font-semibold text-gray-900 dark:text-white text-lg">
            {category.name}
          </span>
          <div className="mt-3 h-1 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ backgroundColor: category.color }}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}
