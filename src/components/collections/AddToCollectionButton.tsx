/**
 * 添加到集合按钮组件
 * 用于将问题添加到用户创建的集合中
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, X, Check } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { toast } from 'react-toastify';
import { clsx } from 'clsx';

interface AddToCollectionButtonProps {
  questionId: string;
  onSuccess?: () => void;
}

export function AddToCollectionButton({
  questionId,
  onSuccess,
}: AddToCollectionButtonProps) {
  const { collections, addQuestion } = useCollections();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // 集合ID

  const handleToggleCollection = async (collectionId: string) => {
    setLoading(collectionId);
    try {
      const success = await addQuestion(collectionId, questionId);
      if (success) {
        toast.success('✅ 已添加到集合');
        if (onSuccess) {
          onSuccess();
        }
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          isOpen
            ? 'bg-purple-500 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <FolderPlus size={16} />
        <span>添加到集合</span>
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    选择集合
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {collections.length === 0 ? (
                  <div className="py-8 text-center">
                    <FolderPlus size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      还没有创建集合
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      先去创建一个集合吧
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {collections.map((collection) => {
                      const isInCollection = collection.questions.includes(questionId);

                      return (
                        <motion.button
                          key={collection.id}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleToggleCollection(collection.id)}
                          disabled={loading === collection.id || isInCollection}
                          className={clsx(
                            'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                            isInCollection
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                            loading === collection.id && 'opacity-50'
                          )}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                            style={{
                              backgroundColor: isInCollection
                                ? 'transparent'
                                : `${collection.color}20`
                            }}
                          >
                            {collection.icon || '📁'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {collection.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {collection.questionCount} 个问题
                            </div>
                          </div>
                          {isInCollection && (
                            <Check size={16} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {collections.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // 导航到创建集合页面
                      window.location.href = '/favorites?create=true';
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FolderPlus size={16} />
                    <span>创建新集合</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
