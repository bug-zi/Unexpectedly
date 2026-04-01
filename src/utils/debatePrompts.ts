import { ChatMessage, DebateSession, DebateStance } from '@/types';

/**
 * 辩论对手系统提示词
 */
const OPPONENT_SYSTEM_PROMPT = `你是一位辩论高手，正在与用户进行一对一辩论。

请遵循以下规则：
- 立场坚定，始终为你方观点辩护
- 用严密的逻辑和有力的论据反驳对方
- 可以引用数据、案例、理论来支撑论点
- 语言精炼有力，每次回复控制在150字以内
- 保持专业和理性，不带个人攻击
- 直接回应对方的核心论点，不回避
- 始终用中文回答`;

/**
 * 评委系统提示词
 */
const JUDGE_SYSTEM_PROMPT = `你是一位资深的辩论评委，需要对这场辩论进行公正的评价。

请严格按照以下JSON格式返回评价结果（不要包含markdown代码块标记）：

{
  "summary": "对整场辩论的整体评价（100字以内）",
  "userScore": 7,
  "opponentScore": 7,
  "userStrengths": ["优点1", "优点2"],
  "userWeaknesses": ["不足1", "不足2"],
  "keyClashes": ["交锋点1", "交锋点2"],
  "winner": "user 或 opponent 或 draw",
  "advice": "对用户辩论能力提升的建议（50字以内）"
}

评分标准（1-10分）：
- 论点清晰度
- 逻辑严密性
- 论据充分性
- 反驳有效性
- 语言表达

winner判断：
- "user": 用户方明显更优
- "opponent": 对手方明显更优
- "draw": 势均力敌

始终用中文回答。`;

/**
 * 辩题生成系统提示词
 */
const TOPIC_GENERATION_SYSTEM_PROMPT = `你是一位辩题设计专家。请生成一个有深度的辩论题目。

要求：
1. 题目应该涉及生活中有争议的话题，有明确的正反两方立场
2. 题目要有趣、有思考价值，能激发深度讨论
3. 只输出辩题本身，不要输出其他任何内容
4. 辩题格式示例："人工智能是否会取代人类的工作"
5. 避免过于极端或敏感的话题
6. 始终用中文回答`;

/**
 * 构建辩题生成的消息列表
 */
export function buildTopicGenerationMessages(): ChatMessage[] {
  const categories = [
    '科技与人文', '教育改革', '社会伦理', '职业发展',
    '生活方式', '人际关系', '环境保护', '心理健康',
    '艺术与文化', '未来趋势', '哲学思辨', '日常选择',
  ];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  return [
    { role: 'system', content: TOPIC_GENERATION_SYSTEM_PROMPT },
    { role: 'user', content: `请从"${randomCategory}"相关的领域中，生成一个有趣的辩论题目。要求正反双方都有充分的论点空间。` },
  ];
}

/**
 * 构建AI对手的消息列表
 */
export function buildOpponentMessages(session: DebateSession): ChatMessage[] {
  const opponentStance: DebateStance = session.userStance === 'pro' ? 'con' : 'pro';
  const stanceLabel = session.userStance === 'pro' ? '正方' : '反方';
  const opponentLabel = opponentStance === 'pro' ? '正方' : '反方';

  const systemPrompt = `${OPPONENT_SYSTEM_PROMPT}

辩题：${session.topic}
你担任的是${opponentLabel}辩手，用户担任的是${stanceLabel}辩手。
你的立场：${opponentStance === 'pro' ? '支持' : '反对'}这个观点。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of session.messages) {
    if (msg.role === 'user') {
      messages.push({ role: 'user', content: `[${stanceLabel}说]: ${msg.content}` });
    } else if (msg.role === 'opponent') {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }

  return mergeConsecutiveRoles(messages);
}

/**
 * 构建评委评价的消息列表
 */
export function buildJudgeMessages(session: DebateSession): ChatMessage[] {
  const stanceLabel = session.userStance === 'pro' ? '正方' : '反方';
  const opponentLabel = session.userStance === 'pro' ? '反方' : '正方';

  let conversationText = `辩题：${session.topic}\n`;
  conversationText += `用户立场：${stanceLabel}，AI对手立场：${opponentLabel}\n\n`;

  for (const msg of session.messages) {
    if (msg.role === 'user') {
      conversationText += `【${stanceLabel}(用户)】: ${msg.content}\n\n`;
    } else if (msg.role === 'opponent') {
      conversationText += `【${opponentLabel}(AI对手)】: ${msg.content}\n\n`;
    }
  }

  return [
    { role: 'system', content: JUDGE_SYSTEM_PROMPT },
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
