/**
 * 灵感扩散器 - 词语气泡
 * 支持深度着色、展开指示、hover光晕
 */

import { useState, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, BookOpen } from 'lucide-react';
import type { DiffuserNode } from '@/types/diffuser';
import { findSnapTarget } from '@/utils/diffuserLayout';

interface DiffuserBubbleProps {
  node: DiffuserNode;
  depth: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: () => void;
  onShiftSelect: () => void;
  onExpand: () => void;
  onAddMore: () => void;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
  onMoveBatch?: (moves: Array<{ nodeId: string; x: number; y: number }>) => void;
  selectedNodes?: DiffuserNode[];
  onOpenNotebook: () => void;
  /** 拖拽靠近其他节点时回调 */
  onDragNear: (targetId: string | null) => void;
  /** 两个节点碰撞触发反应 */
  onReaction: (targetId: string) => void;
  /** 画布上所有节点（用于碰撞检测） */
  allNodes: DiffuserNode[];
  /** 是否被其他气泡靠近（高亮发光） */
  isNearTarget: boolean;
  childCount: number;
  zoom: number;
  staggerIndex: number;
}

// 深度对应的颜色梯度（用于连接线等辅助视觉）
const DEPTH_COLORS = [
  { bg: 'from-green-500/60 to-emerald-600/60', border: 'border-green-400/50', shadow: 'shadow-green-500/25', rootText: 'text-white', childText: 'text-green-800' },
  { bg: 'from-teal-400/50 to-green-500/50', border: 'border-teal-300/40', shadow: 'shadow-teal-400/20', rootText: 'text-white', childText: 'text-teal-800' },
  { bg: 'from-emerald-400/45 to-teal-500/45', border: 'border-emerald-300/35', shadow: 'shadow-emerald-400/15', rootText: 'text-white', childText: 'text-emerald-800' },
  { bg: 'from-cyan-400/40 to-emerald-500/40', border: 'border-cyan-300/30', shadow: 'shadow-cyan-400/10', rootText: 'text-white', childText: 'text-cyan-800' },
];

