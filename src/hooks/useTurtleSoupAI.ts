/**
 * 海龟汤 AI Hook
 * 封装海龟汤游戏的 LLM 流式调用
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildTurtleSoupMessages } from '@/utils/gamePrompts';
import type { QAPair, QuestionAnswer } from '@/utils/turtleSoupAI';

interface UseTurtleSoupAIOptions {
  onStreaming?: (text: string) => void;
}

export function useTurtleSoupAI(options?: UseTurtleSoupAIOptions) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const askQuestion = useCallback(
    async (
      question: string,
      scenario: string,
      truth: string,
      qaHistory: Array<{ question: string; answer: string; answerText: string }>
    ): Promise<QAPair | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const messages = buildTurtleSoupMessages(
          scenario,
          truth,
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
        let answer: QuestionAnswer;
        const firstChar = trimmed[0];

        if (firstChar === '是') {
          answer = 'yes';
        } else if (firstChar === '否') {
          answer = 'no';
        } else {
          answer = 'irrelevant';
        }

        return {
          question,
          answer,
          answerText: trimmed,
          timestamp: new Date(),
        };
      } catch (err) {
        console.error('海龟汤 AI 调用失败:', err);
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
