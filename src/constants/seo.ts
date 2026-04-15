export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  /** Canonical path override (e.g. '/growth' for '/questions/growth') */
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

export const SITE_NAME = '万万没想到';
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://unexpectedly.debugzi.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const seoConfig: Record<string, PageSEO> = {
  '/': {
    title: '万万没想到 - 每日思维提升工具，锻炼5种思维维度',
    description:
      '每天5分钟深度思考，比刷短视频强100倍。1000+真人设计问题，25种思维维度组合，灵感老虎机、海龟汤推理、成长追踪，全方位锻炼你的思维能力。',
    keywords: [
      '思维训练',
      '深度思考',
      '创意激发',
      '自我提升',
      '成长记录',
      '每日思考',
    ],
    ogType: 'website',
  },
  '/questions': {
    title: '万万没想到 - 思考问题库，5种思维维度×5种生活场景',
    description:
      '1000+真人设计的深度思考问题，覆盖假设思维、逆向思考、联想创意、自我反思、未来设想5大维度，探索职业、创意、人际、学习、哲学5大场景。',
    keywords: [
      '思考问题',
      '思维维度',
      '假设思维',
      '逆向思考',
      '联想创意',
      '自我反思',
      '未来设想',
    ],
  },
  '/questions/explore': {
    title: '万万没想到 - 问题探索，发现激发思考的好问题',
    description:
      '按思维维度和生活场景探索精选问题，找到最适合你的思考练习。每一个问题都是一次思维的冒险。',
    keywords: ['问题探索', '思维练习', '深度提问', '思考训练'],
  },
  '/writing': {
    title: '万万没想到 - 创意写作工具，灵感老虎机+文笔挑战',
    description:
      '灵感老虎机随机组合词语激发创意，文笔挑战锻炼文字精炼能力。发现隐藏彩蛋组合，解锁更多灵感。',
    keywords: ['创意写作', '灵感老虎机', '文笔挑战', '随机词语', '创意激发'],
  },
  '/slot-machine': {
    title: '万万没想到 - 灵感老虎机，三个词语碰撞无限创意',
    description:
      '拉一下灵感老虎机，三个随机词语的碰撞激发意想不到的创意灵感。发现隐藏彩蛋组合，打开全新的思维空间。',
    keywords: ['灵感老虎机', '随机词语', '创意工具', '灵感激发'],
  },
  '/writing-challenge': {
    title: '万万没想到 - 文笔挑战，精炼你的文字表达力',
    description:
      '用最少的字描述最复杂的场景，锻炼文字精炼能力。挑战你的表达极限，提升写作技巧。',
    keywords: ['文笔挑战', '写作练习', '文字精炼', '表达力'],
  },
  '/inspiration': {
    title: '万万没想到 - 灵感源泉，AI生成不重样的创意灵感',
    description:
      '6大灵感领域，AI为你生成文学创作、项目开发、沟通表达、学术探索、生活创意、人际关系的独特灵感，每次都不重样。',
    keywords: ['灵感生成', 'AI创意', '文学灵感', '项目灵感', '沟通表达', '人际关系', '创意工具', '思维激发'],
  },
  '/inspiration/:domainId': {
    title: '万万没想到 - 灵感源泉，探索创意灵感',
    description:
      '选择你感兴趣的灵感领域，AI为你生成独特的创意灵感，火花、深潜、跨界碰撞三种模式。',
    keywords: ['灵感探索', 'AI灵感', '创意生成'],
  },
  '/logic-reasoning': {
    title: '万万没想到 - 逻辑推理游戏，海龟汤/谜语/猜数字',
    description:
      '海龟汤、谜语人、猜数字——多种推理游戏模式，在解谜中锻炼逻辑思维和逆向推理能力。',
    keywords: ['逻辑推理', '推理游戏', '海龟汤', '谜语', '猜数字', '逻辑思维'],
  },
  '/turtle-soup': {
    title: '万万没想到 - 海龟汤推理游戏，挑战你的逻辑思维',
    description:
      '通过是/否提问揭开谜题背后的真相，锻炼你的逆向推理和逻辑思维能力。多个难度等级，从入门到烧脑。',
    keywords: ['海龟汤', '推理游戏', '逻辑推理', '是/否提问', '谜题'],
  },
  '/logic-reasoning/riddle': {
    title: '万万没想到 - 谜语人游戏，破解层层谜题',
    description:
      '挑战各种趣味谜语和脑筋急转弯，锻炼联想思维和语言理解能力。从简单到烧脑，层层递进。',
    keywords: ['谜语', '脑筋急转弯', '猜谜', '联想思维'],
  },
  '/logic-reasoning/yes-or-no': {
    title: '万万没想到 - 是非题游戏，二选一的思维博弈',
    description:
      '看似简单的二选一问题背后，隐藏着深层的思维陷阱。训练你的判断力和决策思维。',
    keywords: ['是非题', '二选一', '思维博弈', '判断力'],
  },
  '/logic-reasoning/guess-number': {
    title: '万万没想到 - 猜数字游戏，逻辑缩小范围',
    description:
      '用最少的提问次数猜出目标数字，锻炼你的逻辑推理和区间缩小策略能力。',
    keywords: ['猜数字', '逻辑推理', '策略思维', '数字游戏'],
  },
  '/growth': {
    title: '万万没想到 - 成长追踪，看见你的思维在进化',
    description:
      '时间线记录每一次深度思考，统计你的思维偏好和成长轨迹。一个月后回看，你会惊讶于自己的变化。',
    keywords: ['成长追踪', '思维进化', '思考记录', '个人成长'],
    canonicalPath: '/growth',
  },
  '/checkin': {
    title: '万万没想到 - 每日打卡，让思考成为习惯',
    description:
      '每日签到打卡，养成深度思考的好习惯。连续打卡记录，见证你的坚持和成长。',
    keywords: ['每日打卡', '签到', '思考习惯', '连续打卡'],
  },
  '/tasks': {
    title: '万万没想到 - 任务中心，完成思维挑战赢取成就',
    description:
      '完成各种思维挑战任务，解锁成就徽章。让思考训练更有目标和动力。',
    keywords: ['任务中心', '思维挑战', '成就系统', '打卡任务'],
  },
  '/debate': {
    title: '万万没想到 - 辩论堂，多角度思考争议话题',
    description:
      '选择你的立场，从多角度深入思考争议话题。锻炼批判性思维和辩证思考能力。',
    keywords: ['辩论', '批判性思维', '辩证思考', '争议话题'],
  },
  '/roundtable/discuss': {
    title: '万万没想到 - 圆桌讨论进行中',
    description: '正在进行圆桌讨论，多视角深入探讨话题。',
    keywords: ['圆桌讨论', '思维碰撞'],
  },
  '/profile': {
    title: '万万没想到 - 个人中心',
    description: '管理你的个人资料、思考记录和偏好设置。',
    keywords: ['个人中心', '资料管理'],
    noindex: true,
  },
  '/favorites': {
    title: '万万没想到 - 我的收藏',
    description: '查看和管理你收藏的精选思考问题。',
    keywords: ['收藏', '精选问题'],
    noindex: true,
  },
  '/later': {
    title: '万万没想到 - 稍后阅读',
    description: '保存感兴趣的问题，稍后回来深入思考。',
    keywords: ['稍后阅读', '问题收藏'],
    noindex: true,
  },
  '/login': {
    title: '万万没想到 - 登录',
    description: '登录你的账号，同步思考记录。',
    keywords: ['登录', '账号'],
    noindex: true,
  },
};

