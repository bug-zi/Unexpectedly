/**
 * 知识科普页面 - 包含世界之最、系统思维、健康主理三个模块
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, BarChart3, Trophy, Network, HeartPulse, X, MessageCircle, Sparkles } from 'lucide-react';
import { knowledgeModules } from '@/constants/knowledgePopularize';
import { GiWorld } from 'react-icons/gi';

export function KnowledgePopularizePage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [knowledgeStats, setKnowledgeStats] = useState({
    totalViewed: 0,
    worldRecordsViewed: 0,
    systemsThinkingViewed: 0,
    healthManagementViewed: 0
  });

  // 加载统计数据
  useEffect(() => {
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = () => {
    // 从localStorage加载阅读统计
    const viewedItems = JSON.parse(localStorage.getItem('knowledgeViewed') || '[]');

    const worldRecordsCount = viewedItems.filter((id: string) => id.startsWith('world-records')).length;
    const systemsThinkingCount = viewedItems.filter((id: string) => id.startsWith('systems-thinking')).length;
    const healthManagementCount = viewedItems.filter((id: string) => id.startsWith('health-management')).length;

    setKnowledgeStats({
      totalViewed: viewedItems.length,
      worldRecordsViewed: worldRecordsCount,
      systemsThinkingViewed: systemsThinkingCount,
      healthManagementViewed: healthManagementCount
    });
  };

  const startRandomModule = () => {
    const randomIndex = Math.floor(Math.random() * knowledgeModules.length);
    navigate(knowledgeModules[randomIndex].path);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return Trophy;
      case 'Network':
        return Network;
      case 'HeartPulse':
        return HeartPulse;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题和图标 */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
              >
                <BookOpen size={24} className="text-white" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
                知识科普
              </h1>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomModule}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="随机开始学习"
              >
                <BarChart3 size={18} />
                <span className="hidden md:inline">随机开始</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadKnowledgeStats();
                  setShowStats(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="查看学习统计"
              >
                <Trophy size={18} />
                <span className="hidden md:inline">学习统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="模块说明"
              >
                <BookOpen size={18} />
                <span className="hidden md:inline">模块说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/knowledge-popularize/ai-ask')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                title="AI 智能问答"
              >
                <MessageCircle size={18} />
                <span className="hidden md:inline">AI 问答</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              选择你的
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {' '}知识模块
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              探索世界之最、学习系统思维、管理健康生活，用科学知识武装头脑
            </p>
          </motion.div>

          {/* 模块卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {knowledgeModules.map((module, index) => {
              const Icon = getIconComponent(module.icon);
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(module.path)}
                  className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 dark:border-green-800 overflow-hidden cursor-pointer group`}
                >
                  {/* 背景装饰 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* 内容 */}
                  <div className="relative p-8">
                    {/* 图标和标题 */}
                    <div className="mb-6">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      >
                        <Icon size={32} className="text-green-600 dark:text-green-400" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {module.title}
                      </h3>
                      <div className={`h-1 w-12 bg-gradient-to-r ${module.gradient} rounded-full mb-3`} />
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      {module.description}
                    </p>

                    {/* 知识点数量 */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {module.items.length} 个知识点
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        开始学习 →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI 问答入口 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/knowledge-popularize/ai-ask')}
            className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 dark:from-green-600 dark:via-emerald-600 dark:to-teal-600 rounded-3xl shadow-2xl p-8 cursor-pointer overflow-hidden group mb-8"
          >
            {/* 背景动画 */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], y: [0, 30, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* 内容 */}
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <MessageCircle size={28} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white">
                    AI 智能问答
                  </h3>
                </div>
                <p className="text-white/90 text-lg max-w-2xl">
                  有任何关于世界之最、系统思维或健康管理的问题？直接问我，我会用AI为你详细解答！
                </p>
              </div>

              {/* 右侧动画 */}
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden md:block"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={40} className="text-white" />
                </div>
              </motion.div>
            </div>

            {/* 脉波效果 */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* 学习提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-800"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={24} className="text-green-500" />
              学习建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>每天学习</strong>少量知识点，避免信息过载</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>联系实际</strong>思考知识如何应用到生活</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>定期复习</strong>巩固已学知识，强化记忆</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>分享讨论</strong>与他人交流，加深理解</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 模块说明弹窗 */}
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-green-200 dark:border-green-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">模块说明</h3>
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
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                      <Trophy size={20} />
                      世界之最
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      探索世界纪录和自然奇观，了解地球的极限与奇迹。从最高的山峰到最深的海洋，从最大的生物到最小的国家。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">地理</span>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">自然</span>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">纪录</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <Network size={20} />
                      系统思维
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      多学科知识体系，融合心理学、社会学、科学、数学、哲学、医学等学科，培养系统性思考能力。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full">心理学</span>
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full">社会学</span>
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full">跨学科</span>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                    <h4 className="font-bold text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
                      <HeartPulse size={20} />
                      健康主理
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      普及重要的健康知识，涵盖运动、饮食、睡眠、心理健康等方面，科学管理身体健康。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full">健康</span>
                      <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full">生活</span>
                      <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full">科学</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 学习统计弹窗 */}
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-green-200 dark:border-green-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">学习统计</h3>
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
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                    {knowledgeStats.totalViewed}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">已学知识点</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Trophy size={20} className="text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">世界之最</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{knowledgeStats.worldRecordsViewed}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Network size={20} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">系统思维</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{knowledgeStats.systemsThinkingViewed}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <HeartPulse size={20} className="text-teal-600 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-300">健康主理</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{knowledgeStats.healthManagementViewed}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
