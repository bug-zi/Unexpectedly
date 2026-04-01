/**
 * 思维维度类型
 */
export type ThinkingDimension =
  | 'hypothesis'    // 假设思维
  | 'reverse'       // 逆向思考
  | 'creative'      // 联想创意
  | 'reflection'    // 自我反思
  | 'future';       // 未来设想

/**
 * 生活场景类型
 */
export type LifeScenario =
  | 'career'        // 职业发展
  | 'creative'      // 创意激发
  | 'relationship'  // 人际关系
  | 'learning'      // 学习成长
  | 'philosophy';   // 生活哲学

/**
 * 主分类类型
 */
export type PrimaryCategory = 'thinking' | 'scenario' | 'random';

/**
 * 问题难度等级
 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/**
 * 情绪类型
 */
export type Mood = 'positive' | 'neutral' | 'negative';

/**
 * 思维深度类型
 */
export type Depth = 'shallow' | 'medium' | 'deep';

/**
 * 问题接口
 */
export interface Question {
  id: string;
  category: {
    primary: PrimaryCategory;
    secondary?: ThinkingDimension | LifeScenario;
  };
  content: string;
  difficulty: Difficulty;
  tags: string[];
  createdAt: Date;
  updatedAt?: Date;
  answerCount: number;
}

/**
 * 回答接口
 */
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  metadata: {
    wordCount: number;
    readingTime: number;      // 阅读时间(秒)
    writingTime: number;      // 写作时间(秒)
    mood?: Mood;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * 思维变化接口
 */
export interface ThoughtChange {
  keywordChanges: {
    added: string[];
    removed: string[];
    persistent: string[];
  };
  moodChange: {
    from: Mood;
    to: Mood;
    confidence: number;
  };
  depthChange: {
    from: Depth;
    to: Depth;
    evidence: string[];
  };
}

/**
 * 老虎机结果接口
 */
export interface SlotMachineResult {
  id: string;
  words: [string, string, string];
  userId: string;
  response?: string;
  easterEgg?: EasterEgg;
  createdAt: Date;
}

/**
 * 彩蛋接口
 */
export interface EasterEgg {
  type: 'combination' | 'triple' | 'semantic' | 'time';
  title: string;
  message: string;
  specialEffect?: 'glow' | 'confetti' | 'shake';
}

/**
 * 成就接口
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

/**
 * 用户进度接口
 */
export interface UserProgress {
  userId: string;
  stats: {
    totalAnswers: number;
    totalDays: number;
    currentStreak: number;
    longestStreak: number;
    slotMachinePlays: number;
  };
  categoryBreakdown: {
    [category: string]: {
      count: number;
      percentage: number;
      lastAnswered?: Date;
    };
  };
  achievements: Achievement[];
  unlockedFeatures: string[];
}

/**
 * 分类配置接口
 */
export interface CategoryConfig {
  id: string;
  name: string;
  icon: string; // emoji（向后兼容）
  iconName?: string; // Lucide组件名称
  color: string;
  light: string;
  dark: string;
}

/**
 * 海龟汤游戏记录接口
 */
export interface TurtleSoupRecord {
  id: string;
  puzzleId: string;
  puzzleTitle: string;
  difficulty: '简单' | '中等' | '困难';
  category: string;
  questionsAsked: number;
  hintsUsed: number;
  solved: boolean; // 是否查看真相
  completedAt: Date;
}

/**
 * 活动类型
 */
export type ActivityType = 'answer' | 'slotMachine' | 'turtleSoup';

/**
 * 统一的活动记录接口
 */
export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: Date;
  data: Answer | SlotMachineResult | TurtleSoupRecord;
}

/**
 * 导出格式类型
 */
export type ExportFormat = 'pdf' | 'markdown' | 'json';

// ===== 大咖圆桌相关类型 =====

/**
 * 大咖领域
 */
export type ThinkerDomain =
  | 'philosophy' | 'strategy' | 'business' | 'psychology'
  | 'science' | 'literature' | 'art' | 'economics'
  | 'politics' | 'technology' | 'religion' | 'education';

/**
 * 大咖/思想家
 */
export interface Thinker {
  id: string;
  name: string;
  nameEn: string;
  era: string;
  domain: ThinkerDomain[];
  avatar: string;
  color: string;
  systemPrompt: string;
  thinkingStyle: ThinkingDimension | LifeScenario;
  quote?: string;
}

/**
 * 圆桌消息
 */
export interface RoundtableMessage {
  id: string;
  role: 'user' | 'thinker' | 'system';
  thinkerId?: string;
  content: string;
  round?: number;
  createdAt: Date;
}

/**
 * 圆桌会话
 */
export interface RoundtableSession {
  id: string;
  questionId: string;
  userId: string;
  thinkers: string[];
  messages: RoundtableMessage[];
  rounds: number;
  summary?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

/**
 * LLM 提供商
 */
export type LLMProvider = 'deepseek' | 'qwen' | 'glm' | 'kimi' | 'doubao';

/**
 * LLM 配置
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

/**
 * LLM 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
