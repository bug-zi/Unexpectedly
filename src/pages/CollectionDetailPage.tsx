/**
 * 集合详情页面
 * 展示集合中的问题、进度、管理功能
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Share2,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  Play,
  Edit3,
  X,
  GripVertical,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCollection, useCollections } from '@/hooks/useCollections';
import { useFavorites } from '@/hooks/useFavorites';
import { getQuestionById } from '@/constants/questions';
import { Button } from '@/components/ui/Button';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import clsx from 'clsx';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

type FilterType = 'all' | 'answered' | 'pending';

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collection, loading, refetch } = useCollection(id);
  const { removeFavorite, moveToCollection } = useFavorites();
  const {
    deleteCollection,
    removeQuestion,
    duplicateCollection,
  } = useCollections();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // 筛选后的问题列表
  const filteredQuestions = collection?.questions
    .map((questionId) => ({
      id: questionId,
      question: getQuestionById(questionId),
    }))
    .filter((item) => {
      if (!item.question) return false;

      // TODO: 根据 isAnswered 状态筛选
      // 暂时显示所有问题
      return true;
    }) || [];

  const answeredCount = filteredQuestions.filter(q => {
    // TODO: 检查是否已回答
    return false;
  }).length;

  const pendingCount = filteredQuestions.length - answeredCount;

  const handleDelete = async () => {
    if (!collection) return;

    if (confirm(`确定要删除集合"${collection.name}"吗？此操作不可恢复。`)) {
      const success = await deleteCollection(collection.id);
      if (success) {
        navigate('/favorites');
      }
    }
  };

  const handleDuplicate = async () => {
    if (!collection) return;
    await duplicateCollection(collection.id);
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!collection) return;

    if (confirm('确定要从集合中移除这个问题吗？')) {
      const success = await removeQuestion(collection.id, questionId);
      if (success) {
        refetch();
      }
    }
  };

  const handleShare = async () => {
    if (!collection) return;

    // 生成分享链接
    const url = `${window.location.origin}/collections/${collection.id}`;

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(url);
      toast.success('✅ 链接已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败，请手动复制链接');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">集合不存在</p>
          <Button onClick={() => navigate('/favorites')}>返回</Button>
        </div>
      </div>
    );
  }

  const progress = collection.progress || 0;
  const isCompleted = progress === 100;

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/favorites')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${collection.color}20` }}
              >
                {collection.icon || '📁'}
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {collection.name}
              </h1>
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className={clsx(
                  'p-2 rounded-lg transition-all',
                  showSettings
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Settings size={20} className="text-gray-600 dark:text-gray-400" />
              </motion.button>
              <div className="w-10" />
            </div>
          </div>
        </div>
      </nav>

      {/* 设置下拉菜单 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 right-4 sm:right-8 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 w-48 sm:min-w-[200px]"
          >
            <button
              onClick={() => {
                setShowEditDialog(true);
                setShowSettings(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Edit3 size={18} />
              <span>编辑集合</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Plus size={18} />
              <span>复制集合</span>
            </button>
            <button
              onClick={handleShare}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Share2 size={18} />
              <span>分享集合</span>
            </button>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={18} />
              <span>删除集合</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 进度卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-gray-200 dark:border-gray-700"
          >
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle size={32} className="text-green-500" />
                  ) : (
                    <Clock size={32} className="text-purple-500" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isCompleted ? '已完成' : '进行中'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {collection.description || '暂无描述'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {progress}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {collection.answeredCount} / {collection.questionCount}
                  </div>
                </div>
              </div>

              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={clsx(
                    'h-full rounded-full',
                    isCompleted ? 'bg-green-500' : 'bg-purple-500'
                  )}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              {!isCompleted && (
                <Button
                  variant="primary"
                  className="flex-1 min-w-[200px]"
                  onClick={() => {
                    // 找到第一个未回答的问题
                    const firstPending = filteredQuestions[0];
                    if (firstPending) {
                      navigate(`/question/${firstPending.id}`);
                    }
                  }}
                  disabled={filteredQuestions.length === 0}
                >
                  <Play size={18} className="mr-2" />
                  继续思考
                </Button>
              )}

              {isCompleted && (
                <Button
                  variant="secondary"
                  className="flex-1 min-w-[200px]"
                  onClick={() => {
                    toast.info('🎉 集成进度报告功能即将上线');
                  }}
                >
                  查看报告
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setIsReordering(!isReordering)}
                className={clsx(
                  'border-2',
                  isReordering
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                {isReordering ? '完成排序' : '重新排序'}
              </Button>
            </div>
          </motion.div>

          {/* 状态筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-1">
              {[
                { key: 'all' as FilterType, label: '全部' },
                { key: 'answered' as FilterType, label: '已回答' },
                { key: 'pending' as FilterType, label: '待思考' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    filterType === filter.key
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredQuestions.length} 个问题
            </div>
          </motion.div>

          {/* 问题列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  集合中还没有问题
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  从收藏中添加问题，或者浏览问题时直接添加到这个集合
                </p>
                <Button onClick={() => navigate('/favorites')} variant="secondary">
                  去添加问题
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredQuestions.map((item, index) => {
                  if (!item.question) return null;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all relative"
                    >
                      {isReordering && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-grab">
                          <GripVertical size={24} className="text-gray-400" />
                        </div>
                      )}

                      <div className={clsx('p-6', isReordering ? 'pl-16' : '')}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                #{index + 1}
                              </span>
                              {item.question.category.primary && (
                                <span
                                  className={clsx(
                                    'px-2 py-1 rounded-lg text-xs font-medium',
                                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                  )}
                                >
                                  {getCategoryConfig(
                                    item.question.category.primary as 'thinking' | 'scenario',
                                    item.question.category.secondary!
                                  )?.name}
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif text-xl font-medium text-gray-900 dark:text-white mb-4">
                              {item.question.content}
                            </h3>

                            {item.question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {item.question.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/question/${item.id}`)}
                            >
                              开始思考
                            </Button>
                            {!isReordering && (
                              <button
                                onClick={() => handleRemoveQuestion(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="移除"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.div>

          {/* 最后更新时间 */}
          {collection.updatedAt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              最后更新：{formatDistanceToNow(new Date(collection.updatedAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* 编辑对话框 */}
      {showEditDialog && (
        <CreateCollectionDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            refetch();
          }}
          collectionId={collection.id}
        />
      )}
    </div>
  );
}
