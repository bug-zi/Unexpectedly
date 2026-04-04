/**
 * 待思考页面
 * 展示标记为"待思考"的问题，与收藏功能完全独立
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Clock,
  LogIn,
  Grid,
  List,
} from 'lucide-react';
import { useLater } from '@/hooks/useLater';
import { QuestionCard } from '@/components/features/QuestionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

export function LaterPage() {
  const navigate = useNavigate();
  const { laterQuestions, stats, loading } = useLater();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoading = checkingAuth || loading;

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

  // 筛选后的待思考列表
  const filteredLaterQuestions = laterQuestions.filter(later => {
    const question = getQuestionById(later.questionId);
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

    return true;
  });

  const handleQuestionClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const handleSkip = () => {
    const currentIndex = filteredLaterQuestions.findIndex(
      l => l.questionId === filteredLaterQuestions[0]?.questionId
    );
    const nextIndex = (currentIndex + 1) % filteredLaterQuestions.length;
    if (filteredLaterQuestions[nextIndex]) {
      handleQuestionClick(filteredLaterQuestions[nextIndex].questionId);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/UI-picture/UI-question4.jpg)',
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
              <ArrowLeft size={18} />
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
                <Clock size={20} className="text-yellow-500 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                  待思考
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
                  className="w-20 h-20 border-4 border-yellow-200 dark:border-yellow-900 rounded-full"
                />
                {/* 中圈旋转 */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 left-2 w-16 h-16 border-4 border-cyan-400 dark:border-cyan-600 rounded-full"
                />
                {/* 内圈 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-5 left-5 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-full flex items-center justify-center"
                >
                  <Clock size={20} className="text-white" />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                正在加载待思考列表...
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
                    <LogIn size={32} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    登录后使用待思考功能
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    待思考功能需要登录才能使用。登录后你可以：
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">🕐</span>
                      <span>标记问题稍后思考</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">📋</span>
                      <span>整理待思考清单</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">📊</span>
                      <span>追踪思考进度</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500">🔔</span>
                      <span>设置优先级提醒</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <LogIn size={18} className="mr-2" />
                    立即登录
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 主要内容（仅在加载完成后显示） */}
          {!isLoading && isAuthenticated && (
            <>
              {/* 统计卡片 */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: customEasing.elastic }}
                className="mb-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-yellow-400 dark:border-yellow-600 overflow-hidden"
                >
                  {/* 背景图 */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/UI-picture/UI-question3.jpg')" }}
                  />
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm" />

                  <div className="relative p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mb-3 inline-block">
                    <Clock size={24} className="text-yellow-500" />
                  </div>
                  <div className="relative text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.total}
                  </div>
                  <div className="relative text-sm text-gray-600 dark:text-gray-400">
                    待思考总数
                  </div>
                </motion.div>
              </motion.div>

              {/* 搜索和视图切换 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 flex flex-col md:flex-row gap-4"
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="搜索待思考的问题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-3 text-base border-2 border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                    fullWidth
                  />
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
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </motion.div>

              {/* 待思考问题列表 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  待思考问题
                </h2>

                {filteredLaterQuestions.length === 0 ? (
                  <div className="relative text-center py-20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-question3.jpg')" }} />
                    <div className="absolute inset-0 bg-white/65 dark:bg-gray-900/65 backdrop-blur-sm" />
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100/80 to-yellow-200/80 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full mb-6">
                      <Clock size={48} className="text-gray-400" />
                    </div>
                    <h3 className="relative text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {searchQuery ? '没有找到匹配的问题' : '待思考列表是空的'}
                    </h3>
                    <p className="relative text-gray-600 dark:text-gray-400 mb-6">
                      {searchQuery
                        ? '试试调整搜索关键词'
                        : '点击问题卡片上的时钟图标标记为待思考'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => navigate('/questions')} variant="secondary">
                        去浏览问题
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredLaterQuestions.map((later, index) => {
                      const question = getQuestionById(later.questionId);
                      if (!question) return null;

                      return (
                        <motion.div
                          key={later.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.05, 0.5) }}
                          className="relative"
                        >
                          {/* 添加时间标签 */}
                          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>
                              添加于 {formatDistanceToNow(later.createdAt, {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                          <QuestionCard
                            question={question}
                            onStart={() => handleQuestionClick(question.id)}
                            onSkip={handleSkip}
                          />
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
    </div>
  );
}