export const DiffuserBubble = memo(function DiffuserBubble({
  node,
  depth,
  isSelected,
  isMultiSelected,
  onSelect,
  onShiftSelect,
  onExpand,
  onAddMore,
  onDelete,
  onMove,
  onMoveBatch,
  selectedNodes,
  onOpenNotebook,
  onDragNear,
  onReaction,
  allNodes,
  isNearTarget,
  childCount,
  zoom,
  staggerIndex,
}: DiffuserBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const groupDragStart = useRef<Array<{ id: string; x: number; y: number }> | null>(null);
  const isRoot = node.parentId === null;
  const nodeLevel = node.level ?? (isRoot ? 1 : 3); // 兼容旧数据
  const colors = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

  // 等级影响尺寸
  const sizeClass = nodeLevel === 1
    ? 'min-w-[100px] px-6 py-3'
    : nodeLevel === 2
      ? 'min-w-[70px] px-4 py-2.5'
      : 'min-w-[60px] px-3 py-2';

  const textSize = nodeLevel === 1 ? 'text-base font-bold' : nodeLevel === 2 ? 'text-sm font-medium' : 'text-xs font-medium';

  // 拖拽处理（含碰撞检测 + 组拖拽）
  const snapTargetRef = useRef<string | null>(null);
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };

    // 多选组拖拽：快照所有选中节点位置
    if (isMultiSelected && selectedNodes && selectedNodes.length > 0 && onMoveBatch) {
      groupDragStart.current = selectedNodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
    } else {
      groupDragStart.current = null;
    }

    const handleMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - dragStart.current.x) / zoom;
      const dy = (ev.clientY - dragStart.current.y) / zoom;

      if (groupDragStart.current && onMoveBatch) {
        // 组拖拽：所有选中节点统一偏移
        const moves = groupDragStart.current.map((n) => ({
          nodeId: n.id,
          x: n.x + dx,
          y: n.y + dy,
        }));
        onMoveBatch(moves);
      } else {
        // 单节点拖拽
        const newX = dragStart.current.nodeX + dx;
        const newY = dragStart.current.nodeY + dy;
        onMove(newX, newY);

        // 碰撞检测（仅单拖拽）
        const snap = findSnapTarget(newX, newY, allNodes, node.id);
        const targetId = snap ? snap.node.id : null;
        if (targetId !== snapTargetRef.current) {
          snapTargetRef.current = targetId;
          onDragNear(targetId);
        }
      }
    };
    const handleUp = () => {
      // 仅单拖拽触发碰撞反应
      if (!groupDragStart.current && snapTargetRef.current) {
        onReaction(snapTargetRef.current);
        snapTargetRef.current = null;
        onDragNear(null);
      }
      groupDragStart.current = null;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [node.x, node.y, node.id, zoom, onMove, onMoveBatch, isMultiSelected, selectedNodes, allNodes, onDragNear, onReaction]);

  return (
    <div
      data-bubble
      className="absolute group"
      style={{
        left: node.x,
        top: node.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: nodeLevel === 1 ? 0 : 0.03 * staggerIndex,
      }}
      onMouseDown={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          if (e.shiftKey) {
            onShiftSelect();
          } else {
            onSelect();
            setShowActions(!showActions);
          }
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!node.isExpanded && !node.isLoading) {
          onExpand();
        }
      }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 气泡主体 */}
      <div
        className={`
          relative rounded-full cursor-pointer whitespace-nowrap
          transition-all duration-200 select-none
          ${nodeLevel === 1
            ? `bg-gradient-to-br ${colors.bg} backdrop-blur-md border-2 ${colors.border} shadow-lg ${colors.shadow}`
            : nodeLevel === 2
              ? `bg-green-300/50 backdrop-blur-sm border-2 border-green-400/40 shadow-md shadow-green-300/15`
              : `bg-white/50 backdrop-blur-sm border ${colors.border}`
          }
          ${sizeClass}
          ${isSelected && !isMultiSelected ? `ring-2 ring-green-400/70 shadow-lg ${colors.shadow}` : ''}
	          ${isMultiSelected ? 'ring-2 ring-green-500 shadow-lg shadow-green-400/30' : ''}
          ${isNearTarget ? 'ring-2 ring-yellow-400/80 shadow-lg shadow-yellow-400/40 scale-110' : ''}
          ${node.isLoading ? 'animate-pulse' : ''}
          hover:shadow-lg hover:shadow-green-400/20
          hover:bg-green-100/40 dark:hover:bg-green-900/20
          hover:scale-105 active:scale-95
          transition-transform
        `}
      >
        <span className={`${nodeLevel === 1 ? colors.rootText : nodeLevel === 2 ? 'text-green-800' : colors.childText} ${textSize}`}>
          {node.word}
        </span>

        {/* 加载指示器 - 旋转环 */}
        {node.isLoading && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
            <Loader2 className="relative inline-flex w-4 h-4 text-green-500 animate-spin" />
          </span>
        )}

        {/* 未展开指示 - 子节点数量角标 */}
        {!node.isExpanded && !node.isLoading && nodeLevel !== 1 && childCount === 0 && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-green-500/70 text-white text-[8px] font-bold shadow-sm">
            +
          </span>
        )}

        {/* 笔记指示器 - 有笔记时显示 */}
        {node.notes && node.notes.length > 0 && (
          <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-green-500/80 text-white shadow-sm">
            <BookOpen size={8} />
          </span>
        )}
      </div>

      {/* 操作按钮 - hover 或选中时显示（多选时隐藏） */}
      {(showActions || (isSelected && !isMultiSelected)) && !node.isLoading && (
        <motion.div
          className="absolute -top-2 -right-2 flex items-center gap-1"
          initial={{ scale: 0, y: 4 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 追加按钮 */}
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/80 backdrop-blur-sm text-white shadow-sm hover:bg-green-400 hover:scale-110 transition-all"
            title="拓展更多词语"
            onClick={(e) => {
              e.stopPropagation();
              onAddMore();
            }}
          >
            <Plus size={12} />
          </button>

          {/* 笔记本按钮 */}
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full bg-green-400/70 backdrop-blur-sm text-white shadow-sm hover:bg-green-300 hover:scale-110 transition-all"
            title="笔记本"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotebook();
            }}
          >
            <BookOpen size={12} />
          </button>

          {/* 删除按钮 */}
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/70 backdrop-blur-sm text-white shadow-sm hover:bg-red-400 hover:scale-110 transition-all"
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <X size={12} />
          </button>
        </motion.div>
      )}

      {/* 未展开时的提示 */}
      {!node.isExpanded && !node.isLoading && !showActions && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-gray-400 whitespace-nowrap">双击展开</span>
        </div>
      )}
    </motion.div>
    </div>
  );
});
