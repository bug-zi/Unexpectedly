/**
 * Yes or No AI Hook
 * 封装 Yes or No 游戏的 LLM 流式调用
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildYesNoMessages } from '@/utils/gamePrompts';

interface YesNoQAPair {
  question: string;
  answer: 'yes' | 'no';
  answerText?: string;
  timestamp: Date;
}

interface UseYesNoAIOptions {
  onStreaming?: (text: string) => void;
}

export function useYesNoAI(options?: UseYesNoAIOptions) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const askQuestion = useCallback(
    async (
      question: string,
      targetWord: string,
      category: string,
      qaHistory: Array<{ question: string; answer: string }>
    ): Promise<YesNoQAPair | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const messages = buildYesNoMessages(
          targetWord,
          category,
          question,
          qaHistory
        );

        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot)) {
          if (abortRef.current) break;
          fullText += token;
          options?.onStreaming?.(fullText);
        }

        if (!fullText.trim()) return null;

        // 解析回答类型
        const trimmed = fullText.trim();
        const firstChar = trimmed[0];

        const answer: 'yes' | 'no' = firstChar === '是' ? 'yes' : 'no';

        return {
          question,
          answer,
          answerText: trimmed,
          timestamp: new Date(),
        };
      } catch (err) {
        console.error('Yes or No AI 调用失败:', err);
        return null;
      }
    },
    [llmConfig, options]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { askQuestion, abort, hasAI: !!llmConfig };
}

export type { YesNoQAPair };
