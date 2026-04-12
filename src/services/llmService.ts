import { ChatMessage, LLMConfig } from '@/types';

/**
 * LLM 服务 - 支持 DeepSeek 和千问 (OpenAI 兼容协议)
 */

interface ProviderConfig {
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
}

const PROVIDERS: Record<string, ProviderConfig> = {
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'],
  },
  glm: {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    models: ['glm-4-flash', 'glm-4', 'glm-4-plus', 'glm-4-long'],
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  },
  doubao: {
    name: '豆包 (字节)',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    models: ['doubao-pro-32k', 'doubao-lite-32k', 'doubao-1.5-pro-32k'],
  },
};

/**
 * 获取 provider 配置
 */
export function getProviderConfig(provider: string): ProviderConfig {
  return PROVIDERS[provider] || PROVIDERS.deepseek;
}

/**
 * 流式聊天 - 返回 AsyncGenerator 逐 token 输出
 */
export interface StreamChatOptions {
  temperature?: number;
  max_tokens?: number;
}

export async function* streamChat(
  messages: ChatMessage[],
  config: LLMConfig,
  options?: StreamChatOptions
): AsyncGenerator<string, void, unknown> {
  const providerConfig = getProviderConfig(config.provider);
  const baseUrl = config.baseUrl || providerConfig.baseUrl;
  const model = config.model || providerConfig.defaultModel;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: options?.temperature ?? 0.8,
      max_tokens: options?.max_tokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `API 请求失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
    } catch {
      // 非 JSON 错误，使用默认消息
    }
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法获取响应流');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch {
        // 解析失败，跳过
      }
    }
  }
}

/**
 * 非流式聊天 - 等待完整响应
 */
export async function chat(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<string> {
  const providerConfig = getProviderConfig(config.provider);
  const baseUrl = config.baseUrl || providerConfig.baseUrl;
  const model = config.model || providerConfig.defaultModel;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `API 请求失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
    } catch {
      // 非 JSON 错误
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}

/**
 * 验证 API Key 是否有效
 */
export async function validateApiKey(config: LLMConfig): Promise<boolean> {
  try {
    const providerConfig = getProviderConfig(config.provider);
    const baseUrl = config.baseUrl || providerConfig.baseUrl;
    const model = config.model || providerConfig.defaultModel;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
