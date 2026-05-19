/**
 * 阶段面板 - 左侧状态指示 + 活动日志
 */

import { useEffect, useRef } from 'react';
import type { BrainstormPhase, ActivityLogEntry } from '@/types/brainstorm';

interface StagePanelProps {
  phase: BrainstormPhase;
  currentRound: number;
  totalRounds: number;
  activityLog: ActivityLogEntry[];
}

const STAGES: Array<{ key: BrainstormPhase; label: string; icon: string }> = [
  { key: 'seeding', label: '种子选词', icon: '🌱' },
  { key: 'expanding', label: '词语扩展', icon: '🌿' },
  { key: 'colliding', label: '碰撞融合', icon: '💥' },
  { key: 'scoring', label: '评分筛选', icon: '⭐' },
  { key: 'reviewing', label: '复盘学习', icon: '🧠' },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

export function StagePanel({ phase, currentRound, totalRounds, activityLog }: StagePanelProps) {
  const logRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新日志
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [activityLog.length]);

  const currentStageIdx = STAGE_ORDER.indexOf(phase);
  const isRunning = !['idle', 'completed', 'error', 'paused'].includes(phase);

  return (
    <div className="w-[200px] shrink-0 flex flex-col bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-r border-green-200/30 dark:border-green-700/30">
      {/* 轮次 */}
      <div className="px-3 py-2.5 border-b border-green-200/30 dark:border-green-700/30">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          风暴进程
          {currentRound > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">
              {currentRound}/{totalRounds}
            </span>
          )}
        </h3>
      </div>

      {/* 阶段指示 */}
      <div className="px-3 py-2.5 space-y-1.5 border-b border-green-200/30 dark:border-green-700/30">
        {STAGES.map((stage, idx) => {
          const isDone = currentStageIdx > idx;
          const isCurrent = phase === stage.key;
          const isPending = currentStageIdx < idx;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors ${
                isCurrent
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium'
                  : isDone
                    ? 'text-gray-400 line-through'
                    : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              <span className="text-sm">{isDone ? '✓' : stage.icon}</span>
              <span>{stage.label}</span>
              {isCurrent && isRunning && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* 活动日志 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" ref={logRef}>
        {activityLog.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            等待启动...
          </p>
        )}
        {activityLog.map((entry) => (
          <div key={entry.id} className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <span className="text-gray-300 dark:text-gray-600 mr-1">
              {new Date(entry.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            {entry.message}
          </div>
        ))}
      </div>

      {/* 错误状态 */}
      {phase === 'error' && (
        <div className="px-3 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border-t border-red-200/30">
          出错了，请重试
        </div>
      )}

      {/* 暂停状态 */}
      {phase === 'paused' && (
        <div className="px-3 py-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200/30">
          已暂停
        </div>
      )}
    </div>
  );
}
