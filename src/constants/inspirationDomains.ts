/**
 * 灵感源泉 - 6大灵感领域定义
 */

export type DepthLevel = 'spark' | 'deep-dive' | 'cross-pollination';

export interface InspirationSubcategory {
  id: string;
  name: string;
  description: string;
  promptFocus: string;
}

export interface InspirationDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  darkGradient: string;
  borderColor: string;
  darkBorderColor: string;
  hoverShadow: string;
  subcategories: InspirationSubcategory[];
}

export const INSPIRATION_DOMAINS: InspirationDomain[] = [
  {
    id: 'literary',
    name: '文学创作',
    description: '角色、世界观、情节——让你的故事活起来',
    icon: 'PenTool',
    color: 'green',
    gradient: 'from-green-900/70 via-emerald-800/50 to-green-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-green-900/60 dark:to-gray-800/70',
    borderColor: 'border-green-200/80 dark:border-green-800/60',
    darkBorderColor: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    hoverShadow: 'rgba(34, 197, 94, 0.25)',
    subcategories: [
      {
        id: 'character',
        name: '角色设计',
        description: '创造有血有肉的人物',
        promptFocus: '设计一个独特的人物角色，包含性格、背景、动机、矛盾和成长弧线',
      },
      {
        id: 'worldbuilding',
        name: '世界观构建',
        description: '搭建令人沉浸的世界',
        promptFocus: '构建一个独特的世界设定，包含社会结构、文化、规则和冲突',
      },
      {
        id: 'plot',
        name: '情节线索',
        description: '编织引人入胜的故事线',
        promptFocus: '构思一个引人入胜的故事情节，包含起承转合、悬念和反转',
      },
      {
        id: 'narrative',
        name: '叙事视角',
        description: '选择独特的讲述方式',
        promptFocus: '设计一种独特的叙事视角和讲述方式，打破常规叙事模式',
      },
      {
        id: 'emotion',
        name: '情感弧线',
        description: '设计打动人心的情感',
        promptFocus: '设计一段动人的情感发展弧线，让读者产生共鸣和情感投射',
      },
    ],
  },
  {
    id: 'project',
    name: '项目开发',
    description: '从点子到产品——发现下一个机会',
    icon: 'Rocket',
    color: 'green',
    gradient: 'from-green-900/70 via-teal-800/50 to-emerald-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-green-900/60 dark:to-gray-800/70',
    borderColor: 'border-green-200/80 dark:border-green-800/60',
    darkBorderColor: 'hover:border-teal-400 dark:hover:border-teal-600',
    hoverShadow: 'rgba(16, 185, 129, 0.25)',
    subcategories: [
      {
        id: 'trends',
        name: '技术趋势',
        description: '捕捉下一个技术浪潮',
        promptFocus: '分析一个有潜力的技术趋势，并提供基于此趋势的项目创意',
      },
      {
        id: 'pain-points',
        name: '痛点挖掘',
        description: '发现真实存在的需求',
        promptFocus: '深入挖掘一个真实存在的用户痛点，并提出创新解决方案',
      },
      {
        id: 'innovation',
        name: '创新角度',
        description: '用新视角看旧问题',
        promptFocus: '从一个非常规的角度重新审视一个常见问题，提出创新解决思路',
      },
      {
        id: 'tech-stack',
        name: '技术选型',
        description: '选择最合适的技术方案',
        promptFocus: '为一个特定场景推荐一个有趣的技术组合方案，并说明理由',
      },
      {
        id: 'business-model',
        name: '商业模式',
        description: '设计可持续的盈利路径',
        promptFocus: '为一个项目创意设计一个独特的商业模式和盈利路径',
      },
    ],
  },
  {
    id: 'design',
    name: '视觉设计',
    description: '色彩、布局、品牌——让设计会说话',
    icon: 'Palette',
    color: 'green',
    gradient: 'from-emerald-900/70 via-green-800/50 to-lime-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-emerald-900/60 dark:to-gray-800/70',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
    darkBorderColor: 'hover:border-lime-400 dark:hover:border-lime-600',
    hoverShadow: 'rgba(132, 204, 22, 0.25)',
    subcategories: [
      {
        id: 'color',
        name: '色彩方案',
        description: '调配打动人心的颜色',
        promptFocus: '设计一个独特的色彩方案，包含主色、辅色、强调色及其使用场景和情绪传达',
      },
      {
        id: 'layout',
        name: '布局创意',
        description: '打破常规的排版方式',
        promptFocus: '构思一个打破常规的视觉布局方案，创新的空间组织和视觉层次',
      },
      {
        id: 'brand',
        name: '品牌故事',
        description: '构建有温度的品牌叙事',
        promptFocus: '为一个虚构品牌构建完整的品牌叙事，包含核心理念、视觉语言和情感定位',
      },
      {
        id: 'interaction',
        name: '交互范式',
        description: '设计令人愉悦的交互',
        promptFocus: '设计一种创新的用户交互方式，让用户体验更自然、更有趣',
      },
      {
        id: 'metaphor',
        name: '视觉隐喻',
        description: '用视觉传递深层含义',
        promptFocus: '创造一个有力的视觉隐喻概念，用图像语言传达抽象理念',
      },
    ],
  },
  {
    id: 'academic',
    name: '学术探索',
    description: '研究方向、论文选题——打开学术视野',
    icon: 'GraduationCap',
    color: 'green',
    gradient: 'from-teal-900/70 via-emerald-800/50 to-teal-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-teal-900/60 dark:to-gray-800/70',
    borderColor: 'border-teal-200/80 dark:border-teal-800/60',
    darkBorderColor: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    hoverShadow: 'rgba(20, 184, 166, 0.25)',
    subcategories: [
      {
        id: 'research-direction',
        name: '研究方向',
        description: '找到值得深耕的领域',
        promptFocus: '推荐一个有前景的研究方向，包含背景、研究空白、潜在突破点',
      },
      {
        id: 'paper-topic',
        name: '论文选题',
        description: '确定有价值的课题',
        promptFocus: '构思一个有学术价值和创新性的论文选题，包含研究问题和预期贡献',
      },
      {
        id: 'experiment',
        name: '实验设计',
        description: '设计严谨的验证方案',
        promptFocus: '设计一个巧妙的实验方案来验证一个假设，包含方法论、变量控制和数据分析',
      },
      {
        id: 'methodology',
        name: '方法论创新',
        description: '改进传统研究方法',
        promptFocus: '提出一个改进或创新的研究方法，解决现有方法论的局限性',
      },
      {
        id: 'cross-discipline',
        name: '跨学科融合',
        description: '碰撞出新的学术火花',
        promptFocus: '将两个不同学科的理论或方法融合，产生新的研究视角和可能性',
      },
    ],
  },
  {
    id: 'life',
    name: '生活创意',
    description: '策划、话题、成长——让生活更有趣',
    icon: 'Coffee',
    color: 'green',
    gradient: 'from-lime-900/70 via-green-800/50 to-emerald-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-lime-900/60 dark:to-gray-800/70',
    borderColor: 'border-lime-200/80 dark:border-lime-800/60',
    darkBorderColor: 'hover:border-green-400 dark:hover:border-green-600',
    hoverShadow: 'rgba(101, 163, 13, 0.25)',
    subcategories: [
      {
        id: 'event',
        name: '活动策划',
        description: '策划让人难忘的活动',
        promptFocus: '策划一个独特有趣的活动方案，包含主题、流程、亮点和参与方式',
      },
      {
        id: 'social',
        name: '社交话题',
        description: '找到有趣的话题切入点',
        promptFocus: '提供一组有趣的社交话题和聊天切入点，适合不同社交场合',
      },
      {
        id: 'growth',
        name: '个人成长',
        description: '发现自我提升的方向',
        promptFocus: '提出一个个人成长方向和具体行动方案，帮助突破舒适区',
      },
      {
        id: 'travel',
        name: '旅行灵感',
        description: '规划与众不同的旅程',
        promptFocus: '设计一条独特的旅行路线或体验方案，避开热门景点，发现隐藏之美',
      },
      {
        id: 'ritual',
        name: '仪式感设计',
        description: '为日常注入特殊意义',
        promptFocus: '设计一个为日常生活注入仪式感的创意方案，让平凡日子变得特别',
      },
    ],
  },
  {
    id: 'philosophy',
    name: '哲学思辨',
    description: '思想实验、伦理困境——追问终极问题',
    icon: 'Scale',
    color: 'green',
    gradient: 'from-green-900/70 via-emerald-800/50 to-teal-600/40',
    darkGradient: 'dark:from-gray-900/80 dark:via-green-900/60 dark:to-gray-800/70',
    borderColor: 'border-green-200/80 dark:border-green-800/60',
    darkBorderColor: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    hoverShadow: 'rgba(5, 150, 105, 0.25)',
    subcategories: [
      {
        id: 'thought-experiment',
        name: '思想实验',
        description: '在脑中做不可思议的实验',
        promptFocus: '设计一个原创或变体的思想实验，引发对某个根本问题的深度思考',
      },
      {
        id: 'ethics',
        name: '伦理困境',
        description: '面对没有标准答案的选择',
        promptFocus: '构建一个复杂的伦理困境场景，展现不同道德框架下的冲突选择',
      },
      {
        id: 'existence',
        name: '存在追问',
        description: '思考关于存在的大问题',
        promptFocus: '提出一个关于存在本质的深刻问题，并从多个哲学流派的角度展开分析',
      },
      {
        id: 'paradox',
        name: '认知悖论',
        description: '在矛盾中发现真理',
        promptFocus: '提出或构造一个认知悖论，分析其中的逻辑矛盾和哲学启示',
      },
      {
        id: 'wisdom',
        name: '智慧综合',
        description: '融汇东西方的思想精华',
        promptFocus: '将东西方哲学传统中的智慧融会贯通，提出对当代生活有指导意义的见解',
      },
    ],
  },
];

export const DEPTH_CONFIG: Record<DepthLevel, { name: string; description: string; icon: string }> = {
  spark: { name: '火花', description: '精炼1-2句，快速冲击', icon: 'Zap' },
  'deep-dive': { name: '深潜', description: '详细展开，含示例', icon: 'Anchor' },
  'cross-pollination': { name: '跨界碰撞', description: '融合其他领域', icon: 'Shuffle' },
};

export function getDomainById(id: string): InspirationDomain | undefined {
  return INSPIRATION_DOMAINS.find((d) => d.id === id);
}

export function getSubcategoryById(
  domainId: string,
  subcategoryId: string
): InspirationSubcategory | undefined {
  const domain = getDomainById(domainId);
  return domain?.subcategories.find((s) => s.id === subcategoryId);
}
