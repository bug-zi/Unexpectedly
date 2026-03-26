/**
 * 猜数字游戏页面
 * 玩家需要猜出四位不重复数字的答案，根据xAxB提示进行推理
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shuffle,
  Send,
  Hash,
  HelpCircle,
  Trophy,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  generateSecretNumber,
  isValidGuess,
  compareGuess,
  formatGuessResult,
  getHint,
  analyzeGuessHistory,
  type GuessResult
} from '@/utils/guessNumber';
import { saveGuessNumberRecord } from '@/utils/storage';

export function GuessNumberPage() {
  const navigate = useNavigate();
  const [secretNumber, setSecretNumber] = useState(generateSecretNumber());
  const [guessHistory, setGuessHistory] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const startNewGame = () => {
    const newSecret = generateSecretNumber();
    setSecretNumber(newSecret);
    setGuessHistory([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setAttempts(0);
    setErrorMessage('');
  };

  useEffect(() => {
    // 加载历史最佳成绩
    const savedBest = localStorage.getItem('guessNumberBestScore');
    if (savedBest) {
      setBestScore(parseInt(savedBest));
    }
  }, []);

  const handleSubmitGuess = () => {
    const guess = currentGuess.trim();

    // 验证输入
    if (!guess) {
      setErrorMessage('请输入四位数字');
      return;
    }

    if (!isValidGuess(guess)) {
      setErrorMessage('请输入四位不重复的数字');
      return;
    }

    setErrorMessage('');

    // 比较猜测
    const result = compareGuess(guess, secretNumber);
    setGuessHistory(prev => [...prev, result]);
    setAttempts(prev => prev + 1);
    setCurrentGuess('');

    // 检查是否猜对
    if (result.isCorrect) {
      setIsGameOver(true);
      setTotalGames(prev => prev + 1);

      // 保存游戏记录
      const record = {
        id: `guess-number-${Date.now()}`,
        secretNumber,
        attempts: attempts + 1,
        solved: true,
        completedAt: new Date()
      };
      saveGuessNumberRecord(record);

      // 更新最佳成绩
      const currentBest = localStorage.getItem('guessNumberBestScore');
      if (!currentBest || (attempts + 1) < parseInt(currentBest)) {
        localStorage.setItem('guessNumberBestScore', (attempts + 1).toString());
        setBestScore(attempts + 1);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitGuess();
    }
  };

  const handleGiveUp = () => {
    setIsGameOver(true);

    // 保存未完成的记录
    const record = {
      id: `guess-number-${Date.now()}`,
      secretNumber,
      attempts,
      solved: false,
      completedAt: new Date()
    };
    saveGuessNumberRecord(record);
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [guessHistory]);

  const getScoreColor = (score: number) => {
    if (score <= 5) return 'text-green-600 dark:text-green-400';
    if (score <= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20">
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
              <Hash size={24} className="text-red-500" />
              <h1 className="text-xl font-bold text-red-700 dark:text-red-300">
                猜数字
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <HelpCircle size={16} />
                <span className="hidden sm:inline">游戏说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewGame}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Shuffle size={16} />
                <span className="hidden sm:inline">新游戏</span>
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
                <span className="text-sm text-gray-600 dark:text-gray-400">当前</span>
                <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{attempts}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">次</span>
              </div>
              {bestScore && (
                <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                  <span className="text-sm text-gray-600 dark:text-gray-400">最佳</span>
                  <span className={`ml-2 text-lg font-bold ${getScoreColor(bestScore)}`}>{bestScore}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">次</span>
                </div>
              )}
            </div>
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">4位不重复数字</span>
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
                      <span><strong>目标</strong>：猜出一个四位不重复数字的神秘答案</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>A</strong>：数字和位置都对（例如：答案1234，你猜1xxx，则1A）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>B</strong>：数字对但位置不对（例如：答案1234，你猜2xxx，则1B）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>示例</strong>：答案1234，你猜1324，得到2A2B（1和4位置对，2和3数字对位置错）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>策略</strong>：根据xAxB提示逐步缩小范围，用最少的次数猜出答案</span>
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
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                猜数字挑战
              </motion.h2>
              <p className="text-orange-100 text-sm">根据xAxB提示，猜出四位不重复数字</p>
            </div>

            {/* 游戏区域 */}
            <div className="p-8">
              {/* 输入区域 */}
              {!isGameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Hash size={24} className="text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">你的猜测</h3>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentGuess}
                      onChange={(e) => {
                        // 只允许输入数字，最多4位
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCurrentGuess(value);
                        setErrorMessage('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="输入四位数字（不重复）"
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest font-mono"
                      maxLength={4}
                      disabled={isGameOver}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitGuess}
                      disabled={currentGuess.length !== 4 || isGameOver}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={20} />
                      <span>猜测</span>
                    </motion.button>
                  </div>

                  {/* 错误提示 */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300"
                      >
                        <AlertCircle size={20} />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 放弃按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGiveUp}
                    className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    放弃并查看答案
                  </motion.button>
                </motion.div>
              )}

              {/* 猜测历史 */}
              {guessHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={24} className="text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">猜测历史</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({guessHistory.length} 次)
                    </span>
                  </div>

                  <div
                    ref={historyRef}
                    className="max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="space-y-2">
                      <AnimatePresence>
                        {guessHistory.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-xl border-2 ${
                              result.isCorrect
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">
                                  {result.guess}
                                </div>
                                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-bold text-lg">
                                  {result.a}A{result.b}B
                                </div>
                              </div>
                              {!result.isCorrect && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHint(result, secretNumber)}
                                </div>
                              )}
                              {result.isCorrect && (
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold">
                                  <Trophy size={20} />
                                  <span>正确！</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 策略建议 */}
                  {!isGameOver && guessHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                    >
                      <div className="flex items-start gap-2">
                        <TrendingUp size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">策略建议</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {analyzeGuessHistory(guessHistory)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* 游戏结束 */}
              {isGameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-500"
                >
                  <div className="text-center">
                    <Trophy size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
                      {guessHistory[guessHistory.length - 1]?.isCorrect ? '恭喜你！' : '游戏结束'}
                    </h3>
                    <p className="text-lg text-red-600 dark:text-red-400 mb-2">
                      正确答案是：<span className="font-bold font-mono text-2xl">{secretNumber}</span>
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      你用了 {attempts} 次猜测
                      {bestScore && attempts <= bestScore && ' 🎉 新纪录！'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewGame}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
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
