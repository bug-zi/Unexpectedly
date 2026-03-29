/**
 * 首页 - 三个主要功能入口
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Gamepad2, CircleDashed, Brain, Sparkles, Star, Clock, Bell, TrendingUp, ArrowRight, Lightbulb, Puzzle, Zap, Copy, RefreshCw, BookOpen, Info, Calendar, User, Target } from 'lucide-react';
import { getRandomQuestion } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { Icon } from '@/components/ui/Icon';

// 自定义缓动曲线
const customEasing = {
  elastic: [0.68, -0.55, 0.265, 1.55],
  unexpected: [0.87, 0, 0.13, 1],
};

// 浮动装饰元素组件
const FloatingShape = ({ children, delay, duration = 6, className = '' }: { children: React.ReactNode; delay: number; duration?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.6, scale: 1 }}
    transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    className={`absolute pointer-events-none ${className}`}
  >
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// 脉波动画组件
const PulseRing = ({ className }: { className?: string }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 0, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`absolute inset-0 rounded-full border-2 border-current ${className}`}
  />
);


// 思考/推理语料库 - 50句
const thinkingQuotes = [
  "逻辑不是知识的全部，却是所有知识的出发点。",
  "每一个坚实的结论背后，都站着一排无声的证据。",
  "推理的本质，是从已知的碎片中重构未知的全貌。",
  "如果前提是错的，再严密的逻辑也只会带你走向更远的谬误。",
  "因果律是世界的脊梁，而推理则是顺着脊梁攀爬的过程。",
  "排除所有不可能，剩下的无论多么不可思议，都是真相。",
  "定义不清的讨论，只是在不同频率上的无效呼喊。",
  "逻辑是思维的语法，确保我们不仅在说话，而且在表达意义。",
  "归纳法让我们认识世界，演绎法让我们理解世界。",
  "逻辑的力量在于：它能强迫你的头脑承认它并不想接受的结论。",
  "思考不是为了寻找标准答案，而是为了拆解问题的本质。",
  "伟大的发现往往源于对「理所当然」的第一次怀疑。",
  "洞察力是看穿表象的X射线，能发现事物间隐秘的关联。",
  "所谓直觉，往往是高度熟练后的瞬间推理。",
  "深度思考是孤独的，因为你需要穿过常识的丛林。",
  "最简单的问题，往往需要最深刻的推理才能回答。",
  "观察是收集拼图，而思考是拼合过程。",
  "能够站在对手的角度进行推理，是心智成熟的标志。",
  "偏见是思维的围墙，思考则是拆除围墙的锤子。",
  "真正的深刻，是能将复杂的事物归纳为简单的真理。",
  "怀疑不是终点，而是通往确信的必经之路。",
  "永远不要爱上你的第一个假设。",
  "批判性思维最重要的目标，是审视自己的思维模型。",
  "当所有人的想法都一样时，说明没有人真的在思考。",
  "警惕那些完美的逻辑，因为现实往往充满了随机的杂音。",
  "证伪比证实更有力量，因为它能剔除错误的幻想。",
  "知识的边界由逻辑划定，而认知的疆域由怀疑拓展。",
  "保持开放的心态，但别让你的大脑因为太开放而掉出来。",
  "推理的陷阱通常不在于计算错误，而在于情感倾向。",
  "所有的共识都值得被再次审视。",
  "思考的深度决定了选择的高度。",
  "决策是推理在现实世界中的落脚点。",
  "概率是理性的语言，世界并非非黑即白。",
  "平庸的思维寻找借口，优秀的思维寻找变量。",
  "长期主义的本质，是对未来因果链条的坚定推演。",
  "在信息不足的情况下保持冷静，也是一种高级的逻辑。",
  "推理不仅是向前预测，更是向后追溯失败的根源。",
  "最好的决策不是没有风险，而是算清了风险。",
  "思维模型就像工具箱，你拥有的工具越多，看世界的维度越广。",
  "战略是思考的艺术，而执行是逻辑的验证。",
  "我思故我在。",
  "思想的力量远比枪炮更有穿透力。",
  "思考是灵魂与自己的对话。",
  "逻辑是严寒中的火种，照亮混乱中的秩序。",
  "博学而不思，如同吃下食物却不消化。",
  "推理是连接已知岸边与未知彼岸的桥梁。",
  "智慧的增长不在于信息的积累，而在于对信息处理方式的进化。",
  "逻辑可以带你从A走到B，而想象力和推理能带你去任何地方。",
  "一个人的思维疆域，就是他世界的边界。",
  "终身思考者，永远不会在平庸中老去。",
];

export function HomePage() {
  const navigate = useNavigate();
  const { setCurrentQuestion } = useAppStore();
  const [currentThinkingQuote, setCurrentThinkingQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 初始化思考语料库
    const randomIndex = Math.floor(Math.random() * thinkingQuotes.length);
    setQuoteIndex(randomIndex);
    setCurrentThinkingQuote(thinkingQuotes[randomIndex]);

    // 设置10秒自动切换
    intervalRef.current = setInterval(() => {
      setQuoteIndex((prev) => {
        const nextIndex = (prev + 1) % thinkingQuotes.length;
        setCurrentThinkingQuote(thinkingQuotes[nextIndex]);
        return nextIndex;
      });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 刷新当前句子
  const handleRefreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * thinkingQuotes.length);
      setQuoteIndex(randomIndex);
      setCurrentThinkingQuote(thinkingQuotes[randomIndex]);
      setIsRefreshing(false);

      // 重置定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setQuoteIndex((prev) => {
          const nextIndex = (prev + 1) % thinkingQuotes.length;
          setCurrentThinkingQuote(thinkingQuotes[nextIndex]);
          return nextIndex;
        });
      }, 10000);
    }, 300);
  };

  // 复制当前句子
  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(currentThinkingQuote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* 背景浮动装饰元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingShape delay={0} duration={8} className="top-20 left-[10%]">
          <div className="w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
        </FloatingShape>
        <FloatingShape delay={0.5} duration={7} className="top-40 right-[15%]">
          <div className="w-32 h-32 bg-pink-500/10 rounded-full blur-xl" />
        </FloatingShape>
        <FloatingShape delay={1} duration={9} className="bottom-40 left-[20%]">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
        </FloatingShape>
        <FloatingShape delay={1.5} duration={6} className="bottom-20 right-[10%]">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full blur-xl" />
        </FloatingShape>

        {/* 浮动图标 */}
        <FloatingShape delay={2} duration={10} className="top-[30%] right-[8%]">
          <Lightbulb size={40} className="text-yellow-500/20" />
        </FloatingShape>
        <FloatingShape delay={2.5} duration={8} className="top-[60%] left-[5%]">
          <Puzzle size={32} className="text-blue-500/20" />
        </FloatingShape>
        <FloatingShape delay={3} duration={7} className="bottom-[30%] right-[25%]">
          <Zap size={36} className="text-purple-500/20" />
        </FloatingShape>
      </div>

      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
              >
                <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-transparent">
                  万万没想到
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  每日思维提升工具
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAboutModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Info size={18} />
                <span>介绍</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/landing')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Sparkles size={18} />
                <span>体验介绍</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/checkin')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Calendar size={18} />
                <span>签到</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Target size={18} />
                <span>任务</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notifications')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Bell size={18} />
                <span>提醒</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <User size={18} />
                <span>我的</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero 标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEasing.elastic }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              今天你想探索什么？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              选择一个入口，开启你的思维之旅
            </p>
          </motion.div>

          {/* 四个主要功能入口 - 增强动画 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* 逻辑推理入口 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.1 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/logic-reasoning')}
                className="group relative w-full bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-red-200 dark:border-red-800 hover:border-rose-400 dark:hover:border-rose-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/30 rounded-full"
                      />
                      <Puzzle size={20} className="text-red-500" />
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
                      <Puzzle size={48} className="text-red-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    逻辑推理
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    推理思考，锻炼逻辑思维
                  </p>
                  <motion.div
                    className="flex items-center text-red-600 dark:text-red-400 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    开始推理
                    <ArrowRight size={20} className="ml-2" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>

            {/* 问题思考入口 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.2 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/questions')}
                className="group relative w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-amber-200 dark:border-amber-800 hover:border-orange-400 dark:hover:border-orange-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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
                      <Brain size={20} className="text-amber-500" />
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
                      <Brain size={48} className="text-amber-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    问题思考
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    精选问题，引导深度思考
                  </p>
                  <motion.div
                    className="flex items-center text-amber-600 dark:text-amber-400 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    开始探索
                    <ArrowRight size={20} className="ml-2" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>

            {/* 写作创造入口 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.3 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/writing')}
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
                    写作创造
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    激发创意，创造精彩内容
                  </p>
                  <motion.div
                    className="flex items-center text-blue-600 dark:text-blue-400 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    开始创作
                    <ArrowRight size={20} className="ml-2" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>

            {/* 知识科普入口 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.4 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/knowledge-popularize')}
                className="group relative w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 dark:border-green-800 hover:border-emerald-400 dark:hover:border-emerald-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500/30 rounded-full"
                      />
                      <BookOpen size={20} className="text-green-500" />
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
                      <BookOpen size={48} className="text-green-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    知识科普
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    科学知识，拓展认知边界
                  </p>
                  <motion.div
                    className="flex items-center text-green-600 dark:text-green-400 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    探索知识
                    <ArrowRight size={20} className="ml-2" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          </div>

          {/* 思考语料库 - 玻璃质感卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                {/* 背景光晕 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl rounded-3xl" />

                {/* 玻璃质感背景 */}
                <div className="relative p-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-gray-600/40 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    {/* 左侧装饰图标 */}
                    <motion.div
                      className="flex-shrink-0"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="p-5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl shadow-lg">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-purple-500/30 rounded-full"
                          />
                          <Sparkles size={48} className="text-purple-500" />
                        </div>
                      </div>
                    </motion.div>

                    {/* 中间语料库内容 */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        思考金句
                      </h3>
                      <motion.p
                        key={quoteIndex}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl text-gray-800 dark:text-gray-200 font-medium leading-relaxed"
                      >
                        "{currentThinkingQuote}"
                      </motion.p>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyQuote}
                        className="p-3 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-2xl transition-all backdrop-blur-sm shadow-md"
                        title={copied ? "已复制！" : "复制"}
                      >
                        <Copy size={24} className={copied ? "text-green-500" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRefreshQuote}
                        className="p-3 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-2xl transition-all backdrop-blur-sm shadow-md"
                        title="刷新"
                      >
                        <RefreshCw
                          size={24}
                          className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 项目介绍弹窗 */}
      <AnimatePresence>
        {aboutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setAboutModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles size={32} className="text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">万万没想到</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAboutModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ArrowRight size={24} className="text-white" />
                  </motion.button>
                </div>
                <p className="text-white/90 mt-2">每日思维提升工具</p>
              </div>

              {/* 内容区域 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* 项目介绍 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Sparkles size={20} className="text-purple-500" />
                      关于项目
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>万万没想到</strong>是一款精心设计的每日思维提升工具。通过精心挑选的问题、创意游戏和知识科普，帮助你每天进行深度思考，拓展认知边界，提升创造力。
                    </p>
                  </div>

                  {/* 四大核心功能 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Brain size={20} className="text-blue-500" />
                      核心功能
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Puzzle size={18} className="text-red-500" />
                          <h4 className="font-bold text-gray-900 dark:text-white">逻辑推理</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">推理悬疑，还原真相</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={18} className="text-amber-500" />
                          <h4 className="font-bold text-gray-900 dark:text-white">问题思考</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">精选问题，深度思考</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={18} className="text-blue-500" />
                          <h4 className="font-bold text-gray-900 dark:text-white">写作创造</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">激发创意，创造内容</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={18} className="text-green-500" />
                          <h4 className="font-bold text-gray-900 dark:text-white">知识科普</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">科学知识，拓展认知</p>
                      </div>
                    </div>
                  </div>

                  {/* 特色亮点 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Lightbulb size={20} className="text-yellow-500" />
                      特色亮点
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Zap size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>海龟汤游戏</strong>：经典的情境推理游戏，通过提问还原故事真相
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>灵感老虎机</strong>：随机词语组合，激发无限创意联想
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>成长追踪</strong>：记录你的思考历程，见证思维的成长
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>云端同步</strong>：支持数据备份，随时随地继续思考
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* 使用建议 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen size={20} className="text-green-500" />
                      使用建议
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      建议每天花 10-15 分钟，选择一个问题深入思考并写下你的想法。持续练习，你会发现自己的思维变得更加敏捷、创造力和逻辑推理能力也在不断提升。
                    </p>
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAboutModalOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all"
                >
                  开始探索
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
