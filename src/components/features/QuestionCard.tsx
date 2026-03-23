import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { Question } from '@/types';
import { getCategoryConfig } from '@/constants/categories';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/Icon';
import { clsx } from 'clsx';
import { useFavorites } from '@/hooks/useFavorites';
import { useLater } from '@/hooks/useLater';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
  question: Question;
  onStart: () => void;
  onSkip: () => void;
  showFavorite?: boolean;
}

export function QuestionCard({
  question,
  onStart,
  onSkip,
  showFavorite = true,
}: QuestionCardProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { isLater, addToLater, removeFromLater } = useLater();
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const [laterAnimating, setLaterAnimating] = useState(false);
  const navigate = useNavigate();

  // 检查是否已收藏/稍后回答
  const favorited = isFavorited(question.id);
  const later = isLater(question.id);

  const category = question.category.primary
    ? getCategoryConfig(question.category.primary as 'thinking' | 'scenario', question.category.secondary!)
    : null;

  if (!category) return null;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setFavoriteAnimating(true);
    setTimeout(() => setFavoriteAnimating(false), 500);

    try {
      if (favorited) {
        await removeFavorite(question.id);
      } else {
        await addFavorite(question.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '收藏操作失败';
      if (message.includes('请先登录')) {
        toast.warning('💡 请先登录后使用收藏功能', {
          position: 'top-center',
          autoClose: 2000,
          onClick: () => navigate('/login')
        });
      } else {
        toast.error(`❌ ${message}`);
      }
      console.error('收藏操作失败:', error);
    }
  };

  const handleLater = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setLaterAnimating(true);
    setTimeout(() => setLaterAnimating(false), 500);

    try {
      if (later) {
        await removeFromLater(question.id);
      } else {
        const success = await addToLater(question.id);
        if (success) {
          // 点击"稍后回答"后自动切换到下一个问题
          setTimeout(() => {
            onSkip();
          }, 800);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败';
      if (message.includes('请先登录')) {
        toast.warning('💡 请先登录后使用此功能', {
          position: 'top-center',
          autoClose: 2000,
          onClick: () => navigate('/login')
        });
      } else {
        toast.error(`❌ ${message}`);
      }
      console.error('稍后回答操作失败:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto hover:shadow-xl transition-all relative"
    >
      {/* 右上角按钮组 */}
      {showFavorite && (
        <div className="absolute top-6 right-6 flex gap-2 z-10">
          {/* 稍后回答按钮 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLater}
            animate={laterAnimating ? {
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0],
            } : {}}
            transition={{ duration: 0.5 }}
            className={clsx(
              'p-2 rounded-lg transition-all',
              later
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={later ? '取消稍后回答' : '稍后回答'}
          >
            <Clock size={20} fill={later ? 'currentColor' : 'none'} />
          </motion.button>

          {/* 收藏按钮 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            animate={favoriteAnimating ? {
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0],
            } : {}}
            transition={{ duration: 0.5 }}
            className={clsx(
              'p-2 rounded-lg transition-all',
              favorited
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={favorited ? '取消收藏' : '收藏'}
          >
            <Star size={20} fill={favorited ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
      )}

      {/* 类别标签 */}
      <div className="flex items-center justify-between mb-6 pr-12">
        <div
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'text-sm font-medium'
          )}
          style={{
            backgroundColor: category.light,
            color: category.dark,
          }}
        >
          <CategoryIcon
            iconName={category.iconName || category.icon}
            color={category.dark}
            size={18}
          />
          <span>{category.name}</span>
        </div>
        {question.answerCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="text-base">💭</span>
            <span>{question.answerCount}人已思考</span>
          </span>
        )}
      </div>

      {/* 问题文本 */}
      <h2 className="font-serif text-3xl md:text-4xl font-medium leading-relaxed text-gray-900 dark:text-white mb-8">
        {question.content}
      </h2>

      {/* 难度标签 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          难度:
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className={clsx(
                'w-2 h-2 rounded-full',
                level <= question.difficulty
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onStart} fullWidth>
          开始思考
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="border border-gray-200 dark:border-gray-700"
          fullWidth
        >
          换一个
        </Button>
      </div>

      {/* 标签 */}
      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
