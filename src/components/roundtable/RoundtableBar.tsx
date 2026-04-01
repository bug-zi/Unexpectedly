import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getThinkerById } from '@/constants/thinkers';

interface RoundtableBarProps {
  thinkerIds: string[];
  onRemove: (thinkerId: string) => void;
}

export function RoundtableBar({ thinkerIds, onRemove }: RoundtableBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-hide">
      <span className="text-xs text-gray-400 shrink-0">参与人:</span>
      <AnimatePresence>
        {thinkerIds.map(id => {
          const thinker = getThinkerById(id);
          if (!thinker) return null;

          return (
            <motion.div
              key={id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 shrink-0"
            >
              <span className="text-sm">{thinker.avatar}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {thinker.name}
              </span>
              <button
                onClick={() => onRemove(id)}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={10} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
