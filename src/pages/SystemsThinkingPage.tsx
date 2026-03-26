/**
 * 系统思维页面 - 多学科知识体系
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Network, ChevronLeft, ChevronRight, Brain, Users, Lightbulb } from 'lucide-react';
import { systemsThinkingData } from '@/constants/knowledgePopularize';

export function SystemsThinkingPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedItems, setViewedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // 加载已查看记录
    const viewed = JSON.parse(localStorage.getItem('knowledgeViewed') || '[]');
    setViewedItems(viewed);

    // 标记当前为已查看
    if (!viewed.includes(`systems-thinking-${currentIndex}`)) {
      const newViewed = [...viewed, `systems-thinking-${currentIndex}`];
      localStorage.setItem('knowledgeViewed', JSON.stringify(newViewed));
      setViewedItems(newViewed);
    }
  }, [currentIndex]);

  // 分类数据
  const categories = [
    { id: 'all', name: '全部', icon: Network },
    { id: '心理学', name: '心理学', icon: Brain },
    { id: '社会学', name: '社会学', icon: Users },
    { id: '科学', name: '科学', icon: Lightbulb },
    { id: '数学', name: '数学', icon: Lightbulb },
    { id: '哲学', name: '哲学', icon: Lightbulb },
    { id: '医学', name: '医学', icon: Brain }
  ];

  const filteredItems = selectedCategory === 'all'
    ? systemsThinkingData
    : systemsThinkingData.filter(item => item.category === selectedCategory);

  const currentItem = filteredItems[currentIndex] || systemsThinkingData[0];
  const isViewed = viewedItems.includes(`systems-thinking-${currentIndex}`);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-emerald-200 dark:border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/knowledge-popularize')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Network size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
                系统思维
              </h1>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {filteredItems.length}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 分类选择 */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} />
                    {category.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden"
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
                      <Network size={16} />
                      {currentItem.category || '跨学科'}
                      {isViewed && <span>• 已学习</span>}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {currentItem.title}
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center ml-4"
                  >
                    <Network size={32} className="text-white" />
                  </motion.div>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-8">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentItem.content}
                </p>
              </div>

              {/* 底部导航 */}
              <div className="px-8 pb-8 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl font-medium transition-all"
                >
                  <ChevronLeft size={20} />
                  上一个
                </motion.button>

                {/* 进度指示器 */}
                <div className="flex gap-2">
                  {filteredItems.slice(0, 10).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        index === currentIndex
                          ? 'w-8 bg-emerald-500'
                          : index < currentIndex
                          ? 'w-2 bg-emerald-300 dark:bg-emerald-700'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                  {filteredItems.length > 10 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                      +{filteredItems.length - 10}
                    </span>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg"
                >
                  下一个
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-emerald-200 dark:border-emerald-800"
          >
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Network size={20} className="text-emerald-500" />
              系统思维要点
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>各学科知识相互关联，形成整体认知</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>理解复杂系统的动态变化和相互作用</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>多角度思考问题，避免单一视角</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>关注长远影响和系统性后果</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
