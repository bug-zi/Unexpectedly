/**
 * 辩论堂相关类型定义
 */

/**
 * 辩论立场
 */
export type DebateStance = 'pro' | 'con';

/**
 * 辩论会话状态
 */
export type DebateStatus = 'idle' | 'topic_generated' | 'debating' | 'judged';

/**
 * 辩论消息角色
 */
export type DebateRole = 'user' | 'opponent' | 'system' | 'judge';

/**
 * 辩论消息
 */
export interface DebateMessage {
  id: string;
  role: DebateRole;
  stance: DebateStance;
  content: string;
  createdAt: Date;
}

/**
 * 评委评价结果
 */
export interface JudgeResult {
  summary: string;
  userScore: number;
  opponentScore: number;
  userStrengths: string[];
  userWeaknesses: string[];
  keyClashes: string[];
  winner: 'user' | 'opponent' | 'draw';
  advice: string;
}

/**
 * 辩论会话
 */
export interface DebateSession {
  id: string;
  userId: string;
  topic: string;
  userStance: DebateStance;
  messages: DebateMessage[];
  status: DebateStatus;
  judgeResult?: JudgeResult;
  createdAt: Date;
  completedAt?: Date;
}
