import { Question, Thinker, ThinkingDimension, LifeScenario } from '@/types';
import { THINKERS } from '@/constants/thinkers';

/**
 * 问题-大咖智能匹配算法
 *
 * 匹配因素：
 * 1. 思维维度/场景直接匹配 (权重最高)
 * 2. 标签交集匹配
 * 3. 难度匹配（高难度推荐更深层的思想家）
 * 4. 领域多样性（推荐结果尽量跨领域）
 */

interface MatchScore {
  thinker: Thinker;
  score: number;
  reasons: string[];
}

export function matchThinkers(question: Question, count: number = 8): Thinker[] {
  const scores = THINKERS.map(thinker => calculateScore(question, thinker));

  // 按分数排序
  scores.sort((a, b) => b.score - a.score);

  // 选择 top 结果，保证领域多样性
  const selected: Thinker[] = [];
  const usedDomains = new Set<string>();

  // 第一轮：按分数顺序选择，优先不同领域
  for (const { thinker } of scores) {
    if (selected.length >= count) break;

    const hasNewDomain = thinker.domain.some(d => !usedDomains.has(d));
    if (hasNewDomain || selected.length >= count - 2) {
      selected.push(thinker);
      thinker.domain.forEach(d => usedDomains.add(d));
    }
  }

  // 如果还不够，补充剩余高分
  if (selected.length < count) {
    for (const { thinker } of scores) {
      if (selected.length >= count) break;
      if (!selected.find(t => t.id === thinker.id)) {
        selected.push(thinker);
      }
    }
  }

  return selected;
}

function calculateScore(question: Question, thinker: Thinker): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. 思维维度/场景直接匹配 (权重 50)
  if (question.category.secondary === thinker.thinkingStyle) {
    score += 50;
    reasons.push('分类匹配');
  }

  // 2. 标签交集匹配 (权重 20 per tag)
  const questionTags = question.tags || [];
  const thinkerDomains = thinker.domain;
  for (const tag of questionTags) {
    if (thinkerDomains.includes(tag as Thinker['domain'][number])) {
      score += 20;
      reasons.push(`标签匹配: ${tag}`);
    }
    // 也检查名字关键词
    if (thinker.name.includes(tag) || thinker.nameEn.toLowerCase().includes(tag.toLowerCase())) {
      score += 15;
      reasons.push(`关键词匹配`);
    }
  }

  // 3. 难度匹配 (高难度推荐更深层的大咖)
  if (question.difficulty >= 4) {
    const deepThinkers = ['socrates', 'nietzsche', 'jung', 'aurelius', 'laozi', 'zhuangzi', 'schopenhauer'];
    if (deepThinkers.includes(thinker.id)) {
      score += 15;
      reasons.push('深度匹配');
    }
  }

  // 4. 小随机扰动，避免每次推荐完全一样
  score += Math.random() * 5;

  return { thinker, score, reasons };
}

/**
 * 为指定思维维度获取推荐组合
 */
export function getRecommendedLineup(
  style: ThinkingDimension | LifeScenario
): Thinker[] {
  const matched = THINKERS.filter(t => t.thinkingStyle === style);
  // 取前 5 个，确保不重复
  return matched.slice(0, 5);
}

/**
 * 获取预设的经典圆桌组合
 */
export function getClassicLineups(): { name: string; description: string; thinkers: string[] }[] {
  return [
    {
      name: '东西方哲学碰撞',
      description: '苏格拉底 vs 孔子 vs 老子 vs 尼采 vs 释迦牟尼',
      thinkers: ['socrates', 'confucius', 'laozi', 'nietzsche', 'buddha'],
    },
    {
      name: '创新者的对话',
      description: '达芬奇 vs 乔布斯 vs 爱迪生 vs 毕加索 vs 宫崎骏',
      thinkers: ['davinci', 'jobs', 'edison', 'picasso', 'stevejobs_creative'],
    },
    {
      name: '思维模型大师',
      description: '芒格 vs 卡尼曼 vs 费曼 vs 爱因斯坦 vs 马斯克',
      thinkers: ['munger', 'kahneman', 'feynman', 'einstein', 'musk'],
    },
    {
      name: '人生导师天团',
      description: '孔子 vs 奥勒留 vs 弗兰克尔 vs 稻盛和夫 vs 叔本华',
      thinkers: ['confucius', 'aurelius', 'frankl', 'inamori', 'schopenhauer'],
    },
    {
      name: '未来预言家',
      description: '库兹韦尔 vs 凯文凯利 vs 马斯克 vs 特斯拉 vs 费曼',
      thinkers: ['kurzweil', 'kevin_kelly', 'musk', 'tesla', 'feynman'],
    },
    {
      name: '管理大师智慧',
      description: '德鲁克 vs 稻盛和夫 vs 富兰克林 vs 芒格 vs 卡耐基',
      thinkers: ['drucker', 'inamori', 'franklin', 'munger', 'carnegie'],
    },
  ];
}
