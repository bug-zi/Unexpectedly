import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Question, Answer, SlotMachineResult, UserProgress } from '@/types';
import { getUserStorageKey, getCurrentUserId } from '@/utils/userStorage';

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

  // 重置所有数据并清除存储
  resetAll: () => void;
}

const initialState = {
  currentQuestion: null,
  answers: [],
  slotMachineWords: null,
  progress: null,
  isLoading: false,
};

// 当前存储键名（用于追踪变化）
let currentStorageKey: string | null = null;

// 自定义存储，根据当前用户动态选择存储键
const createUserAwareStorage = (): StateStorage => {
  return {
    getItem: (name: string): string | null => {
      const userKey = getUserStorageKey(name);
      currentStorageKey = userKey;
      return localStorage.getItem(userKey);
    },
    setItem: (name: string, value: string): void => {
      const userKey = getUserStorageKey(name);
      currentStorageKey = userKey;
      localStorage.setItem(userKey, value);
    },
    removeItem: (name: string): void => {
      const userKey = getUserStorageKey(name);
      localStorage.removeItem(userKey);
    },
  };
};

// 创建 store 的函数，用于重新初始化
const createAppStore = () => {
  return create<AppState>()(
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

        // 重置所有数据并清除 localStorage
        resetAll: () => {
          // 清除内存状态
          set(initialState);
          
          // 清除 localStorage 中的数据
          const userKey = getUserStorageKey('wwx-app-storage');
          localStorage.removeItem(userKey);
          console.log('🧹 已清除存储:', userKey);
        },
      }),
      {
        name: 'wwx-app-storage',
        storage: createJSONStorage(createUserAwareStorage),
        partialize: (state) => ({
          answers: state.answers,
          progress: state.progress,
        }),
      }
    )
  );
};

// 导出单例 store
export const useAppStore = createAppStore();

// 重新初始化 store 的函数（用于用户切换时）
export function reinitializeAppStore(): void {
  console.log('🔄 重新初始化 AppStore，当前用户:', getCurrentUserId() || '游客');
  // 触发页面刷新以重新加载 store
  window.location.reload();
}
