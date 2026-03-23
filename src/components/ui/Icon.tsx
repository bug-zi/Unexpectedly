import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

/**
 * 通用Icon组件
 * 根据name动态渲染对应的Lucide图标
 */
export function Icon({ name, size = 24, className, color }: IconProps) {
  const IconComponent = (LucideIcons as Record<string, LucideIcon>)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
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
