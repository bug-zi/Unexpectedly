/**
 * 灵感扩散器 - 词语碰撞反应 AI Hook
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildReactionPrompt } from '@/utils/diffuserPrompts';
import { generateId } from '@/utils/diffuserLayout';
import type { DiffuserReactionResult } from '@/types/diffuser';

interface RawReactionItem {
  content: string;
  type: string;
}

function parseReactionResponse(text: string): DiffuserReactionResult[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item: unknown) =>
              typeof item === 'object' && item !== null && 'content' in item && 'type' in item
          )
          .map((item) => ({
            id: generateId('rxn'),
            content: String((item as RawReactionItem).content).trim(),
            type: String((item as RawReactionItem).type).trim(),
            adopted: false,
          }))
          .filter((r) => r.content.length > 0);
      }
    }
  } catch {
    // JSON 解析失败
  }
  return [];
}

export function useDiffuserReactionAI() {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const generateReaction = useCallback(
    async (wordA: string, wordB: string): Promise<DiffuserReactionResult[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildReactionPrompt(wordA, wordB);

      try {
        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot, {
          temperature: 0.8,
          max_tokens: 600,
        })) {
          if (abortRef.current) break;
          fullText += token;
        }

        if (!fullText.trim()) return [];
        return parseReactionResponse(fullText.trim());
      } catch (err) {
        console.error('碰撞反应生成失败:', err);
        return [];
      }
    },
    [llmConfig]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generateReaction, abort, isConfigured: !!llmConfig };
}
