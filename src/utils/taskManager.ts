/**
 * 任务管理工具
 */

import { DAILY_TASKS_CONFIG, WEEKLY_TASKS_CONFIG, TaskProgress } from '@/types/tasks';
import { getUserData, getUserDataSync, setUserData, getUserStorageKey } from '@/utils/userStorage';

const TASK_PROGRESS_KEY = 'wanwan-task-progress';
const TASK_COMPLETED_DAYS_KEY = 'wanwan-task-completed-days';

// 获取用户专属的存储键
function getTaskProgressKey(): string {
  return getUserStorageKey(TASK_PROGRESS_KEY);
}

function getCompletedDaysKey(): string {
  return getUserStorageKey(TASK_COMPLETED_DAYS_KEY);
}

/**
 * 获取当前日期的日期字符串 (YYYY-MM-DD)
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
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
 * 获取今天的任务进度
 */
export function getTodayTaskProgress(): TaskProgress {
  const date = getCurrentDateString();
  const week = getCurrentWeekString();

  const saved = getUserDataSync<Record<string, TaskProgress>>(TASK_PROGRESS_KEY, {});
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
 * 保存任务进度
 */
export function saveTaskProgress(progress: TaskProgress): void {
  const saved = getUserDataSync<Record<string, TaskProgress>>(TASK_PROGRESS_KEY, {});
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

  setUserData(TASK_PROGRESS_KEY, allProgress);
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
  const saved = getUserDataSync<Record<string, TaskProgress>>(TASK_PROGRESS_KEY, {});

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
  const completedDays = getUserDataSync<string[]>(TASK_COMPLETED_DAYS_KEY, []);

  // 如果这一天还没有被记录，添加它
  if (!completedDays.includes(date)) {
    completedDays.push(date);
    setUserData(TASK_COMPLETED_DAYS_KEY, completedDays);
  }
}

/**
 * 获取累计完成任务的天数
 */
export function getCompletedDaysCount(): number {
  const completedDays = getUserDataSync<string[]>(TASK_COMPLETED_DAYS_KEY, []);
  return completedDays.length;
}
