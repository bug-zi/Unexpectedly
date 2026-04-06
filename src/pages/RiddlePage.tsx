/**
 * 谜语人游戏页面
 * 玩家需要猜出谜语的答案
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  Eye,
  EyeOff,
  Shuffle,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  HelpCircle,
  Star
} from 'lucide-react';
import {
  getRandomRiddle,
  checkRiddleAnswer,
  getAnswerSimilarity,
  type Riddle
} from '@/constants/riddles';
import { saveRiddleRecord } from '@/utils/storage';
import { updateDailyTaskProgress } from '@/utils/taskManager';
import { usePageSEO } from '@/hooks/usePageSEO';

export function RiddlePage() {
  const navigate = useNavigate();
  const { SEORender } = usePageSEO({ seo: '/logic-reasoning/riddle' });
  const [currentRiddle, setCurrentRiddle] = useState<Riddle>(getRandomRiddle());
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    similarity: number;
    message: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNewGame = () => {
    let newRiddle = getRandomRiddle();
    // 确保不会随机到同一个谜语
    while (newRiddle.id === currentRiddle.id) {
      newRiddle = getRandomRiddle();
    }
    setCurrentRiddle(newRiddle);
    setShowAnswer(false);
    setShowHint(false);
    setCurrentHintIndex(0);
    setUserAnswer('');
    setAttempts(0);
    setLastResult(null);
  };

  const handleSubmitAnswer = () => {
    const answer = userAnswer.trim();
    if (!answer) return;

    const isCorrect = checkRiddleAnswer(answer, currentRiddle.answer);
    const similarity = getAnswerSimilarity(answer, currentRiddle.answer);

    let message = '';
    if (isCorrect) {
      message = '🎉 恭喜你，答对了！';

      // 保存游戏记录
      const record = {
        id: `riddle-${Date.now()}`,
        riddleId: currentRiddle.id,
        riddleQuestion: currentRiddle.question,
        answer: currentRiddle.answer,
        category: currentRiddle.category,
        difficulty: currentRiddle.difficulty,
        attempts: attempts + 1,
        hintsUsed: currentHintIndex + (showHint ? 1 : 0),
        solved: true,
        completedAt: new Date()
      };
      saveRiddleRecord(record);

      // 更新每日任务进度（逻辑推理）
      updateDailyTaskProgress('daily-reasoning', 1);

      setShowAnswer(true);
      setSolvedCount(prev => prev + 1);
    } else if (similarity >= 60) {
      message = '🔥 非常接近了！再想想？';
    } else if (similarity >= 30) {
      message = '💡 方向对了，但还需要调整';
    } else {
      message = '❌ 不太对，继续加油！';
    }

    setLastResult({ isCorrect, similarity, message });
    setAttempts(prev => prev + 1);

    if (!isCorrect) {
      setUserAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const handleNextHint = () => {
    if (currentHintIndex < currentRiddle.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  const getDifficultyColor = (difficulty: Riddle['difficulty']) => {
    switch (difficulty) {
      case '简单':
        return 'text-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/20';
      case '中等':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case '困难':
        return 'text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-900/40';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'bg-green-500';
    if (similarity >= 60) return 'bg-yellow-500';
    if (similarity >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-red-200 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <Lightbulb size={24} className="text-red-500" />
              <h1 className="text-xl font-bold text-red-700 dark:text-red-300">
                谜语人
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="游戏说明"
              >
                <HelpCircle size={18} />
                <span className="hidden md:inline">游戏说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewGame}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="换个谜题"
              >
                <Shuffle size={18} />
                <span className="hidden md:inline">换个谜题</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 游戏统计 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">已解谜</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{solvedCount}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">个</span>
              </div>
              <div className={`px-4 py-2 rounded-xl shadow-md ${getDifficultyColor(currentRiddle.difficulty)}`}>
                <span className="text-sm font-medium">{currentRiddle.difficulty}</span>
              </div>
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">尝试</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{attempts}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">次</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">{currentRiddle.category}</span>
            </div>
          </motion.div>

          {/* 游戏说明 - 可展开/收起 */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-red-500" />
                    游戏说明
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>谜面</strong>：仔细阅读谜语，思考其中的线索</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>猜测</strong>：在输入框中输入你的答案</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>提示</strong>：遇到困难可以查看提示</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>答案</strong>：实在猜不出来可以查看答案</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 谜题卡片 */}
          <motion.div
            key={currentRiddle.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200 dark:border-red-800"
          >
            {/* 标题区域 */}
            <div className="relative p-8 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/UI-picture/UI-logic1.jpg)' }}
              />
              <div className="absolute inset-0 bg-transparent" />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-3xl md:text-4xl font-bold text-white mb-2"
              >
                谜语挑战
              </motion.h2>
              <p className="relative z-10 text-red-100 text-sm">开动脑筋，猜出谜底</p>
            </div>

            {/* 谜面 */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star size={24} className="text-red-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">谜面</h3>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed text-center">
                    {currentRiddle.question}
                  </p>
                </div>
              </motion.div>

              {/* 答题区域 */}
              {!showAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={24} className="text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">你的答案</h3>
                  </div>

                  {/* 答案输入框 */}
                  <div className="flex gap-3 mb-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入你的答案..."
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
                      disabled={showAnswer}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || showAnswer}
                      className="px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden"
                      style={{
                        backgroundImage: 'url(/UI-picture/UI-logic1.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Send size={20} />
                      <span>提交</span>
                    </motion.button>
                  </div>

                  {/* 答案反馈 */}
                  <AnimatePresence>
                    {lastResult && !lastResult.isCorrect && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl border-2 ${
                          lastResult.similarity >= 60
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getSimilarityColor(lastResult.similarity)} flex items-center justify-center`}>
                            <XCircle size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{lastResult.message}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              相似度: {lastResult.similarity}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* 提示区域 */}
              <AnimatePresence>
                {showHint && !showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb size={24} className="text-red-500" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">提示</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({currentHintIndex + 1}/{currentRiddle.hints.length})
                      </span>
                    </div>
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                        {currentRiddle.hints[currentHintIndex]}
                      </p>
                      {currentHintIndex < currentRiddle.hints.length - 1 && (
                        <button
                          onClick={handleNextHint}
                          className="mt-4 px-4 py-2 bg-cover bg-center hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all"
                          style={{ backgroundImage: "url(/icon-picture/icon-logic1.jpg)" }}
                        >
                          下一个提示
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 答案 */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={24} className="text-red-500" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">正确答案</h3>
                    </div>
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed text-center font-bold">
                        {currentRiddle.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 操作按钮 */}
            <div className="px-8 pb-8">
              <div className="flex flex-wrap gap-4">
                {!showAnswer ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium relative overflow-hidden"
                      style={{
                        backgroundImage: 'url(/UI-picture/UI-logic1.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {showHint ? <EyeOff size={20} /> : <Lightbulb size={20} />}
                      <span>{showHint ? '隐藏提示' : '显示提示'}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAnswer(true);
                        setLastResult({
                          isCorrect: false,
                          similarity: 0,
                          message: '查看答案'
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium relative overflow-hidden"
                      style={{
                        backgroundImage: 'url(/UI-picture/UI-logic1.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Eye size={20} />
                      <span>查看答案</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-500 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={32} className="text-red-500" />
                    <div>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">
                        {lastResult?.isCorrect ? '回答正确！' : '答案揭晓'}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">点击右上角"换个谜题"继续挑战</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      </div>
    </div>
  );
}
