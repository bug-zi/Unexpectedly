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

/**
 * 四层降级解析AI回答
 */
function parseAIResponse(text: string): QuestionAnswer {
  const trimmed = text.trim();
  if (!trimmed) return 'wrong';

  // 第一层：结构化格式（对，... 或 错，...）
  const firstChar = trimmed[0];
  if (firstChar === '对' || firstChar === '正') return 'correct';
  if (firstChar === '错' || firstChar === '否') return 'wrong';

  // 第二层：前5字符扫描
  const prefix = trimmed.substring(0, 5);
  if (/对|正确|是的|没错/.test(prefix)) return 'correct';
  if (/错|不正确|不是|没有|错误/.test(prefix)) return 'wrong';

  // 第三层：全文关键词扫描
  if (/^(是的|没错|正确|对，|对的)/.test(trimmed)) return 'correct';
  if (/^(不是|没有|错误|错|不相关|无关)/.test(trimmed)) return 'wrong';

  // 第四层：安全降级
  return 'wrong';
}

export function useTurtleSoupAI(options?: UseTurtleSoupAIOptions) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const askQuestion = useCallback(
    async (
      question: string,
      scenario: string,
      truth: string,
      qaHistory: Array<{ question: string; answer: string; answerText: string }>,
      hints?: string[]
    ): Promise<QAPair | null> => {
      if (!llmConfig) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const messages = buildTurtleSoupMessages(
          scenario,
          truth,
          question,
          qaHistory,
          hints
        );

        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot)) {
          if (abortRef.current) break;
          fullText += token;
          options?.onStreaming?.(fullText);
        }

        if (!fullText.trim()) return null;

        const answer = parseAIResponse(fullText.trim());

        return {
          question,
          answer,
          answerText: fullText.trim(),
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
