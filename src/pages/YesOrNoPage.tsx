/**
 * Yes or No 游戏页面
 * AI出题，玩家通过是/否问题猜出AI心中的词语
 */

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Trophy,
  Play
} from 'lucide-react';
import { getRandomWord, analyzeYesNoQuestion, isValidYesOrNoQuestion } from '@/constants/yesOrNoWords';
import { saveYesOrNoRecord, getYesOrNoRecords } from '@/utils/storage';
import { updateDailyTaskProgress } from '@/utils/taskManager';
import { useYesNoAI } from '@/hooks/useYesNoAI';
import { usePageSEO } from '@/hooks/usePageSEO';

interface QAPair {
  question: string;
  answer: 'yes' | 'no';
  answerText?: string;
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
  const [isGiveUp, setIsGiveUp] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qaListRef = useRef<HTMLDivElement>(null);

  // AI Hook - 流式回调实时更新最后一条 QA 的 answerText
  const onStreaming = useCallback((text: string) => {
    setQaHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, answerText: text };
      }
      return updated;
    });
  }, []);

  const { askQuestion: askLLM, hasAI } = useYesNoAI({ onStreaming });

  const startNewGame = () => {
    const random = getRandomWord();
    setTargetWord(random.word);
    setCategory(random.category);
    setQaHistory([]);
    setCurrentQuestion('');
    setIsCorrect(false);
    setQuestionsAsked(0);
    setGameStarted(true);
  };

  useEffect(() => {
    // 加载已完成的总局数
    const records = getYesOrNoRecords();
    const completedGames = records.filter((r: any) => r.solved).length;
    setTotalGames(completedGames);
  }, []);

  const handleSubmitQuestion = async () => {
    const question = currentQuestion.trim();
    if (!question || isCorrect) return;

    setIsSubmitting(true);

    // 检测是否猜对了答案
    const normalizedInput = question.toLowerCase();
    const normalizedTarget = targetWord.toLowerCase();
    const cleanedInput = normalizedInput.replace(/[吗？?！!。，,、]+$/g, '');

    const isCorrectGuess =
      cleanedInput === normalizedTarget ||
      cleanedInput === `是${normalizedTarget}` ||
      cleanedInput === `我猜是${normalizedTarget}` ||
      cleanedInput === `我猜${normalizedTarget}` ||
      cleanedInput === `答案是${normalizedTarget}` ||
      cleanedInput === `答案${normalizedTarget}` ||
      cleanedInput === `是不是${normalizedTarget}` ||
      cleanedInput === `是不是${normalizedTarget}吗`;

    if (isCorrectGuess) {
      setIsCorrect(true);
      setQaHistory(prev => [...prev, {
        question,
        answer: 'yes',
        answerText: `🎉 恭喜你猜对了！答案就是「${targetWord}」！`,
        timestamp: new Date()
      }]);
      setCurrentQuestion('');
      setIsSubmitting(false);
      setQuestionsAsked(prev => prev + 1);

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
      updateDailyTaskProgress('daily-reasoning', 1);
      setTotalGames(prev => prev + 1);
      return;
    }

    // 检查是否是有效的yes/no问题
    if (!isValidYesOrNoQuestion(question)) {
      const invalidAnswer: QAPair = {
        question,
        answer: 'yes',
        answerText: '请用"是/否"的形式提问，或直接输入你的猜测答案',
        timestamp: new Date()
      };
      setQaHistory(prev => [...prev, {
        ...invalidAnswer,
        question: `[提示] 请用"是/否"的形式提问，或直接输入猜测答案`
      }]);
      setCurrentQuestion('');
      setIsSubmitting(false);
      return;
    }

    if (hasAI) {
      // AI 模式：先添加占位条目，流式更新
      const placeholder: QAPair = {
        question,
        answer: 'yes',
        answerText: '',
        timestamp: new Date(),
      };
      setQaHistory(prev => [...prev, placeholder]);
      setCurrentQuestion('');

      const result = await askLLM(question, targetWord, category, qaHistory);

      if (result) {
        // AI 成功，替换占位条目
        setQaHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            question,
            answer: result.answer,
            answerText: result.answerText,
            timestamp: new Date(),
          };
          return updated;
        });
      } else {
        // AI 失败，回退到规则引擎
        const fallback = analyzeYesNoQuestion(question, targetWord, category);
        setQaHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            question,
            answer: fallback.answer,
            timestamp: new Date(),
          };
          return updated;
        });
      }
    } else {
      // 无 AI 配置，使用规则引擎
      const result = analyzeYesNoQuestion(question, targetWord, category);
      setQaHistory(prev => [...prev, {
        question,
        answer: result.answer,
        timestamp: new Date()
      }]);
      setCurrentQuestion('');
    }

    setIsSubmitting(false);
    setQuestionsAsked(prev => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmitQuestion();
    }
  };

  const handleGiveUp = () => {
    setIsGiveUp(true);
    setIsCorrect(true);
    setQaHistory(prev => [...prev, {
      question: '我放弃了',
      answer: 'yes',
      answerText: `答案是「${targetWord}」，再接再厉！`,
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

  return (
    <div className="min-h-screen relative">
      {/* 背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-picture/bg-logic.png)' }}
      />
      {/* 半透明渐变遮罩 */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-rose-50/70 to-red-50/80 dark:from-gray-900/90 dark:via-red-900/80 dark:to-rose-900/85" />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent">
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
              <div className="relative px-4 py-2 rounded-xl shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icon-picture/icon-logic1.jpg)' }} />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                <div className="relative">
                  <span className="text-sm text-gray-600 dark:text-gray-400">已挑战</span>
                  <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{totalGames}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">局</span>
                </div>
              </div>
              <div className="relative px-4 py-2 rounded-xl shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icon-picture/icon-logic1.jpg)' }} />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                <div className="relative">
                  <span className="text-sm text-gray-600 dark:text-gray-400">提问</span>
                  <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{questionsAsked}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">次</span>
                </div>
              </div>
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
                <div className="relative p-6 rounded-2xl shadow-lg border-2 border-red-200/80 dark:border-red-800/60 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icon-picture/icon-logic1.jpg)' }} />
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
                  <div className="hidden dark:block absolute inset-0 dark:bg-gray-900/80" />
                  <div className="relative">
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
                        <span><strong>猜测</strong>：有把握时直接在输入框输入你的答案即可</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span><strong>目标</strong>：用最少的问题猜出答案</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 游戏卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200/80 dark:border-red-800/60"
          >
            {/* 卡片背景图 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-logic1.jpg)' }} />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
            <div className="hidden dark:block absolute inset-0 dark:bg-gray-900/85" />

            {/* 标题区域 */}
            <div className="relative p-8 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-logic1.jpg)' }} />
              <div className="absolute inset-0 bg-white/75 backdrop-blur-sm" />
              <div className="hidden dark:block absolute inset-0 dark:bg-gray-900/80" />
              <div className="relative">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2"
                >
                  Yes or No
                </motion.h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">AI出题，你提问！猜出心中的词语</p>
              </div>
            </div>

            {/* 开始游戏按钮 */}
            {!gameStarted && (
              <div className="relative p-12 flex flex-col items-center justify-center gap-6 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-logic1.jpg)' }} />
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
                <div className="hidden dark:block absolute inset-0 dark:bg-gray-900/75" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                    <HelpCircle size={48} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">准备好了吗？</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">AI会随机选择一个词语，通过是/否问题来猜出它</p>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startNewGame()}
                  className="relative px-12 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all font-bold text-lg flex items-center gap-3"
                >
                  <Play size={24} />
                  开始游戏
                </motion.button>
              </div>
            )}

            {/* 问答区域 */}
            {gameStarted && <div className="relative p-8">
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
                  className="mb-4 max-h-96 overflow-y-auto space-y-3 p-4 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/40"
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
                          <div className="flex-1 p-3 bg-red-50/90 dark:bg-red-900/20 rounded-2xl rounded-tl-none">
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
                              ? 'bg-green-50/90 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/40'
                              : 'bg-red-50/90 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40'
                          }`}>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                              {qa.answerText || (qa.answer === 'yes' ? '是' : '否')}
                              {isSubmitting && index === qaHistory.length - 1 && !qa.answerText && (
                                <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1 align-middle" />
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* 建议问题 */}
              {qaHistory.length === 0 && !isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">不知道从何开始？试试以下提问：</p>
                  <div className="flex flex-wrap gap-2">
                    {['是两个字的词语吗？', '是抽象名词吗？', '是一种职业吗？'].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentQuestion(q);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 text-sm bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-red-100/80 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 输入区域 */}
              {!isCorrect && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='用是/否形式的句子提问'
                      className="flex-1 px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-700/60 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
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
                          <span>发送</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGiveUp}
                    className="w-full px-6 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/60 text-gray-500 dark:text-gray-400 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2 border border-gray-200/40 dark:border-gray-700/40"
                  >
                    <RotateCcw size={16} />
                    <span>放弃本轮</span>
                  </motion.button>
                </div>
              )}

              {/* 游戏结束 */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full p-6 rounded-2xl border-2 border-red-500/80 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icon-picture/icon-logic1.jpg)' }} />
                  <div className="absolute inset-0 bg-red-50/90 backdrop-blur-sm" />
                  <div className="hidden dark:block absolute inset-0 dark:bg-red-900/80" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Trophy size={32} className="text-red-500" />
                    <div className="text-center">
                      {isGiveUp ? (
                        <>
                          <p className="text-lg font-bold text-red-700 dark:text-red-300">没关系！</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            答案是：<span className="font-bold">{targetWord}</span>
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            下次一定能猜到！
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-red-700 dark:text-red-300">恭喜你！</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            答案就是：<span className="font-bold">{targetWord}</span>
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            用了 {questionsAsked} 个问题
                          </p>
                        </>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setGameStarted(false);
                          setQaHistory([]);
                          setIsCorrect(false);
                          setIsGiveUp(false);
                          setQuestionsAsked(0);
                          setCurrentQuestion('');
                        }}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium"
                      >
                        再来一局
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>}
          </motion.div>
        </div>
      </main>

      </div>{/* 内容层结束 */}
    </div>
  );
}
