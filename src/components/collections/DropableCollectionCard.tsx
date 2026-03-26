import { memo } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Collection } from '@/types/collections';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DropableCollectionCardProps {
  collection: Collection;
  onClick?: () => void;
}

export const DropableCollectionCard = memo(({
  collection,
  onClick,
}: DropableCollectionCardProps) => {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: `collection-${collection.id}`,
    data: {
      collection,
      type: 'collection',
    },
  });

  return (
    <motion.div
      ref={setNodeRef}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer
        border-2 relative overflow-hidden group
        ${isDroppableOver ? 'border-green-500 shadow-green-500/50' : 'border-transparent hover:border-purple-200 dark:hover:border-purple-800'}
      `}
    >
      {/* 拖拽悬停提示 */}
      {isDroppableOver && (
        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10">
          <div className="text-center">
            <Plus size={48} className="text-green-500 mx-auto mb-2" />
            <p className="text-green-600 dark:text-green-400 font-medium">松开添加到集合</p>
          </div>
        </div>
      )}

      {/* 进度条背景 */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all"
        style={{
          width: `${collection.progress}%`,
          backgroundColor: collection.color,
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${collection.color}20` }}
        >
          {collection.icon || '📁'}
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
    </motion.div>
  );
});

DropableCollectionCard.displayName = 'DropableCollectionCard';
