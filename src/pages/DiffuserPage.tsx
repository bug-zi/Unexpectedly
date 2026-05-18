/**
 * 灵感扩散器 - 主页面
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useDiffuserStore } from '@/stores/diffuserStore';
import { useDiffuserAI } from '@/hooks/useDiffuserAI';
import { DiffuserCanvas } from '@/components/diffuser/DiffuserCanvas';
import { DiffuserInputBar } from '@/components/diffuser/DiffuserInputBar';
import { DiffuserDeleteDialog } from '@/components/diffuser/DiffuserDeleteDialog';
import { DiffuserClearDialog } from '@/components/diffuser/DiffuserClearDialog';
import { DiffuserEmptyState } from '@/components/diffuser/DiffuserEmptyState';
import DiffuserNotebook from '@/components/diffuser/DiffuserNotebook';
import DiffuserReactionPanel from '@/components/diffuser/DiffuserReactionPanel';
import { useDiffuserReactionAI } from '@/hooks/useDiffuserReactionAI';
import { generateId } from '@/utils/diffuserLayout';
import type { DiffuserReaction } from '@/types/diffuser';
import { toast } from 'react-toastify';

export function DiffuserPage() {
  const navigate = useNavigate();
  const nodes = useDiffuserStore((s) => s.nodes);
  const edges = useDiffuserStore((s) => s.edges);
  const addRootNode = useDiffuserStore((s) => s.addRootNode);
  const addChildNodes = useDiffuserStore((s) => s.addChildNodes);
  const removeNode = useDiffuserStore((s) => s.removeNode);
  const setNodeLoading = useDiffuserStore((s) => s.setNodeLoading);
  const getChildrenOf = useDiffuserStore((s) => s.getChildrenOf);
  const getDescendantIds = useDiffuserStore((s) => s.getDescendantIds);
  const clearCanvas = useDiffuserStore((s) => s.clearCanvas);
  const moveNode = useDiffuserStore((s) => s.moveNode);
  const addReaction = useDiffuserStore((s) => s.addReaction);
  const selectedIds = useDiffuserStore((s) => s.selectedIds);
  const setSelectedIds = useDiffuserStore((s) => s.setSelectedIds);
  const moveNodesBatch = useDiffuserStore((s) => s.moveNodesBatch);

  const { generateWords, isConfigured } = useDiffuserAI({ count: 8 });
  const { generateWords: generateMore } = useDiffuserAI({ count: 4 });
  const { generateReaction, isConfigured: isReactionConfigured } = useDiffuserReactionAI();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [centerTarget, setCenterTarget] = useState<{ x: number; y: number } | null>(null);
  const [notebookTarget, setNotebookTarget] = useState<string | null>(null);
  const [nearTargetId, setNearTargetId] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<DiffuserReaction | null>(null);
  const [isReactionGenerating, setIsReactionGenerating] = useState(false);

  // 输入新词语
  const handleSubmitWord = useCallback(
    async (word: string) => {
      if (!isConfigured) {
        toast.error('请先配置 AI 模型');
        return;
      }

      setIsGenerating(true);
      const rootId = addRootNode(word);

      // 居中到新创建的根节点
      const rootNode = useDiffuserStore.getState().getNodeById(rootId);
      if (rootNode) {
        setCenterTarget({ x: rootNode.x, y: rootNode.y });
      }

      // 标记加载
      setNodeLoading(rootId, true);

      try {
        const allWords = useDiffuserStore.getState().nodes.map((n) => n.word);
        const words = await generateWords(word, allWords);
        const unique = words.filter((w) => !allWords.includes(w.word));
        if (unique.length > 0) {
          addChildNodes(rootId, unique);
        }
      } catch {
        toast.error('生成失败，请重试');
      } finally {
        setNodeLoading(rootId, false);
        setIsGenerating(false);
      }
    },
    [isConfigured, addRootNode, addChildNodes, setNodeLoading, generateWords]
  );

  // 展开节点
  const handleExpandNode = useCallback(
    async (nodeId: string) => {
      const node = useDiffuserStore.getState().getNodeById(nodeId);
      if (!node || node.isExpanded || node.isLoading) return;

      if (!isConfigured) {
        toast.error('请先配置 AI 模型');
        return;
      }

      setNodeLoading(nodeId, true);

      try {
        const allWords = useDiffuserStore.getState().nodes.map((n) => n.word);
        const words = await generateWords(node.word, allWords);
        const unique = words.filter((w) => !allWords.includes(w.word));
        if (unique.length > 0) {
          addChildNodes(nodeId, unique);
        }
      } catch {
        toast.error('展开失败，请重试');
      } finally {
        setNodeLoading(nodeId, false);
      }
    },
    [isConfigured, addChildNodes, setNodeLoading, generateWords]
  );

  // 追加更多词语
  const handleAddMore = useCallback(
    async (nodeId: string) => {
      const node = useDiffuserStore.getState().getNodeById(nodeId);
      if (!node || node.isLoading) return;

      if (!isConfigured) {
        toast.error('请先配置 AI 模型');
        return;
      }

      setNodeLoading(nodeId, true);

      try {
        // 获取画布上所有词语，避免重复
        const allWords = useDiffuserStore.getState().nodes.map((n) => n.word);
        const words = await generateMore(node.word, allWords);
        const unique = words.filter((w) => !allWords.includes(w.word));
        if (unique.length > 0) {
          addChildNodes(nodeId, unique);
        }
      } catch {
        toast.error('追加失败，请重试');
      } finally {
        setNodeLoading(nodeId, false);
      }
    },
    [isConfigured, addChildNodes, setNodeLoading, generateMore, getChildrenOf]
  );

  // 词语碰撞反应
  const handleReaction = useCallback(
    async (nodeIdA: string, nodeIdB: string) => {
      const nodeA = useDiffuserStore.getState().getNodeById(nodeIdA);
      const nodeB = useDiffuserStore.getState().getNodeById(nodeIdB);
      if (!nodeA || !nodeB) return;

      if (!isReactionConfigured) {
        toast.error('请先配置 AI 模型');
        return;
      }

      setIsReactionGenerating(true);
      // 创建占位 reaction
      const placeholderReaction: DiffuserReaction = {
        id: generateId('rxn'),
        sourceWordA: nodeA.word,
        sourceWordB: nodeB.word,
        nodeIdA,
        nodeIdB,
        results: [],
        createdAt: new Date().toISOString(),
      };
      setActiveReaction(placeholderReaction);

      try {
        const results = await generateReaction(nodeA.word, nodeB.word);
        const reaction: DiffuserReaction = {
          ...placeholderReaction,
          results,
        };
        addReaction(reaction);
        setActiveReaction(reaction);
      } catch {
        toast.error('碰撞反应失败，请重试');
        setActiveReaction(null);
      } finally {
        setIsReactionGenerating(false);
      }
    },
    [isReactionConfigured, generateReaction, addReaction]
  );

  // 删除节点
  const handleDeleteNode = useCallback((nodeId: string) => {
    setDeleteTarget(nodeId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      removeNode(deleteTarget);
      if (selectedId === deleteTarget) {
        setSelectedId(null);
      }
    }
    setDeleteTarget(null);
  }, [deleteTarget, removeNode, selectedId]);

  // 多选回调
  const handleSelectIds = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    if (ids.length === 1) {
      setSelectedId(ids[0]);
    } else if (ids.length > 1) {
      setSelectedId(null);
    }
  }, [setSelectedIds]);

  const handleAddToSelection = useCallback((id: string) => {
    const current = useDiffuserStore.getState().selectedIds;
    if (current.includes(id)) {
      setSelectedIds(current.filter((i) => i !== id));
    } else {
      setSelectedIds([...current, id]);
    }
  }, [setSelectedIds]);

  // 删除弹窗数据
  const deleteNode = deleteTarget
    ? useDiffuserStore.getState().getNodeById(deleteTarget)
    : null;
  const deleteDescendantCount = deleteTarget
    ? getDescendantIds(deleteTarget).length
    : 0;

  return (
    <div className="h-screen flex flex-col relative">
      {/* 背景图 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-picture/灵感器1.png)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/55 dark:from-gray-900/85 dark:via-gray-900/80 dark:to-gray-900/75" />

      <div className="relative z-10 flex flex-col h-full">
        {/* 顶部导航 */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-green-200/30 dark:border-green-700/30">
          <button
            className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            onClick={() => navigate('/inspiration')}
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-gray-700 dark:text-gray-200 font-medium text-sm hidden sm:block">灵感扩散器</h1>

        <div className="flex-1" />

        {/* 输入栏 */}
        <div className="w-48 sm:w-64 md:w-80">
          <DiffuserInputBar onSubmit={handleSubmitWord} isLoading={isGenerating} recentWords={nodes.filter(n => !n.parentId).map(n => n.word)} />
        </div>

        <div className="flex-1" />

        {/* 节点数量 */}
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden md:inline">
          {nodes.length} 个词语 · {edges.length} 条关联
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs md:hidden">
          {nodes.length}
        </span>

        {/* 清空画布 */}
        {nodes.length > 0 && (
          <button
            className="p-1.5 sm:p-2 rounded-full bg-white/20 text-gray-500 hover:bg-red-500/30 hover:text-red-400 transition-colors"
            title="清空画布"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* 画布区域 */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {nodes.length === 0 && <DiffuserEmptyState isConfigured={isConfigured} />}
        <DiffuserCanvas
          nodes={nodes}
          edges={edges}
          selectedId={selectedId}
          selectedIds={selectedIds}
          onSelectNode={setSelectedId}
          onSelectIds={handleSelectIds}
          onAddToSelection={handleAddToSelection}
          onExpandNode={handleExpandNode}
          onAddMoreNode={handleAddMore}
          onDeleteNode={handleDeleteNode}
          onMoveNode={moveNode}
          onMoveNodesBatch={moveNodesBatch}
          onOpenNotebook={setNotebookTarget}
          onReaction={handleReaction}
          nearTargetId={nearTargetId}
          onDragNear={setNearTargetId}
          centerOnNode={centerTarget}
        />
      </div>

      </div>
      {/* 删除确认弹窗 */}
      <DiffuserDeleteDialog
        isOpen={!!deleteTarget}
        word={deleteNode?.word ?? ''}
        descendantCount={deleteDescendantCount}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 清空画布确认弹窗 */}
      <DiffuserClearDialog
        isOpen={showClearConfirm}
        nodeCount={nodes.length}
        onConfirm={() => {
          clearCanvas();
          setSelectedId(null);
          setNotebookTarget(null);
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* 词语笔记本面板 */}
      <DiffuserNotebook
        isOpen={!!notebookTarget}
        nodeId={notebookTarget}
        word={notebookTarget ? useDiffuserStore.getState().getNodeById(notebookTarget)?.word ?? '' : ''}
        onClose={() => setNotebookTarget(null)}
      />

      {/* 碰撞反应面板 */}
      <DiffuserReactionPanel
        isOpen={!!activeReaction}
        reaction={activeReaction}
        isGenerating={isReactionGenerating}
        onClose={() => setActiveReaction(null)}
        onRegenerate={() => {
          if (activeReaction) handleReaction(activeReaction.nodeIdA, activeReaction.nodeIdB);
        }}
      />
    </div>
  );
}
