/**
 * 灵感扩散器 - 词语碰撞反应结果面板
 * 底部操作栏：保留并关闭 / 合并并关闭（带确认对话框）
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, Check, RefreshCw } from 'lucide-react';
import { useDiffuserStore } from '@/stores/diffuserStore';
import type { DiffuserReaction, DiffuserReactionResult } from '@/types/diffuser';
import { generateId } from '@/utils/diffuserLayout';

interface DiffuserReactionPanelProps {
  isOpen: boolean;
  reaction: DiffuserReaction | null;
  isGenerating: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

const TYPE_STYLES: Record<string, string> = {
  '反常识组合': 'bg-purple-50 text-purple-700 border-purple-200/60',
  '行为改造': 'bg-blue-50 text-blue-700 border-blue-200/60',
  '隐喻实体化': 'bg-rose-50 text-rose-700 border-rose-200/60',
  '极端场景': 'bg-orange-50 text-orange-700 border-orange-200/60',
  '微型实验': 'bg-teal-50 text-teal-700 border-teal-200/60',
  '假如世界': 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
};

export default function DiffuserReactionPanel({
  isOpen,
  reaction: reactionProp,
  isGenerating,
  onClose,
  onRegenerate,
}: DiffuserReactionPanelProps) {
  const addNote = useDiffuserStore((s) => s.addNote);
  const markResultAdopted = useDiffuserStore((s) => s.markResultAdopted);
  const removeNode = useDiffuserStore((s) => s.removeNode);

  // 从 store 中读取最新的 reaction 数据（采纳后状态会同步更新）
  const storeReactions = useDiffuserStore((s) => s.reactions);
  const reaction = reactionProp
    ? storeReactions.find((r) => r.id === reactionProp.id) ?? reactionProp
    : null;

  const [showMergeConfirm, setShowMergeConfirm] = useState(false);

  const adoptedCount = reaction
    ? reaction.results.filter((r) => r.adopted).length
    : 0;

  const handleAdopt = useCallback((result: DiffuserReactionResult) => {
    if (!reaction || result.adopted) return;

    const noteContent = `[${result.type}] ${result.content}（「${reaction.sourceWordA}」×「${reaction.sourceWordB}」）`;
    addNote(reaction.nodeIdA, { content: noteContent, source: 'ai' });
    addNote(reaction.nodeIdB, { content: noteContent, source: 'ai' });
    markResultAdopted(reaction.id, result.id);
  }, [reaction, addNote, markResultAdopted]);

  // 保留并关闭：源词语保留原位
  const handleKeepClose = useCallback(() => {
    setShowMergeConfirm(false);
    onClose();
  }, [onClose]);

  // 确认合并：消耗源词语，创建融合节点，保持连接关系
  const handleConfirmMerge = useCallback(() => {
    if (!reaction) return;

    const state = useDiffuserStore.getState();
    const adoptedResults = reaction.results.filter((r) => r.adopted);
    const nodeA = state.getNodeById(reaction.nodeIdA);
    const nodeB = state.getNodeById(reaction.nodeIdB);
    const midX = nodeA && nodeB ? (nodeA.x + nodeB.x) / 2 : 500;
    const midY = nodeA && nodeB ? (nodeA.y + nodeB.y) / 2 : 400;

    const notes = adoptedResults.map((result) => ({
      id: generateId('note'),
      content: `[${result.type}] ${result.content}（「${reaction.sourceWordA}」×「${reaction.sourceWordB}」）`,
      source: 'ai' as const,
      createdAt: new Date().toISOString(),
    }));

    const fusionId = generateId('diff');
    const fusionNode = {
      id: fusionId,
      word: `${reaction.sourceWordA}×${reaction.sourceWordB}`,
      parentId: null,
      x: midX,
      y: midY,
      isExpanded: false,
      isLoading: false,
      level: 2 as const,
      createdAt: new Date().toISOString(),
      notes,
      reactionFrom: { wordA: reaction.sourceWordA, wordB: reaction.sourceWordB },
    };

    // 收集源节点的父节点和子节点，用于重连边
    const parentA = nodeA?.parentId;
    const parentB = nodeB?.parentId;
    // 去重父节点列表
    const parentIds = [parentA, parentB].filter((p): p is string => p != null);

    // 收集源节点的子节点
    const childrenA = state.nodes.filter((n) => n.parentId === reaction.nodeIdA);
    const childrenB = state.nodes.filter((n) => n.parentId === reaction.nodeIdB);
    const allChildren = [...childrenA, ...childrenB];

    // 先删除源节点（会连带删除相关边和子节点）
    removeNode(reaction.nodeIdA);
    removeNode(reaction.nodeIdB);

    // 重新添加：融合节点 + 重连父边 + 恢复子节点 + 子节点边
    useDiffuserStore.setState((s) => {
      const newEdges = [...s.edges];

      // 父节点 → 融合节点的边
      for (const pid of parentIds) {
        if (!newEdges.some((e) => e.sourceId === pid && e.targetId === fusionId)) {
          newEdges.push({
            id: generateId('edge'),
            sourceId: pid,
            targetId: fusionId,
            type: 'parent-child',
          });
        }
      }

      // 恢复子节点（重新挂到融合节点下）+ 边
      const restoredChildren = allChildren.map((child) => ({
        ...child,
        parentId: fusionId,
      }));
      for (const child of restoredChildren) {
        if (!newEdges.some((e) => e.sourceId === fusionId && e.targetId === child.id)) {
          newEdges.push({
            id: generateId('edge'),
            sourceId: fusionId,
            targetId: child.id,
            type: 'parent-child',
          });
        }
      }

      return {
        nodes: [...s.nodes, fusionNode, ...restoredChildren],
        edges: newEdges,
      };
    });

    setShowMergeConfirm(false);
    onClose();
  }, [reaction, removeNode, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] flex flex-col"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-green-200/40 rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-100/50">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                <span className="text-sm font-semibold text-green-800">
                  碰撞反应
                </span>
                {reaction && (
                  <span className="text-sm text-green-600">
                    「{reaction.sourceWordA}」×「{reaction.sourceWordB}」
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isGenerating && reaction && reaction.results.length > 0 && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <RefreshCw size={13} />
                    再次生成
                  </button>
                )}
                <button
                  onClick={handleKeepClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[45vh] px-4 py-3">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 size={24} className="animate-spin text-green-500" />
                  <p className="text-sm text-gray-500">两个词语正在碰撞中...</p>
                </div>
              ) : reaction && reaction.results.length > 0 ? (
                <div className="space-y-2">
                  {reaction.results.map((result, i) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        result.adopted
                          ? 'bg-green-50/50 border-green-200/40'
                          : 'bg-white/70 border-gray-100 hover:bg-green-50/30 hover:border-green-200/40'
                      }`}
                    >
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                        TYPE_STYLES[result.type] || 'bg-gray-50 text-gray-600 border-gray-200/60'
                      }`}>
                        {result.type}
                      </span>

                      <p className="flex-1 text-sm text-gray-700 leading-relaxed">{result.content}</p>

                      {result.adopted ? (
                        <span className="shrink-0 flex items-center gap-0.5 text-xs text-green-600">
                          <Check size={12} />
                          已采纳
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdopt(result)}
                          className="shrink-0 px-2 py-1 text-xs bg-green-500/80 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          采纳
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-sm text-gray-400">没有生成结果，请重试</p>
                </div>
              )}
            </div>

            {/* 底部操作栏 */}
            {!isGenerating && reaction && reaction.results.length > 0 && (
              <div className="px-4 py-3 border-t border-green-100/50 bg-white/60">
                <div className="flex gap-3">
                  <button
                    onClick={handleKeepClose}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-green-500/80 text-white hover:bg-green-600 transition-colors"
                  >
                    <Check size={14} />
                    保留并关闭
                  </button>
                  <button
                    onClick={() => setShowMergeConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors bg-green-50 text-green-700 border-green-200/60 hover:bg-green-100"
                  >
                    <Zap size={14} />
                    合并并关闭
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-1.5">
                  {adoptedCount > 0
                    ? `已采纳 ${adoptedCount} 条，合并后将融合为新节点`
                    : '合并后两个词语将融合为新节点'}
                </p>
              </div>
            )}
          </div>

          {/* 合并确认对话框 */}
          <AnimatePresence>
            {showMergeConfirm && reaction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
                onClick={() => setShowMergeConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-xl border border-green-200/40 p-5 mx-4 max-w-sm w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Zap size={16} className="text-green-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">确认合并？</h3>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    「<span className="font-medium text-gray-800">{reaction.sourceWordA}</span>」
                    和「<span className="font-medium text-gray-800">{reaction.sourceWordB}</span>」
                    将被消耗，融合为新节点
                    「<span className="font-medium text-green-700">{reaction.sourceWordA}×{reaction.sourceWordB}</span>」
                  </p>

                  {adoptedCount > 0 && (
                    <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-4">
                      已采纳的 {adoptedCount} 条笔记将转移到新节点上
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMergeConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirmMerge}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      确认合并
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
