import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

interface DebateTopicCardProps {
  topic: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onSelectStance: (stance: 'pro' | 'con') => void;
}

export function DebateTopicCard({ topic, isGenerating, onGenerate, onSelectStance }: DebateTopicCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 辩题展示区域 */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700 rounded-3xl p-8 text-center mb-6">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={32} className="text-violet-500" />
              </motion.div>
              <p className="text-violet-600 dark:text-violet-300 font-medium">正在生成今日辩题...</p>
            </div>
          ) : topic ? (
            <>
              <div className="text-xs text-violet-400 mb-3 font-medium tracking-wider">今日辩题</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                {topic}
              </h2>
            </>
          ) : (
            <div className="py-8">
              <Sparkles size={40} className="text-violet-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">点击下方按钮生成辩题</p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {!topic && !isGenerating && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            生成今日辩题
          </motion.button>
        )}

        {/* 选择立场 */}
        {topic && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectStance('pro')}
              className="flex flex-col items-center gap-2 py-5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
            >
              <ThumbsUp size={28} className="text-emerald-500" />
              <span className="font-bold text-emerald-700 dark:text-emerald-300">正方</span>
              <span className="text-xs text-emerald-500">支持这个观点</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectStance('con')}
              className="flex flex-col items-center gap-2 py-5 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-2 border-rose-200 dark:border-rose-700 rounded-2xl hover:border-rose-400 dark:hover:border-rose-500 transition-colors"
            >
              <ThumbsDown size={28} className="text-rose-500" />
              <span className="font-bold text-rose-700 dark:text-rose-300">反方</span>
              <span className="text-xs text-rose-500">反对这个观点</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
