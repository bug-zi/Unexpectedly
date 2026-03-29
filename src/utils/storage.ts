/**
 * 本地存储工具（支持用户数据隔离）
 * 所有数据都会根据当前登录用户进行隔离存储
 *
 * 存储策略：
 * - 登录用户：优先使用本地存储，可手动同步到云端
 * - 游客用户：始终使用本地存储
 */

import { Answer, SlotMachineResult, UserProgress, TurtleSoupRecord } from '@/types';
import { getCurrentUserId, getUserStorageKey, setUserData, removeUserData, getUserDataSync } from '@/utils/userStorage';

const STORAGE_KEYS = {
  ANSWERS: 'wwx-answers',
  SLOT_MACHINE: 'wwx-slot-machine',
  TURTLE_SOUP: 'wwx-turtle-soup',
  RIDDLE: 'wwx-riddle',
  YES_OR_NO: 'wwx-yes-or-no',
  GUESS_NUMBER: 'wwx-guess-number',
  PROGRESS: 'wwx-progress',
  FAVORITES: 'wwx-favorites',
  LATER: 'wwx-later',
  COLLECTIONS: 'wwx-collections',
} as const;

/**
 * 获取本地数据（同步，直接从 localStorage 读取）
 */
function getLocalData<T>(key: string, defaultValue: T): T {
  const userKey = getUserStorageKey(key);
  const data = localStorage.getItem(userKey);
  if (!data) return defaultValue;

  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 保存回答到本地存储
 */
export function saveAnswer(answer: Answer): void {
  const answers = getAnswers();
  answers.push(answer);
  setUserData(STORAGE_KEYS.ANSWERS, answers);
}

/**
 * 获取所有回答
 */
export function getAnswers(): Answer[] {
  const data = getLocalData<Answer[]>(STORAGE_KEYS.ANSWERS, []);
  return data.map((a: any) => ({
    ...a,
    createdAt: new Date(a.createdAt),
    updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
  }));
}

/**
 * 获取最近的回答（7天内）
 */
export function getRecentAnswers(days: number = 7): Answer[] {
  const answers = getAnswers();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return answers.filter((a) => new Date(a.createdAt) >= cutoffDate);
}

/**
 * 删除回答
 */
export function deleteAnswer(answerId: string): void {
  const answers = getAnswers();
  const filteredAnswers = answers.filter((a) => a.id !== answerId);
  setUserData(STORAGE_KEYS.ANSWERS, filteredAnswers);
}

/**
 * 更新回答
 */
export function updateAnswer(answerId: string, updates: Partial<Answer>): void {
  const answers = getAnswers();
  const index = answers.findIndex((a) => a.id === answerId);
  if (index !== -1) {
    answers[index] = {
      ...answers[index],
      ...updates,
      updatedAt: new Date(),
    };
    setUserData(STORAGE_KEYS.ANSWERS, answers);
  }
}

/**
 * 保存老虎机结果
 */
export function saveSlotMachineResult(result: SlotMachineResult): void {
  const results = getSlotMachineResults();
  results.push(result);
  setUserData(STORAGE_KEYS.SLOT_MACHINE, results);
}

/**
 * 获取所有老虎机结果
 */
export function getSlotMachineResults(): SlotMachineResult[] {
  const data = getUserDataSync<SlotMachineResult[]>(STORAGE_KEYS.SLOT_MACHINE, []);

  return data.map((r: any) => ({
    ...r,
    createdAt: new Date(r.createdAt),
  }));
}

/**
 * 保存海龟汤游戏记录
 */
export function saveTurtleSoupRecord(record: TurtleSoupRecord): void {
  const records = getTurtleSoupRecords();
  records.push(record);
  setUserData(STORAGE_KEYS.TURTLE_SOUP, records);
}

/**
 * 获取所有海龟汤游戏记录
 */
export function getTurtleSoupRecords(): TurtleSoupRecord[] {
  const data = getUserDataSync<TurtleSoupRecord[]>(STORAGE_KEYS.TURTLE_SOUP, []);

  return data.map((r: any) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
}

/**
 * 保存谜语人游戏记录
 */
export function saveRiddleRecord(record: any): void {
  const records = getRiddleRecords();
  records.push(record);
  setUserData(STORAGE_KEYS.RIDDLE, records);
}

/**
 * 获取所有谜语人游戏记录
 */
export function getRiddleRecords(): any[] {
  const data = getUserDataSync<any[]>(STORAGE_KEYS.RIDDLE, []);

  return data.map((r: any) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
}

/**
 * 保存Yes or No游戏记录
 */
export function saveYesOrNoRecord(record: any): void {
  const records = getYesOrNoRecords();
  records.push(record);
  setUserData(STORAGE_KEYS.YES_OR_NO, records);
}

/**
 * 获取所有Yes or No游戏记录
 */
export function getYesOrNoRecords(): any[] {
  const data = getUserDataSync<any[]>(STORAGE_KEYS.YES_OR_NO, []);

  return data.map((r: any) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
}

/**
 * 保存猜数字游戏记录
 */
export function saveGuessNumberRecord(record: any): void {
  const records = getGuessNumberRecords();
  records.push(record);
  setUserData(STORAGE_KEYS.GUESS_NUMBER, records);
}

/**
 * 获取所有猜数字游戏记录
 */
export function getGuessNumberRecords(): any[] {
  const data = getUserDataSync<any[]>(STORAGE_KEYS.GUESS_NUMBER, []);

  return data.map((r: any) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
}

/**
 * 保存用户进度
 */
export function saveProgress(progress: UserProgress): void {
  setUserData(STORAGE_KEYS.PROGRESS, progress);
}

/**
 * 获取用户进度
 */
export function getProgress(): UserProgress | null {
  return getUserDataSync<UserProgress | null>(STORAGE_KEYS.PROGRESS, null);
}

/**
 * 更新用户进度
 */
export function updateProgress(updates: Partial<UserProgress>): void {
  const currentProgress = getProgress();
  const newProgress = {
    ...currentProgress,
    ...updates,
  } as UserProgress;
  saveProgress(newProgress);
}

/**
 * 清除当前用户的所有数据
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeUserData(key);
  });
}

/**
 * 清除当前登录用户的所有数据（包括用户标识）
 * 用于登出时清理
 */
export function clearCurrentUserAllData(): void {
  clearCurrentUserData();
}

/**
 * 导出数据为JSON
 */
export function exportDataAsJSON(): string {
  const data = {
    answers: getAnswers(),
    slotMachineResults: getSlotMachineResults(),
    turtleSoup: getTurtleSoupRecords(),
    riddles: getRiddleRecords(),
    yesOrNo: getYesOrNoRecords(),
    guessNumber: getGuessNumberRecords(),
    progress: getProgress(),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * 导入数据
 */
export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.answers) {
      setUserData(STORAGE_KEYS.ANSWERS, data.answers);
    }

    if (data.slotMachineResults) {
      setUserData(STORAGE_KEYS.SLOT_MACHINE, data.slotMachineResults);
    }

    if (data.turtleSoup) {
      setUserData(STORAGE_KEYS.TURTLE_SOUP, data.turtleSoup);
    }

    if (data.riddles) {
      setUserData(STORAGE_KEYS.RIDDLE, data.riddles);
    }

    if (data.yesOrNo) {
      setUserData(STORAGE_KEYS.YES_OR_NO, data.yesOrNo);
    }

    if (data.guessNumber) {
      setUserData(STORAGE_KEYS.GUESS_NUMBER, data.guessNumber);
    }

    if (data.progress) {
      setUserData(STORAGE_KEYS.PROGRESS, data.progress);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 获取收藏的问题ID列表
 */
export function getFavoriteQuestionIds(): string[] {
  return getUserDataSync<string[]>(STORAGE_KEYS.FAVORITES, []);
}

/**
 * 保存收藏的问题ID列表
 */
export function saveFavoriteQuestionIds(ids: string[]): void {
  setUserData(STORAGE_KEYS.FAVORITES, ids);
}

/**
 * 添加收藏
 */
export function addFavorite(questionId: string): void {
  const favorites = getFavoriteQuestionIds();
  if (!favorites.includes(questionId)) {
    favorites.push(questionId);
    saveFavoriteQuestionIds(favorites);
  }
}

/**
 * 移除收藏
 */
export function removeFavorite(questionId: string): void {
  const favorites = getFavoriteQuestionIds();
  const filtered = favorites.filter((id) => id !== questionId);
  saveFavoriteQuestionIds(filtered);
}

/**
 * 获取"稍后阅读"的问题ID列表
 */
export function getLaterQuestionIds(): string[] {
  return getUserDataSync<string[]>(STORAGE_KEYS.LATER, []);
}

/**
 * 保存"稍后阅读"的问题ID列表
 */
export function saveLaterQuestionIds(ids: string[]): void {
  setUserData(STORAGE_KEYS.LATER, ids);
}

/**
 * 添加到稍后阅读
 */
export function addLater(questionId: string): void {
  const later = getLaterQuestionIds();
  if (!later.includes(questionId)) {
    later.push(questionId);
    saveLaterQuestionIds(later);
  }
}

/**
 * 从稍后阅读移除
 */
export function removeLater(questionId: string): void {
  const later = getLaterQuestionIds();
  const filtered = later.filter((id) => id !== questionId);
  saveLaterQuestionIds(filtered);
}

/**
 * 获取收藏夹列表
 */
export function getCollections(): any[] {
  return getUserDataSync<any[]>(STORAGE_KEYS.COLLECTIONS, []);
}

/**
 * 保存收藏夹列表
 */
export function saveCollections(collections: any[]): void {
  setUserData(STORAGE_KEYS.COLLECTIONS, collections);
}

// 重新导出用户存储工具函数
export { getUserData, getUserDataSync, setUserData, removeUserData } from '@/utils/userStorage';
