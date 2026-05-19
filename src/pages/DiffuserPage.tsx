/**
 * 灵感扩散器 - 主页面
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Archive, XCircle } from 'lucide-react';
import { BrainstormTabView } from '@/components/brainstorm/BrainstormTabView';
import { IdeaCard } from '@/components/brainstorm/IdeaCard';
import { useDiffuserStore } from '@/stores/diffuserStore';
import { useBrainstormStore } from '@/stores/brainstormStore';
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
  const snapshotState = useDiffuserStore((s) => s.snapshotState);
  const restoreState = useDiffuserStore((s) => s.restoreState);
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
  const [mode, setModeRaw] = useState<'manual' | 'auto'>(() => {
    return (localStorage.getItem('wwx-diffuser-mode') as 'manual' | 'auto') || 'manual';
  });
  const [showCollection, setShowCollection] = useState(false);

  const collectionBox = useBrainstormStore((s) => s.collectionBox);
  const removeFromCollection = useBrainstormStore((s) => s.removeFromCollection);

  const MANUAL_BACKUP_KEY = 'wwx-diffuser-manual-backup';
  const AUTO_BACKUP_KEY = 'wwx-diffuser-auto-backup';

  // 同步模式切换：在点击时立即保存当前画布 + 恢复目标模式画布，不用 useEffect
  const switchMode = useCallback((newMode: 'manual' | 'auto') => {
    const prevMode = localStorage.getItem('wwx-diffuser-mode') || 'manual';
    if (prevMode === newMode) return;

    // 1) 保存当前画布到对应模式的备份
    const currentSnapshot = snapshotState();
    const backupKey = prevMode === 'manual' ? MANUAL_BACKUP_KEY : AUTO_BACKUP_KEY;
    try { localStorage.setItem(backupKey, JSON.stringify(currentSnapshot)); } catch {}

    // 2) 恢复目标模式的画布
    const targetBackupKey = newMode === 'manual' ? MANUAL_BACKUP_KEY : AUTO_BACKUP_KEY;
    try {
      const saved = localStorage.getItem(targetBackupKey);
      if (saved) {
        restoreState(JSON.parse(saved));
      } else if (newMode === 'auto') {
        clearCanvas();
      }
      // manual 首次无备份则保持当前画布不变
    } catch {
      if (newMode === 'auto') clearCanvas();
    }

    // 3) 更新 mode
    localStorage.setItem('wwx-diffuser-mode', newMode);
    setModeRaw(newMode);
  }, [snapshotState, restoreState, clearCanvas]);

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

          {/* 模式切换 Tab */}
          <div className="flex items-center bg-white/30 dark:bg-gray-700/30 rounded-lg p-0.5 ml-2">
            <button
              onClick={() => switchMode('manual')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-white/80 dark:bg-gray-600/80 text-green-700 dark:text-green-300 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              手动模式
            </button>
            <button
              onClick={() => switchMode('auto')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'auto'
                  ? 'bg-white/80 dark:bg-gray-600/80 text-green-700 dark:text-green-300 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              自动模式
            </button>
          </div>

        <div className="flex-1" />

        {/* 输入栏 - 仅手动模式 */}
        {mode === 'manual' && (
        <div className="w-48 sm:w-64 md:w-80">
          <DiffuserInputBar onSubmit={handleSubmitWord} isLoading={isGenerating} recentWords={nodes.filter(n => !n.parentId).map(n => n.word)} />
        </div>
        )}

        <div className="flex-1" />

        {/* 收纳盒按钮 - 仅自动模式 */}
        {mode === 'auto' && (
          <button
            onClick={() => setShowCollection(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50/60 dark:bg-green-900/20 hover:bg-green-100/70 dark:hover:bg-green-900/35 transition-colors"
          >
            <Archive size={14} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">收纳盒</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
              {collectionBox.length}
            </span>
          </button>
        )}

        {/* 节点数量 */}
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden md:inline">
          {nodes.length} 个词语 · {edges.length} 条关联
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs md:hidden">
          {nodes.length}
        </span>

        {/* 清空画布 - 仅手动模式 */}
        {mode === 'manual' && nodes.length > 0 && (
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
      {mode === 'auto' ? (
        <BrainstormTabView>
          <DiffuserCanvas
            nodes={nodes}
            edges={edges}
            selectedId={null}
            selectedIds={[]}
            onSelectNode={() => {}}
            onSelectIds={() => {}}
            onAddToSelection={() => {}}
            onExpandNode={() => {}}
            onAddMoreNode={() => {}}
            onDeleteNode={() => {}}
            onMoveNode={() => {}}
            onMoveNodesBatch={() => {}}
            onOpenNotebook={() => {}}
            onReaction={() => {}}
            nearTargetId={null}
            onDragNear={() => {}}
            centerOnNode={centerTarget}
          />
        </BrainstormTabView>
      ) : (
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
      )}

      </div>
      {/* 手动模式专属面板 */}
      {mode === 'manual' && (
      <>
      <DiffuserDeleteDialog
        isOpen={!!deleteTarget}
        word={deleteNode?.word ?? ''}
        descendantCount={deleteDescendantCount}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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

      <DiffuserNotebook
        isOpen={!!notebookTarget}
        nodeId={notebookTarget}
        word={notebookTarget ? useDiffuserStore.getState().getNodeById(notebookTarget)?.word ?? '' : ''}
        onClose={() => setNotebookTarget(null)}
      />

      <DiffuserReactionPanel
        isOpen={!!activeReaction}
        reaction={activeReaction}
        isGenerating={isReactionGenerating}
        onClose={() => setActiveReaction(null)}
        onRegenerate={() => {
          if (activeReaction) handleReaction(activeReaction.nodeIdA, activeReaction.nodeIdB);
        }}
      />
      </>
      )}

      {/* 收纳盒弹窗 - 页面居中 */}
      {showCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCollection(false)}
          />
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-200/40 dark:border-green-700/40 w-[520px] max-w-[90vw] max-h-[80vh] flex flex-col">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-green-200/30 dark:border-green-700/30">
              <Archive size={18} className="text-green-600 dark:text-green-400" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex-1">
                收纳盒
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
                {collectionBox.length} 个点子
              </span>
              <button
                onClick={() => setShowCollection(false)}
                className="p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {collectionBox.length > 0 ? (
                collectionBox.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} onRemove={removeFromCollection} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Archive size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">收纳盒还是空的</p>
                  <p className="text-xs mt-1">从展台挑选好点子收入这里</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
