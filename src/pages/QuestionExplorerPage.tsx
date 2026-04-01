/**
 * 问题探索页面
 * 显示当前问题卡片和2个分类模块：思维维度、生活场景
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestionCard } from '@/components/features/QuestionCard';
import { ArrowLeft, Brain, Globe, Star, BookOpen, Sparkles, FileText } from 'lucide-react';
import { getRandomQuestion } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { Icon } from '@/components/ui/Icon';

// 自定义缓动曲线
const customEasing = {
  elastic: [0.68, -0.55, 0.265, 1.55],
  unexpected: [0.87, 0, 0.13, 1],
};

export function QuestionExplorerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentQuestion } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setQuestion] = useState(() => getRandomQuestion());

  const handleStartThinking = () => {
    setCurrentQuestion(currentQuestion);
    navigate(`/question/${currentQuestion.id}`);
  };

  const handleRoundtable = () => {
    setCurrentQuestion(currentQuestion);
    navigate(`/roundtable/setup?q=${currentQuestion.id}`);
  };

  const handleSkipQuestion = () => {
    if (selectedCategory) {
      const question = getRandomQuestion(selectedCategory);
      setQuestion(question);
    } else {
      const question = getRandomQuestion();
      setQuestion(question);
    }
  };

  const handleResetCategory = () => {
    setSelectedCategory(null);
    const question = getRandomQuestion();
    setQuestion(question);
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-2 py-1.5 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
              <span className="text-sm hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2 px-2 min-w-0"
            >
              <Icon name="Brain" size={20} className="text-amber-500 shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300 truncate">
                问题探索
              </h1>
            </motion.div>

            {/* 右侧：四个功能按钮 */}
            <div className="flex items-center gap-1 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/favorites')}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                title="收藏"
              >
                <Star size={16} />
                <span className="hidden lg:inline">收藏</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/later')}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="待思考"
              >
                <BookOpen size={16} />
                <span className="hidden lg:inline">待思考</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/question-generator')}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                title="创建问题"
              >
                <Sparkles size={16} />
                <span className="hidden lg:inline">创建问题</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/growth')}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                title="成长记录"
              >
                <FileText size={16} />
                <span className="hidden lg:inline">成长记录</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 - 三栏布局 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              开启思维之旅
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              选择探索方式，每天进步一点点
            </p>
          </motion.div>

          {/* 主布局：问题卡片居中，分类按钮在下方 */}
          <div className="flex flex-col items-center">
            {/* 问题卡片 - 主角 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected }}
              className="w-full max-w-3xl mb-8"
            >
              <QuestionCard
                question={currentQuestion}
                onStart={handleStartThinking}
                onSkip={handleSkipQuestion}
                onRoundtable={handleRoundtable}
              />
            </motion.div>

            {/* 分类探索 - 辅助选项 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.2 }}
              className="w-full max-w-3xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-700 to-transparent"></div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 px-3">
                  或按分类探索
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-700 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 思维维度 */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/categories/thinking')}
                  className="group p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg group-hover:scale-110 transition-transform">
                      <Brain size={24} className="text-amber-500" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        思维维度
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        假设、逆向、创意、反思、未来
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* 生活场景 */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/categories/scenario')}
                  className="group p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-amber-200 dark:border-amber-800 hover:border-yellow-400 dark:hover:border-yellow-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg group-hover:scale-110 transition-transform">
                      <Globe size={24} className="text-amber-500" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        生活场景
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        工作、创意、关系、学习、哲学
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
