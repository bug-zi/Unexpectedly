import type { ChatMessage, LLMConfig, QuestCategory, QuestDifficulty, RandomQuest } from '@/types';
import { chat } from '@/services/llmService';
import { buildRandomQuestMessages } from '@/utils/randomQuestPrompts';

interface QuestAIResponse {
  title: string;
  description: string;
  estimatedMinutes: number;
  encouragement: string;
}

function parseAIResponse(content: string): QuestAIResponse {
  // 尝试从 markdown 代码块中提取 JSON
  const jsonMatch =
    content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('AI 返回格式无法解析');
  }

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  if (!parsed.title || !parsed.description) {
    throw new Error('AI 返回内容缺少必要字段');
  }

  return {
    title: String(parsed.title).slice(0, 20),
    description: String(parsed.description).slice(0, 150),
    estimatedMinutes: Math.min(30, Math.max(5, Number(parsed.estimatedMinutes) || 10)),
    encouragement: String(parsed.encouragement || '做到了就很棒！').slice(0, 50),
  };
}

export async function generateRandomQuest(
  llmConfig: LLMConfig,
  category: QuestCategory,
  difficulty: QuestDifficulty,
  recentCategories: QuestCategory[],
  recentTitles: string[]
): Promise<RandomQuest> {
  const messages: ChatMessage[] = buildRandomQuestMessages(
    category,
    difficulty,
    recentCategories,
    recentTitles
  );

  const content = await chat(messages, llmConfig);
  const parsed = parseAIResponse(content);

  return {
    id: `rq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    difficulty,
    title: parsed.title,
    description: parsed.description,
    estimatedMinutes: parsed.estimatedMinutes,
    encouragement: parsed.encouragement,
    createdAt: new Date().toISOString(),
  };
}
