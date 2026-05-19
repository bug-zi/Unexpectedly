/**
 * 右侧面板 - 展台（待决定） + 已丢弃
 */

import { useState } from 'react';
import type { BrainstormIdea } from '@/types/brainstorm';
import { IdeaCard } from './IdeaCard';
import { DiscardPile } from './DiscardPile';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShowcasePanelProps {
  showcase: BrainstormIdea[];
  discarded: BrainstormIdea[];
  onAdopt: (id: string) => void;
  onDiscard: (id: string, reason?: string) => void;
}

export function ShowcasePanel({
  showcase,
  discarded,
  onAdopt,
  onDiscard,
}: ShowcasePanelProps) {
  const [discardTarget, setDiscardTarget] = useState<BrainstormIdea | null>(null);
  const [discardReason, setDiscardReason] = useState('');

  const handleConfirmDiscard = () => {
    if (discardTarget) {
      onDiscard(discardTarget.id, discardReason.trim() || undefined);
      setDiscardTarget(null);
      setDiscardReason('');
    }
  };

  return (
    <div className="w-[280px] shrink-0 flex flex-col bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-l border-green-200/30 dark:border-green-700/30">
      {/* 展台 */}
      <div className="px-3 py-2.5 border-b border-green-200/30 dark:border-green-700/30 bg-amber-50/40 dark:bg-amber-900/10">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          展台
          {showcase.length > 0 && (
            <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
              {showcase.length} 条待审
            </span>
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* 展台点子 */}
        {showcase.map((idea) => (
          <div key={idea.id} className="relative">
            <IdeaCard idea={idea} hideStatus />
            <div className="flex gap-1.5 mt-1.5">
              <button
                onClick={() => onAdopt(idea.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-green-500/15 text-green-700 dark:text-green-300 text-xs font-medium hover:bg-green-500/25 transition-colors"
              >
                <Check size={12} />
                收入收纳盒
              </button>
              <button
                onClick={() => setDiscardTarget(idea)}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors"
              >
                <X size={12} />
                丢弃
              </button>
            </div>
          </div>
        ))}

        {showcase.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            启动风暴后，合格的点子将出现在展台
          </p>
        )}

        {/* 已丢弃 */}
        <DiscardPile discarded={discarded} />
      </div>

      {/* 丢弃理由弹窗 */}
      <AnimatePresence>
        {discardTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => { setDiscardTarget(null); setDiscardReason(''); }}
          >
            <motion.div
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => { setDiscardTarget(null); setDiscardReason(''); }}
              >
                <X size={18} />
              </button>

              <h3 className="text-gray-700 dark:text-gray-200 font-medium text-base mb-2">丢弃这条点子</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">
                {discardTarget.ideaText}
              </p>

              <textarea
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                placeholder="为什么不喜欢这条？写下原因可以帮助AI后续规避类似问题（可选）"
                className="w-full h-20 px-3 py-2 text-sm rounded-lg bg-white/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-400/40 placeholder:text-gray-400 resize-none"
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                <motion.button
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                  onClick={() => { setDiscardTarget(null); setDiscardReason(''); }}
                  whileTap={{ scale: 0.97 }}
                >
                  取消
                </motion.button>
                <motion.button
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-medium hover:bg-red-400/90 transition-colors"
                  onClick={handleConfirmDiscard}
                  whileTap={{ scale: 0.97 }}
                >
                  直接丢弃
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
