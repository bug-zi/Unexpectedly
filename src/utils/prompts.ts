import { ChatMessage, RoundtableMessage, RoundtableSession, Thinker } from '@/types';

/**
 * 圆桌讨论指令 - 附加在每个大咖的 system prompt 之后
 */
const ROUNDTABLE_DIRECTIVE = `

你现在正在参与一场圆桌讨论。其他思想家也会就同一问题发言。

请遵循以下规则：
- 直接回应其他人的观点——可以赞同、补充、或礼貌地质疑
- 用你独特的思维框架来分析问题，展现你与众不同的视角
- 不要客套寒暄，直接切入核心观点
- 回复控制在200字以内，言简意赅
- 始终用中文回答`;

/**
 * 摘要生成指令
 */
const SUMMARY_DIRECTIVE = `你是一位善于提炼的讨论总结者。请根据以下圆桌讨论内容，生成一份结构清晰的讨论摘要：

要求：
1. 列出每位大咖的核心观点（用大咖名字标注）
2. 标注他们之间的共识和分歧
3. 给出对用户的启发建议
4. 控制在300字以内
5. 用中文回答`;

/**
 * 构建单大咖对话的消息列表（用于 1v1 咨询场景，预留扩展）
 */
export function buildSingleChatMessages(
  thinker: Thinker,
  history: RoundtableMessage[]
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'system', content: thinker.systemPrompt + '\n\n始终用中文回答。' },
  ];

  for (const msg of history) {
    if (msg.role === 'user') {
      messages.push({ role: 'user', content: msg.content });
    } else if (msg.thinkerId === thinker.id) {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }

  return messages;
}

/**
 * 构建圆桌讨论的消息列表 - 核心的消息重写机制
 *
 * 关键设计：同一个对话历史，对每个大咖做不同的"视角重写"：
 * - 该大咖自己说过的话 → role: 'assistant'
 * - 其他大咖说过的话 → role: 'user'，前缀标注发言人
 * - 用户的话 → role: 'user'，保持原样
 */
export function buildRoundtableMessages(
  thinker: Thinker,
  session: RoundtableSession,
  allThinkers: Thinker[]
): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: thinker.systemPrompt + ROUNDTABLE_DIRECTIVE,
    },
  ];

  for (const msg of session.messages) {
    if (msg.role === 'user') {
      messages.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'thinker') {
      if (msg.thinkerId === thinker.id) {
        // 自己的话 → assistant
        messages.push({ role: 'assistant', content: msg.content });
      } else {
        // 其他大咖的话 → user，前缀标注名字
        const speaker = allThinkers.find(t => t.id === msg.thinkerId);
        const speakerName = speaker?.name || '某位思想家';
        messages.push({
          role: 'user',
          content: `[${speakerName}说]: ${msg.content}`,
        });
      }
    } else if (msg.role === 'system') {
      // 系统消息跳过（已在 system prompt 中处理）
    }
  }

  // 合并连续相同 role 的消息（避免 API 报错）
  return mergeConsecutiveRoles(messages);
}

/**
 * 构建摘要生成的消息列表
 */
export function buildSummaryMessages(session: RoundtableSession, allThinkers: Thinker[]): ChatMessage[] {
  let conversationText = `讨论主题：${session.questionId}\n\n`;

  for (const msg of session.messages) {
    if (msg.role === 'user') {
      conversationText += `【用户】: ${msg.content}\n\n`;
    } else if (msg.role === 'thinker') {
      const speaker = allThinkers.find(t => t.id === msg.thinkerId);
      conversationText += `【${speaker?.name || '某位思想家'}】: ${msg.content}\n\n`;
    }
  }

  return [
    { role: 'system', content: SUMMARY_DIRECTIVE },
    { role: 'user', content: conversationText },
  ];
}

/**
 * 合并连续相同 role 的消息
 */
function mergeConsecutiveRoles(messages: ChatMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];

  for (const msg of messages) {
    const last = result[result.length - 1];
    if (last && last.role === msg.role) {
      last.content += '\n\n' + msg.content;
    } else {
      result.push({ ...msg });
    }
  }

  return result;
}

/**
 * 生成用户参与讨论的提示
 */
export function buildUserParticipationPrompt(userMessage: string): string {
  return `主持人补充了一个想法：${userMessage}\n请基于这个新信息继续讨论。`;
}
