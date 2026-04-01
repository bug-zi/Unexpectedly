import { motion } from 'framer-motion';
import { RoundtableMessage } from '@/types';
import { getThinkerById } from '@/constants/thinkers';

interface ThinkerBubbleProps {
  message: RoundtableMessage;
  isStreaming?: boolean;
}

export function ThinkerBubble({ message, isStreaming }: ThinkerBubbleProps) {
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] bg-amber-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  if (message.role === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // 大咖发言
  const thinker = getThinkerById(message.thinkerId || '');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3"
    >
      {/* 头像 */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5"
        style={{ backgroundColor: (thinker?.color || '#6366F1') + '20' }}
      >
        {thinker?.avatar || '🧑'}
      </div>

      {/* 气泡 */}
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {thinker?.name || '思想家'}
          </span>
          {message.round !== undefined && (
            <span className="text-xs text-gray-400">第{message.round}轮</span>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
