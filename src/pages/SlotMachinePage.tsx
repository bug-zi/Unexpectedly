import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SlotMachine } from '@/components/features/SlotMachine';
import { EasterEgg } from '@/types';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function SlotMachinePage() {
  const navigate = useNavigate();

  const handleSpinComplete = (
    spinWords: [string, string, string],
    egg?: EasterEgg
  ) => {
    // 跳转到答案页面，并传递数据
    navigate('/slot-machine/answer', {
      state: {
        words: spinWords,
        easterEgg: egg || null,
      },
    });
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-blue-900/30 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/writing')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                灵感老虎机
              </h1>
            </motion.div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              灵感老虎机
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              三个随机词语碰撞出你意想不到的创意火花
            </p>
          </motion.div>

          {/* 老虎机 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: customEasing.unexpected }}
          >
            <SlotMachine onSpinComplete={handleSpinComplete} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
