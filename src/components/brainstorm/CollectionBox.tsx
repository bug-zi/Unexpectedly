/**
 * 右侧面板 - 展台（待决定） + 收纳盒（已保留） + 已丢弃
 */

import type { BrainstormIdea } from '@/types/brainstorm';
import { IdeaCard } from './IdeaCard';
import { DiscardPile } from './DiscardPile';
import { Check, X } from 'lucide-react';

interface ShowcasePanelProps {
  showcase: BrainstormIdea[];
  collection: BrainstormIdea[];
  discarded: BrainstormIdea[];
  onAdopt: (id: string) => void;
  onDiscard: (id: string) => void;
  onRemoveFromCollection: (id: string) => void;
}

export function ShowcasePanel({
  showcase,
  collection,
  discarded,
  onAdopt,
  onDiscard,
  onRemoveFromCollection,
}: ShowcasePanelProps) {
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
                onClick={() => onDiscard(idea.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors"
              >
                <X size={12} />
                丢弃
              </button>
            </div>
          </div>
        ))}

        {showcase.length === 0 && collection.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            启动风暴后，合格的点子将出现在展台
          </p>
        )}

        {/* 收纳盒 */}
        {collection.length > 0 && (
          <div className="border-t border-green-200/40 dark:border-green-700/40 pt-2.5">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              收纳盒
              <span className="text-green-600 dark:text-green-400">{collection.length} 个</span>
            </h4>
            <div className="space-y-2">
              {collection.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onRemove={onRemoveFromCollection} />
              ))}
            </div>
          </div>
        )}

        {/* 已丢弃 */}
        <DiscardPile discarded={discarded} />
      </div>
    </div>
  );
}
