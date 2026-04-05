import { useRoundtableStore } from '@/stores/roundtableStore';

/**
 * 检查用户是否已配置 AI 大模型
 */
export function useLLMConfig() {
  const llmConfig = useRoundtableStore(state => state.llmConfig);
  const isConfigured = !!(llmConfig && llmConfig.apiKey);

  return { isConfigured, llmConfig };
}
