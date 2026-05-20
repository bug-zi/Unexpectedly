/**
 * 用户偏好学习库 - 跨 session 累积用户对点子的偏好
 * AI 每次生成时参考此库，实现"越用越懂用户"
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrainstormIdea } from '@/types/brainstorm';

interface TypeStats {
  [ideaType: string]: number;
}

interface DislikedWithReason {
  text: string;
  reason: string;
  type: string;
  timestamp: number;
}

interface UserPreferenceState {
  // 类型偏好统计
  likedTypes: TypeStats;
  dislikedTypes: TypeStats;

  // 丢弃理由库（去重，最新在前）
  discardReasons: DislikedWithReason[];

  // 最近喜欢的点子样例（滑动窗口，最多 15 条）
  recentLiked: Array<{ text: string; type: string }>;

  // 累计统计
  totalLiked: number;
  totalDisliked: number;

  // Actions
  recordLike: (idea: BrainstormIdea) => void;
  recordDislike: (idea: BrainstormIdea, reason?: string) => void;

  /** 供 AI prompt 使用的格式化偏好摘要 */
  getPreferenceSummary: () => string;

  /** 获取供 prompt 使用的偏好数据对象 */
  getPreferenceData: () => {
    likedTypes: TypeStats;
    dislikedTypes: TypeStats;
    discardReasons: DislikedWithReason[];
    recentLiked: Array<{ text: string; type: string }>;
  };
}

const MAX_DISCARD_REASONS = 30;
const MAX_RECENT_LIKED = 15;

export const useUserPreferenceStore = create<UserPreferenceState>()(
  persist(
    (set, get) => ({
      likedTypes: {},
      dislikedTypes: {},
      discardReasons: [],
      recentLiked: [],
      totalLiked: 0,
      totalDisliked: 0,

      recordLike: (idea) =>
        set((s) => {
          const type = idea.type || '未知';
          const likedTypes = { ...s.likedTypes, [type]: (s.likedTypes[type] || 0) + 1 };
          const recentLiked = [{ text: idea.ideaText, type }, ...s.recentLiked].slice(0, MAX_RECENT_LIKED);
          return {
            likedTypes,
            recentLiked,
            totalLiked: s.totalLiked + 1,
          };
        }),

      recordDislike: (idea, reason) =>
        set((s) => {
          const type = idea.type || '未知';
          const dislikedTypes = { ...s.dislikedTypes, [type]: (s.dislikedTypes[type] || 0) + 1 };

          let discardReasons = [...s.discardReasons];
          if (reason && reason.trim()) {
            discardReasons = [
              { text: idea.ideaText, reason: reason.trim(), type, timestamp: Date.now() },
              ...discardReasons,
            ].slice(0, MAX_DISCARD_REASONS);
          }

          return {
            dislikedTypes,
            discardReasons,
            totalDisliked: s.totalDisliked + 1,
          };
        }),

      getPreferenceSummary: () => {
        const s = get();
        const parts: string[] = [];

        // 类型偏好排行
        const likedSorted = Object.entries(s.likedTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);
        const dislikedSorted = Object.entries(s.dislikedTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        if (likedSorted.length > 0) {
          parts.push(`用户历史偏好类型（从高到低）：${likedSorted.map(([t, c]) => `${t}(${c}次)`).join('、')}`);
        }
        if (dislikedSorted.length > 0) {
          parts.push(`用户历史不喜欢类型：${dislikedSorted.map(([t, c]) => `${t}(${c}次)`).join('、')}`);
        }

        // 丢弃理由摘要（取最近 8 条，去重理由关键词）
        if (s.discardReasons.length > 0) {
          const recentReasons = s.discardReasons.slice(0, 8);
          const reasonLines = recentReasons
            .map((r) => `  - 「${r.text.slice(0, 30)}」→ 原因：${r.reason}`)
            .join('\n');
          parts.push(`用户丢弃点子的具体反馈（必须规避这些方向）：\n${reasonLines}`);
        }

        // 最近喜欢的样例
        if (s.recentLiked.length > 0) {
          const samples = s.recentLiked.slice(0, 5).map((l) => `  - [${l.type}] ${l.text}`).join('\n');
          parts.push(`用户最近喜欢的点子样例（往这个方向靠拢）：\n${samples}`);
        }

        return parts.join('\n\n');
      },

      getPreferenceData: () => {
        const s = get();
        return {
          likedTypes: s.likedTypes,
          dislikedTypes: s.dislikedTypes,
          discardReasons: s.discardReasons,
          recentLiked: s.recentLiked,
        };
      },
    }),
    {
      name: 'user-preference-storage',
    }
  )
);
