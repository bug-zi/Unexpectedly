/**
 * 灵感源泉 - Prompt构建器和随机种子生成器
 */

import type { InspirationDomain, InspirationSubcategory, DepthLevel } from '@/constants/inspirationDomains';
import { getRandomPainPointCharacter } from '@/constants/inspirationDomains';
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
  communication: [
    '在对方还没说完的时候就猜到他要说什么然后抢先回应', '用一个反问把对方的攻击转化为你的加分项',
    '把一个复杂的道理用一个对方熟悉的日常场景讲明白', '在不认错的前提下化解一个对你不利的局面',
    '用沉默和停顿制造比语言更有力的压力', '在30秒内把一个陌生人变成愿意帮你的人',
    '用一个自嘲化解一个让你下不来台的尴尬', '把对方的拒绝翻转为一个新的机会',
    '在不撒谎的前提下重新包装一个不利的事实', '用一个具体数字替代一段空洞的解释',
    '在对方最放松的时刻说出你最想说的话', '用一个故事替代一个论据说服对方',
    '在群体场合用一句话让所有人的注意力集中到你身上', '把一个两难选择重新定义为一个全新的选项',
    '在对方说"不"之后找到第三个让他说"好"的角度', '用一个意想不到的类比让对方瞬间理解你的立场',
  ],
  academic: [
    '观察一个每天重复却没人追问为什么的日常习惯', '用经济学思维重新解释一个看似与钱无关的行为',
    '在社交媒体的热门话题中找出被忽略的认知偏差', '把生物学中的进化逻辑套用到职场竞争策略上',
    '从物理学的熵增定律理解为什么房间总是变乱', '用博弈论分析一次日常讨价还价中的最优策略',
    '发现心理学中一个效应在日常消费中的隐藏应用', '把城市规划的学术思路用到个人时间管理上',
    '用信息论的视角分析为什么有些话传着传着就变了', '从营养学研究中找到一条颠覆常识的饮食建议',
    '把行为经济学的助推理论用在一个你想改掉的习惯上', '用社会学的角色理论解释一次尴尬的社交场合',
    '从认知科学的角度理解为什么你记不住刚读过的内容', '用统计学的思维拆解一条朋友圈里转发的数据结论',
    '把生态学中的共生关系映射到人际关系的经营上', '从传播学理论解读一个短视频为什么能爆火',
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
  relationship: [
    '在不暴露自己脆弱的前提下让对方感受到你的在乎', '用一个微小的让步换回对方巨大的信任',
    '在对方情绪最差的时刻用一句话而不是一通道理安慰', '把一个潜在的冲突提前转化为一次增进感情的机会',
    '在不贬低自己的前提下真诚地赞美一个你嫉妒的人', '用一个提问而不是建议帮助朋友看清自己的问题',
    '在不破坏气氛的情况下退出一个你不舒服的社交场合', '把一段冷掉的关系用一条消息重新激活',
    '在对方说气话的时候听出他真正想表达的需求', '用一个共同敌人快速拉近和陌生人的距离',
    '在不伤和气的情况下让爱占便宜的人知难而退', '把对方的缺点重新描述成一个让关系更好的特点',
    '在一个群体中不动声色地成为大家依赖的那个人', '在不主动联系的情况下让对方想主动找你',
    '在道歉时不丢面子地让对方觉得你是真心的', '用一次示弱修复一段因为逞强而疏远的关系',
  ],
};

// 思维方法池 - 通用的创意思维工具
const THINKING_METHODS = [
  '类比推理', '逆向假设', '极限外推', '视角切换',
  '矛盾统一', '系统拆解', '时间压缩', '角色互换',
  '约束激发', '组合创新', '归纳猜想', '演绎验证',
  '边界试探', '抽象升降', '因果追溯', '反事实推理',
];

// 文学创作子分类的随机风格池 - 代码层随机，不依赖AI计算
const CHARACTER_NAME_STYLES = [
  '复姓古风（如：慕容霜、上官鸦、东方霁、尉迟鹃）',
  '少数民族异域感（如：阿依古丽、巴特尔、央金、扎西顿珠）',
  '民国文艺风（如：沈鹿笙、苏绾卿、顾念秋、柳如烟）',
  '现代独特名（如：步寻、宋微澜、贺知非、商羽）',
  '译名/日韩风格（如：桐生浅、佐藤鸢、伊万·楚瓦绍夫、金赛纶）',
  '笔名绰号型（如：七堇、浮白、老猫、三更）',
];

const WORLD_RESIDENT_TYPES = [
  '人类',
  '动物（如拥有文明的蚁群、鲸族联邦）',
  '植物（如会思考的森林网络）',
  '非生物（如拥有意识的石头、河流、建筑）',
  '人造物（如觉醒的AI、被赋予灵魂的工具）',
  '混合体（如人与兽的共生体、肉体与机械的嵌合体）',
];

