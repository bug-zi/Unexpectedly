/**
 * 控制栏 - 启动/暂停/继续/重新开始
 */

import { Play, Pause, RotateCcw } from 'lucide-react';
import type { BrainstormPhase } from '@/types/brainstorm';

interface ControlBarProps {
  phase: BrainstormPhase;
  currentRound: number;
  totalRounds: number;
  collectedCount: number;
  topicInput: string;
  onTopicChange: (val: string) => void;
  onStart: (topic?: string, rounds?: number) => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  isConfigured: boolean;
}

export function ControlBar({
  phase,
  currentRound,
  totalRounds,
  collectedCount,
  topicInput,
  onTopicChange,
  onStart,
  onPause,
  onResume,
  onRestart,
  isConfigured,
}: ControlBarProps) {
  const isIdle = phase === 'idle';
  const isActive = !['idle', 'completed', 'error'].includes(phase);
  const isPaused = phase === 'paused';
  const isDone = phase === 'completed' || phase === 'error';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t border-green-200/30 dark:border-green-700/30">
      {/* 种子词输入 */}
      {isIdle && (
        <input
          type="text"
          value={topicInput}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="输入种子词（可选，留空自动生成）"
          className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-lg bg-white/80 dark:bg-gray-700/80 border border-green-200/50 dark:border-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isConfigured) onStart(topicInput || undefined);
          }}
        />
      )}

      {/* 主按钮 */}
      {isIdle && (
        <button
          onClick={() => onStart(topicInput || undefined)}
          disabled={!isConfigured}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={14} />
          启动风暴
        </button>
      )}

      {isActive && !isPaused && (
        <button
          onClick={onPause}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Pause size={14} />
          暂停
        </button>
      )}

      {isPaused && (
        <button
          onClick={onResume}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Play size={14} />
          继续
        </button>
      )}

      {(isActive || isDone) && (
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 text-sm hover:bg-red-500/20 hover:text-red-500 transition-colors"
        >
          <RotateCcw size={14} />
          重新开始
        </button>
      )}

      <div className="flex-1" />

      {/* 统计 */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {!isIdle && (
          <span>
            第 {currentRound}/{totalRounds} 轮
          </span>
        )}
        {collectedCount > 0 && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            已收集 {collectedCount} 个点子
          </span>
        )}
      </div>
    </div>
  );
}
