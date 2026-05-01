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
    '在课堂展示时突然被老师追问一个你没准备的角度', '用一句话让社团面试官觉得你就是他们缺的那个人',
    '在小组讨论中说服大家用你的方案而不是学长的方案', '答辩时老师质疑你的结论你不慌不忙地翻转了局面',
    '在社团竞选时用一句话让所有投票人记住你', '在食堂排队时用30秒跟隔壁班那个有好感的人搭上话',
    '用一次自嘲化解课堂上答错题的尴尬', '面试实习时把HR的拒绝变成一个新的机会',
    '被辅导员叫去谈话时把被动变成主动', '用一个类比让室友瞬间理解你为什么拒绝TA的请求',
    '在班级群里用一句话让所有人的注意力集中到你身上', '用一个故事替代一个论据说服导师采纳你的选题',
    '在社团换届大会上即兴发言让所有人觉得你靠谱', '用一个具体数据替代空洞的自我介绍打动面试官',
    '室友要退课但你用三个理由说服TA坚持下来', '在辩论赛上用一个意想不到的角度让对方措手不及',
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
    '设计一个让室友关系瞬间升温的宿舍夜话仪式', '把考前突击变成一个有趣的挑战游戏',
    '用20%的改变撬动80%的大学体验提升', '找一个校园里被忽视的碎片时间最佳利用方式',
    '设计一个让社团新成员快速融入的破冰活动', '把对未来的焦虑转化为行动力',
    '用七天验证一个小习惯对学习效率的大影响', '从一部纪录片中提炼可操作的大学生存策略',
    '设计一个让自习室时光不再枯燥的仪式', '把一个困扰你很久的宿舍问题换个角度重新定义',
    '用每月500块的生活费创造超预期的周末体验', '设计一个帮助养成早起习惯的宿舍环境',
    '从一次挂科中提炼三条可复制的教训', '把社团竞选中最让人紧张的时刻变成展示机会',
    '用一个简单的规则改善一个学期的学习节奏', '设计一个让同学聚会不再尴尬的开场方式',
  ],
  relationship: [
    '在社团面试时用一句话让学长学姐觉得你靠谱', '用一次小组作业中的让步换回组员的信任',
    '室友情绪崩溃时用一句话而不是一通大道理安慰', '把一个潜在的宿舍矛盾提前化解为增进感情的机会',
    '在社团里真诚地赞美一个你暗暗嫉妒的同学', '用提问而不是建议帮助室友看清TA的感情问题',
    '在不尴尬的情况下退出一个你不感兴趣的宿舍话题', '把和一个同学的冷战用一条消息重新激活',
    '在室友说气话时听出TA真正想表达的需求', '用一个共同吐槽的课程快速拉近和陌生同学的距离',
    '在宿舍里不动声色地成为大家依赖的那个人', '让暗恋的人主动来找你而不是你去找TA',
    '在道歉时不丢面子地让对方觉得你是真心的', '用一次示弱修复一段因为逞强而疏远的室友关系',
    '在不伤和气的情况下让爱占便宜的室友知难而退', '把同学的缺点重新描述成一个让相处更好的特点',
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
  '命令行工具/开发者工具',
  'API服务（给其他开发者用的接口）',
];

