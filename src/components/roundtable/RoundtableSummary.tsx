import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface RoundtableSummaryProps {
  summary: string;
  onClose?: () => void;
}

export function RoundtableSummary({ summary, onClose }: RoundtableSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-amber-500" />
        <h3 className="text-base font-bold text-amber-700 dark:text-amber-300">
          讨论摘要
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            收起
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {summary}
      </div>
    </motion.div>
  );
}
