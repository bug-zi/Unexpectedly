/**
 * 灵感源泉 AI Hook
 * 封装灵感生成的 LLM 流式调用
 */

import { useCallback, useRef } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { getDomainById, getSubcategoryById } from '@/constants/inspirationDomains';
import type { DepthLevel } from '@/constants/inspirationDomains';
import {
  buildInspirationPrompt,
  buildExpandPrompt,
  buildAskPrompt,
  generateRandomSeed,
} from '@/utils/inspirationPrompts';

interface UseInspirationAIOptions {
  onStreaming?: (text: string) => void;
}

export function useInspirationAI(options?: UseInspirationAIOptions) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const abortRef = useRef(false);

  const generate = useCallback(
    async (
      domainId: string,
      subcategoryId: string,
      depth: DepthLevel
    ): Promise<string | null> => {
      if (!llmConfig) return null;

      const domain = getDomainById(domainId);
      const subcategory = getSubcategoryById(domainId, subcategoryId);
      if (!domain || !subcategory) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const seed = generateRandomSeed();
        const messages = buildInspirationPrompt(domain, subcategory, depth, seed);
        const maxTokens = depth === 'spark' ? 512 : 2048;

        let fullText = '';
        const temperature = domainId === 'project' ? 0.78 : 0.95;

        for await (const token of streamChat(messages, configSnapshot, {
          temperature,
          max_tokens: maxTokens,
        })) {
          if (abortRef.current) break;
          fullText += token;
          options?.onStreaming?.(fullText);
        }

        if (!fullText.trim()) return null;
        return fullText.trim();
      } catch (err) {
        console.error('灵感生成失败:', err);
        return null;
      }
    },
    [llmConfig, options]
  );

  const askQuestion = useCallback(
    async (
      previousContent: string,
      question: string,
      domainId: string
    ): Promise<string | null> => {
      if (!llmConfig) return null;

      const domain = getDomainById(domainId);
      if (!domain) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const messages = buildAskPrompt(previousContent, question, domain);

        let fullText = '';

        for await (const token of streamChat(messages, configSnapshot, {
          temperature: 0.85,
          max_tokens: 2048,
        })) {
          if (abortRef.current) break;
          fullText += token;
          options?.onStreaming?.(fullText);
        }

        if (!fullText.trim()) return null;
        return fullText.trim();
      } catch (err) {
        console.error('提问回答失败:', err);
        return null;
      }
    },
    [llmConfig, options]
  );

  const expand = useCallback(
    async (
      previousContent: string,
      domainId: string
    ): Promise<string | null> => {
      if (!llmConfig) return null;

      const domain = getDomainById(domainId);
      if (!domain) return null;

      abortRef.current = false;
      const configSnapshot = { ...llmConfig };

      try {
        const messages = buildExpandPrompt(previousContent, domain);

        let fullText = '';
        const expandTemperature = domainId === 'project' ? 0.80 : 0.90;

        for await (const token of streamChat(messages, configSnapshot, {
          temperature: expandTemperature,
          max_tokens: 2048,
        })) {
          if (abortRef.current) break;
          fullText += token;
          options?.onStreaming?.(fullText);
        }

        if (!fullText.trim()) return null;
        return fullText.trim();
      } catch (err) {
        console.error('灵感展开失败:', err);
        return null;
      }
    },
    [llmConfig, options]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generate, expand, askQuestion, abort, isConfigured: !!llmConfig };
}