const PROJECT_CORE_MECHANICS = [
  'AI辅助（AI作为增强功能而非产品本身，比如AI帮用户更快完成某个具体操作，而不是又一个AI对话机器人）',
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

// 项目类型与核心机制的兼容性矩阵 — 防止不现实的随机组合
const PROJECT_TYPE_MECHANIC_COMPAT: Record<string, number[]> = {
  '独立app应用（iOS/Android）': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  'Web网站/在线工具': [0, 1, 2, 4, 5, 6, 7, 8, 9],
  '浏览器插件/扩展': [0, 1, 2, 4, 5, 6, 8],
  '微信小程序': [1, 3, 4, 5, 6, 7, 8],
  '桌面端工具': [0, 1, 2, 5, 6, 8],
  '互动网页（纯前端，无需后端）': [1, 2, 4, 5, 6, 7, 8],
  '命令行工具/开发者工具': [0, 2, 5, 6, 8],
  'API服务（给其他开发者用的接口）': [0, 2, 4, 5],
};

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

// 项目开发子分类的强制类型指定 - 代码层随机 + 兼容性约束
// 其他项目子分类的随机领域池
const TECH_TREND_FIELDS = [
  'AI/大模型应用层', '前端/Web技术', '移动端开发', '数据库/存储',
  'DevOps/自动化', '安全/隐私', '音视频处理', '开发者体验',
];
const INNOVATION_FIELDS = [
  '日常效率工具', '内容创作', '学习/教育', '健康/运动',
  '个人财务', '社交/社区', '娱乐/游戏', '开发者工具',
];
const TECH_SCENARIOS = [
  '个人博客/作品集', '小工具/SaaS', '数据仪表盘',
  '实时协作应用', '内容管理/后台', 'API服务',
];
const BUSINESS_MODELS = [
  '订阅制（月费/年费）', '一次性买断', '免费+增值功能',
  '按使用量计费', '交易抽成/佣金', '内容付费/知识变现',
];

function getProjectStyleOverride(subcategoryId: string): string {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  if (subcategoryId === 'idea-incubation') {
    const projectType = pick(PROJECT_IDEA_TYPES);
    // 从兼容的机制池中选取，防止不现实的组合
    const compatibleIndices = PROJECT_TYPE_MECHANIC_COMPAT[projectType] ?? PROJECT_CORE_MECHANICS.map((_, i) => i);
    const mechanicIndex = compatibleIndices[Math.floor(Math.random() * compatibleIndices.length)];
    const coreMechanic = PROJECT_CORE_MECHANICS[mechanicIndex];
    const entryAngle = pick(PROJECT_ENTRY_ANGLES);

    return `\n\n【强制指定项目形态（最高优先级）】本次生成的项目必须是：${projectType}。介绍中必须体现出这种产品形态的使用方式。\n\n【强制指定核心机制（最高优先级）】本次项目的核心体验必须围绕：${coreMechanic}。这是产品最独特的地方，必须在介绍中明确体现。\n\n【强制指定创意出发点（最高优先级）】本次创意必须：${entryAngle}。`;
  }

  if (subcategoryId === 'trends') {
    const field = pick(TECH_TREND_FIELDS);
    return `\n\n【强制指定技术领域（最高优先级）】本次趋势洞察必须围绕「${field}」领域的具体技术变化展开，不要泛泛而谈整个科技行业。`;
  }

  if (subcategoryId === 'innovation') {
    const field = pick(INNOVATION_FIELDS);
    return `\n\n【强制指定创新领域（最高优先级）】本次必须针对「${field}」领域中的一个旧问题进行逆向创新，不要脱离这个领域。`;
  }

  if (subcategoryId === 'tech-stack') {
    const scenario = pick(TECH_SCENARIOS);
    return `\n\n【强制指定开发场景（最高优先级）】本次技术选型必须针对「${scenario}」场景中的具体问题推荐方案。`;
  }

  if (subcategoryId === 'business-model') {
    const model = pick(BUSINESS_MODELS);
    return `\n\n【强制指定变现模式（最高优先级）】本次商业模式的核心收入来源必须是「${model}」，在此基础上设计具体的产品。`;
  }

  return '';
}

// 项目开发领域专用系统提示词 — 技术产品人视角
function buildProjectSystemPrompt(
  subcategory: InspirationSubcategory,
  timestamp: string,
  projectStyleOverride: string
): string {
  return `你是一位兼具技术背景和产品思维的独立开发者/产品经理。

## 你的角色
- 你既能写代码也做过产品，理解从想法到上线的完整路径
- 你评判一个点子的标准是：1-3人小团队能否在1-4周内做出MVP
- 你对"看着酷但做不出来"的PPT产品零兴趣，你追求的是真能跑的东西
- 你了解常见技术栈的能力边界，不会提出超出工程现实的想法
- 你见过太多烂产品和好产品的区别，知道什么让用户留下来

## 当前任务
- 方向：${subcategory.name}（${subcategory.description}）

## 【最重要的输出格式约束 — 必须严格遵守】
${subcategory.promptFocus}

## 可行性判断标准（每次生成前必须自检）
- 1-3人小团队是否能在1-4周内做出核心功能可用的MVP？
- 核心功能是否可以用成熟技术栈实现？（不需要自研算法、不需要硬件供应链、不需要大量训练数据）
- 用户获取成本是否可以很低？（不依赖大规模推广、不需要冷启动大量用户）
- 是否有明确的付费意愿场景？（不是"先做大用户量再想怎么赚钱"）

## 你必须避免的
- 需要融资才能启动的项目（硬件制造、大规模数据采集、需要牌照的业务）
- 纯概念性产品（没有具体的使用场景和操作流程）
- 需要大量用户才能成立的产品（社交网络、平台型产品、交易市场）
- 技术上不成熟的方案（需要自研核心AI模型、需要极低延迟的实时系统）
- 任何包含以下词汇的表述：SaaS平台、综合解决方案、一站式服务、生态系统、赋能、助力、闭环、抓手、矩阵、中台

## 好点子的特征（校准参考）
- 「单词引力」：一个CLI工具，每次在终端输入命令时随机显示一个GRE单词及语境例句。核心极简，一个人一天能做出来，但确实有用。（技术栈：Rust CLI + 本地词库JSON，零后端）
- 「Git Shamer」：浏览器插件，在GitHub PR页面自动标注每个文件最后修改人的"代码平均存活时间"，让技术债务可视化。实用、有趣、一个人能做。（技术栈：Chrome Extension + GitHub API）
- 「三分钟日记」：微信小程序，每天只给3分钟写日记，时间到了自动保存并锁定，第二天才能看到自己写了什么。核心机制是时间压力+延迟反馈。（技术栈：微信小程序 + 云开发）

## 差点子的特征（必须避免）
- 「AI全能创作平台」：太宽泛、需要大团队、没有明确场景
- 「智能健康管理生态系统」：PPT词汇堆砌、不具体、没有核心体验
- 「基于区块链的去中心化社交网络」：技术不成熟、需要大量用户冷启动、一个人做不了

## 输出标准
1. 必须用中文，语言精练有力量
2. 内容必须具有实际启发性，不要空洞的口号或鸡汤
3. 要有具体的、可感知的细节，避免泛泛而谈
4. 不要使用"我们可以"、"让我们"之类的套话开头
5. 时间戳 ${timestamp} 确保每次输出不同${projectStyleOverride}`;
}

// 通用领域系统提示词（文学、沟通、学术、生活、人际关系）
function buildGenericSystemPrompt(
  domain: InspirationDomain,
  subcategory: InspirationSubcategory,
  timestamp: string,
  characterOverride: string,
  literaryStyleOverride: string,
  projectStyleOverride: string
): string {
  return `你是一位专注于「${domain.name}」领域的资深创意顾问。

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

  const systemPrompt = domain.id === 'project'
    ? buildProjectSystemPrompt(subcategory, timestamp, projectStyleOverride)
    : buildGenericSystemPrompt(domain, subcategory, timestamp, characterOverride, literaryStyleOverride, projectStyleOverride);

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
