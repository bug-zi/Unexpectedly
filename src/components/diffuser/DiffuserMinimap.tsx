/**
 * 灵感扩散器 - 小地图
 * 显示所有节点的缩略视图，点击可快速导航
 */

import { useMemo } from 'react';

interface DiffuserMinimapProps {
  nodes: Array<{ id: string; x: number; y: number; parentId: string | null }>;
  onNavigate: (x: number, y: number) => void;
}

const MINIMAP_W = 140;
const MINIMAP_H = 90;
const PADDING = 8;

export function DiffuserMinimap({ nodes, onNavigate }: DiffuserMinimapProps) {
  const { viewBox, dots } = useMemo(() => {
    if (nodes.length === 0) return { viewBox: '0 0 140 90', dots: [] };

    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 80;
    const maxX = Math.max(...xs) + 80;
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 50;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const s = Math.min((MINIMAP_W - PADDING * 2) / contentW, (MINIMAP_H - PADDING * 2) / contentH);

    const dots = nodes.map((n) => ({
      id: n.id,
      cx: PADDING + (n.x - minX) * s,
      cy: PADDING + (n.y - minY) * s,
      isRoot: !n.parentId,
      origX: n.x,
      origY: n.y,
    }));

    return { viewBox: `0 0 ${MINIMAP_W} ${MINIMAP_H}`, dots };
  }, [nodes]);

  if (nodes.length === 0) return null;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const closest = dots.reduce((prev, curr) => {
      const dPrev = Math.hypot(prev.cx - clickX, prev.cy - clickY);
      const dCurr = Math.hypot(curr.cx - clickX, curr.cy - clickY);
      return dCurr < dPrev ? curr : prev;
    });
    onNavigate(closest.origX, closest.origY);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <svg
        width={MINIMAP_W}
        height={MINIMAP_H}
        viewBox={viewBox}
        className="bg-white/60 backdrop-blur-sm border border-green-200/30 rounded-lg shadow-sm cursor-pointer"
        onClick={handleClick}
      >
        {dots.map((d) => (
          <circle
            key={d.id}
            cx={d.cx}
            cy={d.cy}
            r={d.isRoot ? 3.5 : 2}
            fill={d.isRoot ? 'rgba(34,197,94,0.7)' : 'rgba(34,197,94,0.35)'}
          />
        ))}
      </svg>
    </div>
  );
}
