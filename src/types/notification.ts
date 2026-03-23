/**
 * 通知相关类型定义
 */

/**
 * 提醒时间配置
 */
export interface ReminderTime {
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * 提醒设置
 */
export interface ReminderSettings {
  enabled: boolean;
  time: ReminderTime;
  timezone: string;
  reminderMessages: string[];
  lastReminderDate?: string; // ISO格式的日期
}

/**
 * 通知权限状态
 */
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * 提醒语库
 */
export interface ReminderMessage {
  id: string;
  content: string;
  category: 'motivational' | 'thoughtful' | 'challenging';
}
