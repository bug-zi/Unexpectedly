/**
 * 单个点子卡片（含四维评分）
 */

import type { BrainstormIdea } from '@/types/brainstorm';

interface IdeaCardProps {
  idea: BrainstormIdea;
  onRemove?: (id: string) => void;
  hideStatus?: boolean;
}

const DIMENSION_LABELS: Record<string, string> = {
  innovation: '创新性',
  feasibility: '可行性',
  practicality: '实用性',
  fun: '趣味性',
};

const DIMENSION_COLORS: Record<string, string> = {
  innovation: 'bg-purple-400',
  feasibility: 'bg-blue-400',
  practicality: 'bg-emerald-400',
  fun: 'bg-orange-400',
};

export function IdeaCard({ idea, onRemove, hideStatus }: IdeaCardProps) {
  const dims = ['innovation', 'feasibility', 'practicality', 'fun'] as const;

  return (
    <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-green-200/40 dark:border-green-700/40 space-y-2">
      {/* 来源词 */}
      <div className="flex items-center gap-1 flex-wrap">
        {idea.sourceWords.map((w, i) => (
          <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
            {w}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-1">{idea.type}</span>
      </div>

      {/* 创意内容 */}
      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
        {idea.ideaText}
      </p>

      {/* 评分条 */}
      <div className="space-y-1">
        {dims.map((dim) => {
          const score = idea.scores[dim];
          const pct = Math.round(score * 10);
          return (
            <div key={dim} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-gray-500 dark:text-gray-400 shrink-0">
                {DIMENSION_LABELS[dim]}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-200/60 dark:bg-gray-700/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${DIMENSION_COLORS[dim]} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right text-gray-600 dark:text-gray-300 font-medium">
                {score.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 综合 + 操作 */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${idea.qualified ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
          综合 {idea.scores.average.toFixed(1)} {!hideStatus && (idea.qualified ? '✓ 入选' : '✗ 未达标')}
        </span>
        {onRemove && (
          <button
            onClick={() => onRemove(idea.id)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            移除
          </button>
        )}
      </div>
    </div>
  );
}
