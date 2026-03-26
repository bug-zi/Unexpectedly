import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  gradient?: boolean;
}

/**
 * 通用Icon组件
 * 根据name动态渲染对应的Lucide图标
 */
export function Icon({ name, size = 24, className, color, gradient = false }: IconProps) {
  const IconComponent = (LucideIcons as Record<string, LucideIcon>)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  if (gradient) {
    const gradientId = `gradient-${name}-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444">
                <animate
                  attributeName="stop-color"
                  values="#ef4444;#eab308;#3b82f6;#22c55e;#ef4444"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="33%" stopColor="#eab308">
                <animate
                  attributeName="stop-color"
                  values="#eab308;#3b82f6;#22c55e;#ef4444;#eab308"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="66%" stopColor="#3b82f6">
                <animate
                  attributeName="stop-color"
                  values="#3b82f6;#22c55e;#ef4444;#eab308;#3b82f6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#22c55e">
                <animate
                  attributeName="stop-color"
                  values="#22c55e;#ef4444;#eab308;#3b82f6;#22c55e"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
          <IconComponent
            size={size}
            style={{ color: `url(#${gradientId})` }}
          />
        </svg>
      </div>
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      style={{ color }}
    />
  );
}

/**
 * 分类图标组件
 * 用于渲染带有背景色的分类图标
 */
export function CategoryIcon({
  iconName,
  color,
  size = 20,
  className,
}: {
  iconName: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx('inline-flex items-center justify-center', className)}
      style={{ color }}
    >
      <Icon name={iconName} size={size} />
    </div>
  );
}
