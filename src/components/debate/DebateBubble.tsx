import { motion } from 'framer-motion';
import { DebateMessage } from '@/types';
import { renderCompactContent } from '@/utils/formatContent';

interface DebateBubbleProps {
  message: DebateMessage;
  isStreaming?: boolean;
}

export function DebateBubble({ message, isStreaming }: DebateBubbleProps) {
  const stanceLabel = (stance: 'pro' | 'con') => stance === 'pro' ? '正方' : '反方';

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%]">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-xs text-gray-400">{stanceLabel(message.stance)}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">你</span>
          </div>
          <div className="bg-amber-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
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

  // AI对手发言
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3"
    >
      {/* 头像 */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 bg-orange-100 dark:bg-orange-900/30">
        🤖
      </div>

      {/* 气泡 */}
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-gray-900 dark:text-white">AI辩手</span>
          <span className="text-xs text-gray-400">{stanceLabel(message.stance)}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {isStreaming ? (
              <>
                {message.content}
                <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-text-bottom" />
              </>
            ) : (
              renderCompactContent(message.content)
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
