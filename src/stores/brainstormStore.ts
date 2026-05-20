/**
 * 灵感风暴引擎 - 状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BrainstormPhase,
  BrainstormIdea,
  RoundResult,
  RoundReview,
  CollisionResult,
  ActivityLogEntry,
} from '@/types/brainstorm';
import { useUserPreferenceStore } from '@/stores/userPreferenceStore';

interface BrainstormState {
  // 状态机
  phase: BrainstormPhase;
  previousPhase: BrainstormPhase | null;
  currentRound: number;
  totalRounds: number;
  errorMessage: string | null;

  // 用户输入
  topicInput: string;
  scoreThreshold: number;

  // 轮次历史
  rounds: RoundResult[];
  lessonsLearned: string[];

  // 输出
  showcase: BrainstormIdea[];       // 展台：评分合格，等待用户决定
  collectionBox: BrainstormIdea[];  // 收纳盒：用户确认保留的
  discardPile: BrainstormIdea[];    // 已丢弃

  // 碰撞去重
  collidedKeys: string[];

  // 活动日志
  activityLog: ActivityLogEntry[];

  // Token 统计
  tokensUsed: number;

  // Actions
  setPhase: (phase: BrainstormPhase) => void;
  setTopicInput: (input: string) => void;
  startSession: (topic?: string, rounds?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  setError: (msg: string) => void;
  clearError: () => void;

  addToShowcase: (idea: BrainstormIdea) => void;
  addIdeaToDiscard: (idea: BrainstormIdea) => void;
  moveToCollection: (ideaId: string) => void;
  discardFromShowcase: (ideaId: string, reason?: string) => void;
  removeFromCollection: (ideaId: string) => void;

  startRound: (seedWord: string) => void;
  setRoundExpandedWords: (words: string[]) => void;
  addRoundCollision: (result: CollisionResult) => void;
  setRoundReview: (review: RoundReview) => void;
  addLessons: (lessons: string[]) => void;

  addCollidedKey: (key: string) => void;
  hasCollided: (key: string) => boolean;

  addLog: (phase: BrainstormPhase, message: string) => void;
  addTokens: (n: number) => void;
}

let logIdCounter = 0;

export const useBrainstormStore = create<BrainstormState>()(
  persist(
    (set, get) => ({
  phase: 'idle',
  previousPhase: null,
  currentRound: 0,
  totalRounds: 3,
  errorMessage: null,
  topicInput: '',
  scoreThreshold: 6.0,
  rounds: [],
  lessonsLearned: [],
  collectionBox: [],
  discardPile: [],
  showcase: [],
  collidedKeys: [],
  activityLog: [],
  tokensUsed: 0,

  setPhase: (phase) =>
    set((s) => ({
      phase,
      previousPhase: phase === 'paused' ? s.phase : s.previousPhase,
    })),

  setTopicInput: (input) => set({ topicInput: input }),

  startSession: (topic, rounds) =>
    set((s) => ({
      phase: 'idle',
      previousPhase: null,
      currentRound: 0,
      totalRounds: rounds ?? 3,
      topicInput: topic ?? '',
      rounds: [],
      lessonsLearned: [],
      // 保留收纳盒和丢弃堆，新风暴在已有基础上进行
      collectionBox: s.collectionBox,
      discardPile: s.discardPile,
      showcase: [],
      collidedKeys: [],
      activityLog: [],
      tokensUsed: 0,
      errorMessage: null,
    })),

  pauseSession: () =>
    set((s) => ({
      phase: 'paused',
      previousPhase: s.phase,
    })),

  resumeSession: () =>
    set((s) => ({
      phase: s.previousPhase ?? 'idle',
      previousPhase: null,
    })),

  resetSession: () =>
    set({
      phase: 'idle',
      previousPhase: null,
      currentRound: 0,
      rounds: [],
      lessonsLearned: [],
      collectionBox: [],
      discardPile: [],
      showcase: [],
      collidedKeys: [],
      activityLog: [],
      tokensUsed: 0,
      errorMessage: null,
    }),

  setError: (msg) => set({ phase: 'error', errorMessage: msg }),
  clearError: () => set({ errorMessage: null }),

  addToShowcase: (idea) =>
    set((s) => ({ showcase: [...s.showcase, idea] })),

  addIdeaToDiscard: (idea) =>
    set((s) => ({ discardPile: [...s.discardPile, idea] })),

  moveToCollection: (ideaId) =>
    set((s) => {
      const idea = s.showcase.find((i) => i.id === ideaId);
      if (!idea) return s;
      useUserPreferenceStore.getState().recordLike(idea);
      return {
        showcase: s.showcase.filter((i) => i.id !== ideaId),
        collectionBox: [...s.collectionBox, idea],
      };
    }),

  discardFromShowcase: (ideaId, reason) =>
    set((s) => {
      const idea = s.showcase.find((i) => i.id === ideaId);
      if (!idea) return s;
      useUserPreferenceStore.getState().recordDislike(idea, reason);
      return {
        showcase: s.showcase.filter((i) => i.id !== ideaId),
        discardPile: [...s.discardPile, { ...idea, userDiscardReason: reason }],
      };
    }),

  removeFromCollection: (ideaId) =>
    set((s) => ({
      collectionBox: s.collectionBox.filter((i) => i.id !== ideaId),
    })),

  startRound: (seedWord) =>
    set((s) => ({
      currentRound: s.currentRound + 1,
      rounds: [
        ...s.rounds,
        {
          roundNumber: s.currentRound + 1,
          seedWord,
          expandedWords: [],
          collisions: [],
          review: null,
        },
      ],
    })),

  setRoundExpandedWords: (words) =>
    set((s) => {
      const rounds = [...s.rounds];
      const current = rounds[rounds.length - 1];
      if (current) current.expandedWords = words;
      return { rounds };
    }),

  addRoundCollision: (result) =>
    set((s) => {
      const rounds = [...s.rounds];
      const current = rounds[rounds.length - 1];
      if (current) current.collisions.push(result);
      return { rounds };
    }),

  setRoundReview: (review) =>
    set((s) => {
      const rounds = [...s.rounds];
      const current = rounds[rounds.length - 1];
      if (current) current.review = review;
      return { rounds };
    }),

  addLessons: (lessons) =>
    set((s) => ({
      lessonsLearned: [...s.lessonsLearned, ...lessons],
    })),

  addCollidedKey: (key) =>
    set((s) => ({ collidedKeys: [...s.collidedKeys, key] })),

  hasCollided: (key) => get().collidedKeys.includes(key),

  addLog: (phase, message) =>
    set((s) => ({
      activityLog: [
        ...s.activityLog,
        {
          id: `log-${++logIdCounter}`,
          phase,
          message,
          timestamp: Date.now(),
        },
      ],
    })),

  addTokens: (n) => set((s) => ({ tokensUsed: s.tokensUsed + n })),
    }),
    {
      name: 'brainstorm-storage',
      partialize: (state) => ({
        collectionBox: state.collectionBox,
        discardPile: state.discardPile,
        showcase: state.showcase,
      }),
    }
  )
);
