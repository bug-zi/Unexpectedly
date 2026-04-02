/**
 * 问题思考 Hub 页面
 * 展示两个子模块入口：问题卡片 和 辩论堂
 * 设计风格参考写作创造页面，黄色主色调
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Swords,
  BookOpen,
  BarChart3,
  Shuffle,
  X,
  History,
} from 'lucide-react';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function QuestionThinkingHubPage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 思考模块配置
  const thinkingModules = [
    {
      id: 'question-card',
      title: '问题卡片',
      path: '/questions/explore',
      icon: Brain,
    },
    {
      id: 'debate',
      title: '辩论堂',
      path: '/debate',
      icon: Swords,
    },
  ];

  const startRandomModule = () => {
    const randomIndex = Math.floor(Math.random() * thinkingModules.length);
    navigate(thinkingModules[randomIndex].path);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-question.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 背景遮罩层 - 黄色主题 */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/85 via-amber-50/80 to-orange-50/85 dark:from-gray-900/90 dark:via-yellow-900/85 dark:to-gray-800/90 z-0" />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid grid-cols-3 items-center h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: customEasing.unexpected }}
                className="relative inline-flex items-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="absolute right-[calc(100%+6px)] w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Brain size={20} className="text-yellow-500 dark:text-yellow-400" />
                </motion.div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  问题思考
                </h1>
              </motion.div>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all whitespace-nowrap"
                title="模式说明"
              >
                <BookOpen size={18} />
                <span>模式说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomModule}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all whitespace-nowrap"
                title="随机开始思考"
              >
                <Shuffle size={18} />
                <span>随机开始</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all whitespace-nowrap"
                title="查看思考统计"
              >
                <BarChart3 size={18} />
                <span>思考统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all whitespace-nowrap"
                title="查看历史记录"
              >
                <History size={18} />
                <span>历史记录</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 模式说明弹窗 */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-yellow-200 dark:border-yellow-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">模式说明</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInstructions(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                      <Brain size={20} />
                      问题卡片
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      精选问题，引导深度思考。通过双维度分类探索思维的新边界。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full">
                        深度
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full">
                        探索
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full">
                        反思
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <Swords size={20} />
                      辩论堂
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      与AI辩手展开激烈辩论，锻炼思辨能力，提升逻辑表达。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full">
                        思辨
                      </span>
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full">
                        逻辑
                      </span>
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full">
                        对抗
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    使用建议
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>
                        <strong>问题卡片</strong>
                        适合独自深度思考，发现新的思维角度
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>
                        <strong>辩论堂</strong>
                        适合锻炼逻辑思维和表达能力，从多角度看待问题
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>
                        两种模式可以结合使用，先深度思考再进行辩论验证
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 思考统计弹窗 */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-yellow-200 dark:border-yellow-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">思考统计</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStats(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-2">
                    --
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">总思考字数</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      --
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      问题探索次数
                    </div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      --
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      辩论次数
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    开始你的第一次深度思考吧！
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              选择思考方式
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              两种不同的思考模式，激发你的深度思维
            </p>
          </motion.div>

          {/* 两个模块卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 问题卡片模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/questions/explore')}
                className="group relative w-full rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-yellow-200 dark:border-yellow-800 hover:border-amber-400 dark:hover:border-amber-600 p-8 text-left overflow-hidden cursor-pointer"
                style={{
                  backgroundImage: 'url(/UI-picture/UI-question1.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* 背景遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 via-amber-50/70 to-orange-50/75 dark:from-gray-900/85 dark:via-yellow-900/80 dark:to-gray-800/85" />

                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-yellow-500/30 rounded-full"
                      />
                      <Brain size={20} className="text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Brain size={48} className="text-yellow-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    问题卡片
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">
                    精选问题，引导深度思考探索
                  </p>
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                    开始探索
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* 辩论堂模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/debate')}
                className="group relative w-full rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-yellow-200 dark:border-yellow-800 hover:border-amber-400 dark:hover:border-amber-600 p-8 text-left overflow-hidden cursor-pointer"
                style={{
                  backgroundImage: 'url(/UI-picture/UI-question2.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* 背景遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-yellow-50/70 to-orange-50/75 dark:from-gray-900/85 dark:via-amber-900/80 dark:to-gray-800/85" />

                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-amber-500/30 rounded-full"
                      />
                      <Swords size={20} className="text-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Swords size={48} className="text-amber-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    辩论堂
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">
                    与AI辩手辩论，锻炼思辨能力
                  </p>
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                    开始辩论
                  </div>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
      </div>{/* 内容层结束 */}
    </div>
  );
}
