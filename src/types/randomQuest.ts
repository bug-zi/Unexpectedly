// ===== 随机小任务扭蛋机相关类型 =====

export type QuestCategory = 'creative' | 'physical' | 'social' | 'reflection' | 'exploration' | 'kindness';

export type QuestDifficulty = 1 | 2 | 3 | 4 | 5;

export interface RandomQuest {
  id: string;
  category: QuestCategory;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
  encouragement: string;
  completedAt?: string;
  skippedAt?: string;
  createdAt: string;
}

export interface CategoryDifficultyState {
  category: QuestCategory;
  currentDifficulty: QuestDifficulty;
  consecutiveSame: number;
  completedCount: number;
}
