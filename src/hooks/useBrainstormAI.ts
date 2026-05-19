/**
 * 灵感风暴引擎 - AI 调用 Hook
 * 评分、复盘、多词碰撞、种子提取
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import {
  buildMultiWordReactionPrompt,
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

export function useBrainstormAI() {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  /** 多词碰撞，返回创意列表 */
  const generateMultiReaction = useCallback(
    async (
      words: string[],
      lessonsLearned?: string[]
    ): Promise<DiffuserReactionResult[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildMultiWordReactionPrompt(words, lessonsLearned);

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

  /** 评分单条创意 */
  const scoreIdea = useCallback(
    async (idea: string, sourceWords: string[]): Promise<IdeaScores & { reasoning: string; qualified: boolean } | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildScoringPrompt(idea, sourceWords);

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
        const qualified = average >= 6.0 && [innovation, feasibility, practicality, fun].filter((s) => s >= 7).length >= 2;

        return {
          innovation,
          feasibility,
          practicality,
          fun,
          average,
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
    scoreIdea,
    reviewRound,
    extractSeedKeywords,
    abort,
    isConfigured: !!llmConfig,
  };
}
