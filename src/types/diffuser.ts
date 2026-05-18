/**
 * 灵感扩散器 - 类型定义
 */

/** 笔记本中的单条笔记 */
export interface DiffuserNote {
  id: string;
  content: string;
  /** 'user' 手动撰写, 'ai' AI 生成建议 */
  source: 'user' | 'ai';
  createdAt: string;
}

/** 画布上的词语气泡节点 */
export interface DiffuserNode {
  id: string;
  word: string;
  /** 父节点ID，根节点为 null */
  parentId: string | null;
  /** 画布绝对坐标 */
  x: number;
  y: number;
  /** 是否已展开（子节点已生成） */
  isExpanded: boolean;
  /** AI 正在生成子节点 */
  isLoading: boolean;
  /**
   * 词语等级：
   * 1 - 用户手动输入的根词语
   * 2 - 三级词语被用户点击扩散后升级
   * 3 - AI 自动生成的词语（默认）
   */
  level: 1 | 2 | 3;
  createdAt: string;
  /** 笔记本 - 该词语的思考笔记 */
  notes?: DiffuserNote[];
  /** 如果此节点是反应产物，记录反应来源 */
  reactionFrom?: { wordA: string; wordB: string };
}

/** 气泡之间的连接线 */
export interface DiffuserEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'parent-child' | 'ai-suggested';
  /** 关联关系描述 */
  relation?: string;
}

/** AI 生成的关联词 */
export interface DiffuserWord {
  word: string;
  relation: string;
  /** 与父词的相关性 0.8~1.0，越大越相关 */
  relevance: number;
}

/** 词语碰撞反应结果中的单条创意 */
export interface DiffuserReactionResult {
  id: string;
  content: string;
  /** 故事灵感、奇妙比喻、深思问题、新奇视角、融合概念、有趣场景 */
  type: string;
  adopted: boolean;
}

/** 词语碰撞反应记录 */
export interface DiffuserReaction {
  id: string;
  sourceWordA: string;
  sourceWordB: string;
  nodeIdA: string;
  nodeIdB: string;
  /** AI 生成的创意结果 */
  results: DiffuserReactionResult[];
  createdAt: string;
}
