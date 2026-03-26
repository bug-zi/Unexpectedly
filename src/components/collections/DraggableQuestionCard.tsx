import { memo } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Star } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types';
import { getCategoryConfig } from '@/constants/categories';
import { Icon } from '@iconify/react';

interface DraggableQuestionCardProps {
  question: Question;
  index: number;
  isAnswered?: boolean;
  onStart?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  disableDrag?: boolean;
}

export const DraggableQuestionCard = memo(({
  question,
  index,
  isAnswered = false,
  onStart,
  onRemove,
  isDragging = false,
  disableDrag = false,
}: DraggableQuestionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: question.id,
    disabled: disableDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = question.category.primary === 'thinking'
    ? getCategoryConfig('thinking', question.category.secondary!)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative transition-all duration-200
        ${isSortableDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isDragging ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'}
      `}
    >
      {/* 拖拽手柄 */}
      {!disableDrag && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
        >
          <GripVertical size={20} className="text-gray-400" />
        </div>
      )}

      {/* 卡片内容 */}
      <div className={`
        bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700
        ${!disableDrag ? 'pl-16' : ''}
        transition-all hover:border-purple-300 dark:hover:border-purple-700
      `}>
        <div className="flex items-start justify-between gap-4">
          {/* 左侧内容 */}
          <div className="flex-1 min-w-0">
            {/* 序号和分类 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{index + 1}
              </span>
              {category && (
                <span
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: category.light,
                    color: category.dark,
                  }}
                >
                  {category.name}
                </span>
              )}
              {isAnswered && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  已回答
                </span>
              )}
            </div>

            {/* 问题内容 */}
            <h3 className="font-serif text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-3 line-clamp-2">
              {question.content}
            </h3>

            {/* 标签 */}
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {question.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{question.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* 难度指示 */}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < question.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                />
              ))}
              <span className="ml-2 text-xs text-gray-500">
                难度 {question.difficulty}/5
              </span>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onStart && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                开始思考
              </motion.button>
            )}
            {onRemove && !disableDrag && (
              <button
                onClick={onRemove}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="移除"
              >
                <Icon icon="ph:x-circle" width={20} height={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 拖拽时的视觉提示 */}
      {isSortableDragging && (
        <div className="absolute inset-0 bg-purple-500/10 rounded-2xl pointer-events-none border-2 border-purple-500" />
      )}
    </div>
  );
});

DraggableQuestionCard.displayName = 'DraggableQuestionCard';
