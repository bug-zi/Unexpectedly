/**
 * 灵感风暴引擎 - 类型定义
 */

/** 单个点子的评分 */
export interface IdeaScores {
  innovation: number;
  feasibility: number;
  practicality: number;
  fun: number;
  average: number;
  weightedAverage: number;
}

/** 自动模式生成的点子 */
export interface BrainstormIdea {
  id: string;
  sourceWords: string[];
  ideaText: string;
  type: string;
  scores: IdeaScores;
  reasoning: string;
  qualified: boolean;
  roundNumber: number;
  createdAt: string;
  userDiscardReason?: string;
}

/** 碰撞结果（多词碰撞） */
export interface CollisionResult {
  words: string[];
  ideas: BrainstormIdea[];
}

/** 复盘总结 */
export interface RoundReview {
  whatWorked: string[];
  whatFailed: string[];
  lessons: string[];
  suggestedDirection: string;
  suggestedSeedWord: string;
}

/** 单轮结果 */
export interface RoundResult {
  roundNumber: number;
  seedWord: string;
  expandedWords: string[];
  collisions: CollisionResult[];
  review: RoundReview | null;
}

/** 状态机阶段 */
export type BrainstormPhase =
  | 'idle'
  | 'seeding'
  | 'expanding'
  | 'colliding'
  | 'scoring'
  | 'collecting'
  | 'reviewing'
  | 'paused'
  | 'completed'
  | 'error';

/** 活动日志条目 */
export interface ActivityLogEntry {
  id: string;
  phase: BrainstormPhase;
  message: string;
  timestamp: number;
}