/** Get a dynamic PageSEO for question pages */
export function getQuestionPageSEO(
  questionId: string,
  questionText?: string
): PageSEO {
  return {
    title: questionText
      ? `${questionText.slice(0, 30)}${questionText.length > 30 ? '...' : ''} - 万万没想到`
      : '万万没想到 - 深度思考问题',
    description: questionText
      ? `来思考这个问题：${questionText.slice(0, 80)}${questionText.length > 80 ? '...' : ''}。每天5分钟深度思考，锻炼你的思维能力。`
      : '每天5分钟深度思考，锻炼你的思维能力。',
    keywords: ['思考问题', '深度思考', '思维训练'],
    canonicalPath: `/question/${questionId}`,
  };
}

/** Get a dynamic PageSEO for collection detail pages */
export function getCollectionPageSEO(
  collectionId: string,
  collectionName?: string
): PageSEO {
  return {
    title: collectionName
      ? `${collectionName} - 万万没想到`
      : '万万没想到 - 收藏集详情',
    description: collectionName
      ? `查看收藏集「${collectionName}」中的精选问题。`
      : '查看收藏集中的精选问题。',
    keywords: ['收藏集', '精选问题'],
    noindex: true,
  };
}

/** Get a dynamic PageSEO for category list pages */
export function getCategoryPageSEO(
  categoryType: string,
  categoryName?: string
): PageSEO {
  return {
    title: categoryName
      ? `${categoryName} - 万万没想到`
      : '万万没想到 - 分类浏览',
    description: categoryName
      ? `浏览${categoryName}相关的精选思考问题。`
      : '按分类浏览思考问题。',
    keywords: [categoryName || '分类', '思考问题'],
  };
}
