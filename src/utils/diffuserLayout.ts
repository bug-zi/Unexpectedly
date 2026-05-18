/**
 * 灵感扩散器 - 布局算法（防重叠）
 */

import type { DiffuserNode } from '@/types/diffuser';

// 气泡间最小中心距（像素）
const MIN_SPACING = 120;
// 根节点集群间最小中心距
const CLUSTER_SPACING = 350;
// 最大搜索尝试次数
const MAX_SPIRAL_ATTEMPTS = 48;

/**
 * 检查某个位置是否与已有节点重叠
 */
function isOverlapping(
  x: number,
  y: number,
  nodes: Array<{ x: number; y: number }>,
  minDist: number = MIN_SPACING
): boolean {
  return nodes.some((n) => {
    const dx = n.x - x;
    const dy = n.y - y;
    return dx * dx + dy * dy < minDist * minDist;
  });
}

/**
 * 相关性 → 半径映射
 * relevance 0.8~1.0 → 半径 baseRadius*2.0 ~ baseRadius*0.8
 * 相关性越大（越相关），距离父节点越近
 */
function relevanceToRadius(relevance: number, baseRadius: number): number {
  // clamp 到 0.8~1.0
  const clamped = Math.min(1.0, Math.max(0.8, relevance));
  // 线性映射：1.0 → baseRadius*0.8（最近），0.8 → baseRadius*2.0（最远）
  const t = (clamped - 0.8) / 0.2; // 0.8→0, 1.0→1
  return baseRadius * (2.0 - 1.2 * t); // t=1 → 0.8x, t=0 → 2.0x
}

/**
 * 判断两条线段是否相交（排除端点附近，避免共享端点误判）
 */
function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d1x = ax2 - ax1, d1y = ay2 - ay1;
  const d2x = bx2 - bx1, d2y = by2 - by1;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return false; // 平行
  const t = ((bx1 - ax1) * d2y - (by1 - ay1) * d2x) / cross;
  const u = ((bx1 - ax1) * d1y - (by1 - ay1) * d1x) / cross;
  // 排除端点附近（共享父节点等场景）
  return t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95;
}

/**
 * 检查新边是否与已有边交叉
 */
function edgeCrossesExisting(
  px: number, py: number,
  nx: number, ny: number,
  edges: Array<{ sx: number; sy: number; tx: number; ty: number }>
): boolean {
  for (const e of edges) {
    if (segmentsIntersect(px, py, nx, ny, e.sx, e.sy, e.tx, e.ty)) {
      return true;
    }
  }
  return false;
}

/**
 * 计算环形布局位置（防重叠 + 防边交叉 + 相关性决定距离）
 * 相关性越大的词离父节点越近，相关性越小的词离父节点越远
 */
export function calcRadialPositions(
  centerX: number,
  centerY: number,
  count: number = 8,
  radius: number = 140,
  startAngle: number = Math.PI / 8,
  existingNodes: Array<{ x: number; y: number }> = [],
  relevances: number[] = [],
  existingEdges: Array<{ sx: number; sy: number; tx: number; ty: number }> = []
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const placedEdges = [...existingEdges];

  // 按相关性从高到低排序，高相关性的词先放置（占据靠近父节点的位置）
  const indexed = Array.from({ length: count }, (_, i) => ({
    idx: i,
    relevance: relevances[i] ?? 0.8,
  }));
  indexed.sort((a, b) => b.relevance - a.relevance);

  // 为每个排序后的位置计算角度（均匀分布）
  const angleMap = new Map<number, number>();
  indexed.forEach((item, order) => {
    angleMap.set(item.idx, startAngle + (2 * Math.PI * order) / count);
  });

  for (let i = 0; i < count; i++) {
    const relevance = relevances[i] ?? 0.9;
    const nodeRadius = relevanceToRadius(relevance, radius);
    const baseAngle = angleMap.get(i)!;

    // 理想位置
    let bestX = centerX + nodeRadius * Math.cos(baseAngle);
    let bestY = centerY + nodeRadius * Math.sin(baseAngle);

    // 检测碰撞（包括同批次已放置的节点）和边交叉
    const allOccupied = [...existingNodes, ...positions];

    if (isOverlapping(bestX, bestY, allOccupied, MIN_SPACING) ||
        edgeCrossesExisting(centerX, centerY, bestX, bestY, placedEdges)) {
      // 逐步尝试：先偏移角度，再增大半径
      let found = false;

      for (let extraR = 0; extraR <= 200 && !found; extraR += 20) {
        const testRadius = nodeRadius + extraR;
        for (let aStep = 0; aStep <= 8 && !found; aStep++) {
          const offsets = aStep === 0 ? [0] : [aStep * 0.1, -aStep * 0.1];
          for (const aOff of offsets) {
            const testX = centerX + testRadius * Math.cos(baseAngle + aOff);
            const testY = centerY + testRadius * Math.sin(baseAngle + aOff);
            if (!isOverlapping(testX, testY, allOccupied, MIN_SPACING) &&
                !edgeCrossesExisting(centerX, centerY, testX, testY, placedEdges)) {
              bestX = testX;
              bestY = testY;
              found = true;
              break;
            }
          }
        }
      }
    }

    positions.push({ x: bestX, y: bestY });
    // 将已放置的边加入列表，后续节点也会避开与该边交叉
    placedEdges.push({ sx: centerX, sy: centerY, tx: bestX, ty: bestY });
  }

  return positions;
}

