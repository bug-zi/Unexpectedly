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
import { getAnswers, getSlotMachineResults, getTurtleSoupRecords, updateAnswer, deleteAnswer } from '@/utils/storage';
import { Answer, Activity } from '@/types';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
        // 加载所有活动
        loadAllActivities();
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // 加载所有类型的活动记录
  const loadAllActivities = () => {
    const answersData = getAnswers();
    const slotMachineResults = getSlotMachineResults();
    const turtleSoupRecords = getTurtleSoupRecords();

    // 转换为统一的活动格式
    const allActivities: Activity[] = [
      ...answersData.map(a => ({
        id: a.id,
        type: 'answer' as const,
        timestamp: a.createdAt,
        data: a,
      })),
      ...slotMachineResults.map(r => ({
        id: r.id,
        type: 'slotMachine' as const,
        timestamp: r.createdAt,
        data: r,
      })),
      ...turtleSoupRecords.map(r => ({
        id: r.id,
        type: 'turtleSoup' as const,
        timestamp: r.completedAt,
        data: r,
      })),
    ];

    // 按时间倒序排序
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setActivities(allActivities);
  };

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
        // 加载所有活动
        loadAllActivities();
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

  // 筛选时间范围后的活动
  const filteredActivities = useMemo(() => {
    if (selectedPeriod === 'all') return activities;

    const days = selectedPeriod === '7days' ? 7 : 30;
    const cutoffDate = subDays(new Date(), days);

    return activities.filter((activity) => new Date(activity.timestamp) >= cutoffDate);
  }, [activities, selectedPeriod]);

  // 统计数据
  const stats = useMemo(() => {
    const answerActivities = filteredActivities.filter(a => a.type === 'answer');
    const totalAnswers = answerActivities.length;

    // 计算总字数：包含问答和老虎机
    let totalWords = answerActivities.reduce(
      (sum, activity) => sum + (activity.data as Answer).metadata.wordCount,
      0
    );

    // 添加老虎机的字数
    const slotMachineActivities = filteredActivities.filter(a => a.type === 'slotMachine');
    slotMachineActivities.forEach(activity => {
      const slotResult = activity.data as any;
      if (slotResult.response) {
        totalWords += slotResult.response.length;
      }
    });

    return {
      totalAnswers,
      totalWords,
      totalSlotMachines: slotMachineActivities.length,
      totalTurtleSoups: filteredActivities.filter(a => a.type === 'turtleSoup').length,
    };
  }, [filteredActivities]);

  // 查找可对比的回答（同一问题7天前的回答）
  const comparisonPairs = useMemo(() => {
    return findSevenDayComparisons(filteredAnswers);
  }, [filteredAnswers]);

  // 按日期分组
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};

    filteredActivities.forEach((activity) => {
      const dateKey = format(new Date(activity.timestamp), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return grouped;
  }, [filteredActivities]);

  const handleExport = () => {
    setShowBatchExport(true);
  };

  const handleRefresh = async () => {
    await loadFromCloud();
  };

  const handleActivityClick = (activity: Activity) => {
    // 只有问答和老虎机有详细内容可以展示
    if (activity.type === 'answer' || activity.type === 'slotMachine') {
      setSelectedActivity(activity);
    }
  };

  const handleEditAnswer = (answer: Answer) => {
    setSelectedActivity(null);
    setEditingAnswer(answer);
  };

  const handleSaveEdit = (updatedContent: string) => {
    if (!editingAnswer) return;

    // 更新本地存储
    updateAnswer(editingAnswer.id, {
      content: updatedContent,
      metadata: {
        ...editingAnswer.metadata,
        wordCount: updatedContent.length,
      },
    });

    // 如果已登录，同步到云端
    if (isAuthenticated && user) {
      supabase
        .from('answers')
        .update({
          content: updatedContent,
          metadata: {
            wordCount: updatedContent.length,
            readingTime: editingAnswer.metadata.readingTime,
            writingTime: editingAnswer.metadata.writingTime,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAnswer.id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('云端更新失败:', error);
          }
        });
    }

    // 重新加载数据
    loadAllActivities();
    setEditingAnswer(null);
  };

  const handleDeleteAnswer = (answerId: string) => {
    setDeleteTargetId(answerId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;

    // 删除本地存储
    deleteAnswer(deleteTargetId);

    // 如果已登录，软删除云端数据
    if (isAuthenticated && user) {
      supabase
        .from('answers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deleteTargetId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('云端删除失败:', error);
          }
        });
    }

    // 重新加载数据
    loadAllActivities();
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
    setSelectedActivity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <Icon icon="ph:arrow-left" width={22} height={22} />
              <span>返回</span>
            </button>
            <div className="flex items-center gap-2">
              <Icon icon="ph:chart-line-up-duotone" width={28} height={28} className="text-amber-500" />
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
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
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
                gradient: 'from-amber-500 to-yellow-500',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
              },
              {
                label: '总字数',
                value: stats.totalWords.toLocaleString(),
                icon: 'ph:text-aa',
                gradient: 'from-orange-500 to-amber-500',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
              },
              {
                label: '灵感次数',
                value: stats.totalSlotMachines,
                icon: 'ph:lightbulb',
                gradient: 'from-yellow-500 to-amber-500',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
              },
              {
                label: '海龟汤',
                value: stats.totalTurtleSoups,
                icon: 'ph:bowl-food',
                gradient: 'from-amber-500 to-yellow-500',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
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
              📅 活动时间线
            </h3>

            {Object.keys(activitiesByDate).length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                    <Icon icon="ph:calendar-x" width={36} height={36} className="text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      还没有活动记录
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      开始思考，记录你的成长足迹吧！
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(activitiesByDate)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([dateKey, dayActivities], index) => (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        {/* 日期头部 */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
                            <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                {dayActivities.length} 个活动
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 活动列表 */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {dayActivities.map((activity) => {
                            // 根据活动类型渲染不同的内容
                            if (activity.type === 'answer') {
                              const answer = activity.data as Answer;
                              const question = getQuestionById(answer.questionId);

                              return (
                              <div
                                key={answer.id}
                                onClick={() => handleActivityClick(activity)}
                                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                              >
                                {/* 问题标题 */}
                                <div className="flex items-start gap-3">
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
                                  <div className="flex-shrink-0">
                                    <Icon icon="ph:caret-right" width={20} height={20} className="text-gray-400" />
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (activity.type === 'slotMachine') {
                            const slotResult = activity.data as any;
                            return (
                              <div
                                key={activity.id}
                                onClick={() => handleActivityClick(activity)}
                                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="p-2 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg">
                                      <Icon icon="ph:lightbulb-duotone" width={18} height={18} className="text-orange-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900 dark:text-white">灵感老虎机</span>
                                      {slotResult.easterEgg && (
                                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                                          彩蛋
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {slotResult.words.map((word: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium">
                                          {word}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Icon icon="ph:clock" width={14} height={14} />
                                        {format(new Date(activity.timestamp), 'HH:mm')}
                                      </span>
                                      {slotResult.response && (
                                        <span className="flex items-center gap-1">
                                          <Icon icon="ph:text-aa" width={14} height={14} />
                                          {slotResult.response.length} 字
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {slotResult.response && (
                                    <div className="flex-shrink-0">
                                      <Icon icon="ph:caret-right" width={20} height={20} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (activity.type === 'turtleSoup') {
                            const soupRecord = activity.data as any;
                            const difficultyColor = {
                              '简单': 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-900/20',
                              '中等': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
                              '困难': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
                            }[soupRecord.difficulty];
                            return (
                              <div key={activity.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                                      <Icon icon="ph:bowl-food" width={18} height={18} className="text-amber-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900 dark:text-white">海龟汤</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColor}`}>
                                        {soupRecord.difficulty}
                                      </span>
                                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                                        {soupRecord.category}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{soupRecord.puzzleTitle}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Icon icon="ph:clock" width={14} height={14} />
                                        {format(new Date(activity.timestamp), 'HH:mm')}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Icon icon="ph:chat-circle-dots" width={14} height={14} />
                                        {soupRecord.questionsAsked} 个问题
                                      </span>
                                      {soupRecord.hintsUsed > 0 && (
                                        <span className="flex items-center gap-1">
                                          <Icon icon="ph:lightbulb" width={14} height={14} />
                                          {soupRecord.hintsUsed} 个提示
                                        </span>
                                      )}
                                      {soupRecord.solved && (
                                        <span className="px-2 py-0.5 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded-full text-xs">
                                          已完成
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
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

      {/* 活动详情弹窗 */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedActivity.type === 'answer' ? '问题回答' : '灵感联想'}
              </h2>
              <div className="flex items-center gap-2">
                {selectedActivity.type === 'answer' && (
                  <>
                    <button
                      onClick={() => handleEditAnswer(selectedActivity.data as Answer)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      <Icon icon="ph:pencil-simple" width={18} height={18} />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAnswer(selectedActivity.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Icon icon="ph:trash" width={18} height={18} />
                      <span>删除</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedActivity.type === 'answer' && (() => {
              const answer = selectedActivity.data as Answer;
              const question = getQuestionById(answer.questionId);
              return (
                <div className="space-y-6">
                  {/* 问题 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                        <Icon icon="ph:question-duotone" width={20} height={20} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">问题</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium mb-2">{question?.content || '未知问题'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Icon icon="ph:clock" width={14} height={14} />
                          {format(new Date(answer.createdAt), 'yyyy年MM月dd日 HH:mm')}
                        </span>
                        {question?.category && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                            {getCategoryConfig(question.category.primary)?.label || question.category.primary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 回答 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                        <Icon icon="ph:chat-circle-dots" width={20} height={20} className="text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">我的回答</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{answer.content}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Icon icon="ph:text-aa" width={14} height={14} />
                          {answer.metadata.wordCount} 字
                        </span>
                        {answer.metadata.tags && answer.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {answer.metadata.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedActivity.type === 'slotMachine' && (() => {
              const slotResult = selectedActivity.data as any;
              return (
                <div className="space-y-6">
                  {/* 词语组合 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg">
                        <Icon icon="ph:lightbulb-duotone" width={20} height={20} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">灵感词语</h3>
                      {slotResult.easterEgg && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                          {slotResult.easterEgg.title}
                        </span>
                      )}
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex flex-wrap justify-center gap-3 mb-3">
                        {slotResult.words.map((word: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-lg font-bold">
                            {word}
                          </span>
                        ))}
                      </div>
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center justify-center gap-1">
                          <Icon icon="ph:clock" width={14} height={14} />
                          {format(new Date(selectedActivity.timestamp), 'yyyy年MM月dd日 HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 联想内容 */}
                  {slotResult.response && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg">
                          <Icon icon="ph:lightbulb" width={20} height={20} className="text-pink-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">我的联想</h3>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{slotResult.response}</p>
                        <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Icon icon="ph:text-aa" width={14} height={14} />
                            {slotResult.response.length} 字
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* 编辑对话框 */}
      {editingAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">编辑回答</h2>
              <button
                onClick={() => setEditingAnswer(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 问题 */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white font-medium">
                  {getQuestionById(editingAnswer.questionId)?.content || '未知问题'}
                </p>
              </div>

              {/* 编辑区 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  你的回答
                </label>
                <textarea
                  value={editingAnswer.content}
                  onChange={(e) => setEditingAnswer({ ...editingAnswer, content: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100 min-h-[200px] resize-y"
                  placeholder="在这里修改你的回答..."
                />
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {editingAnswer.content.length} 字
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleSaveEdit(editingAnswer.content)}
                  disabled={!editingAnswer.content.trim()}
                  className="flex-1"
                >
                  保存修改
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setEditingAnswer(null)}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:warning-circle" width={32} height={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                确认删除
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                你确定要删除这条问答记录吗？此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  确认删除
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
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
