import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Users } from 'lucide-react';
import { Question } from '@/types';
import { getCategoryConfig } from '@/constants/categories';
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
  onRoundtable?: () => void;
}

export function QuestionCard({
  question,
  onStart,
  onSkip,
  showFavorite = true,
  onRoundtable,
}: QuestionCardProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { isLater, addToLater, removeFromLater } = useLater();
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const [laterAnimating, setLaterAnimating] = useState(false);
  const navigate = useNavigate();

  // 使用本地乐观状态，立即响应点击
  const [optimisticFavorited, setOptimisticFavorited] = useState<boolean | null>(null);
  const [optimisticLater, setOptimisticLater] = useState<boolean | null>(null);

  // 获取当前状态（优先使用乐观状态，回退到全局状态）
  const favorited = optimisticFavorited !== null ? optimisticFavorited : isFavorited(question.id);
  const later = optimisticLater !== null ? optimisticLater : isLater(question.id);

  const category = question.category.primary
    ? getCategoryConfig(question.category.primary as 'thinking' | 'scenario', question.category.secondary!)
    : null;

  if (!category) return null;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newState = !favorited;

    // 立即更新 UI（乐观更新）
    setOptimisticFavorited(newState);
    setFavoriteAnimating(true);
    setTimeout(() => setFavoriteAnimating(false), 500);

    // 立即显示成功提示
    toast.success(newState ? '⭐ 已收藏' : '已取消收藏', {
      autoClose: 1500,
      className: '!bg-gradient-to-r !from-yellow-500 !to-amber-500 !text-white',
      style: { background: 'linear-gradient(to right, #EAB308, #F59E0B)' }
    });

    try {
      if (newState) {
        const result = await addFavorite(question.id);
        if (!result) {
          // 如果添加失败，回滚状态并显示错误
          setOptimisticFavorited(null);
          toast.error('收藏失败，请重试');
        }
      } else {
        const success = await removeFavorite(question.id);
        if (!success) {
          // 如果删除失败，回滚状态并显示错误
          setOptimisticFavorited(null);
          toast.error('取消收藏失败，请重试');
        }
      }
    } catch (error) {
      // 出错时回滚状态
      setOptimisticFavorited(null);
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

    const newState = !later;

    // 立即更新 UI（乐观更新）
    setOptimisticLater(newState);
    setLaterAnimating(true);
    setTimeout(() => setLaterAnimating(false), 500);

    // 立即显示成功提示
    toast.success(newState ? '🕐 已添加到"待思考"' : '已从"待思考"移除', {
      autoClose: 1500,
      className: '!bg-gradient-to-r !from-yellow-500 !to-amber-500 !text-white',
      style: { background: 'linear-gradient(to right, #EAB308, #F59E0B)' }
    });

    try {
      if (newState) {
        const success = await addToLater(question.id);
        if (!success) {
          // 如果添加失败，回滚状态并显示错误
          setOptimisticLater(null);
          toast.error('添加失败，请重试');
        } else {
          // 点击"稍后回答"后自动切换到下一个问题
          setTimeout(() => {
            onSkip();
          }, 300);
        }
      } else {
        const success = await removeFromLater(question.id);
        if (!success) {
          // 如果删除失败，回滚状态并显示错误
          setOptimisticLater(null);
          toast.error('移除失败，请重试');
        }
      }
    } catch (error) {
      // 出错时回滚状态
      setOptimisticLater(null);
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
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto hover:shadow-xl transition-all border-2 border-amber-200 dark:border-amber-800 relative"
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
                ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700'
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
      <div className="mb-6 pr-12">
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
      </div>

      {/* 问题文本 - 固定高度限制 */}
      <div className="min-h-[120px] max-h-[140px] mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-medium leading-relaxed text-gray-900 dark:text-white line-clamp-4">
          {question.content}
        </h2>
      </div>

      {/* 难度标签 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
          难度:
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className={clsx(
                'w-2 h-2 rounded-full',
                level <= question.difficulty
                  ? 'bg-amber-500'
                  : 'bg-amber-200 dark:bg-amber-800'
              )}
            />
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="relative overflow-hidden w-full py-2.5 px-4 rounded-lg font-medium transition-all border border-amber-200 dark:border-amber-800"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/icon-picture/icon-question1.jpg)' }}
          />
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70" />
          <span className="relative z-10 text-gray-700 dark:text-gray-300">开始思考</span>
        </motion.button>
        {onRoundtable && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRoundtable}
            className="relative overflow-hidden w-full py-2.5 px-4 rounded-lg font-medium transition-all"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url(/icon-picture/icon-question1.jpg)' }}
            />
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/70" />
            <span className="relative z-10 flex items-center justify-center text-black dark:text-amber-300">
              <Users size={16} className="mr-1" />
              大咖圆桌
            </span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSkip}
          className="relative overflow-hidden w-full py-2.5 px-4 rounded-lg font-medium transition-all border border-amber-200 dark:border-amber-800"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/icon-picture/icon-question1.jpg)' }}
          />
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70" />
          <span className="relative z-10 text-gray-700 dark:text-gray-300">换一个</span>
        </motion.button>
      </div>

      {/* 标签 */}
      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-amber-200 dark:border-amber-800">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