const WORLD_BUILDING_TYPES = [
  '现实暗层型（如哈利波特：现实世界表面之下隐藏着完整的另一套社会秩序和力量体系）',
  '完全架空型（如指环王/冰与火之歌：全新的地理、种族、文明和政治博弈）',
  '科幻推演型（如三体/基地：基于科学假设推演出的未来社会形态）',
  '历史裂变型（如高堡奇人：真实历史关键节点走向不同结局）',
  '微观异世界型（如虫师/千与千寻：日常世界缝隙中的异空间）',
  '末世废土型（如辐射/最后生还者：文明崩塌后在废墟中重建秩序）',
];

const PLOT_TYPES = [
  '密室博弈型（少数人在封闭空间中的信任崩塌）',
  '时间困局型（时间循环、限制或倒流带来的绝境）',
  '身份谜题型（主角的真实身份或记忆被逐步揭开）',
  '道德困兽型（每个选项都违背主角核心价值观的绝境）',
  '赌注升级型（从小事件开始不断加码直到失控）',
  '双线交汇型（两条看似无关的故事线在结尾碰撞）',
];

const NARRATIVE_VIEWPOINT_TYPES = [
  '物件视角（用无生命物体的视角讲述故事）',
  '群体视角（用"我们"的集体意识叙事）',
  '倒序碎片型（从结尾倒着讲，每次只给一个碎片）',
  '多声部复调（3个角色各讲同一事件，版本互相矛盾）',
  '注释体（正文极简，故事信息藏在脚注、批注中）',
  '未来回望型（站在未来回望现在，已知结局的口吻）',
  '缺席叙事型（主角始终不出现，通过他人间接建构）',
];

const EMOTION_TYPES = [
  '隐忍之爱（以对方不知情的方式默默守护）',
  '恨中生怜（对最恨的人产生了理解或柔软）',
  '错位的归属（以为属于A，最终发现归属是B）',
  '悔而不改（意识到做错了，但依然选择同样的路）',
  '恐惧的诱惑（明明害怕，却被恐惧本身吸引）',
  '陌生人的温度（与陌生人产生了最深刻的情感连接）',
];

// 项目开发 - 点子孵化 随机池
const PROJECT_IDEA_TYPES = [
  '独立app应用（iOS/Android）',
  'Web网站/在线工具',
  '浏览器插件/扩展',
  '微信小程序',
  '桌面端工具',
  '互动网页（纯前端，无需后端）',
  '命令行工具',
  '硬件/物联网设备',
];

const PROJECT_CORE_MECHANICS = [
  'AI生成/对话（让AI成为核心体验的一部分，不只是辅助功能）',
  '游戏化机制（用游戏思维设计非游戏场景，让枯燥的事情变有趣）',
  '数据可视化（把抽象数据变成可感知的图形或动画）',
  '社交/连接（人与人的连接是核心价值，不是附属功能）',
  '个性化/自适应（越用越懂用户，每次打开都不一样）',
  '创意工具（帮助用户产出内容而非消费内容）',
  '碎片化体验（每次使用只需1-5分钟，随时随地）',
  '记忆/记录（用新颖的方式保存和回顾人生片段）',
  '随机性/惊喜（核心体验依赖意外和发现，不可预测）',
  '协作共创（多人共同参与创造一个东西）',
];

