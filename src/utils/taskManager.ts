/**
 * 任务管理工具
 */

import { DAILY_TASKS_CONFIG, WEEKLY_TASKS_CONFIG, TaskProgress } from '@/types/tasks';
import { getUserStorageKey } from '@/utils/userStorage';

const TASK_PROGRESS_KEY = 'wanwan-task-progress';
const TASK_COMPLETED_DAYS_KEY = 'wanwan-task-completed-days';

// 同步标记 key，与 userStorage.ts 中的保持一致
const SYNCED_KEYS_KEY = 'wwx-synced-keys';

// 缓存找到的存储键，避免重复扫描
let cachedTaskKey: string | null = null;
let cachedCompletedDaysKey: string | null = null;

/**
 * 将旧 key 的数据迁移到当前用户的 key
 * 确保数据始终存储在 user-{userId}- 前缀下，以便云端同步能识别
 */
function migrateToCurrentKey(baseKey: string, oldKey: string): string {
  const currentKey = getUserStorageKey(baseKey);
  if (oldKey === currentKey) return currentKey;

  const data = localStorage.getItem(oldKey);
  if (data) {
    // 合并：如果当前 key 已有数据，以更完整的数据为准
    const existingData = localStorage.getItem(currentKey);
    let useData = data;
    if (existingData) {
      try {
        const oldParsed = Object.keys(JSON.parse(data)).length;
        const curParsed = Object.keys(JSON.parse(existingData)).length;
        useData = oldParsed >= curParsed ? data : existingData;
      } catch { /* use old data */ }
    }
    localStorage.setItem(currentKey, useData);
    localStorage.removeItem(oldKey);
    console.log(`🔄 迁移任务数据: ${oldKey} -> ${currentKey}`);
  }
  return currentKey;
}

/**
 * 获取当前应使用的任务进度存储键
 * 始终返回当前用户的 key，如有旧数据自动迁移
 */
function getTaskProgressKey(): string {
  const currentKey = getUserStorageKey(TASK_PROGRESS_KEY);
  // 缓存命中
  if (cachedTaskKey === currentKey) return cachedTaskKey;

  // 当前键有数据，直接用
  if (localStorage.getItem(currentKey)) {
    cachedTaskKey = currentKey;
    return currentKey;
  }

  // 当前键无数据，扫描旧 key 并迁移
  const suffix = '-' + TASK_PROGRESS_KEY;
  for (const key of Object.keys(localStorage)) {
    if (key.endsWith(suffix) && key !== currentKey) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            cachedTaskKey = migrateToCurrentKey(TASK_PROGRESS_KEY, key);
            return cachedTaskKey;
          }
        } catch { /* ignore */ }
      }
    }
  }

  cachedTaskKey = currentKey;
  return currentKey;
}

function getCompletedDaysKey(): string {
  const currentKey = getUserStorageKey(TASK_COMPLETED_DAYS_KEY);
  if (cachedCompletedDaysKey === currentKey) return cachedCompletedDaysKey;

  if (localStorage.getItem(currentKey)) {
    cachedCompletedDaysKey = currentKey;
    return currentKey;
  }

  const suffix = '-' + TASK_COMPLETED_DAYS_KEY;
  for (const key of Object.keys(localStorage)) {
    if (key.endsWith(suffix) && key !== currentKey) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedCompletedDaysKey = migrateToCurrentKey(TASK_COMPLETED_DAYS_KEY, key);
            return cachedCompletedDaysKey;
          }
        } catch { /* ignore */ }
      }
    }
  }

  cachedCompletedDaysKey = currentKey;
  return currentKey;
}

/**
 * 获取当前日期的日期字符串 (YYYY-MM-DD)，使用本地时区
 */
export function getCurrentDateString(): string {
  return toLocalDateString(new Date());
}

/**
 * 从日期/时间戳提取本地日期字符串 (YYYY-MM-DD)
 */
function toLocalDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取当前周的周字符串 (YYYY-Www)
 */
export function getCurrentWeekString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * 获取周数
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * 从 localStorage 直接读取任务进度（使用解析后的键）
 */
function readTaskProgress(): Record<string, TaskProgress> {
  const key = getTaskProgressKey();
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, TaskProgress>;
  } catch {
    return {};
  }
}

/**
 * 获取今天的任务进度
 */
export function getTodayTaskProgress(): TaskProgress {
  const date = getCurrentDateString();
  const week = getCurrentWeekString();

  const saved = readTaskProgress();
  // 检查是否有今天的记录
  if (saved[date]) {
    return saved[date];
  }

  // 返回默认进度
  return {
    date,
    week,
    dailyTasks: {
      'daily-question': 0,
      'daily-writing': 0,
      'daily-reasoning': 0,
    },
    dailyCompleted: false,
    weeklyTasks: {
      'weekly-review': false,
      'weekly-summary': false,
    },
    weeklyCompleted: false,
  };
}

