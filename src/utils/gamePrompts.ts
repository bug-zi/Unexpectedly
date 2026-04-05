/**
 * 游戏提示词工具
 * 为海龟汤和 Yes or No 游戏构建 LLM 消息
 */

import { ChatMessage } from '@/types';

// ==================== 海龟汤提示词 ====================

const TURTLE_SOUP_SYSTEM_PROMPT = `你是海龟汤游戏的主持人。你掌握着故事背后的真相（汤底），需要根据真相回答玩家的问题。

规则：
1. 玩家只能问"是/否"问题
2. 你必须严格根据汤底真相来回答，不能凭空创造信息
3. 回答格式：第一个词必须是"是"、"否"或"无关"
4. 回答"是"或"否"后，可以附加简短解释（一句话以内），帮助玩家推理
5. 如果问题不是"是/否"问题，以"无关"开头并提示玩家用"是/否"形式提问
6. 不要直接透露汤底内容，只能引导玩家推理
7. 保持神秘感和趣味性

回答示例：
- 是的，你的方向对了。
- 否，情况并非如此。
- 无关，请用"是/否"形式提问，比如"这个人是盲人吗？"

以下是当前游戏的背景信息：`;

/**
 * 构建海龟汤 LLM 消息
 */
export function buildTurtleSoupMessages(
  scenario: string,
  truth: string,
  question: string,
  qaHistory: Array<{ question: string; answer: string; answerText: string }>
): ChatMessage[] {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `${TURTLE_SOUP_SYSTEM_PROMPT}\n\n汤面（情境）：${scenario}\n汤底（真相）：${truth}`,
  };

  const messages: ChatMessage[] = [systemMessage];

  // 注入历史问答上下文
  if (qaHistory.length > 0) {
    const historyText = qaHistory
      .map(
        (qa) =>
          `玩家问：${qa.question}\n主持人答：${qa.answerText}`
      )
      .join('\n\n');

    messages.push({
      role: 'user',
      content: `以下是之前的问答记录：\n\n${historyText}`,
    });

    messages.push({
      role: 'assistant',
      content: '好的，我已了解之前的问答记录，请继续提问。',
    });
  }

  // 当前问题
  messages.push({
    role: 'user',
    content: question,
  });

  return messages;
}

// ==================== Yes or No 提示词 ====================

const YES_NO_SYSTEM_PROMPT = `你是"20个问题"游戏的主持人。你心中有一个词语，玩家通过问"是/否"问题来猜出这个词语。

规则：
1. 严格根据你心中的词语来回答
2. 回答格式：第一个词必须是"是"或"否"
3. 可以在回答后附加简短提示或鼓励（一句话以内）
4. 如果问题不是"是/否"问题，以"否"开头并提示玩家用"是/否"形式提问
5. 不要直接透露答案词语
6. 保持回答简洁，引导玩家缩小范围
7. 如果玩家直接说出了正确答案（不是问句），回复"🎉 恭喜你猜对了！答案就是[词语]！"
8. 当玩家问到字数相关问题时（如"是几个字的？"），必须严格按照下方提供的【字数】信息回答，不要自己数词语的字数

回答示例：
- 是的，继续往这个方向想。
- 否，不是这个属性。

以下是当前游戏的信息：`;

/**
 * 构建 Yes or No LLM 消息
 */
export function buildYesNoMessages(
  targetWord: string,
  category: string,
  question: string,
  qaHistory: Array<{ question: string; answer: string }>
): ChatMessage[] {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `${YES_NO_SYSTEM_PROMPT}\n\n你心中的词语是：${targetWord}\n类别：${category}\n【字数】${targetWord.length}个字`,
  };

  const messages: ChatMessage[] = [systemMessage];

  // 注入历史问答上下文
  if (qaHistory.length > 0) {
    const historyText = qaHistory
      .map(
        (qa) =>
          `玩家问：${qa.question}\n主持人答：${qa.answer === 'yes' ? '是' : '否'}`
      )
      .join('\n\n');

    messages.push({
      role: 'user',
      content: `以下是之前的问答记录：\n\n${historyText}`,
    });

    messages.push({
      role: 'assistant',
      content: '好的，我已了解之前的问答记录，请继续提问。',
    });
  }

  // 当前问题
  messages.push({
    role: 'user',
    content: question,
  });

  return messages;
}
