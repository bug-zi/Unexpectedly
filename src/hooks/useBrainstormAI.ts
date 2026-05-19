/**
 * 灵感风暴引擎 - AI 调用 Hook
 * 评分、复盘、多词碰撞、种子提取
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import {
  buildMultiWordReactionPrompt,
  buildQuickGatePrompt,
  buildScoringPrompt,
  buildReviewPrompt,
  buildSeedExtractPrompt,
} from '@/utils/brainstormPrompts';
import type { DiffuserReactionResult, ChatMessage } from '@/types';
import type { IdeaScores, RoundReview } from '@/types/brainstorm';
import { generateId } from '@/utils/diffuserLayout';

/** 通用流式调用 */
async function streamCall(
  messages: ChatMessage[],
  config: Record<string, unknown>,
  options: { temperature: number; max_tokens: number },
  abortRef: React.MutableRefObject<boolean>
): Promise<string> {
  let fullText = '';
  for await (const token of streamChat(messages, config, options)) {
    if (abortRef.current) break;
    fullText += token;
  }
  return fullText.trim();
}

/** JSON 提取 */
function extractJSON(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
  return match ? match[0] : null;
}

/** 加权评分常量 */
const SCORING_WEIGHTS = { innovation: 1.5, fun: 1.3, feasibility: 0.7, practicality: 0.5 };
const WEIGHTED_THRESHOLD = 5.5;
const GATE_THRESHOLD = 12; // innovation + fun 必须达到此值

export function useBrainstormAI() {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  /** 多词碰撞，返回创意列表 */
  const generateMultiReaction = useCallback(
    async (
      words: string[],
      lessonsLearned?: string[],
      userPrefs?: { liked: string[]; disliked: string[] }
    ): Promise<DiffuserReactionResult[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildMultiWordReactionPrompt(words, lessonsLearned, userPrefs);

      try {
        const text = await streamCall(messages, configSnapshot, {
          temperature: 0.85,
          max_tokens: 900,
        }, abortRef);

        if (!text) return [];

        // 解析 JSON 数组
        const jsonStr = text.match(/\[[\s\S]*\]/)?.[0];
        if (!jsonStr) return [];

        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(
            (item: unknown) =>
              typeof item === 'object' && item !== null && 'content' in item && 'type' in item
          )
          .map((item: Record<string, unknown>) => ({
            id: generateId('rxn'),
            content: String(item.content).trim(),
            type: String(item.type).trim(),
            adopted: false,
          }))
          .filter((r: DiffuserReactionResult) => r.content.length > 0);
      } catch (err) {
        console.error('多词碰撞生成失败:', err);
        return [];
      }
    },
    [llmConfig]
  );

  /** 快筛门：只评创新性+趣味性，快速过滤无聊点子 */
  const quickGateIdea = useCallback(
    async (
      idea: string,
      sourceWords: string[]
    ): Promise<{ innovation: number; fun: number; pass: boolean } | null> => {
      if (!llmConfig) return null;

      const configSnapshot = { ...llmConfig };
      const messages = buildQuickGatePrompt(idea, sourceWords);

      try {
        const text = await streamCall(messages, configSnapshot, {
          temperature: 0.3,
          max_tokens: 120,
        }, abortRef);

        if (!text) return { innovation: 5, fun: 5, pass: true };

        const jsonStr = extractJSON(text);
        if (!jsonStr) return { innovation: 5, fun: 5, pass: true };

        const parsed = JSON.parse(jsonStr);
        const innovation = Number(parsed.innovation) || 5;
        const fun = Number(parsed.fun) || 5;
        const pass = (innovation + fun >= GATE_THRESHOLD) || innovation >= 8 || fun >= 8;

        return { innovation, fun, pass };
      } catch {
        return { innovation: 5, fun: 5, pass: true };
      }
    },
    [llmConfig]
  );

  /** 评分单条创意（加权 + 防重复） */
  const scoreIdea = useCallback(
    async (
      idea: string,
      sourceWords: string[],
      recentQualifiedIdeas?: string[]
    ): Promise<IdeaScores & { reasoning: string; qualified: boolean } | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildScoringPrompt(idea, sourceWords, recentQualifiedIdeas);

      try {
        const text = await streamCall(messages, configSnapshot, {
          temperature: 0.3,
          max_tokens: 400,
        }, abortRef);

        if (!text) return null;

        const jsonStr = extractJSON(text);
        if (!jsonStr) return null;

        const parsed = JSON.parse(jsonStr);

        const innovation = Number(parsed.innovation) || 5;
        const feasibility = Number(parsed.feasibility) || 5;
        const practicality = Number(parsed.practicality) || 5;
        const fun = Number(parsed.fun) || 5;
        const average = Number(((innovation + feasibility + practicality + fun) / 4).toFixed(1));
        const weightedAverage = Number((
          (innovation * SCORING_WEIGHTS.innovation + fun * SCORING_WEIGHTS.fun +
           feasibility * SCORING_WEIGHTS.feasibility + practicality * SCORING_WEIGHTS.practicality) / 4
        ).toFixed(1));
        const qualified = weightedAverage >= WEIGHTED_THRESHOLD
          && (innovation >= 7 || fun >= 8)
          && [innovation, feasibility, practicality, fun].filter((s) => s >= 6).length >= 2;

        return {
          innovation,
          feasibility,
          practicality,
          fun,
          average,
          weightedAverage,
          reasoning: String(parsed.reasoning || ''),
          qualified,
        };
      } catch (err) {
        console.error('评分失败:', err);
        return null;
      }
    },
    [llmConfig]
  );

  /** 复盘 */
  const reviewRound = useCallback(
    async (
      roundData: {
        seedWord: string;
        expandedWords: string[];
        qualifiedIdeas: Array<{ ideaText: string; scores: { average: number } }>;
        discardedIdeas: Array<{ ideaText: string; scores: { average: number }; reasoning: string }>;
      },
      previousLessons: string[] = []
    ): Promise<RoundReview | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildReviewPrompt(roundData, previousLessons);

      try {
        const text = await streamCall(messages, configSnapshot, {
          temperature: 0.5,
          max_tokens: 600,
        }, abortRef);

        if (!text) return null;

        const jsonStr = extractJSON(text);
        if (!jsonStr) return null;

        const parsed = JSON.parse(jsonStr);

        return {
          whatWorked: Array.isArray(parsed.whatWorked) ? parsed.whatWorked : [],
          whatFailed: Array.isArray(parsed.whatFailed) ? parsed.whatFailed : [],
          lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
          suggestedDirection: String(parsed.suggestedDirection || ''),
          suggestedSeedWord: String(parsed.suggestedSeedWord || ''),
        };
      } catch (err) {
        console.error('复盘失败:', err);
        return null;
      }
    },
    [llmConfig]
  );

  /** 从创意中提取种子词 */
  const extractSeedKeywords = useCallback(
    async (idea: string): Promise<string[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildSeedExtractPrompt(idea);

      try {
        const text = await streamCall(messages, configSnapshot, {
          temperature: 0.4,
          max_tokens: 200,
        }, abortRef);

        if (!text) return [];

        const jsonStr = text.match(/\[[\s\S]*\]/)?.[0];
        if (!jsonStr) return [];

        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter((w: unknown) => typeof w === 'string' && w.length > 0);
      } catch (err) {
        console.error('种子提取失败:', err);
        return [];
      }
    },
    [llmConfig]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    generateMultiReaction,
    quickGateIdea,
    scoreIdea,
    reviewRound,
    extractSeedKeywords,
    abort,
    isConfigured: !!llmConfig,
  };
}
