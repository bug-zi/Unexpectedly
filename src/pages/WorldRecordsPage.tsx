/**
 * 世界之最页面
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { worldRecordsData } from '@/constants/knowledgePopularize';

export function WorldRecordsPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedItems, setViewedItems] = useState<string[]>([]);

  useEffect(() => {
    // 加载已查看记录
    const viewed = JSON.parse(localStorage.getItem('knowledgeViewed') || '[]');
    setViewedItems(viewed);

    // 标记当前为已查看
    if (!viewed.includes(`world-records-${currentIndex}`)) {
      const newViewed = [...viewed, `world-records-${currentIndex}`];
      localStorage.setItem('knowledgeViewed', JSON.stringify(newViewed));
      setViewedItems(newViewed);
    }
  }, [currentIndex]);

  const currentItem = worldRecordsData[currentIndex];
  const isViewed = viewedItems.includes(`world-records-${currentIndex}`);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + worldRecordsData.length) % worldRecordsData.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % worldRecordsData.length);
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/knowledge-popularize')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
                世界之最
              </h1>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {worldRecordsData.length}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-green-200 dark:border-green-800 overflow-hidden"
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
                      <Trophy size={16} />
                      {isViewed && <span>已学习</span>}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {currentItem.title}
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
                  >
                    <Trophy size={32} className="text-white" />
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
                  className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-xl font-medium transition-all"
                >
                  <ChevronLeft size={20} />
                  上一个
                </motion.button>

                {/* 进度指示器 */}
                <div className="flex gap-2">
                  {worldRecordsData.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        index === currentIndex
                          ? 'w-8 bg-green-500'
                          : index < currentIndex
                          ? 'w-2 bg-green-300 dark:bg-green-700'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg"
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
            className="mt-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-green-200 dark:border-green-800 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              💡 点击进度点可以直接跳转到对应的知识点
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
