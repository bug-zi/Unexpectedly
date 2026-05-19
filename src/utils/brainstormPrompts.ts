/**
 * 灵感风暴引擎 - 提示词构建器
 * 多词碰撞、评分、复盘、种子提取
 */

import type { ChatMessage } from '@/types';

// ===================== 多词碰撞 =====================

const MULTI_REACTION_SYSTEM_PROMPT = `你是一个疯狂但靠谱的创意碰撞引擎。给你2-4个词语，你要把它们融合成让人"哇"一声的创意点子。

【扣题规则——最重要】
给定N个词语，每条创意必须涉及全部N个词语，缺一不可。
自检：写完后遮住任意一个词，如果创意还完全成立，说明扣题不紧，重写。

输出维度（每条从不同角度切入）：
- 反常识组合：概念拼在一起产生违反直觉但合理的产物
- 行为改造：改变一群人现有的某个习惯或仪式
- 隐喻实体化：把词语间的隐喻关系变成看得见摸得着的东西
- 极端场景：在某个特殊时刻，这些词语的结合变得必不可少
- 微型实验：花500块以内、周末两天能验证的小实验

硬性规则：
1. 每条content不超过70字，纯文字，禁止emoji和装饰符号
2. 生成4条结果，覆盖至少4个不同维度
3. type字段只能是：反常识组合、行为改造、隐喻实体化、极端场景、微型实验
4. 禁止空洞概念，禁止标签式描述
5. 每条必须包含具体细节，让人在脑子里画出画面
6. 场景必须多样化：每条创意必须在不同场景中发生
7. 优先写让人意外但想通后觉得合理的想法

质量自检：
- 同时涉及所有词语了吗？
- 让人意外吗？意料之中的不够好
- 想通后合理吗？纯粹荒诞的不够好

输出格式：
纯JSON数组，每个元素包含 content 和 type。
[{"content":"具体的创意描述","type":"反常识组合"}]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建多词碰撞提示
 */
export function buildMultiWordReactionPrompt(
  words: string[],
  lessonsLearned?: string[]
): ChatMessage[] {
  const wordsStr = words.map((w) => `「${w}」`).join('和');
  let userContent = `将${wordsStr}碰撞融合，生成4条紧扣这些词语的创意。`;

  if (lessonsLearned && lessonsLearned.length > 0) {
    userContent += `\n\n本轮指导原则（基于之前轮次的经验总结）：\n${lessonsLearned.map((l) => `- ${l}`).join('\n')}`;
  }

  return [
    { role: 'system', content: MULTI_REACTION_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

// ===================== 评分 =====================

const SCORING_SYSTEM_PROMPT = `你是一位理性的创意评估师。你会收到一条创意和它的来源词语，请从4个维度打分（1-10分）。

评分维度：
- 创新性（innovation）：这个想法有多新颖？是否有人做过类似的事？
- 可行性（feasibility）：小团队用现有技术能否实现？
- 实用性（practicality）：是否解决真实存在的问题？
- 趣味性（fun）：人们会不会主动想尝试或分享？

评分流程（先思考再打分）：
1. 先判断这条创意是否紧扣了所有来源词语。如果有明显遗漏，创新性直接-2分。
2. 逐个维度评估，给出1-10分。
3. 计算平均分。
4. 判断是否合格：平均分≥6.0 且至少2个维度≥7.0。

硬性规则：
- 不要给面子分，6分以下是正常的
- 可行性不是让你判断市场前景，而是技术上能不能做出来
- 趣味性是主观感受，但如果你自己看到这个想法没有"有点意思"的反应，就不该给7分以上

输出格式（严格遵守）：
纯JSON，不要任何其他文字。
{"innovation":N,"feasibility":N,"practicality":N,"fun":N,"average":N,"reasoning":"2-3句简短评价","qualified":true/false}`;

/**
 * 构建评分提示
 */
export function buildScoringPrompt(
  idea: string,
  sourceWords: string[]
): ChatMessage[] {
  return [
    { role: 'system', content: SCORING_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `来源词语：${sourceWords.join('、')}\n创意内容：${idea}`,
    },
  ];
}

// ===================== 复盘 =====================

const REVIEW_SYSTEM_PROMPT = `你是一位创意复盘教练。每轮头脑风暴结束后，你负责总结经验教训，指导下轮做得更好。

你的复盘必须：
1. 具体而非笼统——不要说"继续努力"，要说出具体哪里好、哪里差
2. 提炼可操作的经验——下轮生成时能直接用上的指导
3. 建议新的方向——基于本轮发现，推荐一个有潜力的新种子词

输出格式（严格遵守）：
纯JSON，不要任何其他文字。
{"whatWorked":["具体原因1","具体原因2"],"whatFailed":["具体原因1","具体原因2"],"lessons":["可操作的经验1","可操作的经验2","可操作的经验3"],"suggestedDirection":"下一轮的方向建议","suggestedSeedWord":"建议的种子词"}`;

interface ReviewInputData {
  seedWord: string;
  expandedWords: string[];
  qualifiedIdeas: Array<{ ideaText: string; scores: { average: number } }>;
  discardedIdeas: Array<{ ideaText: string; scores: { average: number }; reasoning: string }>;
}

/**
 * 构建复盘提示
 */
export function buildReviewPrompt(
  roundData: ReviewInputData,
  previousLessons: string[] = []
): ChatMessage[] {
  const qualified = roundData.qualifiedIdeas
    .map((i) => `  - [${i.scores.average.toFixed(1)}分] ${i.ideaText}`)
    .join('\n');
  const discarded = roundData.discardedIdeas
    .map((i) => `  - [${i.scores.average.toFixed(1)}分] ${i.ideaText}（${i.reasoning}）`)
    .join('\n');

  let userContent = `【本轮数据】
种子词：${roundData.seedWord}
扩展词：${roundData.expandedWords.join('、')}

合格的点子：
${qualified || '  （无）'}

被丢弃的点子：
${discarded || '  （无）'}

请复盘本轮，总结经验教训。`;

  if (previousLessons.length > 0) {
    userContent += `\n\n之前轮次的经验教训（在此基础上补充，不要重复）：\n${previousLessons.map((l) => `- ${l}`).join('\n')}`;
  }

  return [
    { role: 'system', content: REVIEW_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

// ===================== 种子提取 =====================

const SEED_EXTRACT_SYSTEM_PROMPT = `你从一个创意描述中提取2-3个最有潜力的关键词语，这些词语将被用作下一轮创意生成的种子。

要求：
- 提取名词或名词短语
- 优先选择具体、有画面感的词
- 避免抽象概念

输出格式：
纯JSON数组，不要任何其他文字。
["词语1","词语2"]`;

/**
 * 构建种子词提取提示
 */
export function buildSeedExtractPrompt(topIdea: string): ChatMessage[] {
  return [
    { role: 'system', content: SEED_EXTRACT_SYSTEM_PROMPT },
    { role: 'user', content: `创意：${topIdea}\n\n提取最有潜力的2-3个关键词。` },
  ];
}
