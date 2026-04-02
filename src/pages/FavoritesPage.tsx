/**
 * 我的收藏页面
 * 展示收藏的问题和主题集合
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  FolderOpen,
  Plus,
  MagnifyingGlass,
  SquaresFour,
  List as ListIcon,
  SignIn,
} from '@phosphor-icons/react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCollections } from '@/hooks/useCollections';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import { getQuestionById } from '@/constants/questions';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { clsx } from 'clsx';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'answered';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, stats, loading: favoritesLoading } = useFavorites();
  const { collections, loading: collectionsLoading } = useCollections();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedStatCard, setSelectedStatCard] = useState<'all' | 'answered' | 'collections'>('all');

  // 综合加载状态：认证检查 + 收藏数据 + 集合数据
  const isLoading = checkingAuth || favoritesLoading || collectionsLoading;

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setCheckingAuth(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 筛选后的收藏列表
  const filteredFavorites = favorites.filter(favorite => {
    const question = getQuestionById(favorite.questionId);
    if (!question) {
      return false;
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        question.content.toLowerCase().includes(query) ||
        question.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // 状态过滤
    if (filterType === 'answered' && !favorite.isAnswered) return false;

    return true;
  });

  const handleQuestionClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-question2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 背景遮罩层 - 暖色主题融合 */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(255,251,235,0.82) 0%, rgba(254,243,199,0.75) 40%, rgba(255,237,213,0.78) 100%)' }} />
      <div className="hidden dark:block absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(30,20,10,0.85) 40%, rgba(17,24,39,0.88) 100%)' }} />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="relative flex items-center justify-between h-16 gap-2">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/questions/explore')}
              className="flex items-center gap-1 px-2 py-1.5 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
            >
              <ArrowLeft size={18} weight="duotone" />
              <span className="text-sm hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 - 绝对居中 */}
            <div className="absolute inset-x-0 flex justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: customEasing.unexpected }}
                className="flex items-center gap-2 px-2 pointer-events-auto"
              >
                <Star size={20} weight="duotone" className="text-amber-500 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                  我的收藏
                </h1>
              </motion.div>
            </div>

            <div className="w-16 shrink-0" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 加载动画 */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                {/* 外圈旋转 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-4 border-orange-200 dark:border-orange-900 rounded-full"
                />
                {/* 中圈旋转 */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 left-2 w-16 h-16 border-4 border-yellow-400 dark:border-yellow-600 rounded-full"
                />
                {/* 内圈 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-5 left-5 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-full flex items-center justify-center"
                >
                  <Star size={20} weight="duotone" className="text-white" />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                正在加载收藏数据...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
              >
                请稍候
              </motion.p>
            </motion.div>
          )}

          {/* 未登录提示 */}
          {!isLoading && !isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                    <SignIn size={32} weight="duotone" className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    登录后使用收藏功能
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    收藏和集合功能需要登录才能使用。登录后你可以：
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">⭐</span>
                      <span>收藏喜欢的问题</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">📁</span>
                      <span>创建主题集合</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">📊</span>
                      <span>追踪学习进度</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">🔔</span>
                      <span>设置学习提醒</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <SignIn size={18} weight="duotone" className="mr-2" />
                    立即登录
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 主要内容（仅在加载完成后显示） */}
          {!isLoading && (
            <>
          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {[
              {
                key: 'all',
                label: '总收藏',
                value: stats.totalFavorites,
                icon: Star,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                borderColor: 'border-yellow-400 dark:border-yellow-600',
                bgImage: "url('/UI-picture/UI-question3.jpg')",
              },
              {
                key: 'answered',
                label: '已回答',
                value: stats.answeredFavorites,
                icon: Star,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                borderColor: 'border-yellow-400 dark:border-yellow-600',
                bgImage: "url('/UI-picture/UI-question4.jpg')",
              },
              {
                key: 'collections',
                label: '主题集合',
                value: stats.collectionsCount,
                icon: FolderOpen,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                borderColor: 'border-yellow-400 dark:border-yellow-600',
                bgImage: "url('/UI-picture/UI-question-explore.jpg')",
              },
            ].map((stat) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (stat.key === 'collections') {
                    // 滚动到集合区域
                    const collectionSection = document.getElementById('collections-section');
                    if (collectionSection) {
                      collectionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    setSelectedStatCard('collections');
                  } else {
                    // 设置筛选条件
                    setFilterType(stat.key as 'all' | 'answered');
                    setSelectedStatCard(stat.key as 'all' | 'answered' | 'collections');
                  }
                }}
                className={clsx(
                  'relative rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 overflow-hidden',
                  selectedStatCard === stat.key
                    ? stat.borderColor + ' shadow-md scale-105'
                    : 'border-transparent hover:border-amber-300 dark:hover:border-amber-700'
                )}
              >
                {/* 背景图 */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: stat.bgImage }}
                />
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm" />

                <div className={`relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 mb-3 inline-block`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div className="relative text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="relative text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
                {selectedStatCard === stat.key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* 搜索和筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <MagnifyingGlass
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20} weight="duotone"
              />
              <Input
                type="text"
                placeholder="搜索收藏的问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base border-2 border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                fullWidth
              />
            </div>

            <div className="flex gap-2">
              {/* 筛选按钮 */}
              <div className="flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border-2 border-amber-200 dark:border-amber-800 p-1">
                {[
                  { key: 'all' as FilterType, label: '全部' },
                  { key: 'answered' as FilterType, label: '已答' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === filter.key
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* 视图切换 */}
              <div className="flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border-2 border-amber-200 dark:border-amber-800 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                >
                  <SquaresFour size={18} weight="duotone" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                >
                  <ListIcon size={18} weight="duotone" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 我的集合 */}
          <motion.div
            id="collections-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                我的主题集合
              </h2>
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="primary"
                size="sm"
                className="!bg-amber-100 hover:!bg-amber-200 !text-amber-700 !shadow-none dark:!bg-amber-900/30 dark:hover:!bg-amber-900/50 dark:!text-amber-300"
              >
                <Plus size={18} weight="duotone" className="mr-2" />
                创建集合
              </Button>
            </div>

            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.slice(0, 6).map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/collections/${collection.id}`)}
                    className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-amber-300 dark:hover:border-amber-700 overflow-hidden group backdrop-blur-sm"
                  >
                    {/* 背景图片 */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: 'url(/icon-picture/icon-question1.jpg)' }}
                    />
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-amber-50/80 dark:from-gray-900/85 dark:via-gray-800/80 dark:to-amber-900/80" />
                    {/* 进度条背景 */}
                    <div
                      className="absolute bottom-0 left-0 h-1 z-20 transition-all"
                      style={{
                        width: `${collection.progress}%`,
                        backgroundColor: collection.color,
                      }}
                    />

                    <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${collection.color}20` }}
                      >
                        {collection.icon || <FolderOpen size={24} weight="duotone" />}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {collection.progress}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {collection.answeredCount} / {collection.questionCount}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    {collection.lastAnsweredAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        最后活跃：{formatDistanceToNow(new Date(collection.lastAnsweredAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative text-center py-12 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-question4.jpg')" }} />
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm" />
                <div className="relative text-5xl mb-4"><FolderOpen size={48} weight="duotone" className="text-amber-400 mx-auto" /></div>
                <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-2">
                  还没有创建任何集合
                </h3>
                <p className="relative text-gray-600 dark:text-gray-400 mb-4">
                  集合可以帮助你整理和管理相关的问题
                </p>
              </div>
            )}
          </motion.div>

          {/* 收藏的问题列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              收藏的问题
            </h2>

            {filteredFavorites.length === 0 ? (
              <div className="relative text-center py-20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-question-explore.jpg')" }} />
                <div className="absolute inset-0 bg-white/65 dark:bg-gray-900/65 backdrop-blur-sm" />
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100/80 to-yellow-200/80 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full mb-6">
                  <Star size={48} weight="duotone" className="text-gray-400" />
                </div>
                <h3 className="relative text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchQuery ? '没有找到匹配的问题' : '还没有收藏任何问题'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? '试试调整搜索关键词'
                    : '点击问题卡片上的星星图标收藏喜欢的问题'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/questions')} variant="secondary">
                    去浏览问题
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFavorites.map((favorite, index) => {
                  const question = getQuestionById(favorite.questionId);
                  if (!question) return null;

                  return (
                    <motion.div
                      key={favorite.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleQuestionClick(question.id)}
                      className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-amber-200/40 dark:border-amber-800/40 hover:border-amber-400/60 dark:hover:border-amber-600/60 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/UI-picture/UI-question3.jpg')" }} />
                      <div className="relative flex items-center gap-3 w-full">
                        <span className="text-xs text-amber-500 font-medium shrink-0">
                          #{index + 1}
                        </span>
                        <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {favorite.isAnswered && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                              已答
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true, locale: zhCN })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
            </>
          )}
        </div>
      </main>
      </div>{/* 内容层结束 */}

      {/* 创建集合对话框 */}
      <CreateCollectionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          // 刷新数据
          window.location.reload();
        }}
      />
    </div>
  );
}
