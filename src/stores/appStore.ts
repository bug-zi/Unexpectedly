import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, Answer, SlotMachineResult, UserProgress } from '@/types';

interface AppState {
  // 当前问题
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question) => void;
  clearCurrentQuestion: () => void;

  // 用户回答
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
  getAnswersByQuestionId: (questionId: string) => Answer[];

  // 老虎机
  slotMachineWords: [string, string, string] | null;
  setSlotMachineWords: (words: [string, string, string]) => void;
  clearSlotMachineWords: () => void;

  // 用户进度
  progress: UserProgress | null;
  updateProgress: (updates: Partial<UserProgress>) => void;

  // UI状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 重置所有数据
  resetAll: () => void;
}

const initialState = {
  currentQuestion: null,
  answers: [],
  slotMachineWords: null,
  progress: null,
  isLoading: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 当前问题
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      clearCurrentQuestion: () => set({ currentQuestion: null }),

      // 用户回答
      addAnswer: (answer) =>
        set((state) => ({
          answers: [...state.answers, answer],
        })),
      getAnswersByQuestionId: (questionId) => {
        const state = get();
        return state.answers.filter((a) => a.questionId === questionId);
      },

      // 老虎机
      setSlotMachineWords: (words) => set({ slotMachineWords: words }),
      clearSlotMachineWords: () => set({ slotMachineWords: null }),

      // 用户进度
      updateProgress: (updates) =>
        set((state) => ({
          progress: {
            ...state.progress,
            ...updates,
          } as UserProgress,
        })),

      // UI状态
      setIsLoading: (loading) => set({ isLoading: loading }),

      // 重置所有数据
      resetAll: () => set(initialState),
    }),
    {
      name: 'wwx-app-storage',
      partialize: (state) => ({
        answers: state.answers,
        progress: state.progress,
      }),
    }
  )
);
