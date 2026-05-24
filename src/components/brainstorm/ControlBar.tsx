/**
 * 控制栏 - 启动/暂停/继续/重新开始/清空
 */

import { useState } from 'react';
import { Play, Pause, RotateCcw, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { BrainstormPhase } from '@/types/brainstorm';
import { useControlHubStore } from '@/stores/controlHubStore';

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
  onClear: () => void;
  isConfigured: boolean;
  onOpenControlHub: () => void;
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
  onClear,
  isConfigured,
  onOpenControlHub,
}: ControlBarProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const activeRuleCount = useControlHubStore((s) => s.rules.filter((r) => r.isActive).length);
  const isIdle = phase === 'idle';
  const isActive = !['idle', 'completed', 'error'].includes(phase);
  const isPaused = phase === 'paused';
  const isDone = phase === 'completed' || phase === 'error';
  const hasContent = collectedCount > 0 || !isIdle;

  return (
    <>
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

        {/* 控制中枢按钮 */}
        <button
          onClick={onOpenControlHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 text-sm transition-colors"
          title="控制中枢"
        >
          <Settings size={14} />
          <span className="hidden sm:inline">控制中枢</span>
          {activeRuleCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
              {activeRuleCount}
            </span>
          )}
        </button>

        {/* 清空按钮 */}
        {hasContent && (
          <button
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 text-sm transition-colors"
          >
            <Trash2 size={14} />
            清空
          </button>
        )}
      </div>

      {/* 清空确认弹窗 */}
      <AnimatePresence>
        {showClearDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowClearDialog(false)}
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
                onClick={() => setShowClearDialog(false)}
              >
                <X size={18} />
              </button>

              <motion.div
                className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </motion.div>

              <h3 className="text-center text-gray-700 dark:text-gray-200 font-medium text-base mb-2">确认清空画布</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                确定要清空当前画布上的所有内容吗？
              </p>
              <p className="text-center text-red-500/70 text-xs mb-4">
                包括展台、收纳盒中的全部点子，此操作不可撤销
              </p>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                  onClick={() => setShowClearDialog(false)}
                  whileTap={{ scale: 0.97 }}
                >
                  取消
                </motion.button>
                <motion.button
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-medium hover:bg-red-400/90 transition-colors"
                  onClick={() => {
                    onClear();
                    setShowClearDialog(false);
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  清空
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
