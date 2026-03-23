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
 * 思维维度配置
 */
export const THINKING_DIMENSIONS: Record<ThinkingDimension, CategoryConfig & { iconName: IconName }> = {
  hypothesis: {
    id: 'hypothesis',
    name: '假设思维',
    icon: 'Sparkles',
    iconName: 'Sparkles',
    color: '#8B5CF6',
    light: '#F3F0FF',
    dark: '#6D28D9',
  },
  reverse: {
    id: 'reverse',
    name: '逆向思考',
    icon: 'RefreshCw',
    iconName: 'RefreshCw',
    color: '#F59E0B',
    light: '#FFFBEB',
    dark: '#D97706',
  },
  creative: {
    id: 'creative',
    name: '联想创意',
    icon: 'Link2',
    iconName: 'Link2',
    color: '#06B6D4',
    light: '#ECFEFF',
    dark: '#0891B2',
  },
  reflection: {
    id: 'reflection',
    name: '自我反思',
    icon: 'Lightbulb',
    iconName: 'Lightbulb',
    color: '#FCD34D',
    light: '#FFFEF3',
    dark: '#F59E0B',
  },
  future: {
    id: 'future',
    name: '未来设想',
    icon: 'Rocket',
    iconName: 'Rocket',
    color: '#10B981',
    light: '#ECFDF5',
    dark: '#059669',
  },
};

/**
 * 生活场景配置
 */
export const LIFE_SCENARIOS: Record<LifeScenario, CategoryConfig & { iconName: IconName }> = {
  career: {
    id: 'career',
    name: '职业发展',
    icon: 'Briefcase',
    iconName: 'Briefcase',
    color: '#6366F1',
    light: '#EEF2FF',
    dark: '#4F46E5',
  },
  creative: {
    id: 'creative',
    name: '创意激发',
    icon: 'Palette',
    iconName: 'Palette',
    color: '#EC4899',
    light: '#FDF2F8',
    dark: '#DB2777',
  },
  relationship: {
    id: 'relationship',
    name: '人际关系',
    icon: 'Heart',
    iconName: 'Heart',
    color: '#EF4444',
    light: '#FEF2F2',
    dark: '#DC2626',
  },
  learning: {
    id: 'learning',
    name: '学习成长',
    icon: 'BookOpen',
    iconName: 'BookOpen',
    color: '#8B5CF6',
    light: '#F3F0FF',
    dark: '#7C3AED',
  },
  philosophy: {
    id: 'philosophy',
    name: '生活哲学',
    icon: 'Sprout',
    iconName: 'Sprout',
    color: '#059669',
    light: '#ECFDF5',
    dark: '#047857',
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