/**
 * 保存任务进度（直接写入 localStorage，使用解析后的键）
 */
export function saveTaskProgress(progress: TaskProgress): void {
  const saved = readTaskProgress();
  const allProgress = { ...saved };

  allProgress[progress.date] = progress;

  // 清理30天前的旧数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  Object.keys(allProgress).forEach(date => {
    if (date < cutoffDate) {
      delete allProgress[date];
    }
  });

  // 使用解析后的键保存（确保写入到有数据的那个键）
  const key = getTaskProgressKey();
  localStorage.setItem(key, JSON.stringify(allProgress));

  // 同步标记清除，以便云端同步能检测到变更
  localStorage.removeItem(SYNCED_KEYS_KEY);
}

/**
 * 更新每日任务进度
 */
export function updateDailyTaskProgress(taskId: string, increment: number = 1): void {
  const progress = getTodayTaskProgress();

  if (!progress.dailyTasks[taskId]) {
    progress.dailyTasks[taskId] = 0;
  }

  progress.dailyTasks[taskId] += increment;

  console.log('📈 更新任务进度:', {
    taskId,
    increment,
    newValue: progress.dailyTasks[taskId],
    allTasks: progress.dailyTasks
  });

  // 检查是否所有每日任务都完成
  const allCompleted = DAILY_TASKS_CONFIG.every(task => {
    const current = progress.dailyTasks[task.id] || 0;
    return current >= task.target;
  });

  progress.dailyCompleted = allCompleted;

  // 如果所有任务完成，记录这一天
  if (allCompleted) {
    recordCompletedDay(progress.date);
  }

  saveTaskProgress(progress);
}

/**
 * 完成每周任务
 */
export function completeWeeklyTask(taskId: string): void {
  const progress = getTodayTaskProgress();
  progress.weeklyTasks[taskId] = true;

  // 检查是否所有每周任务都完成
  const allCompleted = WEEKLY_TASKS_CONFIG.every(task =>
    progress.weeklyTasks[task.id]
  );

  progress.weeklyCompleted = allCompleted;
  progress.completedAt = new Date().toISOString();

  saveTaskProgress(progress);
}

/**
 * 获取每日任务状态
 */
export function getDailyTasks() {
  const progress = getTodayTaskProgress();

  return DAILY_TASKS_CONFIG.map(task => {
    const current = progress.dailyTasks[task.id] || 0;
    return {
      ...task,
      current,
      completed: current >= task.target,
      progress: Math.min((current / task.target) * 100, 100),
    };
  });
}

/**
 * 获取每周任务状态
 */
export function getWeeklyTasks() {
  const progress = getTodayTaskProgress();

  return WEEKLY_TASKS_CONFIG.map(task => {
    const completed = progress.weeklyTasks[task.id] || false;
    return {
      ...task,
      completed,
      completedAt: completed ? progress.completedAt : undefined,
    };
  });
}

/**
 * 检查是否是今天
 */
export function isToday(dateString: string): boolean {
  return dateString === getCurrentDateString();
}

/**
 * 获取连续完成天数
 */
export function getTaskStreak(): number {
  const saved = readTaskProgress();

  let streak = 0;
  const today = getCurrentDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  // 如果今天没完成，从昨天开始检查
  let startDate = saved[today]?.dailyCompleted ? today : yesterdayString;
  let checkDate = new Date(startDate);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (saved[dateStr]?.dailyCompleted) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 记录完成任务的一天
 */
function recordCompletedDay(date: string): void {
  const key = getCompletedDaysKey();
  const raw = localStorage.getItem(key);
  const completedDays: string[] = raw ? JSON.parse(raw) : [];

  // 如果这一天还没有被记录，添加它
  if (!completedDays.includes(date)) {
    completedDays.push(date);
    localStorage.setItem(key, JSON.stringify(completedDays));
  }
}

/**
 * 获取累计完成任务的天数
 */
export function getCompletedDaysCount(): number {
  const key = getCompletedDaysKey();
  const raw = localStorage.getItem(key);
  if (!raw) {
    // 没有专门的完成天数记录，从任务进度中计算
    const progress = readTaskProgress();
    return Object.values(progress).filter(p => p.dailyCompleted).length;
  }
  try {
    return (JSON.parse(raw) as string[]).length;
  } catch {
    return 0;
  }
}

/**
 * 从所有 localStorage 键中查找包含指定 baseKey 的数据
 */
function findDataForKey(baseKey: string): any[] {
  const results: any[] = [];

  for (const key of Object.keys(localStorage)) {
    if (key.endsWith('-' + baseKey)) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            results.push(...parsed);
          }
        } catch { /* ignore */ }
      }
    }
  }
  return results;
}

