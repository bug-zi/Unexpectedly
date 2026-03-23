/**
 * 浏览器通知管理工具
 */

import { ReminderSettings, ReminderTime, NotificationPermission, ReminderMessage } from '@/types/notification';

const REMINDER_SETTINGS_KEY = 'wwx-reminder-settings';
const REMINDER_MESSAGES_KEY = 'wwx-reminder-messages';

/**
 * 默认提醒语库
 */
const DEFAULT_REMINDER_MESSAGES: ReminderMessage[] = [
  {
    id: 'motivational-1',
    content: '今天也要思考一个问题哦，发现新的视角！🌟',
    category: 'motivational',
  },
  {
    id: 'motivational-2',
    content: '又到了思考时间，来个"万万没想到"的洞察吧！💡',
    category: 'motivational',
  },
  {
    id: 'thoughtful-1',
    content: '每天一个问题，遇见未知的自己 ✨',
    category: 'thoughtful',
  },
  {
    id: 'thoughtful-2',
    content: '停下来思考片刻，可能有意想不到的收获 🌱',
    category: 'thoughtful',
  },
  {
    id: 'challenging-1',
    content: '今天的思维盲区在哪里？来探索一下吧 🎯',
    category: 'challenging',
  },
  {
    id: 'challenging-2',
    content: '跳出舒适区，回答一个挑战性问题！💪',
    category: 'challenging',
  },
];

/**
 * 获取通知权限状态
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

/**
 * 获取通知系统诊断信息
 */
export function getNotificationDiagnostics(): {
  supported: boolean;
  permission: NotificationPermission;
  secureContext: boolean;
  protocol: string;
  hostname: string;
  isLocalhost: boolean;
  canRequest: boolean;
  reason?: string;
} {
  const diagnostics = {
    supported: 'Notification' in window,
    permission: getNotificationPermission(),
    secureContext: window.isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isLocalhost: window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname === '[::1]',
    canRequest: false,
  } as any;

  // 判断是否可以请求权限
  if (!diagnostics.supported) {
    diagnostics.reason = '浏览器不支持通知API';
    return diagnostics;
  }

  if (diagnostics.permission === 'granted') {
    diagnostics.canRequest = true;
    diagnostics.reason = '已授权，无需再次请求';
    return diagnostics;
  }

  if (diagnostics.permission === 'denied') {
    diagnostics.reason = '用户之前已拒绝通知权限，需要在浏览器设置中手动重置';
    return diagnostics;
  }

  // permission === 'default'
  // localhost 环境允许使用 HTTP 协议请求通知
  const isAllowedEnvironment = diagnostics.secureContext ||
                               diagnostics.isLocalhost ||
                               diagnostics.protocol === 'file:';

  if (!isAllowedEnvironment) {
    diagnostics.reason = '需要在HTTPS环境、localhost或本地文件下才能请求通知权限';
    return diagnostics;
  }

  diagnostics.canRequest = true;
  diagnostics.reason = diagnostics.isLocalhost
    ? '可以请求通知权限（localhost环境）'
    : '可以请求通知权限';
  return diagnostics;
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('当前浏览器不支持通知功能');
  }

  // 添加诊断日志
  const diagnostics = getNotificationDiagnostics();
  console.log('通知诊断信息:', diagnostics);

  // 如果已经请求过且被拒绝，给出更详细的指导
  if (Notification.permission === 'denied') {
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';
    const errorMsg = isLocalhost
      ? '您之前已拒绝通知权限。请按以下步骤重置：\n1. 点击浏览器地址栏左侧的锁图标或⚠️图标\n2. 找到"通知"或"网站设置"\n3. 将通知权限改为"允许"\n4. 刷新页面后重新点击"授权通知"'
      : '您之前已拒绝通知权限，请在浏览器设置中手动重置';
    throw new Error(errorMsg);
  }

  // 如果已经授权，直接返回
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // 检查是否可以请求权限
  if (!diagnostics.canRequest) {
    throw new Error(diagnostics.reason || '当前环境不允许请求通知权限');
  }

  // 添加超时处理
  const timeoutPromise = new Promise<NotificationPermission>((_, reject) => {
    setTimeout(() => reject(new Error('请求权限超时或被阻止。请检查：\n1. 浏览器地址栏是否有权限请求提示\n2. 是否在隐私/无痕模式下\n3. 是否安装了广告拦截插件\n4. 浏览器通知功能是否被禁用')), 15000);
  });

  try {
    console.log('正在请求通知权限...');

    // 直接调用 Notification.requestPermission
    const permission = await Promise.race([
      Notification.requestPermission(),
      timeoutPromise,
    ]);

    console.log('权限请求结果:', permission);

    if (permission === 'denied') {
      throw new Error('权限被拒绝。如需启用，请按照诊断信息中的说明操作');
    }

    return permission as NotificationPermission;
  } catch (error) {
    console.error('请求通知权限失败:', error);
    throw error;
  }
}

