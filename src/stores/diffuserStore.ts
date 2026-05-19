/**
 * 灵感扩散器 - 状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiffuserNode, DiffuserEdge, DiffuserWord, DiffuserNote, DiffuserReaction } from '@/types/diffuser';
import { calcRadialPositions, findFreeClusterPosition, generateId } from '@/utils/diffuserLayout';

const MAX_NODES = 500;
const MAX_EDGES = 1000;

interface DiffuserState {
  nodes: DiffuserNode[];
  edges: DiffuserEdge[];

  /** 添加根节点（用户输入的词） */
  addRootNode: (word: string, canvasWidth?: number, canvasHeight?: number) => string;
  /** 为父节点添加子节点 */
  addChildNodes: (parentId: string, children: DiffuserWord[]) => void;
  /** 删除节点及其所有后代 */
  removeNode: (nodeId: string) => void;
  /** 设置节点展开状态 */
  setNodeExpanded: (nodeId: string, expanded: boolean) => void;
  /** 设置节点加载状态 */
  setNodeLoading: (nodeId: string, loading: boolean) => void;
  /** 移动节点位置 */
  moveNode: (nodeId: string, x: number, y: number) => void;
  /** 清空画布 */
  clearCanvas: () => void;
  /** 获取节点 */
  getNodeById: (id: string) => DiffuserNode | undefined;
  /** 获取子节点 */
  getChildrenOf: (parentId: string) => DiffuserNode[];
  /** 获取节点的所有后代ID（包括自身） */
  getDescendantIds: (nodeId: string) => string[];
  /** 添加笔记到节点 */
  addNote: (nodeId: string, note: Omit<DiffuserNote, 'id' | 'createdAt'>) => void;
  /** 删除节点上的单条笔记 */
  removeNote: (nodeId: string, noteId: string) => void;
  /** 更新笔记内容 */
  updateNote: (nodeId: string, noteId: string, content: string) => void;

  // 碰撞反应
  reactions: DiffuserReaction[];
  /** 添加反应记录 */
  addReaction: (reaction: DiffuserReaction) => void;
  /** 采纳反应结果为新节点，返回新节点ID */
  adoptReactionResult: (reactionId: string, resultId: string, x: number, y: number) => string | null;
  /** 标记反应结果为已采纳 */
  markResultAdopted: (reactionId: string, resultId: string) => void;

  // 多选状态（框选/Shift+点击）
  selectedIds: string[];
  /** 设置多选列表 */
  setSelectedIds: (ids: string[]) => void;
  /** 添加到多选 */
  addToSelection: (id: string) => void;
  /** 从多选移除 */
  removeFromSelection: (id: string) => void;
  /** 清空多选 */
  clearSelection: () => void;
  /** 批量移动节点（一次 set，避免中间渲染） */
  moveNodesBatch: (moves: Array<{ nodeId: string; x: number; y: number }>) => void;

  /** 快照当前画布状态（用于模式切换时保存/恢复） */
  snapshotState: () => { nodes: DiffuserNode[]; edges: DiffuserEdge[]; reactions: DiffuserReaction[] };
  /** 从快照恢复画布状态 */
  restoreState: (snapshot: { nodes: DiffuserNode[]; edges: DiffuserEdge[]; reactions: DiffuserReaction[] }) => void;
}

