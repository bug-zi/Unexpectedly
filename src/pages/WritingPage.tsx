/**
 * 写作创造主页面 - 包含老虎机和文笔挑战两个模块
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, PenTool, BookOpen, BarChart3, Shuffle, X } from 'lucide-react';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function WritingPage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [writingStats, setWritingStats] = useState({
    totalSlotMachines: 0,
    totalChallenges: 0,
    totalWords: 0
  });

  // 写作模块配置
  const writingModules = [
    {
      id: 'slot-machine',
      title: '灵感老虎机',
      path: '/slot-machine',
      icon: Sparkles
    },
    {
      id: 'writing-challenge',
      title: '文笔挑战',
      path: '/writing-challenge',
      icon: PenTool
    }
  ];

  // 加载统计数据
  useEffect(() => {
    loadWritingStats();
  }, []);

  const loadWritingStats = () => {
    // 从localStorage加载创作统计
    const slotMachineRecords = JSON.parse(localStorage.getItem('slotMachineRecords') || '[]');
    const challengeRecords = JSON.parse(localStorage.getItem('writingChallengeRecords') || '[]');

    // 计算总字数
    const totalWords = slotMachineRecords.reduce((sum: number, r: any) => sum + (r.wordCount || 0), 0) +
                      challengeRecords.reduce((sum: number, r: any) => sum + (r.wordCount || 0), 0);

    setWritingStats({
      totalSlotMachines: slotMachineRecords.length,
      totalChallenges: challengeRecords.length,
      totalWords
    });
  };

  const startRandomModule = () => {
    const randomIndex = Math.floor(Math.random() * writingModules.length);
    navigate(writingModules[randomIndex].path);
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-blue-900/30 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
              >
                <PenTool size={20} className="text-white" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
                写作创造
              </h1>
            </motion.div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomModule}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="随机开始创作"
              >
                <Shuffle size={18} />
                <span className="hidden md:inline">随机开始</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadWritingStats();
                  setShowStats(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="查看创作统计"
              >
                <BarChart3 size={18} />
                <span className="hidden md:inline">创作统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="模式说明"
              >
                <BookOpen size={18} />
                <span className="hidden md:inline">模式说明</span>
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
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-blue-200 dark:border-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
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
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <Sparkles size={20} />
                      灵感老虎机
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      随机抽取三个词语，激发你的创意灵感。根据词语组合进行自由创作，打破思维定式。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">创意</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">联想</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">自由</span>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-2">
                      <PenTool size={20} />
                      文笔挑战
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      根据给定的一句话开头，续写出精彩的故事。锻炼文笔和情节构思能力。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">写作</span>
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">故事</span>
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">挑战</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">💡 使用建议</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>灵感老虎机</strong>适合打破创作瓶颈，激发全新创意</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span><strong>文笔挑战</strong>适合锻炼写作技巧，提升文字表达能力</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>两种模式可以结合使用，先获取灵感再进行深度创作</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创作统计弹窗 */}
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
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-blue-200 dark:border-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">创作统计</h3>
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
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                    {writingStats.totalWords}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">总字数</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{writingStats.totalSlotMachines}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">老虎机次数</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{writingStats.totalChallenges}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">文笔挑战次数</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {writingStats.totalWords > 0 ? (
                      <span>太棒了！你已经创作了 <strong className="text-blue-600 dark:text-blue-400">{writingStats.totalWords}</strong> 字</span>
                    ) : (
                      <span>开始你的第一次创作吧！✨</span>
                    )}
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
              选择创作方式
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              两种不同的创作模式，激发你的无限创意
            </p>
          </motion.div>

          {/* 两个模块卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 老虎机模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/slot-machine')}
                className="group relative w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-cyan-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/30 rounded-full"
                      />
                      <Sparkles size={20} className="text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Sparkles size={48} className="text-blue-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    灵感老虎机
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    随机词语组合，激发无限创意联想
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    开始创作
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* 文笔挑战模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/writing-challenge')}
                className="group relative w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-cyan-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/30 rounded-full"
                      />
                      <PenTool size={20} className="text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <PenTool size={48} className="text-blue-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    文笔挑战
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    给出一句话，续写出精彩后文
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    开始挑战
                  </div>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
