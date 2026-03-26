import { Answer, SlotMachineResult, UserProgress, TurtleSoupRecord } from '@/types';

const STORAGE_KEYS = {
  ANSWERS: 'wwx-answers',
  SLOT_MACHINE: 'wwx-slot-machine',
  TURTLE_SOUP: 'wwx-turtle-soup',
  RIDDLE: 'wwx-riddle',
  YES_OR_NO: 'wwx-yes-or-no',
  GUESS_NUMBER: 'wwx-guess-number',
  PROGRESS: 'wwx-progress',
} as const;

/**
 * 保存回答到本地存储
 */
export function saveAnswer(answer: Answer): void {
  const answers = getAnswers();
  answers.push(answer);
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
}

/**
 * 获取所有回答
 */
export function getAnswers(): Answer[] {
  const data = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  if (!data) return [];

  try {
    const answers = JSON.parse(data);
    return answers.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * 根据问题ID获取回答
 */
export function getAnswersByQuestionId(questionId: string): Answer[] {
  const answers = getAnswers();
  return answers.filter((a) => a.questionId === questionId);
}

/**
 * 更新回答
 */
export function updateAnswer(answerId: string, updates: Partial<Omit<Answer, 'id' | 'questionId' | 'userId' | 'createdAt'>>): void {
  const answers = getAnswers();
  const index = answers.findIndex((a) => a.id === answerId);

  if (index !== -1) {
    answers[index] = {
      ...answers[index],
      ...updates,
      updatedAt: new Date(),
    };
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  }
}

/**
 * 删除回答
 */
export function deleteAnswer(answerId: string): void {
  const answers = getAnswers();
  const filteredAnswers = answers.filter((a) => a.id !== answerId);
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(filteredAnswers));
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
 * 保存老虎机结果
 */
export function saveSlotMachineResult(result: SlotMachineResult): void {
  const results = getSlotMachineResults();
  results.push(result);
  localStorage.setItem(STORAGE_KEYS.SLOT_MACHINE, JSON.stringify(results));
}

/**
 * 获取所有老虎机结果
 */
export function getSlotMachineResults(): SlotMachineResult[] {
  const data = localStorage.getItem(STORAGE_KEYS.SLOT_MACHINE);
  if (!data) return [];

  try {
    const results = JSON.parse(data);
    return results.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * 保存海龟汤游戏记录
 */
export function saveTurtleSoupRecord(record: TurtleSoupRecord): void {
  const records = getTurtleSoupRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.TURTLE_SOUP, JSON.stringify(records));
}

/**
 * 获取所有海龟汤游戏记录
 */
export function getTurtleSoupRecords(): TurtleSoupRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.TURTLE_SOUP);
  if (!data) return [];

  try {
    const records = JSON.parse(data);
    return records.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * 保存谜语人游戏记录
 */
export function saveRiddleRecord(record: any): void {
  const records = getRiddleRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.RIDDLE, JSON.stringify(records));
}

/**
 * 获取所有谜语人游戏记录
 */
export function getRiddleRecords(): any[] {
  const data = localStorage.getItem(STORAGE_KEYS.RIDDLE);
  if (!data) return [];

  try {
    const records = JSON.parse(data);
    return records.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * 保存Yes or No游戏记录
 */
export function saveYesOrNoRecord(record: any): void {
  const records = getYesOrNoRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.YES_OR_NO, JSON.stringify(records));
}

/**
 * 获取所有Yes or No游戏记录
 */
export function getYesOrNoRecords(): any[] {
  const data = localStorage.getItem(STORAGE_KEYS.YES_OR_NO);
  if (!data) return [];

  try {
    const records = JSON.parse(data);
    return records.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * 保存猜数字游戏记录
 */
export function saveGuessNumberRecord(record: any): void {
  const records = getGuessNumberRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.GUESS_NUMBER, JSON.stringify(records));
}

/**
 * 获取所有猜数字游戏记录
 */
export function getGuessNumberRecords(): any[] {
  const data = localStorage.getItem(STORAGE_KEYS.GUESS_NUMBER);
  if (!data) return [];

  try {
    const records = JSON.parse(data);
    return records.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * 保存用户进度
 */
export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

/**
 * 获取用户进度
 */
export function getProgress(): UserProgress | null {
  const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
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
 * 清除所有数据
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * 导出数据为JSON
 */
export function exportDataAsJSON(): string {
  const data = {
    answers: getAnswers(),
    slotMachineResults: getSlotMachineResults(),
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
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(data.answers));
    }

    if (data.slotMachineResults) {
      localStorage.setItem(
        STORAGE_KEYS.SLOT_MACHINE,
        JSON.stringify(data.slotMachineResults)
      );
    }

    if (data.progress) {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
    }

    return true;
  } catch {
    return false;
  }
}
