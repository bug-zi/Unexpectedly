/**
 * 灵感扩散器 - 笔记 AI 想法建议 Hook
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildNotebookPrompt } from '@/utils/diffuserPrompts';

/**
 * 从 AI 响应中解析想法列表
 */
function parseNoteResponse(text: string): string[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
          .map((item: string) => item.trim());
      }
    }
  } catch {
    // JSON 解析失败
  }
  return [];
}

export function useDiffuserNoteAI() {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const generateNoteIdeas = useCallback(
    async (
      word: string,
      existingNotes: string[] = []
    ): Promise<string[]> => {
      if (!llmConfig) return [];

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };
      const messages = buildNotebookPrompt(word, existingNotes);

      try {
        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot, {
          temperature: 0.7,
          max_tokens: 500,
        })) {
          if (abortRef.current) break;
          fullText += token;
        }

        if (!fullText.trim()) return [];
        return parseNoteResponse(fullText.trim());
      } catch (err) {
        console.error('笔记想法生成失败:', err);
        return [];
      }
    },
    [llmConfig]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generateNoteIdeas, abort, isConfigured: !!llmConfig };
}
