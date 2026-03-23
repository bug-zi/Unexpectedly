/**
 * 问题收藏夹与主题集合功能
 * 类型定义
 */

// ==================== 核心类型 ====================

/**
 * 问题收藏项
 */
export interface FavoriteItem {
  id: string;
  questionId: string;
  userId: string;
  collectionId?: string | null;
  notes?: string | null;
  tags?: string[];
  isAnswered: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 主题集合
 */
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  icon?: string;
  color?: string;
  coverImage?: string | null;

  // 问题相关
  questions: string[];
  questionCount: number;
  answeredCount: number;
  progress: number;

  // 时间追踪
  lastAnsweredAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;

  // 提醒设置
  reminderEnabled?: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'custom' | null;
  reminderTime?: string | null;

  // 社交设置
  isPublic: boolean;
  isTemplate: boolean;
  forkCount?: number;

  // 元数据
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 集合模板
 */
export interface CollectionTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;

  // 问题配置
  questions: Array<{
    questionId: string;
    order: number;
  }>;
  questionCount: number;

  // 分类
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;

  // 使用数据
  useCount?: number;
  rating?: number;
  ratingCount?: number;

  // 元数据
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 统计与分析 ====================

/**
 * 集合进度统计
 */
export interface CollectionProgress {
  collectionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  progress: number;

  // 时间维度
  startedAt?: Date | null;
  completedAt?: Date | null;
  timeSpent: number; // 总用时（分钟）

  // 回答质量
  totalWords: number;
  averageWordsPerAnswer: number;

  // 活跃度
  currentStreak: number; // 连续回答天数
  longestStreak: number;
  lastActiveAt: Date;
}

/**
 * 集合分析报告
 */
export interface CollectionReport {
  collectionId: string;
  collectionName: string;
  generatedAt: Date;

  // 时间范围
  timeRange: {
    start: Date;
    end: Date;
  };

  // 内容统计
  questionsAnswered: number;
  totalWordsWritten: number;
  averageAnswerLength: number;

  // 主题洞察
  topKeywords: Array<{
    word: string;
    count: number;
  }>;

  // 思维维度分布
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;

  // 成长轨迹
  answerTimeline: Array<{
    questionId: string;
    answeredAt: Date;
    wordCount: number;
  }>;
}

// ==================== 表单类型 ====================

/**
 * 创建集合表单数据
 */
export interface CreateCollectionFormData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questions?: string[];
}

/**
 * 更新集合表单数据
 */
export interface UpdateCollectionFormData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  questions?: string[];
  reminderEnabled?: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'custom';
  reminderTime?: string;
  isPublic?: boolean;
}

/**
 * 收藏操作数据
 */
export interface FavoriteData {
  questionId: string;
  collectionId?: string;
  notes?: string;
  tags?: string[];
}

// ==================== 过滤与排序 ====================

/**
 * 集合筛选选项
 */
export interface CollectionFilters {
  status?: 'all' | 'active' | 'completed' | 'not_started';
  sortBy?: 'updated_at' | 'created_at' | 'name' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 收藏筛选选项
 */
export interface FavoriteFilters {
  isAnswered?: boolean;
  collectionId?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

// ==================== API 响应类型 ====================

/**
 * 集合详情响应（包含问题信息）
 */
export interface CollectionDetail extends Collection {
  questionsData?: Array<{
    id: string;
    question: any; // Question 类型
    isAnswered: boolean;
    answeredAt?: Date;
  }>;
}

/**
 * 收藏统计响应
 */
export interface FavoriteStats {
  totalFavorites: number;
  answeredFavorites: number;
  pendingFavorites: number; // 未回答的收藏数量
  collectionsCount: number;
}

// ==================== 辅助类型 ====================

/**
 * 集合卡片展示数据
 */
export interface CollectionCardData {
  collection: Collection;
  progress?: CollectionProgress;
  lastQuestion?: {
    id: string;
    content: string;
  };
}


// 预设图标列表
export const COLLECTION_ICONS = [
  '📁', '💼', '💡', '🎯', '🌱', '💑', '✨', '🔥',
  '📚', '🚀', '💎', '🎨', '🔮', '🌍', '⭐', '💪',
  '🎓', '🏆', '💖', '🎭', '🎪', '🎢', '🌈', '🎁'
];

// 预设颜色列表
export const COLLECTION_COLORS = [
  '#8B5CF6', // 紫色
  '#3B82F6', // 蓝色
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#EF4444', // 红色
  '#EC4899', // 粉色
  '#14B8A6', // 青色
  '#6366F1', // 靛青
];

// 集合分类
export const COLLECTION_CATEGORIES = [
  { value: 'life', label: '生活探索', icon: '🌍' },
  { value: 'career', label: '职业发展', icon: '💼' },
  { value: 'relationship', label: '关系思考', icon: '💑' },
  { value: 'growth', label: '个人成长', icon: '🌱' },
  { value: 'creative', label: '创意激发', icon: '💡' },
  { value: 'philosophy', label: '哲学思辨', icon: '🔮' },
  { value: 'emotion', label: '情绪觉察', icon: '💭' },
  { value: 'decision', label: '决策辅助', icon: '🎯' },
];

// 集合难度
export const COLLECTION_DIFFICULTIES = [
  { value: 'beginner', label: '入门', stars: 1 },
  { value: 'intermediate', label: '中级', stars: 2 },
  { value: 'advanced', label: '高级', stars: 3 },
];
