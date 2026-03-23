import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  MessageSquare,
  Lightbulb,
  Award,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Cloud,
} from 'lucide-react';
// 使用 Iconify 高级图标
import { Icon } from '@iconify/react';
import { getAnswers } from '@/utils/storage';
import { Answer } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThoughtComparison } from '@/components/features/ThoughtComparison';
import { BatchExportDialog } from '@/components/features/BatchExportDialog';
import { getCategoryConfig } from '@/constants/categories';
import { findSevenDayComparisons, calculateStreak } from '@/utils/comparison';
import { format, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getQuestionById } from '@/constants/questions';

export function GrowthTrackerPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | 'all'>('30days');
  const [showComparison, setShowComparison] = useState<{ oldAnswer: Answer; newAnswer: Answer } | null>(null);
  const [showBatchExport, setShowBatchExport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  // 从云端加载数据（如果已登录）
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        // 从云端加载
        await loadFromCloud();
      } else {
        // 从本地加载
        const local = getAnswers();
        setAnswers(local);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  const loadFromCloud = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setSyncStatus('syncing');

    try {
      // 先获取本地数据
      const localAnswers = getAnswers();
      const localAnswerIds = new Set(localAnswers.map(a => a.id));

      // 从云端获取数据
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // 将云端数据转换为本地格式
        const cloudAnswers: Answer[] = (data as any[]).map((answer: any) => ({
          id: answer.id,
          questionId: answer.question_id,
          userId: answer.user_id,
          content: answer.content,
          metadata: {
            wordCount: (answer.metadata as any).wordCount || 0,
            readingTime: (answer.metadata as any).readingTime || 0,
            writingTime: (answer.metadata as any).writingTime || 0,
            mood: (answer.metadata as any).mood,
            tags: (answer.metadata as any).tags,
          },
          createdAt: new Date(answer.created_at),
          updatedAt: new Date(answer.updated_at),
        }));

        // 合并云端和本地数据（基于 ID 去重）
        const mergedAnswers = [...localAnswers];
        for (const cloudAnswer of cloudAnswers) {
          if (!localAnswerIds.has(cloudAnswer.id)) {
            mergedAnswers.push(cloudAnswer);
          }
        }

        // 按创建时间排序
        mergedAnswers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setAnswers(mergedAnswers);
        setSyncStatus('success');
      }
    } catch (error) {
      console.error('从云端加载数据失败:', error);
      // 降级到本地数据
      const local = getAnswers();
      setAnswers(local);
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  // 筛选时间范围
  const filteredAnswers = useMemo(() => {
    if (selectedPeriod === 'all') return answers;

    const days = selectedPeriod === '7days' ? 7 : 30;
    const cutoffDate = subDays(new Date(), days);

    return answers.filter((answer) => new Date(answer.createdAt) >= cutoffDate);
  }, [answers, selectedPeriod]);

  // 统计数据
  const stats = useMemo(() => {
    const totalAnswers = filteredAnswers.length;
    const totalWords = filteredAnswers.reduce(
      (sum, answer) => sum + answer.metadata.wordCount,
      0
    );

    // 计算连续天数
    const currentStreak = calculateStreak(filteredAnswers);

    return {
      totalAnswers,
      totalWords,
      currentStreak,
    };
  }, [filteredAnswers]);

  // 查找可对比的回答（同一问题7天前的回答）
  const comparisonPairs = useMemo(() => {
    return findSevenDayComparisons(filteredAnswers);
  }, [filteredAnswers]);

  // 按日期分组
  const answersByDate = useMemo(() => {
    const grouped: Record<string, Answer[]> = {};

    filteredAnswers.forEach((answer) => {
      const dateKey = format(new Date(answer.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(answer);
    });

    return grouped;
  }, [filteredAnswers]);

  const handleExport = () => {
    setShowBatchExport(true);
  };

  const handleRefresh = async () => {
    await loadFromCloud();
  };

  const toggleAnswerExpansion = (answerId: string) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) {
        newSet.delete(answerId);
      } else {
        newSet.add(answerId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Icon icon="ph:arrow-left" width={22} height={22} />
              <span>返回</span>
            </button>
            <div className="flex items-center gap-2">
              <Icon icon="ph:chart-line-up-duotone" width={28} height={28} className="text-primary-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                成长足迹
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* 同步状态指示器 */}
              {isAuthenticated && (
                <div className="flex items-center gap-1 text-xs">
                  {syncStatus === 'syncing' && (
                    <>
                      <Icon icon="ph:arrow-clockwise" width={16} height={16} className="animate-spin text-blue-500" />
                      <span className="text-blue-500">同步中...</span>
                    </>
                  )}
                  {syncStatus === 'success' && (
                    <>
                      <Icon icon="ph:cloud-check-duotone" width={16} height={16} className="text-green-500" />
                      <span className="text-green-500">已同步</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <Icon icon="ph:cloud-warning" width={16} height={16} className="text-red-500" />
                      <span className="text-red-500">同步失败</span>
                    </>
                  )}
                </div>
              )}
              {/* 刷新按钮 */}
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  disabled={loading || syncStatus === 'syncing'}
                >
                  <Icon icon="ph:arrow-clockwise" width={18} height={18} className={loading ? 'animate-spin' : ''} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 操作栏 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            {/* 时间筛选 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Icon icon="ph:faders" width={20} height={20} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                {[
                  { key: '7days', label: '7天' },
                  { key: '30days', label: '30天' },
                  { key: 'all', label: '全部' },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key as any)}
                    className={`px-5 py-2 rounded-lg font-medium transition-all ${
                      selectedPeriod === period.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 导出按钮 */}
            <Button
              variant="secondary"
              onClick={handleExport}
              className="shadow-md hover:shadow-lg"
            >
              <Icon icon="ph:download-simple" width={18} height={18} className="mr-2" />
              导出数据
            </Button>
          </motion.div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: '累计回答',
                value: stats.totalAnswers,
                icon: 'lucide:message-circle',
                gradient: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                label: '总字数',
                value: stats.totalWords.toLocaleString(),
                icon: 'ph:text-aa',
                gradient: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              },
              {
                label: '连续天数',
                value: stats.currentStreak,
                icon: 'ph:flame',
                gradient: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
              },
              {
                label: '平均字数',
                value: stats.totalAnswers > 0
                  ? Math.round(stats.totalWords / stats.totalAnswers)
                  : 0,
                icon: 'ph:chart-bar',
                gradient: 'from-orange-500 to-red-500',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="cursor-default"
              >
                <Card className="overflow-hidden h-full">
                  <div className={`p-5 bg-gradient-to-br ${stat.bgColor} h-full`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md`}>
                        <Icon icon={stat.icon} width={28} height={28} className="text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 7天对比提醒 */}
          {comparisonPairs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-lg">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 border-b border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                        <Icon icon="ph:lightbulb-duotone" width={32} height={32} className="text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          💡 7天思维对比
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          发现 <span className="font-bold text-orange-500">{comparisonPairs.length}</span> 个问题的思考变化
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {comparisonPairs.slice(0, 3).map((pair, index) => {
                    const question = getQuestionById(pair.old.questionId);
                    return (
                      <button
                        key={index}
                        onClick={() => setShowComparison(pair)}
                        className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="ph:question-duotone" width={18} height={18} className="text-orange-500 flex-shrink-0" />
                              <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                {question?.content || '未知问题'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Icon icon="ph:calendar-blank" width={14} height={14} />
                                {format(new Date(pair.old.createdAt), 'MM月dd日')}
                              </span>
                              <Icon icon="ph:trend-up" width={16} height={16} className="text-green-500" />
                              <span className="flex items-center gap-1">
                                <Icon icon="ph:calendar-blank" width={14} height={14} />
                                {format(new Date(pair.new.createdAt), 'MM月dd日')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <Icon icon="ph:arrow-right" width={20} height={20} className="text-primary-500" />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {comparisonPairs.length > 3 && (
                  <div className="px-6 pb-6">
                    <div className="text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        还有 {comparisonPairs.length - 3} 个问题可以对比...
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* 时间线 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📅 思考时间线
            </h3>

            {Object.keys(answersByDate).length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                    <Icon icon="ph:calendar-x" width={36} height={36} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      还没有回答记录
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      开始思考，记录你的成长足迹吧！
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(answersByDate)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([dateKey, dayAnswers], index) => (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        {/* 日期头部 */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <Icon icon="ph:calendar-blank-duotone" width={22} height={22} className="text-blue-500" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {format(new Date(dateKey), 'yyyy年MM月dd日', {
                                    locale: zhCN,
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {format(new Date(dateKey), 'EEEE', { locale: zhCN })}
                                </p>
                              </div>
                            </div>
                            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {dayAnswers.length} 个回答
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 回答列表 */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {dayAnswers.map((answer) => {
                            const question = getQuestionById(answer.questionId);
                            const isExpanded = expandedAnswers.has(answer.id);

                            return (
                              <div key={answer.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                {/* 问题标题 */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                                      <Icon icon="ph:question-duotone" width={18} height={18} className="text-orange-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                                      {question?.content || '未知问题'}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Icon icon="ph:text-aa" width={14} height={14} />
                                        {answer.metadata.wordCount} 字
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Icon icon="ph:clock" width={14} height={14} />
                                        {format(new Date(answer.createdAt), 'HH:mm')}
                                      </span>
                                      {question?.category && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                          {getCategoryConfig(question.category.primary)?.label || question.category.primary}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => toggleAnswerExpansion(answer.id)}
                                    className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  >
                                    {isExpanded ? (
                                      <Icon icon="ph:caret-up" width={20} height={20} className="text-gray-500" />
                                    ) : (
                                      <Icon icon="ph:caret-down" width={20} height={20} className="text-gray-500" />
                                    )}
                                  </button>
                                </div>

                                {/* 回答内容（可展开） */}
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 ml-11"
                                  >
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {answer.content}
                                      </p>
                                      {answer.metadata.tags && answer.metadata.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          {answer.metadata.tags.map((tag, i) => (
                                            <span
                                              key={i}
                                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                                            >
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* 对比弹窗 */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                思维对比
              </h2>
              <button
                onClick={() => setShowComparison(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <ThoughtComparison oldAnswer={showComparison.oldAnswer} newAnswer={showComparison.newAnswer} />
          </motion.div>
        </div>
      )}

      {/* 批量导出对话框 */}
      <BatchExportDialog
        answers={filteredAnswers}
        isOpen={showBatchExport}
        onClose={() => setShowBatchExport(false)}
      />
    </div>
  );
}
