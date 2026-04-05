/**
 * 健康主理页面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HeartPulse, Activity, Apple, Moon, Droplets } from 'lucide-react';
import { healthKnowledgeData } from '@/constants/knowledgePopularize';

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function HealthManagementPage() {
  const navigate = useNavigate();
  const [shuffledData] = useState(() => shuffleArray(healthKnowledgeData));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedItems, setViewedItems] = useState<string[]>([]);

  useEffect(() => {
    // 加载已查看记录
    const viewed = JSON.parse(localStorage.getItem('knowledgeViewed') || '[]');
    setViewedItems(viewed);

    // 标记当前为已查看（用标题作为唯一标识）
    const itemKey = `health-management-${shuffledData[currentIndex].title}`;
    if (!viewed.includes(itemKey)) {
      const newViewed = [...viewed, itemKey];
      localStorage.setItem('knowledgeViewed', JSON.stringify(newViewed));
      setViewedItems(newViewed);
    }
  }, [currentIndex, shuffledData]);

  const currentItem = shuffledData[currentIndex];
  const isViewed = viewedItems.includes(`health-management-${currentItem.title}`);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + shuffledData.length) % shuffledData.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shuffledData.length);
  };

  const getHealthIcon = (title: string) => {
    if (title.includes('睡眠') || title.includes('休息')) return Moon;
    if (title.includes('运动') || title.includes('活动')) return Activity;
    if (title.includes('饮食') || title.includes('食物') || title.includes('酒精')) return Apple;
    if (title.includes('水分') || title.includes('水')) return Droplets;
    return HeartPulse;
  };

  return (
    <div className="min-h-screen noise-bg relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-picture/bg-konwledge2.jpg')" }}>
      {/* 背景融合层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/90 via-green-50/85 to-emerald-50/90 dark:from-gray-900/95 dark:via-teal-900/90 dark:to-green-900/90" />
      <div className="relative z-10 min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/knowledge-popularize')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center shadow-lg">
                <HeartPulse size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent hidden sm:block">
                健康主理
              </h1>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {shuffledData.length}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden"
            >
              {/* 头部 */}
              <div className="relative overflow-hidden px-8 py-6">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/85 to-green-600/85" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
                      <HeartPulse size={16} />
                      {isViewed && <span>已学习</span>}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {currentItem.title}
                    </h2>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ml-4"
                  >
                    {(() => {
                      const Icon = getHealthIcon(currentItem.title);
                      return <Icon size={32} className="text-white" />;
                    })()}
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
                  className="flex items-center gap-2 px-6 py-3 bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-400 rounded-xl font-medium transition-all"
                >
                  上一个
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-xl font-medium transition-all shadow-lg"
                >
                  下一个
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 健康提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 relative overflow-hidden rounded-2xl border-2 border-teal-200 dark:border-teal-800"
          >
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge2.jpg')" }} />
            <div className="relative z-10 p-6 bg-gradient-to-r from-teal-50/80 to-green-50/80 dark:from-teal-900/80 dark:to-green-900/80 backdrop-blur-md">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <HeartPulse size={20} className="text-teal-500" />
                健康提醒
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  <span>健康是长期投资，每天的小改变会积累成大不同</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>平衡饮食、规律运动、充足睡眠是健康三要素</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  <span>定期体检，预防胜于治疗</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>心理健康同样重要，必要时寻求专业帮助</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      </div>
    </div>
  );
}
