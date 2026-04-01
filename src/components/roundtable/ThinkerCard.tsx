import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Thinker } from '@/types';

interface ThinkerCardProps {
  thinker: Thinker;
  selected: boolean;
  onToggle: (thinkerId: string) => void;
  compact?: boolean;
  disabled?: boolean;
}

export function ThinkerCard({ thinker, selected, onToggle, compact, disabled: _disabled }: ThinkerCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(thinker.id)}
      disabled={_disabled}
      className={`relative p-3 rounded-xl border-2 transition-all text-left w-full
        ${selected
          ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/30 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-300 dark:hover:border-amber-700'
        }
        ${compact ? 'p-2' : 'p-3'}
      `}
    >
      {/* 选中标记 */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* 头像 */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: thinker.color + '20' }}
        >
          {thinker.avatar}
        </div>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
            {thinker.name}
          </div>
          {!compact && (
            <>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {thinker.nameEn} · {thinker.era}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 名言 */}
      {!compact && thinker.quote && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
          "{thinker.quote}"
        </p>
      )}
    </motion.button>
  );
}
