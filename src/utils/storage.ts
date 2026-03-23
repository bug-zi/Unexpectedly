import { Answer, SlotMachineResult, UserProgress } from '@/types';

const STORAGE_KEYS = {
  ANSWERS: 'wwx-answers',
  SLOT_MACHINE: 'wwx-slot-machine',
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
