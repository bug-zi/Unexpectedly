import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Dices, Users, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { getQuestionById } from '@/constants/questions';
import { getRandomThinkers } from '@/constants/thinkers';
import { matchThinkers } from '@/utils/thinkerMatcher';
import { getClassicLineups } from '@/utils/thinkerMatcher';
import { ThinkerGrid } from '@/components/roundtable/ThinkerGrid';
import { Button } from '@/components/ui/Button';

const customEasing = {
  elastic: [0.68, -0.55, 0.265, 1.55],
  unexpected: [0.87, 0, 0.13, 1],
};

export function RoundtableSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('q');
  const { currentQuestion, llmConfig: _storeLlmConfig } = useAppStore() as any;
  const { llmConfig } = useRoundtableStore();

  const question = questionId ? getQuestionById(questionId) : currentQuestion;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rounds, setRounds] = useState(2);

  // 智能推荐
  const recommendedIds = useMemo(() => {
    if (!question) return [];
    return matchThinkers(question, 6).map(t => t.id);
  }, [question]);

  // 经典组合
  const classicLineups = getClassicLineups();

  const handleToggleThinker = (thinkerId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(thinkerId)) {
        return prev.filter(id => id !== thinkerId);
      }
      if (prev.length >= 5) return prev;
      return [...prev, thinkerId];
    });
  };

  const handleRandom = () => {
    const random = getRandomThinkers(3);
    setSelectedIds(random.map(t => t.id));
  };

  const handleStart = () => {
    if (selectedIds.length < 2 || !question) return;

    // 检查是否有 API 配置
    if (!llmConfig) {
      // 没有配置则跳转到讨论页先配置
      navigate(`/roundtable/discuss?q=${question.id}&thinkers=${selectedIds.join(',')}&rounds=${rounds}`);
      return;
    }

    navigate(`/roundtable/discuss?q=${question.id}&thinkers=${selectedIds.join(',')}&rounds=${rounds}`);
  };

  const handleSelectLineup = (thinkers: string[]) => {
    setSelectedIds(thinkers.slice(0, 5));
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">未找到问题</p>
          <Button onClick={() => navigate('/questions/explore')}>返回问题探索</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="text-base font-bold text-amber-700 dark:text-amber-300">
              选择讨论嘉宾
            </h1>
            <div className="w-12" />
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-32 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 当前问题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: customEasing.unexpected }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800 p-4"
          >
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">讨论主题</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {question.content}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 经典组合 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              经典组合
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {classicLineups.map(lineup => (
                <button
                  key={lineup.name}
                  onClick={() => handleSelectLineup(lineup.thinkers)}
                  className="text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {lineup.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {lineup.description}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 大咖选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                选择大咖
              </h3>
              <button
                onClick={handleRandom}
                className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700"
              >
                <Dices size={14} />
                随机选择
              </button>
            </div>
            <ThinkerGrid
              selectedIds={selectedIds}
              onToggle={handleToggleThinker}
              maxSelect={5}
              recommendedIds={recommendedIds}
            />
          </motion.div>
        </div>
      </main>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-amber-200 dark:border-amber-800 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-question1.jpg')" }} />
        <div className="absolute inset-0 bg-amber-50/90 dark:bg-amber-900/90 backdrop-blur-lg" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已选 {selectedIds.length} 位
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">讨论轮数</span>
              <select
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              >
                <option value={1}>1轮</option>
                <option value={2}>2轮</option>
                <option value={3}>3轮</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleStart}
            disabled={selectedIds.length < 2}
            fullWidth
            className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 dark:disabled:bg-amber-800/50 text-white disabled:text-amber-600 dark:disabled:text-amber-300 border-0"
          >
            {selectedIds.length < 2
              ? `请至少选择 2 位大咖 (${selectedIds.length}/2)`
              : `开始圆桌讨论 (${selectedIds.length}位大咖 · ${rounds}轮)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
