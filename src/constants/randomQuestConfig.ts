import type { QuestCategory, QuestDifficulty } from '@/types';

// ===== 类别配置 =====

export const QUEST_CATEGORIES: QuestCategory[] = [
  'creative',
  'physical',
  'social',
  'reflection',
  'exploration',
  'kindness',
];

export const CATEGORY_LABELS: Record<QuestCategory, string> = {
  creative: '创意挑战',
  physical: '身体行动',
  social: '社交互动',
  reflection: '自我反思',
  exploration: '探索发现',
  kindness: '善意传递',
};

export const CATEGORY_COLORS: Record<QuestCategory, { bg: string; text: string; border: string; hex: string }> = {
  creative: { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700', hex: '#A855F7' },
  physical: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-700', hex: '#22C55E' },
  social: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700', hex: '#3B82F6' },
  reflection: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700', hex: '#F59E0B' },
  exploration: { bg: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-700', hex: '#06B6D4' },
  kindness: { bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-300 dark:border-pink-700', hex: '#EC4899' },
};

export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  1: '轻松试试',
  2: '随便做做',
  3: '来点挑战',
  4: '需要勇气',
  5: '突破自我',
};
