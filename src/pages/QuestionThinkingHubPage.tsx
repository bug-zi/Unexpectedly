import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Swords } from 'lucide-react';

/**
 * 问题思考 Hub 页面
 * 展示两个子模块入口：问题卡片 和 辩论堂
 */
export function QuestionThinkingHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <div className="sticky top-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">问题思考</h1>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-500 dark:text-gray-400 mb-8"
        >
          选择一个模块开始你的思维之旅
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* 问题卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/questions/explore')}
            className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-3xl p-8 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center mb-5">
              <Brain size={28} className="text-amber-600 dark:text-amber-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">问题卡片</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              精选问题，引导深度思考。通过双维度分类探索思维的新边界。
            </p>
          </motion.div>

          {/* 辩论堂 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/debate')}
            className="group cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700 rounded-3xl p-8 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center mb-5">
              <Swords size={28} className="text-violet-600 dark:text-violet-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">辩论堂</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              与AI辩手展开激烈辩论，锻炼思辨能力，提升逻辑表达。
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
