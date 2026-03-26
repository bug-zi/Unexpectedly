/**
 * 逻辑推理模块主页面
 * 包含四个子游戏：海龟汤、谜语人、Yes or No、猜数字
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Puzzle, Lightbulb, HelpCircle, Hash, BookOpen, BarChart3, Shuffle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  gradient: string;
  borderColor: string;
  textColor: string;
}

export function LogicReasoningPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    turtleSoupWins: 0,
    riddleWins: 0,
    yesOrNoWins: 0,
    guessNumberWins: 0
  });

  // 加载游戏统计数据
  useEffect(() => {
    loadGameStats();
  }, []);

  const loadGameStats = () => {
    // 从localStorage加载各游戏统计
    const turtleSoupRecords = JSON.parse(localStorage.getItem('turtleSoupRecords') || '[]');
    const riddleRecords = JSON.parse(localStorage.getItem('riddleRecords') || '[]');
    const yesOrNoRecords = JSON.parse(localStorage.getItem('yesOrNoRecords') || '[]');
    const guessNumberRecords = JSON.parse(localStorage.getItem('guessNumberRecords') || '[]');

    setGameStats({
      totalGames: turtleSoupRecords.length + riddleRecords.length + yesOrNoRecords.length + guessNumberRecords.length,
      turtleSoupWins: turtleSoupRecords.filter((r: any) => r.solved).length,
      riddleWins: riddleRecords.filter((r: any) => r.solved).length,
      yesOrNoWins: yesOrNoRecords.filter((r: any) => r.solved).length,
      guessNumberWins: guessNumberRecords.filter((r: any) => r.solved).length
    });
  };

  const startRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * gameCards.length);
    navigate(gameCards[randomIndex].path);
  };

  const gameCards: GameCard[] = [
    {
      id: 'turtle-soup',
      title: '海龟汤',
      description: '通过提问是/否问题，逐步推理出离奇故事背后的真相',
      icon: <Puzzle size={40} />,
      path: '/turtle-soup',
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    },
    {
      id: 'riddle',
      title: '谜语人',
      description: '猜谜语，动脑筋，锻炼联想思维和文字理解能力',
      icon: <Lightbulb size={40} />,
      path: '/logic-reasoning/riddle',
      color: 'red',
      gradient: 'from-red-500 to-orange-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    },
    {
      id: 'yes-or-no',
      title: 'Yes or No',
      description: 'AI出题，你提问！通过是/否问题猜出AI心中的词语',
      icon: <HelpCircle size={40} />,
      path: '/logic-reasoning/yes-or-no',
      color: 'red',
      gradient: 'from-rose-500 to-pink-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    },
    {
      id: 'guess-number',
      title: '猜数字',
      description: '根据xAxB提示，猜出四位不重复数字的神秘答案',
      icon: <Hash size={40} />,
      path: '/logic-reasoning/guess-number',
      color: 'red',
      gradient: 'from-orange-500 to-red-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    }
  ];

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-red-200 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题和图标 */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg"
              >
                <Puzzle size={24} className="text-white" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent hidden sm:block">
                逻辑推理
              </h1>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomGame}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="随机开始游戏"
              >
                <Shuffle size={18} />
                <span className="hidden md:inline">随机开始</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadGameStats();
                  setShowStats(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="查看游戏统计"
              >
                <BarChart3 size={18} />
                <span className="hidden md:inline">游戏统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="游戏说明"
              >
                <BookOpen size={18} />
                <span className="hidden md:inline">游戏说明</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 游戏说明弹窗 */}
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-red-200 dark:border-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">游戏说明</h3>
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
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <Puzzle size={20} />
                      海龟汤
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      通过提问"是/否"问题，推理出离奇故事背后的真相。适合喜欢悬疑推理的玩家。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">推理</span>
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">悬疑</span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                      <Lightbulb size={20} />
                      谜语人
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      猜谜语，锻炼联想思维和文字理解能力。每个谜语都有提示帮助你找到答案。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">文字</span>
                      <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">联想</span>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                      <HelpCircle size={20} />
                      Yes or No
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      AI出题，你通过"是/否"问题猜出AI心中的词语。可以选择不同词库类别挑战。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full">AI</span>
                      <span className="text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full">问答</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <Hash size={20} />
                      猜数字
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      根据xAxB提示，猜出四位不重复数字。需要逻辑推理和策略思考。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">数字</span>
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">逻辑</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏统计弹窗 */}
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-red-200 dark:border-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">游戏统计</h3>
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
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent mb-2">
                    {gameStats.totalGames}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">总游戏次数</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{gameStats.turtleSoupWins}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">海龟汤完成</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{gameStats.riddleWins}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">谜语人完成</div>
                  </div>
                  <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{gameStats.yesOrNoWins}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Yes or No完成</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{gameStats.guessNumberWins}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">猜数字完成</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 bg-clip-text text-transparent">
                {' '}推理游戏
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              通过不同的逻辑推理游戏，锻炼你的思维能力，提升推理技巧
            </p>
          </motion.div>

          {/* 游戏卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(card.path)}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 ${card.borderColor} overflow-hidden cursor-pointer group`}
              >
                {/* 背景装饰 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* 内容 */}
                <div className="relative p-8">
                  {/* 图标和标题 */}
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      animate={hoveredCard === card.id ? {
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <div className="text-white">
                        {card.icon}
                      </div>
                    </motion.div>

                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold ${card.textColor} mb-2`}>
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-0.5 w-8 bg-gradient-to-r ${card.gradient} rounded-full`} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          点击开始
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {card.description}
                  </p>

                  {/* 特性标签 */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getGameTags(card.id).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-full border border-red-200 dark:border-red-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 箭头指示器 */}
                  <motion.div
                    className="absolute bottom-4 right-4"
                    animate={hoveredCard === card.id ? {
                      x: [0, 5, 0]
                    } : {}}
                    transition={{ duration: 0.5, repeat: hoveredCard === card.id ? Infinity : 0 }}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                      <span className="text-white text-lg">→</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * 获取游戏标签
 */
function getGameTags(gameId: string): string[] {
  const tags: Record<string, string[]> = {
    'turtle-soup': ['推理', '悬疑', '逻辑'],
    'riddle': ['文字', '联想', '创意'],
    'yes-or-no': ['AI', '问答', '推理'],
    'guess-number': ['数字', '逻辑', '策略']
  };

  return tags[gameId] || [];
}
