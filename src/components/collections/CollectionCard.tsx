/**
 * 集合卡片组件
 * 用于在列表中展示集合
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Collection } from '@/types/collections';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import clsx from 'clsx';

interface CollectionCardProps {
  collection: Collection;
  onClick?: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const navigate = useNavigate();
  const isCompleted = collection.progress === 100;
  const isActive = collection.progress > 0 && !isCompleted;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/collections/${collection.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 relative overflow-hidden group"
    >
      {/* 进度条背景 */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${collection.progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 h-1.5 transition-all"
        style={{ backgroundColor: collection.color }}
      />

      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm"
          style={{ backgroundColor: `${collection.color}20` }}
        >
          {collection.icon || '📁'}
        </div>
        <div className="text-right">
          <div className={clsx(
            'text-3xl font-bold mb-1',
            isCompleted ? 'text-green-500' :
            isActive ? 'text-purple-500' :
            'text-gray-400'
          )}>
            {collection.progress}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
            {collection.answeredCount} / {collection.questionCount}
            {isCompleted && (
              <CheckCircle size={14} className="text-green-500" />
            )}
            {isActive && (
              <TrendingUp size={14} className="text-purple-500" />
            )}
          </div>
        </div>
      </div>

      {/* 标题和描述 */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
        {collection.name}
      </h3>
      {collection.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {collection.lastAnsweredAt ? (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDistanceToNow(new Date(collection.lastAnsweredAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        ) : (
          <span>尚未开始</span>
        )}

        {collection.reminderEnabled && (
          <span className="text-purple-600 dark:text-purple-400">
            🔔
          </span>
        )}
      </div>

      {/* 悬停效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
