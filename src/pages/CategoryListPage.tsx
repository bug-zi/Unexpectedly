import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { QuestionCard } from '@/components/features/QuestionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QUESTIONS } from '@/constants/questions';
import { getCategoryConfig, THINKING_DIMENSIONS, LIFE_SCENARIOS } from '@/constants/categories';
import { ThinkingDimension, LifeScenario } from '@/types';
import { Icon } from '@/components/ui/Icon';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function CategoryListPage() {
  const { type } = useParams<{ type: 'thinking' | 'scenario' }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 根据类型获取分类配置
  const categories = type === 'thinking' ? THINKING_DIMENSIONS : LIFE_SCENARIOS;

  // 筛选问题
  const filteredQuestions = useMemo(() => {
    let questions = QUESTIONS;

    // 按主分类筛选
    if (type === 'thinking') {
      questions = questions.filter((q) => q.category.primary === 'thinking');
    } else if (type === 'scenario') {
      questions = questions.filter((q) => q.category.primary === 'scenario');
    }

    // 按子分类筛选
    if (selectedCategory) {
      questions = questions.filter((q) => q.category.secondary === selectedCategory);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      questions = questions.filter(
        (q) =>
          q.content.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return questions;
  }, [type, selectedCategory, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleQuestionClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const pageTitle = type === 'thinking' ? '思维维度' : '生活场景';
  const pageIcon = type === 'thinking' ? 'Lightbulb' : 'Globe';

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
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
              <Icon name={pageIcon} size={24} className="text-amber-600 dark:text-amber-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
            </motion.div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              探索{pageTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {filteredQuestions.length} 个问题等待你的思考
            </p>
          </motion.div>

          {/* 搜索框 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400"
                size={22}
              />
              <Input
                type="text"
                placeholder="搜索问题或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-600 rounded-2xl shadow-lg"
                fullWidth
              />
            </div>
          </motion.div>

          {/* 分类筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Filter size={20} className="text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">按分类筛选</span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent hover:border-amber-300 dark:hover:border-amber-700'
                }`}
              >
                <Sparkles size={16} className="inline mr-2" />
                全部 ({filteredQuestions.length})
              </motion.button>
              {Object.values(categories).map((category, index) => {
                const count = QUESTIONS.filter(
                  (q) => q.category.secondary === category.id
                ).length;
                const isSelected = selectedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2, rotate: isSelected ? 0 : 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                      isSelected
                        ? 'text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: category.color,
                            boxShadow: `0 10px 30px -10px ${category.color}80`,
                          }
                        : {}
                    }
                  >
                    <Icon
                      name={category.iconName || category.icon}
                      size={18}
                      color={isSelected ? '#fff' : category.color}
                      className={isSelected ? 'scale-110' : ''}
                    />
                    <span>{category.name}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* 问题列表 */}
          <AnimatePresence mode="wait">
            {filteredQuestions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
                  <Search size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  没有找到匹配的问题
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  试试调整搜索关键词或选择其他分类
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  variant="secondary"
                >
                  清除筛选条件
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: Math.min(index * 0.05, 0.5),
                      ease: customEasing.unexpected,
                    }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => handleQuestionClick(question.id)}
                    className="cursor-pointer"
                  >
                    <QuestionCard
                      question={question}
                      onStart={() => handleQuestionClick(question.id)}
                      onSkip={() => {
                        const currentIndex = filteredQuestions.findIndex(
                          (q) => q.id === question.id
                        );
                        const nextIndex = (currentIndex + 1) % filteredQuestions.length;
                        handleQuestionClick(filteredQuestions[nextIndex].id);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 统计信息 */}
          {filteredQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full border border-amber-200 dark:border-amber-800">
                <Sparkles size={18} className="text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  显示 {filteredQuestions.length} 个问题
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
