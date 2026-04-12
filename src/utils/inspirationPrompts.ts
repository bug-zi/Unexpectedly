/**
 * 灵感源泉 - Prompt构建器和随机种子生成器
 */

import type { InspirationDomain, InspirationSubcategory, DepthLevel } from '@/constants/inspirationDomains';
import type { ChatMessage } from '@/types';

// 领域适配的创意角度池 - 按领域分组，确保与实际需求匹配
const CREATIVE_ANGLES: Record<string, string[]> = {
  literary: [
    '从一个反直觉的结尾倒推故事', '让两个完全对立的角色被迫合作',
    '把一个日常细节放大为命运的转折点', '用不可靠叙述者制造认知偏差',
    '在看似温馨的场景中埋入不安的伏笔', '让沉默成为最有力的对话',
    '设计一个读者会反复改变立场判断的角色', '把抽象情感具象化为可触摸的事物',
    '让配角无意中说出整部作品的主题', '用一个物品串联起三条时间线',
    '在最紧张的时刻插入一个日常小动作形成反差', '让环境描写暗示角色心理变化',
    '设计一个只有重读第二遍才能发现的真相', '用一首歌或一段旋律贯穿全篇',
    '让开篇第一句话就制造悬念或矛盾', '把一个社会议题融入个人情感冲突中',
  ],
  project: [
    '从用户的一个下意识行为发现需求', '把两个不相关的产品功能合并产生新价值',
    '用最低成本验证一个大胆的假设', '找一个被主流市场忽略的小众痛点',
    '把线下体验中最让人愉悦的部分搬到线上', '重新思考一个被所有人认为理所当然的流程',
    '用游戏化机制解决一个严肃的问题', '从失败产品中挖掘被浪费的好想法',
    '设计一个让用户自发传播的功能', '用数据揭示一个反直觉的用户行为模式',
    '把复杂的多步操作简化为一个动作', '利用用户的闲置资源创造价值',
    '从另一个行业的成功模式中借鉴思路', '设计一个越用越懂用户的功能',
    '把付费门槛转化为用户成长的里程碑', '从评论区的抱怨中提炼产品方向',
  ],
  design: [
    '用留白和负空间传递更多信息', '从自然界的光影变化提取配色方案',
    '把复杂的数据用日常物品做隐喻可视化', '设计一个让人忍不住想点击的微交互',
    '用排版节奏引导阅读情绪', '在极简风格中藏一个让人会心一笑的彩蛋',
    '把品牌故事融入用户操作流程中', '用声音设计增强视觉记忆点',
    '从建筑的动线设计中借鉴页面布局', '设计一个没有文字也能被理解的界面',
    '用色彩的温度差异制造空间纵深感', '把加载过程变成一次品牌体验',
    '从杂志排版中提取数字界面的层次感', '设计一个让人愿意截图分享的界面细节',
    '用动态字体传递内容情绪', '在功能按钮中融入情感化设计',
  ],
  academic: [
    '从跨学科的角度重新审视一个经典理论', '找一个被广泛引用但从未被严格验证的假设',
    '用最新的技术手段重新研究一个老问题', '从失败的研究中发现新的研究问题',
    '把定性研究的洞察转化为可量化的假设', '用一个巧妙的自然实验替代传统实验设计',
    '从日常生活的观察中提炼学术问题', '把两个竞争理论的核心观点整合为新模式',
    '从边缘案例中发现主流理论的盲区', '用一个反例推动理论的边界',
    '从实践者的经验中提炼理论框架', '把大数据分析与传统研究方法结合',
    '从历史案例中提取可验证的规律', '用一个简单模型解释复杂现象',
    '从相邻学科借用方法论解决本学科问题', '把技术伦理问题转化为可研究的学术课题',
  ],
  life: [
    '设计一个让日常重复变得有趣的仪式', '从旅途中的一次意外经历提炼生活智慧',
    '用20%的改变撬动80%的生活质量提升', '找一个被忽视的碎片时间的最佳利用方式',
    '设计一个让两个人快速建立深度连接的活动', '把焦虑转化为创造力的具体方法',
    '用七天时间验证一个小改变的大影响', '从一部电影中提炼可操作的生活策略',
    '设计一个让独处时光变得珍贵的仪式', '把一个困扰你很久的问题换个角度重新定义',
    '用有限的预算创造超预期的体验', '设计一个帮助养成好习惯的环境',
    '从一次失败中提炼三条可复制的教训', '把社交中最让人紧张的时刻变成展示机会',
    '用一个简单的规则改善一个月的生活节奏', '设计一个让朋友聚会不再尴尬的开场方式',
  ],
  philosophy: [
    '用一个思想实验挑战你最深层的道德直觉', '从一个悖论中找到隐藏的真理',
    '把一个古老哲学问题翻译成当代生活场景', '设计一个让双方都有道理但结论矛盾的困境',
    '从科幻作品中提取一个值得认真思考的哲学问题', '用东西方哲学的不同传统分析同一个问题',
    '找到一个日常习惯背后的哲学假设', '设计一个改变一个变量就颠覆整个伦理判断的场景',
    '从一句谚语中挖掘出被忽略的智慧', '用最简单的语言解释一个最深刻的哲学概念',
    '设计一个让 AI 也难以抉择的伦理困境', '从艺术作品中提炼一个存在主义问题',
    '用一个反直觉的论证挑战常识', '把一个技术发展放到哲学史上定位其意义',
    '设计一个只改变时间跨度就完全改变道德判断的场景', '从日常对话中找出隐藏的哲学预设',
  ],
};

