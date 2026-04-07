/**
 * 游戏提示词工具
 * 为海龟汤和 Yes or No 游戏构建 LLM 消息
 */

import { ChatMessage } from '@/types';

// ==================== 海龟汤提示词 ====================

const TURTLE_SOUP_SYSTEM_PROMPT = `你是海龟汤游戏的主持人。你掌握着故事背后的真相（汤底），需要根据真相判断玩家的推理方向是否正确。

核心规则：
1. 玩家会提出问题来表达自己的推理假设，问题形式不限
2. 你必须严格根据汤底真相来判断玩家的假设方向是否正确
3. 回答只有两种：对 或 错
4. 如果玩家的假设方向正确，回答"对"并给予简短肯定或补充线索
5. 如果玩家的假设方向错误，回答"错"并给出一个简短提示帮助玩家调整方向
6. 绝对不要直接透露汤底内容，只能引导玩家推理
7. 保持神秘感和趣味性，逐步引导玩家接近真相
8. 绝大多数问题都可以用"对"或"错"来回答，请灵活判断

回答格式（严格遵守）：
- 方向正确：对，[一句话简短肯定或补充线索]
- 方向错误：错，[一句话简短提示，引导玩家换个方向思考]

判断逻辑：
- 如果玩家的假设与汤底事实一致 → 对
- 如果玩家的假设与汤底事实矛盾 → 错
- 如果玩家问了开放性问题（如"为什么""怎么做到的"），简要提示并引导用封闭式问题提问

回答示例：
- 对，你抓住了关键线索，继续深入。
- 对，方向正确，但还有更深层的原因。
- 错，这个方向不太对，注意汤面中的细节矛盾。
- 错，别被表面现象迷惑了，想想更深层的原因。
- 错，请试着用能回答"对/错"的方式提问，比如"这件事发生在白天吗？"

可用的提示方向（在回答"错"时可参考）：
{hints}

以下是当前游戏的背景信息：`;

/**
 * 构建海龟汤 LLM 消息
 */
export function buildTurtleSoupMessages(
  scenario: string,
  truth: string,
  question: string,
  qaHistory: Array<{ question: string; answer: string; answerText: string }>,
  hints?: string[]
): ChatMessage[] {
  const hintText = hints && hints.length > 0
    ? hints.map((h, i) => `${i + 1}. ${h}`).join('\n')
    : '无预设提示';

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `${TURTLE_SOUP_SYSTEM_PROMPT.replace('{hints}', hintText)}\n\n汤面（情境）：${scenario}\n汤底（真相）：${truth}`,
  };

  const messages: ChatMessage[] = [systemMessage];

  // 注入历史问答上下文（逐条交替注入，保留最近15轮）
  if (qaHistory.length > 0) {
    const recentHistory = qaHistory.slice(-15);
    for (const qa of recentHistory) {
      messages.push({
        role: 'user',
        content: qa.question,
      });
      messages.push({
        role: 'assistant',
        content: qa.answerText,
      });
    }
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