/**
 * 获取默认提醒设置
 */
function getDefaultReminderSettings(): ReminderSettings {
  const now = new Date();
  return {
    enabled: false,
    time: {
      hour: 9,
      minute: 0,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    reminderMessages: DEFAULT_REMINDER_MESSAGES.map(m => m.content),
  };
}

/**
 * 获取提醒设置
 */
export function getReminderSettings(): ReminderSettings {
  try {
    const stored = localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取提醒设置失败:', error);
  }
  return getDefaultReminderSettings();
}

/**
 * 保存提醒设置
 */
export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存提醒设置失败:', error);
    throw new Error('保存失败，请重试');
  }
}

/**
 * 更新提醒设置
 */
export function updateReminderSettings(updates: Partial<ReminderSettings>): ReminderSettings {
  const current = getReminderSettings();
  const updated = { ...current, ...updates };
  saveReminderSettings(updated);
  return updated;
}

/**
 * 启用每日提醒
 */
export async function enableReminder(time: ReminderTime): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    throw new Error('通知权限被拒绝，请在浏览器设置中允许通知');
  }

  updateReminderSettings({
    enabled: true,
    time,
  });

  // 立即测试一次通知
  sendNotification('🔔 每日提醒已设置', `将在每天 ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')} 收到思考提醒`);
}

/**
 * 禁用每日提醒
 */
export function disableReminder(): void {
  updateReminderSettings({ enabled: false });
}

/**
 * 随机获取一条提醒语
 */
function getRandomReminderMessage(): string {
  const settings = getReminderSettings();
  const messages = settings.reminderMessages.length > 0
    ? settings.reminderMessages
    : DEFAULT_REMINDER_MESSAGES.map(m => m.content);
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 发送通知
 */
export function sendNotification(title: string, body: string, icon?: string): void {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知功能');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('通知权限未授予');
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'wwx-daily-reminder',
      requireInteraction: false,
      silent: false,
    });

    // 点击通知时打开应用
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 10秒后自动关闭
    setTimeout(() => {
      notification.close();
    }, 10000);
  } catch (error) {
    console.error('发送通知失败:', error);
  }
}

/**
 * 发送每日提醒通知
 */
export function sendDailyReminder(): void {
  const message = getRandomReminderMessage();
  sendNotification('🤔 思考时间到了！', message);
}

/**
 * 获取本地日期字符串 (YYYY-MM-DD 格式)
 * 使用本地时区而不是 UTC 时区
 */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 检查是否应该发送提醒
 */
