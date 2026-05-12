import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { GashaponMachine } from '@/components/features/GashaponMachine';
import { useRandomQuestStore } from '@/stores/randomQuestStore';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { generateRandomQuest } from '@/utils/randomQuestGenerator';
import { QUEST_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants/randomQuestConfig';
import { usePageSEO } from '@/hooks/usePageSEO';
import type { QuestCategory } from '@/types';

export function RandomQuestPage() {
  usePageSEO({ seo: '/random-quest' });

  const navigate = useNavigate();
  const abortRef = useRef(false);

  const llmConfig = useRoundtableStore((s) => s.llmConfig);
  const currentQuest = useRandomQuestStore((s) => s.currentQuest);
  const isGenerating = useRandomQuestStore((s) => s.isGenerating);
  const questHistory = useRandomQuestStore((s) => s.questHistory);
  const setCurrentQuest = useRandomQuestStore((s) => s.setCurrentQuest);
  const completeQuest = useRandomQuestStore((s) => s.completeQuest);
  const skipQuest = useRandomQuestStore((s) => s.skipQuest);
  const setIsGenerating = useRandomQuestStore((s) => s.setIsGenerating);
  const recordCategoryAppearance = useRandomQuestStore((s) => s.recordCategoryAppearance);
  const getCurrentDifficulty = useRandomQuestStore((s) => s.getCurrentDifficulty);
  const getRecentCategoryNames = useRandomQuestStore((s) => s.getRecentCategoryNames);
  const getRecentTitles = useRandomQuestStore((s) => s.getRecentTitles);

  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleDispense = useCallback(async () => {
    if (!llmConfig) {
      setError('请先配置 AI 服务');
      return;
    }

    abortRef.current = false;
    setError(null);
    setIsGenerating(true);

    try {
      // 随机选类别
      const category: QuestCategory = QUEST_CATEGORIES[Math.floor(Math.random() * QUEST_CATEGORIES.length)];
      const difficulty = getCurrentDifficulty(category);
      const recentCategories = getRecentCategoryNames(5);
      const recentTitles = getRecentTitles(5);

      const quest = await generateRandomQuest(llmConfig, category, difficulty, recentCategories, recentTitles);

      if (abortRef.current) return;

      recordCategoryAppearance(category);
      setCurrentQuest(quest);
    } catch (err) {
      if (abortRef.current) return;
      const message = err instanceof Error ? err.message : '生成失败，请重试';
      setError(message);
      setIsGenerating(false);
    }
  }, [llmConfig, setCurrentQuest, setIsGenerating, recordCategoryAppearance, getCurrentDifficulty, getRecentCategoryNames, getRecentTitles]);

  const handleComplete = useCallback(() => {
    if (currentQuest) {
      completeQuest(currentQuest.id);
    }
  }, [currentQuest, completeQuest]);

  const handleSkip = useCallback(() => {
    if (currentQuest) {
      skipQuest(currentQuest.id);
    }
  }, [currentQuest, skipQuest]);

  const handleRetry = useCallback(() => {
    // 只重置状态，让用户重新点击"抽一个"
  }, []);

  // 格式化时间
  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen font-['Space_Grotesk',sans-serif] text-[#2D3436] overflow-hidden relative">
      {/* 背景 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-picture/bg-index.jpg')" }}
      />
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 100%)' }} />
      <div className="hidden dark:block fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,41,0.75) 0%, rgba(15,23,41,0.55) 20%, rgba(15,23,41,0.4) 50%, rgba(15,23,41,0.6) 100%)' }} />

      {/* 主容器 */}
      <div className="relative w-full max-w-[600px] mx-auto min-h-screen flex flex-col p-4 md:p-8">
        {/* 导航栏 */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="w-11 h-11 glass-panel rounded-full flex items-center justify-center hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
            </motion.button>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D3436] dark:text-gray-100 tracking-tight">
              随机小任务
            </h1>
          </div>
        </header>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8"
        >
          无聊？不知道干嘛？来抽一个试试
        </motion.p>

        {/* AI未配置提示 */}
        {!llmConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 text-center mb-6 border border-white/30 dark:border-gray-600/30"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              需要先配置 AI 服务才能生成随机任务
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/roundtable/discuss')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <Settings size={14} />
              去配置
            </motion.button>
          </motion.div>
        )}

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-xl p-4 text-center mb-4 border border-red-200/50 dark:border-red-700/50"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 dark:text-red-400 mt-1 underline"
              >
                关闭
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 扭蛋机 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex items-center justify-center"
        >
          <GashaponMachine
            onDispense={handleDispense}
            currentQuest={currentQuest}
            isGenerating={isGenerating}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onRetry={handleRetry}
          />
        </motion.div>

        {/* 历史记录 */}
        {questHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors py-2"
            >
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showHistory ? '收起历史' : `最近 ${Math.min(5, questHistory.length)} 个任务`}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {questHistory.slice(0, 5).map((q) => {
                    const catColor = CATEGORY_COLORS[q.category];
                    const isCompleted = !!q.completedAt;
                    return (
                      <div
                        key={q.id}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/15 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 ${isCompleted ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${catColor.bg}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                            {q.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${catColor.bg} text-white`}>
                            {CATEGORY_LABELS[q.category]}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {formatTime(q.createdAt)}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] text-green-500">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