/**
 * 为新的根节点找一个不重叠的位置
 * 从画布中心螺旋向外搜索，确保远离所有已有节点
 */
export function findFreeClusterPosition(
  existingNodes: DiffuserNode[],
  canvasCenterX: number = 500,
  canvasCenterY: number = 400
): { x: number; y: number } {
  if (existingNodes.length === 0) {
    return { x: canvasCenterX, y: canvasCenterY };
  }

  // 画布中心可用则直接用
  if (!isOverlapping(canvasCenterX, canvasCenterY, existingNodes, CLUSTER_SPACING)) {
    return { x: canvasCenterX, y: canvasCenterY };
  }

  // 螺旋搜索：每圈 8 个方向，逐圈扩大
  for (let ring = 1; ring <= MAX_SPIRAL_ATTEMPTS / 8; ring++) {
    const r = CLUSTER_SPACING * ring;
    for (let dir = 0; dir < 8; dir++) {
      const angle = (Math.PI * 2 * dir) / 8 + (Math.PI / 8); // 偏移半格避免对齐轴线
      const x = canvasCenterX + r * Math.cos(angle);
      const y = canvasCenterY + r * Math.sin(angle);

      if (!isOverlapping(x, y, existingNodes, CLUSTER_SPACING)) {
        return { x, y };
      }
    }
  }

  // 兜底：在所有候选位置中选离已有节点最远的
  let bestPos = { x: canvasCenterX + CLUSTER_SPACING, y: canvasCenterY };
  let maxMinDist = 0;

  for (let ring = 1; ring <= 6; ring++) {
    for (let dir = 0; dir < 8; dir++) {
      const r = CLUSTER_SPACING * ring;
      const angle = (Math.PI * 2 * dir) / 8;
      const x = canvasCenterX + r * Math.cos(angle);
      const y = canvasCenterY + r * Math.sin(angle);

      let minDist = Infinity;
      for (const node of existingNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) minDist = d;
      }

      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestPos = { x, y };
      }
    }
  }

  return bestPos;
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix: string = 'diff'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 碰撞反应的磁吸检测半径 */
const SNAP_RADIUS = 60;

/**
 * 检测拖拽中的节点是否靠近某个其他节点（用于碰撞反应）
 * 返回距离最近的节点和距离，如果范围内没有则返回 null
 */
export function findSnapTarget(
  dragX: number,
  dragY: number,
  nodes: DiffuserNode[],
  excludeId: string,
  snapRadius: number = SNAP_RADIUS
): { node: DiffuserNode; distance: number } | null {
  let closest: { node: DiffuserNode; distance: number } | null = null;

  for (const n of nodes) {
    if (n.id === excludeId) continue;
    const dx = n.x - dragX;
    const dy = n.y - dragY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < snapRadius && (!closest || dist < closest.distance)) {
      closest = { node: n, distance: dist };
    }
  }

  return closest;
}

/**
 * 规范化框选矩形，确保 x1<x2, y1<y2
 */
export function normalizeRect(marquee: {
  startX: number; startY: number; currentX: number; currentY: number;
}) {
  return {
    x1: Math.min(marquee.startX, marquee.currentX),
    y1: Math.min(marquee.startY, marquee.currentY),
    x2: Math.max(marquee.startX, marquee.currentX),
    y2: Math.max(marquee.startY, marquee.currentY),
  };
}

/** 气泡尺寸映射（半宽、半高），根据 level */
const BUBBLE_HALF: Record<number, { w: number; h: number }> = {
  1: { w: 50, h: 24 },
  2: { w: 35, h: 20 },
  3: { w: 30, h: 18 },
};

/**
 * 检测节点是否与矩形区域相交（AABB）
 */
export function nodeIntersectsRect(
  node: DiffuserNode,
  rect: { x1: number; y1: number; x2: number; y2: number }
): boolean {
  const half = BUBBLE_HALF[node.level] ?? BUBBLE_HALF[3];
  return !(
    node.x + half.w < rect.x1 ||
    node.x - half.w > rect.x2 ||
    node.y + half.h < rect.y1 ||
    node.y - half.h > rect.y2
  );
}