export function shouldSendReminder(): boolean {
  const settings = getReminderSettings();

  if (!settings.enabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 检查当前时间是否匹配提醒时间（允许5分钟误差）
  const targetMinutes = settings.time.hour * 60 + settings.time.minute;
  const currentMinutes = currentHour * 60 + currentMinute;

  if (Math.abs(currentMinutes - targetMinutes) > 5) {
    return false;
  }

  // 检查今天是否已经发送过提醒（使用本地时区）
  const today = getLocalDateString(now);
  if (settings.lastReminderDate === today) {
    return false;
  }

  return true;
}

/**
 * 标记今天已发送提醒
 */
export function markReminderSent(): void {
  const today = getLocalDateString(new Date());
  updateReminderSettings({ lastReminderDate: today });
}

/**
 * 计算距离下次提醒的时间（毫秒）
 */
export function getTimeUntilNextReminder(): number {
  const settings = getReminderSettings();

  if (!settings.enabled) {
    return -1;
  }

  const now = new Date();
  const target = new Date();
  target.setHours(settings.time.hour, settings.time.minute, 0, 0);

  // 如果今天的时间已经过了，设置为明天
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * 格式化提醒时间为可读字符串
 */
export function formatReminderTime(time: ReminderTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

/**
 * 解析时间字符串为 ReminderTime
 */
export function parseReminderTime(timeStr: string): ReminderTime {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

/**
 * 获取所有提醒语
 */
export function getReminderMessages(): ReminderMessage[] {
  try {
    const stored = localStorage.getItem(REMINDER_MESSAGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取提醒语失败:', error);
  }
  return DEFAULT_REMINDER_MESSAGES;
}

/**
 * 保存自定义提醒语
 */
export function saveReminderMessages(messages: ReminderMessage[]): void {
  try {
    localStorage.setItem(REMINDER_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('保存提醒语失败:', error);
    throw new Error('保存失败，请重试');
  }
}

/**
 * 添加自定义提醒语
 */
export function addReminderMessage(content: string, category: 'motivational' | 'thoughtful' | 'challenging' = 'motivational'): void {
  const messages = getReminderMessages();
  const newMessage: ReminderMessage = {
    id: `custom-${Date.now()}`,
    content,
    category,
  };
  saveReminderMessages([...messages, newMessage]);
}

/**
 * 删除提醒语
 */
export function removeReminderMessage(id: string): void {
  const messages = getReminderMessages();
  const filtered = messages.filter(m => m.id !== id);
  saveReminderMessages(filtered);
}

/**
 * 获取提醒语预览
 */
export function getReminderMessagePreview(): string {
  const message = getRandomReminderMessage();
  return message.length > 50 ? message.substring(0, 50) + '...' : message;
}

/**
 * 获取调试信息
 */
export function getReminderDebugInfo(): {
  enabled: boolean;
  reminderTime: string;
  currentTime: string;
  currentDate: string;
  lastReminderDate: string | undefined;
  shouldSend: boolean;
  timeDiff: number;
  withinWindow: boolean;
  alreadySentToday: boolean;
  nextReminderIn: number;
} {
  const settings = getReminderSettings();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = getLocalDateString(now);

  const targetMinutes = settings.time.hour * 60 + settings.time.minute;
  const currentMinutes = currentHour * 60 + currentMinute;
  const timeDiff = Math.abs(currentMinutes - targetMinutes);
  const withinWindow = timeDiff <= 5;
  const alreadySentToday = settings.lastReminderDate === today;

  return {
    enabled: settings.enabled,
    reminderTime: `${String(settings.time.hour).padStart(2, '0')}:${String(settings.time.minute).padStart(2, '0')}`,
    currentTime: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
    currentDate: today,
    lastReminderDate: settings.lastReminderDate,
    shouldSend: settings.enabled && withinWindow && !alreadySentToday,
    timeDiff,
    withinWindow,
    alreadySentToday,
    nextReminderIn: getTimeUntilNextReminder(),
  };
}

/**
 * 强制发送每日提醒（用于调试）
 * 忽略时间检查，直接发送通知
 */
export function forceSendDailyReminder(): void {
  console.log('[调试] 强制发送每日提醒');
  sendDailyReminder();
}

/**
 * 清除已发送标记（用于调试）
 * 允许重新发送今天的提醒
 */
export function clearReminderSentMark(): void {
  console.log('[调试] 清除已发送标记');
  updateReminderSettings({ lastReminderDate: undefined });
}
