import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RandomQuest, QuestCategory, QuestDifficulty, CategoryDifficultyState } from '@/types';
import { QUEST_CATEGORIES } from '@/constants/randomQuestConfig';

const MAX_HISTORY = 100;

const defaultCategoryStates = (): Record<QuestCategory, CategoryDifficultyState> => {
  const result = {} as Record<QuestCategory, CategoryDifficultyState>;
  for (const cat of QUEST_CATEGORIES) {
    result[cat] = {
      category: cat,
      currentDifficulty: 1 as QuestDifficulty,
      consecutiveSame: 0,
      completedCount: 0,
    };
  }
  return result;
};

interface RandomQuestState {
  questHistory: RandomQuest[];
  categoryStates: Record<QuestCategory, CategoryDifficultyState>;
  currentQuest: RandomQuest | null;
  isGenerating: boolean;

  setCurrentQuest: (quest: RandomQuest) => void;
  completeQuest: (id: string) => void;
  skipQuest: (id: string) => void;
  clearCurrentQuest: () => void;
  setIsGenerating: (v: boolean) => void;
  recordCategoryAppearance: (category: QuestCategory) => void;
  getCurrentDifficulty: (category: QuestCategory) => QuestDifficulty;
  getRecentQuests: (count: number) => RandomQuest[];
  getRecentCategoryNames: (count: number) => QuestCategory[];
  getRecentTitles: (count: number) => string[];
}

export const useRandomQuestStore = create<RandomQuestState>()(
  persist(
    (set, get) => ({
      questHistory: [],
      categoryStates: defaultCategoryStates(),
      currentQuest: null,
      isGenerating: false,

      setCurrentQuest: (quest) =>
        set((state) => ({
          currentQuest: quest,
          isGenerating: false,
          questHistory: [quest, ...state.questHistory].slice(0, MAX_HISTORY),
        })),

      completeQuest: (id) =>
        set((state) => {
          const quest = state.questHistory.find((q) => q.id === id) || state.currentQuest;
          if (!quest) return state;

          const updatedCategory = { ...state.categoryStates[quest.category] };
          updatedCategory.completedCount += 1;

          return {
            currentQuest: null,
            questHistory: state.questHistory.map((q) =>
              q.id === id ? { ...q, completedAt: new Date().toISOString() } : q
            ),
            categoryStates: {
              ...state.categoryStates,
              [quest.category]: updatedCategory,
            },
          };
        }),

      skipQuest: (id) =>
        set((state) => ({
          currentQuest: null,
          questHistory: state.questHistory.map((q) =>
            q.id === id ? { ...q, skippedAt: new Date().toISOString() } : q
          ),
        })),

      clearCurrentQuest: () => set({ currentQuest: null }),
      setIsGenerating: (v) => set({ isGenerating: v }),

      recordCategoryAppearance: (category) =>
        set((state) => {
          const updated = { ...state.categoryStates };
          const prev = state.currentQuest?.category;
          const cat = { ...updated[category] };

          if (prev === category) {
            cat.consecutiveSame += 1;
            if (cat.consecutiveSame >= 2) {
              cat.currentDifficulty = Math.min(5, cat.currentDifficulty + 1) as QuestDifficulty;
              cat.consecutiveSame = 0;
            }
          } else {
            cat.consecutiveSame = 1;
          }

          updated[category] = cat;
          return { categoryStates: updated };
        }),

      getCurrentDifficulty: (category) => get().categoryStates[category].currentDifficulty,

      getRecentQuests: (count) => get().questHistory.slice(0, count),

      getRecentCategoryNames: (count) =>
        get().questHistory.slice(0, count).map((q) => q.category),

      getRecentTitles: (count) =>
        get().questHistory.slice(0, count).map((q) => q.title),
    }),
    {
      name: 'wwx-random-quest',
      partialize: (state) => ({
        questHistory: state.questHistory,
        categoryStates: state.categoryStates,
      }),
    }
  )
);
