/**
 * 任务系统类型定义
 */

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  type: 'question' | 'writing' | 'reasoning';
  target: number; // 目标数量
  current: number; // 当前进度
  completed: boolean;
}

export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  type: 'review' | 'summary';
  completed: boolean;
  completedAt?: string;
}

export interface TaskProgress {
  date: string; // YYYY-MM-DD
  week: string; // YYYY-Www (e.g., 2026-W13)
  dailyTasks: Record<string, number>; // 任务ID -> 完成数量
  dailyCompleted: boolean;
  weeklyTasks: Record<string, boolean>; // 任务ID -> 是否完成
  weeklyCompleted: boolean;
  completedAt?: string; // 每周任务完成时间
}

// 每日任务配置
export const DAILY_TASKS_CONFIG: Omit<DailyTask, 'current' | 'completed'>[] = [
  {
    id: 'daily-question',
    title: '问题思考',
    description: '完成一个问题的思考',
    type: 'question',
    target: 1,
  },
  {
    id: 'daily-writing',
    title: '写作创作',
    description: '完成一道写作创作',
    type: 'writing',
    target: 1,
  },
  {
    id: 'daily-reasoning',
    title: '逻辑推理',
    description: '进行两次逻辑推理',
    type: 'reasoning',
    target: 2,
  },
];

// 每周任务配置
export const WEEKLY_TASKS_CONFIG: Omit<WeeklyTask, 'completed'>[] = [
  {
    id: 'weekly-review',
    title: '回顾思考',
    description: '选出上周最值得思考的问题，并再次思考',
    type: 'review',
  },
  {
    id: 'weekly-summary',
    title: '周末总结',
    description: '写一篇周末总结',
    type: 'summary',
  },
];
