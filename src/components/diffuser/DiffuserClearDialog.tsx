/**
 * 灵感扩散器 - 清空画布确认弹窗
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DiffuserClearDialogProps {
  isOpen: boolean;
  nodeCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiffuserClearDialog({
  isOpen,
  nodeCount,
  onConfirm,
  onCancel,
}: DiffuserClearDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onCancel}
            >
              <X size={18} />
            </button>

            {/* 图标 */}
            <motion.div
              className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </motion.div>

            {/* 标题 */}
            <h3 className="text-center text-gray-700 dark:text-gray-200 font-medium text-base mb-2">确认清空画布</h3>

            {/* 内容 */}
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-1">
              确定要清空画布上的所有内容吗？
            </p>
            <motion.p
              className="text-center text-red-500/70 text-xs mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              将删除全部 {nodeCount} 个词语，此操作不可撤销
            </motion.p>

            {/* 按钮 */}
            <div className="flex gap-3">
              <motion.button
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                onClick={onCancel}
                whileTap={{ scale: 0.97 }}
              >
                取消
              </motion.button>
              <motion.button
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-medium hover:bg-red-400/90 transition-colors"
                onClick={onConfirm}
                whileTap={{ scale: 0.97 }}
              >
                清空
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
