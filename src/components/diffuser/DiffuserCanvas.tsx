/**
 * 灵感扩散器 - 无限画布容器
 * 支持平移、缩放、SVG连接线、触摸手势
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { DiffuserNode, DiffuserEdge } from '@/types/diffuser';
import { DiffuserBubble } from './DiffuserBubble';
import { DiffuserMinimap } from './DiffuserMinimap';
import { normalizeRect, nodeIntersectsRect } from '@/utils/diffuserLayout';

interface DiffuserCanvasProps {
  nodes: DiffuserNode[];
  edges: DiffuserEdge[];
  selectedId: string | null;
  selectedIds: string[];
  onSelectNode: (id: string | null) => void;
  onSelectIds: (ids: string[]) => void;
  onAddToSelection: (id: string) => void;
  onExpandNode: (id: string) => void;
  onAddMoreNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onMoveNodesBatch: (moves: Array<{ nodeId: string; x: number; y: number }>) => void;
  onOpenNotebook: (id: string) => void;
  onReaction: (idA: string, idB: string) => void;
  nearTargetId: string | null;
  onDragNear: (targetId: string | null) => void;
  centerOnNode?: { x: number; y: number } | null;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.0;

export function DiffuserCanvas({
  nodes,
  edges,
  selectedId,
  selectedIds,
  onSelectNode,
  onSelectIds,
  onAddToSelection,
  onExpandNode,
  onAddMoreNode,
  onDeleteNode,
  onMoveNode,
  onMoveNodesBatch,
  onOpenNotebook,
  onReaction,
  nearTargetId,
  onDragNear,
  centerOnNode,
}: DiffuserCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [marquee, setMarquee] = useState<{
    startX: number; startY: number; currentX: number; currentY: number;
  } | null>(null);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchDistRef = useRef(0);
  const touchCenterRef = useRef({ x: 0, y: 0 });

  // 键盘快捷键 + 方向键/WASD 连续平移画布
  useEffect(() => {
    const keysDown = new Set<string>();
    let rafId = 0;

    const isPanKey = (key: string) =>
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(key);

    const tick = () => {
      const SPEED = 8;
      let dx = 0, dy = 0;
      if (keysDown.has('ArrowUp') || keysDown.has('w') || keysDown.has('W')) dy += SPEED;
      if (keysDown.has('ArrowDown') || keysDown.has('s') || keysDown.has('S')) dy -= SPEED;
      if (keysDown.has('ArrowLeft') || keysDown.has('a') || keysDown.has('A')) dx += SPEED;
      if (keysDown.has('ArrowRight') || keysDown.has('d') || keysDown.has('D')) dx -= SPEED;
      if (dx !== 0 || dy !== 0) {
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      if (keysDown.size > 0) rafId = requestAnimationFrame(tick);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectNode(null);
        onSelectIds([]);
      }
      if (e.key === 'Delete') {
        if (selectedIds.length > 0) {
          selectedIds.forEach((id) => onDeleteNode(id));
          onSelectIds([]);
        } else if (selectedId) {
          onDeleteNode(selectedId);
        }
      }
      if (isPanKey(e.key)) {
        e.preventDefault();
        if (!keysDown.has(e.key)) {
          keysDown.add(e.key);
          if (keysDown.size === 1) rafId = requestAnimationFrame(tick);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, [selectedId, selectedIds, onSelectNode, onSelectIds, onDeleteNode]);

  // 自动居中到新节点
  useEffect(() => {
    if (!centerOnNode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPan({
      x: rect.width / 2 - centerOnNode.x * zoom,
      y: rect.height / 2 - centerOnNode.y * zoom,
    });
  }, [centerOnNode, zoom]);

  // 鼠标拖拽平移 / Shift+拖拽框选
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-bubble]')) return;
      if (e.shiftKey) {
        // Shift+拖拽 → 框选
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const canvasX = (e.clientX - rect.left - pan.x) / zoom;
        const canvasY = (e.clientY - rect.top - pan.y) / zoom;
        setMarquee({ startX: canvasX, startY: canvasY, currentX: canvasX, currentY: canvasY });
        return;
      }
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan, zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // 框选拖拽更新
      if (marquee) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const canvasX = (e.clientX - rect.left - pan.x) / zoom;
        const canvasY = (e.clientY - rect.top - pan.y) / zoom;
        setMarquee((prev) => prev ? { ...prev, currentX: canvasX, currentY: canvasY } : null);
        return;
      }
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
    },
    [isPanning, marquee, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (marquee) {
      // 框选结束 → 命中检测
      const rect = normalizeRect(marquee);
      const w = rect.x2 - rect.x1;
      const h = rect.y2 - rect.y1;
      if (w * h > 25) {
        const hitIds = nodes
          .filter((n) => nodeIntersectsRect(n, rect))
          .map((n) => n.id);
        onSelectIds(hitIds);
      }
      setMarquee(null);
      return;
    }
    setIsPanning(false);
  }, [marquee, nodes, onSelectIds]);

  // 以鼠标位置为中心缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (marquee) return; // 框选中不允许缩放
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prevZoom) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom + delta));
      const ratio = newZoom / prevZoom;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return newZoom;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setPan((prevPan) => ({
        x: mouseX - ratio * (mouseX - prevPan.x),
        y: mouseY - ratio * (mouseY - prevPan.y),
      }));
      return newZoom;
    });
  }, [marquee]);

  // 触摸手势 - 平移和双指缩放
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('[data-bubble]')) return;
      if (e.touches.length === 1) {
        setIsPanning(true);
        panStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      } else if (e.touches.length === 2) {
        setIsPanning(false);
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        touchDistRef.current = Math.sqrt(dx * dx + dy * dy);
        touchCenterRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isPanning) {
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;
        setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / touchDistRef.current;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = touchCenterRef.current.x - rect.left;
        const centerY = touchCenterRef.current.y - rect.top;
        setZoom((prevZoom) => {
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * scale));
          const ratio = newZoom / prevZoom;
          setPan((prevPan) => ({
            x: centerX - ratio * (centerX - prevPan.x),
            y: centerY - ratio * (centerY - prevPan.y),
          }));
          return newZoom;
        });
        touchDistRef.current = dist;
      }
    },
    [isPanning]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 点击空白处取消选中
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-bubble]')) {
        if (!e.shiftKey) {
          onSelectNode(null);
          onSelectIds([]);
        }
      }
    },
    [onSelectNode, onSelectIds]
  );

  // 缩放控制
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + 0.15));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - 0.15));
  }, []);

  // 自适应所有节点
  const fitAll = useCallback(() => {
    if (nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const newZoom = Math.min(rect.width / contentW, rect.height / contentH, 1.5);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
    });
  }, [nodes]);

  // 小地图导航
  const navigateToPosition = useCallback((x: number, y: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPan({
      x: rect.width / 2 - x * zoom,
      y: rect.height / 2 - y * zoom,
    });
  }, [zoom]);

  // 计算 Bezier 曲线的控制点
  const edgeLines = useMemo(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return edges
      .map((edge) => {
        const source = nodeMap.get(edge.sourceId);
        const target = nodeMap.get(edge.targetId);
        if (!source || !target) return null;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offset = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.15, 30);
        const cx = midX - dy * 0.15;
        const cy = midY + dx * 0.15;
        return { edge, source, target, cx, cy, offset };
      })
      .filter(Boolean) as Array<{
      edge: DiffuserEdge;
      source: DiffuserNode;
      target: DiffuserNode;
      cx: number;
      cy: number;
    }>;
  }, [nodes, edges]);

  // 计算节点深度
  const nodeDepthMap = useMemo(() => {
    const map = new Map<string, number>();
    const computeDepth = (id: string): number => {
      if (map.has(id)) return map.get(id)!;
      const node = nodes.find((n) => n.id === id);
      if (!node || !node.parentId) {
        map.set(id, 0);
        return 0;
      }
      const d = computeDepth(node.parentId) + 1;
      map.set(id, d);
      return d;
    };
    nodes.forEach((n) => computeDepth(n.id));
    return map;
  }, [nodes]);

  // 子节点数量 & 兄弟索引
  const childCountMap = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((n) => {
      if (n.parentId) {
        map.set(n.parentId, (map.get(n.parentId) || 0) + 1);
      }
    });
    return map;
  }, [nodes]);

  // 兄弟索引（用于交错动画）
  const siblingIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const groups = new Map<string, number>();
    nodes.forEach((n) => {
      const key = n.parentId ?? '__root__';
      const idx = groups.get(key) ?? 0;
      map.set(n.id, idx);
      groups.set(key, idx + 1);
    });
    return map;
  }, [nodes]);

  // 动态计算 SVG 包围盒，确保连接线在任意距离下完全可见
  const svgBounds = useMemo(() => {
    if (nodes.length === 0) {
      return { x: 0, y: 0, w: 10000, h: 10000 };
    }
    const pad = 500;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(0, ...xs) - pad;
    const minY = Math.min(0, ...ys) - pad;
    const maxX = Math.max(10000, ...xs) + pad;
    const maxY = Math.max(10000, ...ys) + pad;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [nodes]);

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 网格背景 - 随缩放调整 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)',
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x % (40 * zoom)}px ${pan.y % (40 * zoom)}px`,
        }}
      />

      {/* 变换层 */}
      <div className="absolute inset-0" style={{ transform, transformOrigin: '0 0' }}>
        {/* SVG 连接线 - Bezier 曲线 */}
        <svg
          className="absolute pointer-events-none"
          viewBox={`${svgBounds.x} ${svgBounds.y} ${svgBounds.w} ${svgBounds.h}`}
          style={{
            left: svgBounds.x,
            top: svgBounds.y,
            width: svgBounds.w,
            height: svgBounds.h,
          }}
        >
          <defs>
            <style>{`
              @keyframes flowDash {
                to { stroke-dashoffset: -20; }
              }
            `}</style>
          </defs>
          {edgeLines.map(({ edge, source, target, cx, cy }) => {
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            return (
              <g key={edge.id} className="group/edge">
                <path
                  d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={
                    edge.type === 'parent-child'
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(34, 197, 94, 0.12)'
                  }
                  strokeWidth={edge.type === 'parent-child' ? 1.5 : 1}
                  strokeDasharray={edge.type === 'ai-suggested' ? '6 4' : 'none'}
                  style={edge.type === 'ai-suggested' ? { animation: 'flowDash 1.5s linear infinite' } : undefined}
                />
                {edge.relation && (
                  <text
                    x={midX}
                    y={midY - 6}
                    textAnchor="middle"
                    className="fill-green-600/0 group-hover/edge:fill-green-600/60 text-[10px] pointer-events-none transition-all"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {edge.relation}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 框选矩形 */}
        {marquee && (() => {
          const x = Math.min(marquee.startX, marquee.currentX);
          const y = Math.min(marquee.startY, marquee.currentY);
          const w = Math.abs(marquee.currentX - marquee.startX);
          const h = Math.abs(marquee.currentY - marquee.startY);
          return (
            <div
              className="absolute pointer-events-none border-2 border-dashed border-green-400/60 bg-green-400/[0.06] rounded"
              style={{ left: x, top: y, width: w, height: h }}
            />
          );
        })()}

        {/* 气泡节点 */}
        {nodes.map((node) => (
          <DiffuserBubble
            key={node.id}
            node={node}
            depth={nodeDepthMap.get(node.id) ?? 0}
            childCount={childCountMap.get(node.id) ?? 0}
            staggerIndex={siblingIndexMap.get(node.id) ?? 0}
            isSelected={selectedId === node.id}
            isMultiSelected={selectedIds.includes(node.id)}
            onSelect={() => onSelectNode(node.id)}
            onShiftSelect={() => onAddToSelection(node.id)}
            onExpand={() => onExpandNode(node.id)}
            onAddMore={() => onAddMoreNode(node.id)}
            onDelete={() => onDeleteNode(node.id)}
            onMove={(x, y) => onMoveNode(node.id, x, y)}
            onMoveBatch={onMoveNodesBatch}
            selectedNodes={selectedIds
              .map((id) => nodes.find((n) => n.id === id))
              .filter((n): n is DiffuserNode => n !== undefined)}
            onOpenNotebook={() => onOpenNotebook(node.id)}
            onDragNear={onDragNear}
            onReaction={(targetId) => onReaction(node.id, targetId)}
            allNodes={nodes}
            isNearTarget={nearTargetId === node.id}
            zoom={zoom}
          />
        ))}
      </div>

      {/* 小地图 */}
      <DiffuserMinimap nodes={nodes} onNavigate={navigateToPosition} />

      {/* 画布控制按钮 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm border border-green-200/40 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
          onClick={zoomIn}
          title="放大"
        >
          <ZoomIn size={14} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm border border-green-200/40 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
          onClick={zoomOut}
          title="缩小"
        >
          <ZoomOut size={14} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm border border-green-200/40 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
          onClick={fitAll}
          title="适应全部"
        >
          <Maximize size={14} />
        </button>
        <div className="text-center text-gray-400/60 text-[10px] font-mono mt-0.5">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
