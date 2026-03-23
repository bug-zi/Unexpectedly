import { Mood, Depth } from '@/types';

/**
 * 简单的关键词提取
 * 使用中文分词的简化版本
 */
export function extractKeywords(text: string): string[] {
  // 移除标点符号和空格
  const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

  // 简单的2-3字词提取
  const words: string[] = [];
  for (let i = 0; i < cleanText.length - 1; i++) {
    // 提取2字词
    if (i < cleanText.length - 1) {
      words.push(cleanText.substring(i, i + 2));
    }
    // 提取3字词
    if (i < cleanText.length - 2) {
      words.push(cleanText.substring(i, i + 3));
    }
  }

  // 统计词频
  const wordCount: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length >= 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  // 过滤停用词
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就',
    '不', '人', '都', '一', '一个', '上', '也', '很',
    '到', '说', '要', '去', '你', '会', '着', '没有',
    '看', '好', '自己', '这',
  ]);

  const filteredWords = Object.entries(wordCount)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return filteredWords;
}

/**
 * 简单的情绪分析
 */
export function analyzeMood(text: string): Mood {
  const positiveWords = [
    '开心', '快乐', '幸福', '满足', '成功', '喜欢', '爱',
    '希望', '期待', '兴奋', '骄傲', '自豪', '感谢', '感激',
    '快乐', '愉快', '欣慰', '喜悦', '乐观', '积极',
  ];

  const negativeWords = [
    '难过', '悲伤', '痛苦', '失望', '沮丧', '愤怒', '恨',
    '害怕', '恐惧', '焦虑', '担心', '烦恼', '痛苦', '绝望',
    '消极', '悲观', '遗憾', '后悔', '伤心', '痛苦',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (text.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (text.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * 分析思维深度
 */
export function analyzeDepth(text: string): Depth {
  const wordCount = text.length;

  // 简单的字数判断
  if (wordCount < 50) return 'shallow';
  if (wordCount < 150) return 'medium';
  return 'deep';
}

/**
 * 收集思维变化证据
 */
export function collectEvidence(oldText: string, newText: string): string[] {
  const evidences: string[] = [];

  const oldKeywords = extractKeywords(oldText);
  const newKeywords = extractKeywords(newText);

  const added = newKeywords.filter((k) => !oldKeywords.includes(k));
  const removed = oldKeywords.filter((k) => !newKeywords.includes(k));

  if (added.length > 0) {
    evidences.push(`新增关键词: ${added.slice(0, 3).join(', ')}`);
  }

  if (removed.length > 0) {
    evidences.push(`消失关键词: ${removed.slice(0, 3).join(', ')}`);
  }

  if (newText.length > oldText.length * 1.5) {
    evidences.push('思考更加深入和详细');
  } else if (newText.length < oldText.length * 0.7) {
    evidences.push('思考更加简洁');
  }

  return evidences;
}

/**
 * 计算置信度
 */
export function calculateConfidence(text1: string, text2: string): number {
  const lengthDiff = Math.abs(text1.length - text2.length);
  const avgLength = (text1.length + text2.length) / 2;
  const diffRatio = lengthDiff / avgLength;

  // 文本差异越大，置信度越低
  return Math.max(0, 1 - diffRatio);
}

/**
 * 计算阅读时间（秒）
 */
export function calculateReadingTime(text: string): number {
  // 中文平均阅读速度：300字/分钟
  const charsPerSecond = 5;
  return Math.ceil(text.length / charsPerSecond);
}

/**
 * 计算字数
 */
export function calculateWordCount(text: string): number {
  return text.replace(/\s/g, '').length;
}