const PROJECT_ENTRY_ANGLES = [
  '从你自己真实遇到的一个需求出发——你想要的这个东西，目前没有任何工具能做好',
  '从一个你觉得很有趣但缺少好工具的爱好出发',
  '从你观察到的身边人反复出现的一个烦恼出发',
  '从一个你很喜欢但觉得可以做得更好的现有产品出发——说清楚哪里好，哪里可以更好',
  '从两个你喜欢的、完全不相关的东西的组合出发——比如"播客×手帐"、"跑步×推理游戏"',
  '从一个"如果...会怎样"的假设出发——比如"如果日记可以像RPG一样写会怎样"',
  '从你一直在想但没人做的一个小众兴趣出发',
  '从你讨厌的一个重复性任务出发——怎么让它变得不讨厌甚至有趣',
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

// 文学创作子分类的强制风格指定 - 代码层随机，不依赖AI计算时间戳取余
function getLiteraryStyleOverride(subcategoryId: string): string {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  if (subcategoryId === 'character') {
    const style = pick(CHARACTER_NAME_STYLES);
    return `\n\n【强制指定姓名风格（最高优先级，覆盖promptFocus中的姓名风格指令）】本次角色姓名必须使用：${style}。禁止使用其他风格。`;
  }

  if (subcategoryId === 'worldbuilding') {
    const resident = pick(WORLD_RESIDENT_TYPES);
    const worldType = pick(WORLD_BUILDING_TYPES);
    return `\n\n【强制指定居民主体（最高优先级）】世界观的居民主体必须为：${resident}。④中的日常瞬间必须以该主体视角描写。\n\n【强制指定世界观类型（最高优先级）】本次必须使用：${worldType}。`;
  }

  if (subcategoryId === 'plot') {
    const plotType = pick(PLOT_TYPES);
    return `\n\n【强制指定情节类型（最高优先级）】本次必须使用：${plotType}。`;
  }

  if (subcategoryId === 'narrative') {
    const viewType = pick(NARRATIVE_VIEWPOINT_TYPES);
    return `\n\n【强制指定视角类型（最高优先级）】本次必须使用：${viewType}。`;
  }

  if (subcategoryId === 'emotion') {
    const emotionType = pick(EMOTION_TYPES);
    return `\n\n【强制指定情感类型（最高优先级）】本次必须使用：${emotionType}。`;
  }

  return '';
}

// 项目开发子分类的强制类型指定 - 代码层随机
function getProjectStyleOverride(subcategoryId: string): string {
  if (subcategoryId !== 'idea-incubation') return '';

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const projectType = pick(PROJECT_IDEA_TYPES);
  const coreMechanic = pick(PROJECT_CORE_MECHANICS);
  const entryAngle = pick(PROJECT_ENTRY_ANGLES);

  return `\n\n【强制指定项目形态（最高优先级）】本次生成的项目必须是：${projectType}。介绍中必须体现出这种产品形态的使用方式。\n\n【强制指定核心机制（最高优先级）】本次项目的核心体验必须围绕：${coreMechanic}。这是产品最独特的地方，必须在介绍中明确体现。\n\n【强制指定创意出发点（最高优先级）】本次创意必须：${entryAngle}。`;
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

  // 痛点挖掘：代码层随机选人，直接注入prompt，AI零选择权
  const characterOverride = subcategory.id === 'pain-points'
    ? `\n\n【指定人物（必须严格遵守）】你必须以「${getRandomPainPointCharacter()}」为主角，禁止替换为其他人物。`
    : '';

  // 文学创作：代码层随机选风格，直接注入prompt，AI零选择权
  const literaryStyleOverride = domain.id === 'literary'
    ? getLiteraryStyleOverride(subcategory.id)
    : '';

  // 项目开发：代码层随机选项目类型和核心机制，直接注入prompt
  const projectStyleOverride = domain.id === 'project'
    ? getProjectStyleOverride(subcategory.id)
    : '';

  const systemPrompt = `你是一位专注于「${domain.name}」领域的资深创意顾问。

## 你的角色
- 你在${domain.name}领域有丰富的实战经验和深度思考
- 你擅长将抽象创意转化为可落地的具体方案
- 你了解这个领域的常见套路，刻意避免它们

## 当前任务
- 领域：${domain.name}（${domain.description}）
- 方向：${subcategory.name}

## 【最重要的输出格式约束 — 必须严格遵守】
${subcategory.promptFocus}

## 输出标准
1. 必须用中文，语言精练有力量
2. 内容必须具有实际启发性，不要空洞的口号或鸡汤
3. 要有具体的、可感知的细节，避免泛泛而谈
4. 不要使用"我们可以"、"让我们"之类的套话开头
5. 时间戳 ${timestamp} 确保每次输出不同${characterOverride}${literaryStyleOverride}${projectStyleOverride}`;

  const userPrompt = `请为「${domain.name}」领域的「${subcategory.name}」方向生成内容。
${characterOverride}${literaryStyleOverride}${projectStyleOverride}
【输出格式要求（最高优先级）】：${subcategory.promptFocus}

创意触发点（作为思维启发的角度，但不可偏离上述输出格式）：${domainAngle}
思维方法（用这个方法展开）：${seed.method}

额外灵感线索：${seed.angle}

${depthInstruction}

直接输出内容，不要标题、不要前缀、不要"以下是你的灵感"这类话。`;

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
      const allDomains = ['文学创作', '项目开发', '沟通表达', '学术探索', '生活创意', '人际关系'];
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
 * 构建提问交互的消息列表
 */
export function buildAskPrompt(
  previousContent: string,
  question: string,
  domain: InspirationDomain
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一位「${domain.name}」领域的资深创意顾问。用户之前获得了一个灵感，现在对这个灵感提出了一个后续问题。

要求：
1. 用中文回答
2. 紧密围绕用户的灵感和问题进行回答，不要泛泛而谈
3. 回答要具体、有深度，最好能给出可操作的建议或新的视角
4. 如果用户的问题是在质疑或挑战灵感中的观点，要正面回应，给出有说服力的论证
5. 语言精练，不要重复灵感中已有的内容`,
    },
    {
      role: 'user',
      content: `这是我在「${domain.name}」领域获得的一个灵感：\n\n${previousContent}\n\n我的问题是：${question}`,
    },
  ];
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
