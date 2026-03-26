import { CategoryConfig, ThinkingDimension, LifeScenario } from '@/types';

/**
 * 图标类型（Lucide组件名称）
 */
type IconName =
  | 'Sparkles'
  | 'RefreshCw'
  | 'Link2'
  | 'Lightbulb'
  | 'Rocket'
  | 'Briefcase'
  | 'Palette'
  | 'Heart'
  | 'BookOpen'
  | 'Sprout';

/**
 * 思维维度配置 - 统一黄色色调
 */
export const THINKING_DIMENSIONS: Record<ThinkingDimension, CategoryConfig & { iconName: IconName }> = {
  hypothesis: {
    id: 'hypothesis',
    name: '假设思维',
    icon: 'Sparkles',
    iconName: 'Sparkles',
    color: '#F59E0B',
    light: '#FFFBEB',
    dark: '#D97706',
  },
  reverse: {
    id: 'reverse',
    name: '逆向思考',
    icon: 'RefreshCw',
    iconName: 'RefreshCw',
    color: '#FBBF24',
    light: '#FEF3C7',
    dark: '#B45309',
  },
  creative: {
    id: 'creative',
    name: '联想创意',
    icon: 'Link2',
    iconName: 'Link2',
    color: '#FCD34D',
    light: '#FFFEF3',
    dark: '#CA8A04',
  },
  reflection: {
    id: 'reflection',
    name: '自我反思',
    icon: 'Lightbulb',
    iconName: 'Lightbulb',
    color: '#FBBF24',
    light: '#FEF9C3',
    dark: '#A16207',
  },
  future: {
    id: 'future',
    name: '未来设想',
    icon: 'Rocket',
    iconName: 'Rocket',
    color: '#F59E0B',
    light: '#FFEDD5',
    dark: '#C2410C',
  },
};

/**
 * 生活场景配置 - 统一黄色色调
 */
export const LIFE_SCENARIOS: Record<LifeScenario, CategoryConfig & { iconName: IconName }> = {
  career: {
    id: 'career',
    name: '职业发展',
    icon: 'Briefcase',
    iconName: 'Briefcase',
    color: '#FCD34D',
    light: '#FEF9C3',
    dark: '#A16207',
  },
  creative: {
    id: 'creative',
    name: '创意激发',
    icon: 'Palette',
    iconName: 'Palette',
    color: '#FBBF24',
    light: '#FEF3C7',
    dark: '#B45309',
  },
  relationship: {
    id: 'relationship',
    name: '人际关系',
    icon: 'Heart',
    iconName: 'Heart',
    color: '#F59E0B',
    light: '#FFFBEB',
    dark: '#D97706',
  },
  learning: {
    id: 'learning',
    name: '学习成长',
    icon: 'BookOpen',
    iconName: 'BookOpen',
    color: '#FCD34D',
    light: '#FFFEF3',
    dark: '#CA8A04',
  },
  philosophy: {
    id: 'philosophy',
    name: '生活哲学',
    icon: 'Sprout',
    iconName: 'Sprout',
    color: '#FBBF24',
    light: '#FFEDD5',
    dark: '#C2410C',
  },
};

/**
 * 获取分类配置
 */
export function getCategoryConfig(
  type: 'thinking' | 'scenario',
  id: ThinkingDimension | LifeScenario
): CategoryConfig {
  if (type === 'thinking') {
    return THINKING_DIMENSIONS[id as ThinkingDimension];
  }
  return LIFE_SCENARIOS[id as LifeScenario];
}
