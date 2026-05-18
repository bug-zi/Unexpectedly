/**
 * 灵感扩散器 - AI 词语生成 Hook
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildDiffuserPrompt } from '@/utils/diffuserPrompts';
import type { DiffuserWord } from '@/types/diffuser';

interface UseDiffuserAIOptions {
  count?: number;
}

/**
 * 从 AI 响应中解析词语列表
 */
function parseWordResponse(text: string): DiffuserWord[] {
  // 尝试 JSON 解析
  try {
    // 提取 JSON 数组部分
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item: unknown) =>
              typeof item === 'object' &&
              item !== null &&
              'word' in item
          )
          .map((item) => {
            const obj = item as Record<string, unknown>;
            const relevance = typeof obj.relevance === 'number'
              ? Math.min(1.0, Math.max(0.8, obj.relevance))
              : 0.9;
            return {
              word: String(obj.word).trim(),
              relation: obj.relation ? String(obj.relation).trim() : '联想',
              relevance,
            };
          })
          .filter((w: DiffuserWord) => w.word.length > 0);
      }
    }
  } catch {
    // JSON 解析失败，尝试正则提取
  }

  // Fallback：正则提取词语
  const words: DiffuserWord[] = [];
  const wordRegex = /"word"\s*:\s*"([^"]+)"/g;
  const relRegex = /"relevance"\s*:\s*([0-9.]+)/g;
  let match;
  const rels: number[] = [];
  let relMatch;
  while ((relMatch = relRegex.exec(text)) !== null) {
    rels.push(Math.min(1.0, Math.max(0.8, parseFloat(relMatch[1]))));
  }
  while ((match = wordRegex.exec(text)) !== null) {
    const idx = words.length;
    words.push({ word: match[1], relation: '联想', relevance: rels[idx] ?? 0.9 });
  }

  return words;
}

export function useDiffuserAI(options?: UseDiffuserAIOptions) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);
  const count = options?.count ?? 8;

  const generateWords = useCallback(
    async (
      word: string,
      existingWords: string[] = []
    ): Promise<DiffuserWord[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildDiffuserPrompt(word, count, existingWords);

      try {
        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot, {
          temperature: 0.6,
          max_tokens: 800,
        })) {
          if (abortRef.current) break;
          fullText += token;
        }

        if (!fullText.trim()) return [];
        return parseWordResponse(fullText.trim());
      } catch (err) {
        console.error('灵感扩散生成失败:', err);
        return [];
      }
    },
    [llmConfig, count]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generateWords, abort, isConfigured: !!llmConfig };
}
