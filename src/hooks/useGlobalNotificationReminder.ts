/**
 * 全局通知提醒 Hook
 * 在应用级别启动定时器，确保通知提醒功能始终运行
 * 即使不在设置页面也能正常发送通知
 */

import { useEffect, useRef } from 'react';
import {
  getReminderSettings,
  shouldSendReminder,
  sendDailyReminder,
  markReminderSent,
} from '@/utils/notifications';

/**
 * 全局通知提醒 Hook
 * 作用：在应用启动时创建全局定时器，每分钟检查是否需要发送提醒
 * 特点：
 * 1. 不依赖 UI 状态，纯后台运行
 * 2. 只在提醒功能启用时运行定时器
 * 3. 自动清理定时器，避免内存泄漏
 * 4. 监听设置变化，动态调整定时器状态
 */
export function useGlobalNotificationReminder(): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 启动定时器
  const startTimer = () => {
    clearTimer(); // 先清理旧的定时器

    const settings = getReminderSettings();

    // 如果未启用提醒，不启动定时器
    if (!settings.enabled) {
      console.log('[全局通知提醒] 提醒功能未启用，不启动定时器');
      return;
    }

    console.log('[全局通知提醒] 启动定时器，检查时间:', settings.time);

    // 每分钟检查一次是否需要发送提醒
    intervalRef.current = setInterval(() => {
      if (shouldSendReminder()) {
        console.log('[全局通知提醒] 发送每日提醒');
        sendDailyReminder();
        markReminderSent();
      }
    }, 60000); // 60秒
  };

  // 初始化定时器
  useEffect(() => {
    startTimer();

    // 组件卸载时清理定时器
    return () => {
      console.log('[全局通知提醒] 清理定时器');
      clearTimer();
    };
  }, []);

  // 监听 storage 事件（跨标签页同步）和自定义事件
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      // 监听 reminder-settings 的变化
      if ('key' in e && e.key === 'wwx-reminder-settings') {
        console.log('[全局通知提醒] 检测到设置变化，重新启动定时器');
        startTimer();
      }
    };

    // 监听 localStorage 变化（用于跨标签页同步）
    window.addEventListener('storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
    };
  }, []);
}
