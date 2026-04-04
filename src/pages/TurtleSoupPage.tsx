/**
 * 海龟汤游戏页面
 * 玩家通过提问是/否问题来推理出故事的真相
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Eye, EyeOff, Shuffle, CheckCircle2, AlertCircle, CircleDashed, Send, MessageSquare, Sparkles, HelpCircle } from 'lucide-react';
import { getRandomPuzzle, turtleSoupPuzzles, type TurtleSoupPuzzle } from '@/constants/turtleSoup';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { answerTurtleSoupQuestion, isValidYesNoQuestion, getSuggestedQuestions, type QAPair } from '@/utils/turtleSoupAI';
import { saveTurtleSoupRecord } from '@/utils/storage';
import { updateDailyTaskProgress } from '@/utils/taskManager';

export function TurtleSoupPage() {
  const navigate = useNavigate();
  const [currentPuzzle, setCurrentPuzzle] = useState<TurtleSoupPuzzle>(getRandomPuzzle());
  const [showTruth, setShowTruth] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qaListRef = useRef<HTMLDivElement>(null);

  const handleNewGame = () => {
    let newPuzzle = getRandomPuzzle();
    // 确保不会随机到同一个谜题
    while (newPuzzle.id === currentPuzzle.id && turtleSoupPuzzles.length > 1) {
      newPuzzle = getRandomPuzzle();
    }
    setCurrentPuzzle(newPuzzle);
    setShowTruth(false);
    setShowHint(false);
    setCurrentHintIndex(0);
    setQaHistory([]);
    setCurrentQuestion('');
  };

  const handleSubmitQuestion = () => {
    const question = currentQuestion.trim();
    if (!question) return;

    setIsSubmitting(true);

    // 检查是否是有效的yes/no问题
    if (!isValidYesNoQuestion(question)) {
      // 添加一个"无关"回答，提示用户
      const irrelevantAnswer: QAPair = {
        question,
        answer: 'irrelevant',
        answerText: '请用"是/否"的形式提问，例如："这个人是盲人吗？"',
        timestamp: new Date()
      };
      setQaHistory(prev => [...prev, irrelevantAnswer]);
      setCurrentQuestion('');
      setIsSubmitting(false);
      return;
    }

    // 模拟AI思考延迟
    setTimeout(() => {
      const answer = answerTurtleSoupQuestion(question, currentPuzzle.scenario, currentPuzzle.truth);
      setQaHistory(prev => [...prev, answer]);
      setCurrentQuestion('');
      setIsSubmitting(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmitQuestion();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setCurrentQuestion(question);
    inputRef.current?.focus();
  };

  // 当有新的问答时，滚动到底部
  useEffect(() => {
    if (qaListRef.current) {
      qaListRef.current.scrollTop = qaListRef.current.scrollHeight;
    }
  }, [qaHistory]);

  const handleRevealTruth = () => {
    // 保存游戏记录
    const record = {
      id: `soup-${Date.now()}`,
      puzzleId: currentPuzzle.id,
      puzzleTitle: currentPuzzle.title,
      difficulty: currentPuzzle.difficulty,
      category: currentPuzzle.category,
      questionsAsked: qaHistory.length,
      hintsUsed: currentHintIndex + (showHint ? 1 : 0),
      solved: true,
      completedAt: new Date(),
    };

    saveTurtleSoupRecord(record);

    // 更新逻辑推理任务进度（完成一次海龟汤游戏）
    updateDailyTaskProgress('daily-reasoning', 1);

    setShowTruth(true);
    setSolvedCount(prev => prev + 1);
  };

  const handleNextHint = () => {
    if (currentHintIndex < currentPuzzle.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  const getDifficultyColor = (difficulty: TurtleSoupPuzzle['difficulty']) => {
    switch (difficulty) {
      case '简单':
        return 'text-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/20';
      case '中等':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case '困难':
        return 'text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-900/40';
    }
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
              <Icon name="CircleDashed" size={24} className="text-red-500" />
              <h1 className="text-xl font-bold text-red-700 dark:text-red-300">
                海龟汤游戏
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
                title="换个题目"
              >
                <Shuffle size={18} />
                <span className="hidden md:inline">换个题目</span>
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
                <span className="text-sm text-gray-600 dark:text-gray-400">已探索</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{solvedCount}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">个谜题</span>
              </div>
              <div className={`px-4 py-2 rounded-xl shadow-md ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                <span className="text-sm font-medium">{currentPuzzle.difficulty}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">{currentPuzzle.category}</span>
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
                      <span><strong>汤面</strong>：给你一个看似离奇或不完整的情境</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>提问</strong>：通过"是/否"问题来获取线索，逐步推理真相</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>推理</strong>：根据回答线索，思考故事背后的真相</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>提示</strong>：遇到困难可以查看提示，循序渐进</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>汤底</strong>：当你想确认或放弃时，查看真相</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 谜题卡片 */}
          <motion.div
            key={currentPuzzle.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200 dark:border-red-800"
          >
            {/* 标题区域 */}
            <div className="relative p-8 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/UI-picture/UI-turtle-soup.jpg)' }}
              />
              <div className="absolute inset-0 bg-transparent" />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {currentPuzzle.title}
              </motion.h2>
              <p className="relative z-10 text-red-100 text-sm">通过提问获取线索，推理出故事真相</p>
            </div>

            {/* 汤面 - 情境 */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">汤面</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">（情境）</span>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                    {currentPuzzle.scenario}
                  </p>
                </div>
              </motion.div>

              {/* 问答区域 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={24} className="text-red-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">提问推理</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({qaHistory.length} 个问题)
                  </span>
                </div>

                {/* 问答历史 */}
                {qaHistory.length > 0 && (
                  <div
                    ref={qaListRef}
                    className="mb-4 max-h-96 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <AnimatePresence>
                      {qaHistory.map((qa, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          {/* 问题 */}
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">你</span>
                            </div>
                            <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl rounded-tl-none">
                              <p className="text-gray-800 dark:text-gray-200">{qa.question}</p>
                            </div>
                          </div>

                          {/* 答案 */}
                          <div className="flex items-start gap-3 ml-11">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                              <Sparkles size={16} className="text-white" />
                            </div>
                            <div className={`flex-1 p-3 rounded-2xl rounded-tl-none ${
                              qa.answer === 'yes'
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : qa.answer === 'no'
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            }`}>
                              <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {qa.answerText}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* 提问输入框 */}
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='用"是/否"的形式提问，例如："死者是意外死亡吗？"、"凶手是精神病患者或有认知障碍吗？"、"案发地点是封闭空间（密室）吗？"'
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
                    disabled={isSubmitting || showTruth}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitQuestion}
                    disabled={!currentQuestion.trim() || isSubmitting || showTruth}
                    className="px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden"
                    style={{
                      backgroundImage: 'url(/UI-picture/UI-turtle-soup.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>思考中</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>提问</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 建议问题 */}
                {qaHistory.length === 0 && !showTruth && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">不知道从何开始？试试这些问题：</p>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestedQuestions(currentPuzzle.scenario, currentPuzzle.truth).slice(0, 3).map((suggestedQ, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(suggestedQ)}
                          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                        >
                          {suggestedQ}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* 提示区域 */}
              <AnimatePresence>
                {showHint && (
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
                        ({currentHintIndex + 1}/{currentPuzzle.hints.length})
                      </span>
                    </div>
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                        {currentPuzzle.hints[currentHintIndex]}
                      </p>
                      {currentHintIndex < currentPuzzle.hints.length - 1 && (
                        <Button
                          onClick={handleNextHint}
                          className="mt-4"
                          variant="outline"
                        >
                          下一个提示
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 汤底 - 真相 */}
              <AnimatePresence>
                {showTruth && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Eye size={24} className="text-red-500" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">汤底</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">（真相）</span>
                    </div>
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-l-4 border-red-500">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                        {currentPuzzle.truth}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 操作按钮 */}
            <div className="px-8 pb-8">
              <div className="flex flex-wrap gap-4">
                {!showTruth ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium relative overflow-hidden"
                      style={{
                        backgroundImage: 'url(/UI-picture/UI-turtle-soup.jpg)',
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
                      onClick={handleRevealTruth}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium relative overflow-hidden"
                      style={{
                        backgroundImage: 'url(/UI-picture/UI-turtle-soup.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Eye size={20} />
                      <span>查看真相</span>
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
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">真相已揭晓</p>
                      <p className="text-sm text-red-600 dark:text-red-400">点击右上角"换个题目"继续探索</p>
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
