/**
 * Yes or No 游戏页面
 * AI出题，玩家通过是/否问题猜出AI心中的词语
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shuffle,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { getRandomWord, analyzeYesNoQuestion, isValidYesOrNoQuestion, getCategories } from '@/constants/yesOrNoWords';
import { saveYesOrNoRecord } from '@/utils/storage';

interface QAPair {
  question: string;
  answer: 'yes' | 'no';
  timestamp: Date;
}

export function YesOrNoPage() {
  const navigate = useNavigate();
  const [targetWord, setTargetWord] = useState('');
  const [category, setCategory] = useState('');
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGuessInput, setShowGuessInput] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const guessInputRef = useRef<HTMLInputElement>(null);
  const qaListRef = useRef<HTMLDivElement>(null);

  const startNewGame = (specificCategory?: string) => {
    const { word, category: newCategory } = getRandomWord();
    setTargetWord(word);
    setCategory(newCategory);
    setQaHistory([]);
    setCurrentQuestion('');
    setIsCorrect(false);
    setQuestionsAsked(0);
    setShowGuessInput(false);
    setUserGuess('');
    setSelectedCategory(specificCategory || null);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleSubmitQuestion = () => {
    const question = currentQuestion.trim();
    if (!question || isCorrect) return;

    setIsSubmitting(true);

    // 检查是否是有效的yes/no问题
    if (!isValidYesOrNoQuestion(question)) {
      const invalidAnswer: QAPair = {
        question,
        answer: 'yes',
        timestamp: new Date()
      };
      setQaHistory(prev => [...prev, {
        ...invalidAnswer,
        question: `[提示] 请用"是/否"的形式提问`
      }]);
      setCurrentQuestion('');
      setIsSubmitting(false);
      return;
    }

    // 模拟AI思考延迟
    setTimeout(() => {
      const result = analyzeYesNoQuestion(question, targetWord, category);
      setQaHistory(prev => [...prev, {
        question,
        answer: result.answer,
        timestamp: new Date()
      }]);
      setCurrentQuestion('');
      setIsSubmitting(false);
      setQuestionsAsked(prev => prev + 1);
    }, 500);
  };

  const handleGuess = () => {
    const guess = userGuess.trim();
    if (!guess) return;

    const isGuessCorrect = guess.toLowerCase() === targetWord.toLowerCase();

    if (isGuessCorrect) {
      setIsCorrect(true);

      // 保存游戏记录
      const record = {
        id: `yesorno-${Date.now()}`,
        targetWord,
        category,
        questionsAsked: questionsAsked + 1,
        solved: true,
        completedAt: new Date()
      };
      saveYesOrNoRecord(record);

      setTotalGames(prev => prev + 1);
    } else {
      // 猜错了，添加到问答历史
      setQaHistory(prev => [...prev, {
        question: `我猜是：${guess}`,
        answer: 'no',
        timestamp: new Date()
      }]);
      setUserGuess('');
      guessInputRef.current?.focus();
      setQuestionsAsked(prev => prev + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      if (showGuessInput) {
        handleGuess();
      } else {
        handleSubmitQuestion();
      }
    }
  };

  const handleGiveUp = () => {
    setIsCorrect(true);
    setQaHistory(prev => [...prev, {
      question: '我放弃了',
      answer: 'yes',
      timestamp: new Date()
    }]);

    // 保存未完成的记录
    const record = {
      id: `yesorno-${Date.now()}`,
      targetWord,
      category,
      questionsAsked: questionsAsked,
      solved: false,
      completedAt: new Date()
    };
    saveYesOrNoRecord(record);
  };

  useEffect(() => {
    if (qaListRef.current) {
      qaListRef.current.scrollTop = qaListRef.current.scrollHeight;
    }
  }, [qaHistory]);

  const categories = getCategories();

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/20">
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
              <HelpCircle size={24} className="text-red-500" />
              <h1 className="text-xl font-bold text-red-700 dark:text-red-300">
                Yes or No
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <HelpCircle size={16} />
                <span className="hidden sm:inline">游戏说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startNewGame()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Shuffle size={16} />
                <span className="hidden sm:inline">新题目</span>
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
                <span className="text-sm text-gray-600 dark:text-gray-400">已挑战</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{totalGames}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">局</span>
              </div>
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">提问</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{questionsAsked}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">次</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">类别: {category}</span>
            </div>
          </motion.div>

          {/* 游戏说明 */}
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
                      <span><strong>AI出题</strong>：电脑会随机选择一个词语，你需要猜出它是什么</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>提问</strong>：通过"是/否"问题来获取线索</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>猜测</strong>：当你有把握时，点击"我要猜测"输入答案</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>目标</strong>：用最少的问题猜出答案</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 游戏卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200 dark:border-red-800"
          >
            {/* 标题区域 */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                Yes or No
              </motion.h2>
              <p className="text-red-100 text-sm">AI出题，你提问！猜出心中的词语</p>
            </div>

            {/* 类别选择 */}
            {!isCorrect && qaHistory.length === 0 && (
              <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">选择类别（可选）</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startNewGame()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 rounded-full transition-colors text-sm"
                  >
                    随机
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => startNewGame(cat)}
                      className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full transition-colors text-sm border border-red-200 dark:border-red-800"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 问答区域 */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={24} className="text-red-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isCorrect ? '游戏结束' : '提问推理'}
                </h3>
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
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                              {qa.answer === 'yes' ? '是' : '否'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* 输入区域 */}
              {!isCorrect && (
                <div className="space-y-3">
                  {!showGuessInput ? (
                    <>
                      <div className="flex gap-3">
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder='用"是/否"的形式提问，例如："是动物吗？"'
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
                          disabled={isSubmitting}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmitQuestion}
                          disabled={!currentQuestion.trim() || isSubmitting}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowGuessInput(true);
                            setTimeout(() => guessInputRef.current?.focus(), 100);
                          }}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Trophy size={20} />
                          <span>我要猜测答案</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGiveUp}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all font-medium flex items-center gap-2"
                        >
                          <RotateCcw size={20} />
                          <span>放弃</span>
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          ref={guessInputRef}
                          type="text"
                          value={userGuess}
                          onChange={(e) => setUserGuess(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="输入你的答案..."
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGuess}
                          disabled={!userGuess.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send size={20} />
                          <span>提交猜测</span>
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowGuessInput(false);
                          setUserGuess('');
                          inputRef.current?.focus();
                        }}
                        className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
                      >
                        返回提问模式
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* 游戏结束 */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-500 flex items-center justify-center gap-3"
                >
                  <Trophy size={32} className="text-red-500" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">恭喜你！</p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      答案就是：<span className="font-bold">{targetWord}</span>
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      用了 {questionsAsked} 个问题
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startNewGame()}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium"
                    >
                      再来一局
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
