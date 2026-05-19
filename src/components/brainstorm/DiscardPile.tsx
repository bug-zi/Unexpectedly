/**
 * 已丢弃点子折叠区
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { BrainstormIdea } from '@/types/brainstorm';

interface DiscardPileProps {
  discarded: BrainstormIdea[];
}

export function DiscardPile({ discarded }: DiscardPileProps) {
  const [open, setOpen] = useState(false);

  if (discarded.length === 0) return null;

  return (
    <div className="border-t border-gray-200/40 dark:border-gray-700/40 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-full"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        已丢弃 {discarded.length} 个
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
          {discarded.map((idea) => (
            <div
              key={idea.id}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 line-through opacity-70"
            >
              {idea.ideaText.slice(0, 50)}...
              <span className="ml-2 text-gray-400">[{idea.scores.average.toFixed(1)}分]</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