// 思维方法池 - 通用的创意思维工具
const THINKING_METHODS = [
  '类比推理', '逆向假设', '极限外推', '视角切换',
  '矛盾统一', '系统拆解', '时间压缩', '角色互换',
  '约束激发', '组合创新', '归纳猜想', '演绎验证',
  '边界试探', '抽象升降', '因果追溯', '反事实推理',
];

export interface RandomSeed {
  angle: string;
  method: string;
}

export function generateRandomSeed(): RandomSeed {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const allAngles = Object.values(CREATIVE_ANGLES).flat();
  return {
    angle: pick(allAngles),
    method: pick(THINKING_METHODS),
  };
}

// 获取领域专属创意角度
function getDomainAngle(domainId: string): string {
  const pool = CREATIVE_ANGLES[domainId] || CREATIVE_ANGLES.literary;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 构建灵感生成的消息列表
 */
export function buildInspirationPrompt(
  domain: InspirationDomain,
  subcategory: InspirationSubcategory,
  depth: DepthLevel,
  seed: RandomSeed
): ChatMessage[] {
  const depthInstruction = getDepthInstruction(depth, domain);
  const domainAngle = getDomainAngle(domain.id);
  const timestamp = new Date().toISOString();

  const systemPrompt = `你是一位专注于「${domain.name}」领域的资深创意顾问。你的任务是为用户生成具有实际价值的灵感。

## 你的角色
- 你在${domain.name}领域有丰富的实战经验和深度思考
- 你擅长将抽象创意转化为可落地的具体方案
- 你了解这个领域的常见套路，刻意避免它们

## 当前任务
- 领域：${domain.name}（${domain.description}）
- 聚焦方向：${subcategory.name}（${subcategory.promptFocus}）

## 输出标准
1. 必须用中文，语言精练有力量
2. 内容必须具有实际启发性，不要空洞的口号或鸡汤
3. 要有具体的、可感知的细节，避免泛泛而谈
4. 不要使用"我们可以"、"让我们"之类的套话开头
5. 时间戳 ${timestamp} 确保每次输出不同`;

  const userPrompt = `请为「${domain.name}」领域的「${subcategory.name}」方向生成一条灵感。

创意触发点（用这个角度切入）：${domainAngle}
思维方法（用这个方法展开）：${seed.method}

额外灵感线索：${seed.angle}

${depthInstruction}

直接输出灵感内容，不要标题、不要前缀、不要"以下是你的灵感"这类话。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

function getDepthInstruction(depth: DepthLevel, domain: InspirationDomain): string {
  switch (depth) {
    case 'spark':
      return `【火花模式】输出格式要求：
- 用2-4句话呈现一个完整的灵感核心
- 第一句话必须直接击中要点，不要铺垫
- 最后一句要留下让人思考的余味
- 总字数控制在50-100字`;
    case 'deep-dive':
      return `【深潜模式】输出格式要求（200-400字）：
1. 灵感核心（1-2句话，直接点明创意的精髓）
2. 具体展开（用具体的场景、例子或数据说明，不要抽象描述）
3. 落地建议（给出1-2个可以立即开始行动的下一步）`;
    case 'cross-pollination': {
      const allDomains = ['文学创作', '项目开发', '视觉设计', '学术探索', '生活创意', '哲学思辨'];
      const otherDomains = allDomains.filter(d => d !== domain.name);
      const randomDomain = otherDomains[Math.floor(Math.random() * otherDomains.length)];
      return `【跨界碰撞模式】输出格式要求（200-300字）：
1. 跨界洞察（一句话点明「${domain.name}」×「${randomDomain}」碰撞出的核心创意）
2. 融合分析（说明这两个领域思维的独特交叉点在哪里，为什么有价值）
3. 应用场景（给出1-2个具体的应用方向或场景）`;
    }
  }
}

/**
 * 构建展开深入的消息列表
 */
export function buildExpandPrompt(
  previousContent: string,
  domain: InspirationDomain
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一位「${domain.name}」领域的资深创意顾问。用户会给你一个灵感片段，你需要在此基础上深入展开。

要求：
1. 用中文回答
2. 保持原有创意的核心价值，但增加更多细节和深度
3. 给出至少2个具体的延伸方向，每个都要有可执行的步骤
4. 如果灵感中有模糊的地方，给出明确的解释和具体化建议
5. 不要重复原有内容，而是层层递进`,
    },
    {
      role: 'user',
      content: `这是我在「${domain.name}」领域获得的一个灵感：\n\n${previousContent}\n\n请帮我进一步深化这个灵感，给出更具体的落地方向和行动建议。`,
    },
  ];
}
