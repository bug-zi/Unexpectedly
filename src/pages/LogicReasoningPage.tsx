/**
 * 逻辑推理模块主页面
 * 包含四个子游戏：海龟汤、谜语人、Yes or No、猜数字
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PuzzlePiece, Lightbulb, Question, Hash, BookOpen, ChartBar, Shuffle, X, ClockCounterClockwise, Trophy, CalendarBlank } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import {
  getTurtleSoupRecords,
  getRiddleRecords,
  getYesOrNoRecords,
  getGuessNumberRecords
} from '@/utils/storage';
import { useLLMConfig } from '@/hooks/useLLMConfig';

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
  disabled?: boolean;
  disabledReason?: string;
  bgImage: string;
  requiresAI?: boolean;
}

export function LogicReasoningPage() {
  const navigate = useNavigate();
  const { isConfigured: isAIConfigured } = useLLMConfig();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showAIRequiredTip, setShowAIRequiredTip] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    turtleSoupWins: 0,
    riddleWins: 0,
    yesOrNoWins: 0,
    guessNumberWins: 0
  });
  const [gameRecords, setGameRecords] = useState<any[]>([]);

  // 加载游戏统计数据
  useEffect(() => {
    loadGameStats();
  }, []);

  const loadGameStats = () => {
    // 从storage工具加载各游戏统计（支持用户隔离）
    const turtleSoupRecords = getTurtleSoupRecords();
    const riddleRecords = getRiddleRecords();
    const yesOrNoRecords = getYesOrNoRecords();
    const guessNumberRecords = getGuessNumberRecords();

    console.log('📊 加载游戏统计:', {
      turtleSoup: turtleSoupRecords.length,
      riddle: riddleRecords.length,
      yesOrNo: yesOrNoRecords.length,
      guessNumber: guessNumberRecords.length
    });

    setGameStats({
      totalGames: turtleSoupRecords.length + riddleRecords.length + yesOrNoRecords.length + guessNumberRecords.length,
      turtleSoupWins: turtleSoupRecords.filter((r: any) => r.solved).length,
      riddleWins: riddleRecords.filter((r: any) => r.solved).length,
      yesOrNoWins: yesOrNoRecords.filter((r: any) => r.solved).length,
      guessNumberWins: guessNumberRecords.filter((r: any) => r.solved).length
    });
  };

  const loadGameRecords = () => {
    // 加载所有游戏记录
    const turtleSoupRecords = getTurtleSoupRecords().map((r: any) => ({
      ...r,
      gameType: '海龟汤',
      icon: '🐢',
      color: 'red'
    }));

    const riddleRecords = getRiddleRecords().map((r: any) => ({
      ...r,
      gameType: '谜语人',
      icon: '💡',
      color: 'orange'
    }));

    const yesOrNoRecords = getYesOrNoRecords().map((r: any) => ({
      ...r,
      gameType: 'Yes or No',
      icon: '❓',
      color: 'rose'
    }));

    const guessNumberRecords = getGuessNumberRecords().map((r: any) => ({
      ...r,
      gameType: '猜数字',
      icon: '🔢',
      color: 'amber'
    }));

    // 合并并按时间倒序排列（最新的在前）
    const allRecords = [...turtleSoupRecords, ...riddleRecords, ...yesOrNoRecords, ...guessNumberRecords]
      .sort((a: any, b: any) => new Date(b.completedAt || b.createdAt || b.syncedAt).getTime() - new Date(a.completedAt || a.createdAt || a.syncedAt).getTime());

    setGameRecords(allRecords);
  };

  const startRandomGame = () => {
    // 过滤掉禁用和需要AI但未配置的游戏
    const availableGames = gameCards.filter(card => !card.disabled && !(card.requiresAI && !isAIConfigured));
    if (availableGames.length === 0) {
      setShowComingSoon(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    navigate(availableGames[randomIndex].path);
  };

  const gameCards: GameCard[] = [
    {
      id: 'turtle-soup',
      title: '海龟汤',
      description: '通过提问是/否问题，逐步推理出离奇故事背后的真相',
      icon: <PuzzlePiece size={40} weight="duotone" className="text-white" />,
      path: '/turtle-soup',
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      bgImage: '/UI-picture/UI-logic1.jpg',
      requiresAI: true
    },
    {
      id: 'riddle',
      title: '谜语人',
      description: '猜谜语，动脑筋，锻炼联想思维和文字理解能力',
      icon: <Lightbulb size={40} weight="duotone" className="text-white" />,
      path: '/logic-reasoning/riddle',
      color: 'red',
      gradient: 'from-red-500 to-orange-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      bgImage: '/UI-picture/UI-logic2.jpg'
    },
    {
      id: 'yes-or-no',
      title: 'Yes or No',
      description: 'AI出题，你提问！通过是/否问题猜出AI心中的词语',
      icon: <Question size={40} weight="duotone" className="text-white" />,
      path: '/logic-reasoning/yes-or-no',
      color: 'red',
      gradient: 'from-rose-500 to-pink-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      disabled: false,
      bgImage: '/UI-picture/UI-logic3.jpg',
      requiresAI: true
    },
    {
      id: 'guess-number',
      title: '猜数字',
      description: '根据xAxB提示，猜出四位不重复数字的神秘答案',
      icon: <Hash size={40} weight="duotone" className="text-white" />,
      path: '/logic-reasoning/guess-number',
      color: 'red',
      gradient: 'from-orange-500 to-red-500',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      bgImage: '/UI-picture/UI-logic4.jpg'
    }
  ];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-logic.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 背景遮罩层 - 保证内容可读性 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-rose-50/80 to-orange-50/85 dark:from-gray-900/90 dark:via-red-900/85 dark:to-rose-900/90 z-0" />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft size={20} weight="duotone" />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题和图标 */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <PuzzlePiece size={24} weight="duotone" className="text-red-500 dark:text-red-400" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                逻辑推理
              </h1>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="游戏说明"
              >
                <BookOpen size={18} weight="duotone" />
                <span className="hidden md:inline">游戏说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomGame}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="随机开始游戏"
              >
                <Shuffle size={18} weight="duotone" />
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
                <ChartBar size={18} weight="duotone" />
                <span className="hidden md:inline">游戏统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadGameRecords();
                  setShowRecords(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="查看推理记录"
              >
                <ClockCounterClockwise size={18} weight="duotone" />
                <span className="hidden md:inline">推理记录</span>
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
              className="relative rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-red-200 dark:border-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景图 */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
              <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[2px]" />

              {/* 头部 */}
              <div className="relative sticky top-0 z-10 overflow-hidden px-6 py-4 flex items-center justify-between">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-rose-900/70" />
                <div className="relative flex items-center gap-3">
                  <BookOpen size={24} weight="duotone" className="text-white" />
                  <h3 className="text-xl font-bold text-white">游戏说明</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInstructions(false)}
                  className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} weight="duotone" />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="relative p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <PuzzlePiece size={20} weight="duotone" />
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

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <Lightbulb size={20} weight="duotone" />
                      谜语人
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      猜谜语，锻炼联想思维和文字理解能力。每个谜语都有提示帮助你找到答案。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">文字</span>
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">联想</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <Question size={20} weight="duotone" />
                      Yes or No
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      AI出题，你通过"是/否"问题猜出AI心中的词语。可以选择不同词库类别挑战。
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">AI</span>
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">问答</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <Hash size={20} weight="duotone" />
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
              className="relative rounded-3xl shadow-2xl max-w-lg w-full border-2 border-red-200 dark:border-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景图 */}
              <div className="absolute inset-0 bg-cover bg-center rounded-3xl" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
              <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 rounded-3xl backdrop-blur-[2px]" />

              {/* 头部 */}
              <div className="relative overflow-hidden px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-rose-900/70" />
                <div className="relative flex items-center gap-3">
                  <ChartBar size={24} weight="duotone" className="text-white" />
                  <h3 className="text-xl font-bold text-white">游戏统计</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStats(false)}
                  className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} weight="duotone" />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="relative p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent mb-2">
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

      {/* 即将推出弹窗 */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-rose-200 dark:border-rose-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Question size={24} weight="duotone" className="text-white" />
                  <h3 className="text-xl font-bold text-white">即将推出</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowComingSoon(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} weight="duotone" />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <Question size={32} weight="duotone" className="text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    稍后开放，敬请期待
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes or No 游戏正在优化中，敬请期待更精彩的推理体验！
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>智能AI出题系统</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>丰富词库类别</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>推理记录追踪</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI配置提示弹窗 */}
      <AnimatePresence>
        {showAIRequiredTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAIRequiredTip(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Question size={24} weight="duotone" className="text-white" />
                  <h3 className="text-xl font-bold text-white">需要AI配置</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAIRequiredTip(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} weight="duotone" />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Question size={32} weight="duotone" className="text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  请配置AI大模型后再来访问
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  此功能需要AI大模型支持，请先在个人中心配置您的AI大模型
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowAIRequiredTip(false)}
                    variant="outline"
                  >
                    稍后再说
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAIRequiredTip(false);
                      navigate('/profile');
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
                  >
                    去配置
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 推理记录弹窗 */}
      <AnimatePresence>
        {showRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRecords(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border-2 border-red-200 dark:border-red-800 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景图 */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
              <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[2px]" />

              {/* 头部 */}
              <div className="relative overflow-hidden px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-rose-900/70" />
                <div className="relative flex items-center gap-3">
                  <ClockCounterClockwise size={24} weight="duotone" className="text-white" />
                  <h3 className="text-xl font-bold text-white">推理游戏记录</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRecords(false)}
                  className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} weight="duotone" />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="relative p-6 overflow-y-auto flex-1">
                {gameRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy size={48} weight="duotone" className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      还没有游戏记录，开始你的第一次推理吧！✨
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gameRecords.map((record: any, index: number) => (
                      <motion.div
                        key={record.id || record.soupId || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-4 border ${
                          record.gameType === '海龟汤' || record.gameType === '猜数字' || record.gameType === '谜语人'
                            ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800'
                            : record.gameType === 'Yes or No'
                            ? 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30 border-rose-200 dark:border-rose-800'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/30 border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        {/* 游戏类型和结果 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{record.icon}</span>
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white">
                              {record.gameType}
                            </span>
                            {record.solved !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                record.solved
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {record.solved ? '✓ 已完成' : '✗ 未完成'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <CalendarBlank size={14} weight="duotone" />
                            <span>
                              {(() => {
                                const date = new Date(record.createdAt || record.syncedAt || record.completedAt);
                                return date.toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* 海龟汤特有信息 */}
                        {record.gameType === '海龟汤' && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                🏷️ {record.soupId || '未知汤面'}
                              </span>
                              <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                                {record.hintsUsed || 0} 次提示
                              </span>
                            </div>
                            {record.timeSpent !== undefined && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                ⏱️ 用时：{Math.floor(record.timeSpent / 60)}分{record.timeSpent % 60}秒
                              </div>
                            )}
                          </div>
                        )}

                        {/* 谜语人特有信息 */}
                        {record.gameType === '谜语人' && record.riddleId && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                            {record.riddleQuestion && (
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📝 {record.riddleQuestion}
                              </div>
                            )}
                            {!record.riddleQuestion && (
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📝 谜题 #{record.riddleId}
                              </div>
                            )}
                            {record.answer && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                💡 答案：{record.answer}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              {record.category && (
                                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                                  {record.category}
                                </span>
                              )}
                              {record.difficulty && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  难度：{record.difficulty}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                🎯 尝试 {record.attempts || 0} 次
                              </span>
                              {record.hintsUsed !== undefined && record.hintsUsed > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  💡 提示 {record.hintsUsed} 次
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Yes or No 特有信息 */}
                        {record.gameType === 'Yes or No' && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                🎯 目标词：{record.targetWord}
                              </div>
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                                {record.category}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              ❓ 提问次数：{record.questionsAsked || 0} 次
                            </div>
                            {record.timeSpent !== undefined && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                ⏱️ 用时：{Math.floor(record.timeSpent / 60)}分{record.timeSpent % 60}秒
                              </div>
                            )}
                          </div>
                        )}

                        {/* 猜数字特有信息 */}
                        {record.gameType === '猜数字' && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                🔢 神秘数字：{record.secretNumber}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                record.solved
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {record.solved ? '✓ 猜中' : '✗ 未猜中'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              🎲 尝试次数：{record.attempts || 0} 次
                            </div>
                            {record.timeSpent !== undefined && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                ⏱️ 用时：{Math.floor(record.timeSpent / 60)}分{record.timeSpent % 60}秒
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 底部统计 */}
              {gameRecords.length > 0 && (
                <div className="relative px-6 py-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    共 <span className="font-bold text-red-600 dark:text-red-400">{gameRecords.length}</span> 条游戏记录
                  </p>
                </div>
              )}
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
            {gameCards.map((card, index) => {
              const isCardDisabled = card.disabled || (card.requiresAI && !isAIConfigured);
              return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => !isCardDisabled && setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={isCardDisabled ? {} : { scale: 1.02 }}
                whileTap={isCardDisabled ? {} : { scale: 0.98 }}
                onClick={() => {
                  if (card.disabled) {
                    setShowComingSoon(true);
                  } else if (card.requiresAI && !isAIConfigured) {
                    setShowAIRequiredTip(true);
                  } else {
                    navigate(card.path);
                  }
                }}
                className={`relative rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 ${card.borderColor} overflow-hidden ${
                  isCardDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer group'
                }`}
              >
                {/* 背景图片 */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${card.bgImage})` }}
                />
                {/* 渐变遮罩 - 保证文字可读 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-white/60 dark:from-gray-900/85 dark:via-gray-800/80 dark:to-gray-900/70" />
                {/* 悬停时的主题色覆盖 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* 禁用标记 */}
                {(card.disabled || (card.requiresAI && !isAIConfigured)) && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`px-3 py-1 ${card.requiresAI && !isAIConfigured ? 'bg-gray-500' : `bg-gradient-to-r ${card.gradient}`} text-white text-xs font-bold rounded-full shadow-lg`}>
                      {card.requiresAI && !isAIConfigured ? '需要AI配置' : '即将推出'}
                    </div>
                  </div>
                )}

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
                      className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
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
            );
            })}
          </div>
        </div>
      </main>
      </div>{/* 内容层结束 */}
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
