/**
 * 灵感风暴引擎 - 碰撞选词与种子选择算法
 */

import type { DiffuserWord } from '@/types/diffuser';

/**
 * 从扩展词中选择最多样化的N个词（不同relation标签优先）
 */
export function selectDiverseWords(
  words: DiffuserWord[],
  count: number
): DiffuserWord[] {
  if (words.length <= count) return words;

  // 按relation分组
  const byRelation = new Map<string, DiffuserWord[]>();
  for (const w of words) {
    const list = byRelation.get(w.relation) || [];
    list.push(w);
    byRelation.set(w.relation, list);
  }

  const selected: DiffuserWord[] = [];
  const relationKeys = Array.from(byRelation.keys());

  // 每轮从不同relation中各取一个
  let round = 0;
  while (selected.length < count) {
    for (const key of relationKeys) {
      if (selected.length >= count) break;
      const group = byRelation.get(key) || [];
      if (round < group.length) {
        selected.push(group[round]);
      }
    }
    round++;
    if (round > 10) break; // 安全退出
  }

  return selected.slice(0, count);
}

/**
 * 生成碰撞组合（2-3个词一组）
 * 从不同语义簇选词，避免重复
 */
export function selectCollisionGroups(
  allWords: string[],
  existingCollisions: Set<string>,
  maxGroups: number = 4
): string[][] {
  if (allWords.length < 2) return [];

  const groups: string[][] = [];

  // 两两碰撞：均匀取词
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 1 && groups.length < maxGroups; i += 2) {
    const pair = [shuffled[i], shuffled[i + 1]].sort();
    const key = pair.join('|');
    if (!existingCollisions.has(key)) {
      groups.push(pair);
    }
  }

  // 如果词数够多，加一个三词碰撞
  if (allWords.length >= 6 && groups.length < maxGroups) {
    const trio = allWords.slice(0, 3).sort();
    const key = trio.join('|');
    if (!existingCollisions.has(key)) {
      groups.push(trio);
    }
  }

  return groups;
}

/**
 * 生成碰撞key（用于去重）
 */
export function makeCollisionKey(words: string[]): string {
  return [...words].sort().join('|');
}

/**
 * 从收纳盒中选最高分点子的关键词作为下一轮种子
 */
export function selectSeedFromCollection(
  collectionBox: Array<{ ideaText: string; scores: { average: number } }>,
  extractedKeywords: string[]
): string {
  if (extractedKeywords.length > 0) return extractedKeywords[0];

  if (collectionBox.length > 0) {
    const top = [...collectionBox].sort(
      (a, b) => b.scores.average - a.scores.average
    )[0];
    // 从点子文本中取第一个有意义的词
    const firstWord = top.ideaText.split(/[，。、！？\s]+/)[0];
    if (firstWord && firstWord.length <= 8) return firstWord;
  }

  // 最终兜底：随机返回
  return '';
}