export const useDiffuserStore = create<DiffuserState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],

      addRootNode: (word, canvasWidth = 1000, canvasHeight = 800) => {
        const id = generateId('diff');
        const position = findFreeClusterPosition(
          get().nodes,
          canvasWidth / 2,
          canvasHeight / 2
        );

        const node: DiffuserNode = {
          id,
          word,
          parentId: null,
          x: position.x,
          y: position.y,
          isExpanded: false,
          isLoading: false,
          level: 1,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          nodes: [...state.nodes, node].slice(-MAX_NODES),
        }));

        return id;
      },

      addChildNodes: (parentId, children) => {
        const state = get();
        const parent = state.nodes.find((n) => n.id === parentId);
        if (!parent) return;

        const existingChildren = state.nodes.filter((n) => n.parentId === parentId);
        const count = children.length;
        // 根据已有子节点数量调整半径，避免重叠
        const radius = existingChildren.length > 0 ? 180 : 140;
        // 偏移起始角度，避免与已有子节点重叠
        const startAngle = existingChildren.length * (Math.PI / count);
        const relevances = children.map((c) => c.relevance ?? 0.9);
        // 构建已有边线段，用于避免新边交叉
        const nodeMap = new Map(state.nodes.map((n) => [n.id, n]));
        const edgeSegments = state.edges
          .map((e) => {
            const s = nodeMap.get(e.sourceId);
            const t = nodeMap.get(e.targetId);
            return s && t ? { sx: s.x, sy: s.y, tx: t.x, ty: t.y } : null;
          })
          .filter((seg): seg is { sx: number; sy: number; tx: number; ty: number } => seg !== null);
        const positions = calcRadialPositions(parent.x, parent.y, count, radius, startAngle, state.nodes, relevances, edgeSegments);

        const newNodes: DiffuserNode[] = children.map((child, i) => ({
          id: generateId('diff'),
          word: child.word,
          parentId,
          x: positions[i].x,
          y: positions[i].y,
          isExpanded: false,
          isLoading: false,
          level: 3 as const,
          createdAt: new Date().toISOString(),
        }));

        const newEdges: DiffuserEdge[] = newNodes.map((n, i) => ({
          id: generateId('edge'),
          sourceId: parentId,
          targetId: n.id,
          type: 'parent-child' as const,
          relation: children[i]?.relation,
        }));

        set((state) => ({
          nodes: [...state.nodes, ...newNodes].slice(-MAX_NODES),
          edges: [...state.edges, ...newEdges].slice(-MAX_EDGES),
        }));

        // 标记父节点为已展开，并将三级词语升级为二级
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === parentId
              ? { ...n, isExpanded: true, ...(n.level === 3 ? { level: 2 as const } : {}) }
              : n
          ),
        }));
      },

      removeNode: (nodeId) => {
        const allIds = new Set<string>();
        const collect = (id: string) => {
          allIds.add(id);
          get().nodes
            .filter((n) => n.parentId === id)
            .forEach((n) => collect(n.id));
        };
        collect(nodeId);

        set((state) => ({
          nodes: state.nodes.filter((n) => !allIds.has(n.id)),
          edges: state.edges.filter(
            (e) => !allIds.has(e.sourceId) && !allIds.has(e.targetId)
          ),
        }));
      },

      setNodeExpanded: (nodeId, expanded) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, isExpanded: expanded } : n
          ),
        }));
      },

      moveNode: (nodeId, x, y) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, x, y } : n
          ),
        }));
      },

      setNodeLoading: (nodeId, loading) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, isLoading: loading } : n
          ),
        }));
      },

      addNote: (nodeId, note) => {
        const newNote: DiffuserNote = {
          id: generateId('note'),
          content: note.content,
          source: note.source,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, notes: [...(n.notes ?? []), newNote] }
              : n
          ),
        }));
      },

      removeNote: (nodeId, noteId) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, notes: n.notes?.filter((nt) => nt.id !== noteId) }
              : n
          ),
        }));
      },

      updateNote: (nodeId, noteId, content) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  notes: n.notes?.map((nt) =>
                    nt.id === noteId ? { ...nt, content } : nt
                  ),
                }
              : n
          ),
        }));
      },

      clearCanvas: () => set({ nodes: [], edges: [], reactions: [], selectedIds: [] }),

      snapshotState: () => {
        const s = get();
        return { nodes: s.nodes, edges: s.edges, reactions: s.reactions };
      },

      restoreState: (snapshot) => set({
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        reactions: snapshot.reactions,
        selectedIds: [],
      }),

      // 碰撞反应
      reactions: [],

      addReaction: (reaction) => {
        set((state) => ({
          reactions: [...state.reactions, reaction],
        }));
      },

      adoptReactionResult: (reactionId, resultId, x, y) => {
        const reaction = get().reactions.find((r) => r.id === reactionId);
        if (!reaction) return null;

        const result = reaction.results.find((r) => r.id === resultId);
        if (!result || result.adopted) return null;

        // 创建新节点
        const newNodeId = generateId('diff');
        const newNode: DiffuserNode = {
          id: newNodeId,
          word: result.content,
          parentId: null,
          x,
          y,
          isExpanded: false,
          isLoading: false,
          level: 1,
          createdAt: new Date().toISOString(),
          reactionFrom: { wordA: reaction.sourceWordA, wordB: reaction.sourceWordB },
        };

        // 标记结果为已采纳
        set((state) => ({
          nodes: [...state.nodes, newNode],
          reactions: state.reactions.map((r) =>
            r.id === reactionId
              ? {
                  ...r,
                  results: r.results.map((res) =>
                    res.id === resultId ? { ...res, adopted: true } : res
                  ),
                }
              : r
          ),
        }));

        return newNodeId;
      },

      markResultAdopted: (reactionId, resultId) => {
        set((state) => ({
          reactions: state.reactions.map((r) =>
            r.id === reactionId
              ? {
                  ...r,
                  results: r.results.map((res) =>
                    res.id === resultId ? { ...res, adopted: true } : res
                  ),
                }
              : r
          ),
        }));
      },

      // 多选状态
      selectedIds: [],

      setSelectedIds: (ids) => {
        set({ selectedIds: ids });
      },

      addToSelection: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds
            : [...state.selectedIds, id],
        }));
      },

      removeFromSelection: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.filter((i) => i !== id),
        }));
      },

      clearSelection: () => {
        set({ selectedIds: [] });
      },

      moveNodesBatch: (moves) => {
        const moveMap = new Map(moves.map((m) => [m.nodeId, m]));
        set((state) => ({
          nodes: state.nodes.map((n) => {
            const m = moveMap.get(n.id);
            return m ? { ...n, x: m.x, y: m.y } : n;
          }),
        }));
      },

      getNodeById: (id) => get().nodes.find((n) => n.id === id),

      getChildrenOf: (parentId) =>
        get().nodes.filter((n) => n.parentId === parentId),

      getDescendantIds: (nodeId) => {
        const ids: string[] = [nodeId];
        const collect = (id: string) => {
          get().nodes
            .filter((n) => n.parentId === id)
            .forEach((n) => {
              ids.push(n.id);
              collect(n.id);
            });
        };
        collect(nodeId);
        return ids;
      },
    }),
    {
      name: 'wwx-diffuser',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        reactions: state.reactions,
      }),
    }
  )
);