/**
 * 从实际游戏记录中修复今天的任务进度
 * 解决因会话丢失导致的任务进度数据丢失问题
 */
export function repairTaskProgressFromRecords(): void {
  const today = getCurrentDateString();
  const progress = getTodayTaskProgress();
  let changed = false;

  console.log('🔧 [repair] 开始修复任务进度, today(本地):', today, '当前进度:', progress.dailyTasks);

  // 1. 统计问题思考 (daily-question): 从 answers 记录中找今天的回答
  const answers = findDataForKey('wwx-answers');
  console.log('🔧 [repair] wwx-answers 记录数:', answers.length);
  const todayAnswers = answers.filter((a: any) => {
    if (!a.createdAt) return false;
    return toLocalDateString(a.createdAt) === today;
  });
  const questionCount = todayAnswers.length;
  if (questionCount > (progress.dailyTasks['daily-question'] || 0)) {
    progress.dailyTasks['daily-question'] = questionCount;
    changed = true;
    console.log('🔧 修复 daily-question:', questionCount);
  }

  // 2. 统计写作创作 (daily-writing): 从 slot machine 和 writing challenge 记录中找
  const slotResults = findDataForKey('wwx-slot-machine');
  const todaySlot = slotResults.filter((r: any) => {
    const dateField = r.savedAt || r.createdAt || r.timestamp;
    if (!dateField) return false;
    return toLocalDateString(dateField) === today;
  });
  // 写作挑战记录存在 app-storage 中
  const writingWorks = findDataForKey('writing-challenge-works');
  const todayWriting = writingWorks.filter((w: any) => {
    const dateField = w.savedAt || w.createdAt || w.timestamp;
    if (!dateField) return false;
    return toLocalDateString(dateField) === today;
  });
  const writingCount = todaySlot.length + todayWriting.length;
  if (writingCount > (progress.dailyTasks['daily-writing'] || 0)) {
    progress.dailyTasks['daily-writing'] = writingCount;
    changed = true;
    console.log('🔧 修复 daily-writing:', writingCount);
  }

  // 3. 统计逻辑推理 (daily-reasoning): turtle soup + guess number + riddle + yes-or-no
  const turtleSoups = findDataForKey('wwx-turtle-soup');
  const todayTurtle = turtleSoups.filter((r: any) => {
    if (!r.completedAt) return false;
    return r.solved && toLocalDateString(r.completedAt) === today;
  });

  const guessNumbers = findDataForKey('wwx-guess-number');
  const todayGuess = guessNumbers.filter((r: any) => {
    const dateField = r.completedAt;
    if (!dateField) return false;
    return r.solved && toLocalDateString(dateField) === today;
  });

  const riddles = findDataForKey('wwx-riddle');
  console.log('🔧 [repair] wwx-riddle 记录数:', riddles.length, riddles.map((r: any) => ({ solved: r.solved, completedAt: r.completedAt })));
  const todayRiddles = riddles.filter((r: any) => {
    const dateField = r.completedAt || r.solvedAt;
    if (!dateField) return false;
    return r.solved && toLocalDateString(dateField) === today;
  });

  const yesOrNo = findDataForKey('wwx-yes-or-no');
  const todayYesOrNo = yesOrNo.filter((r: any) => {
    const dateField = r.completedAt || r.timestamp;
    if (!dateField) return false;
    return r.solved && toLocalDateString(dateField) === today;
  });

  const reasoningCount = todayTurtle.length + todayGuess.length + todayRiddles.length + todayYesOrNo.length;
  console.log('🔧 [repair] 推理统计:', { turtle: todayTurtle.length, guess: todayGuess.length, riddle: todayRiddles.length, yesNo: todayYesOrNo.length, total: reasoningCount });
  if (reasoningCount > (progress.dailyTasks['daily-reasoning'] || 0)) {
    progress.dailyTasks['daily-reasoning'] = reasoningCount;
    changed = true;
    console.log('🔧 修复 daily-reasoning:', reasoningCount, {
      turtle: todayTurtle.length,
      guess: todayGuess.length,
      riddle: todayRiddles.length,
      yesNo: todayYesOrNo.length,
    });
  }

  if (changed) {
    // 检查是否所有每日任务都完成
    progress.dailyCompleted = DAILY_TASKS_CONFIG.every(task => {
      const current = progress.dailyTasks[task.id] || 0;
      return current >= task.target;
    });

    if (progress.dailyCompleted) {
      recordCompletedDay(progress.date);
    }

    saveTaskProgress(progress);
    console.log('✅ 任务进度已从游戏记录中修复:', progress.dailyTasks);
  }
}
