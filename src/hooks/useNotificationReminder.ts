/**
 * 通知提醒 Hook
 * 专门用于设置页面的状态管理和 UI 交互
 * 实际的通知定时器由 useGlobalNotificationReminder 全局管理
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getReminderSettings,
  updateReminderSettings,
  enableReminder,
  disableReminder,
  getNotificationPermission,
  requestNotificationPermission,
  getTimeUntilNextReminder,
  formatReminderTime,
  parseReminderTime,
  getReminderDebugInfo,
  forceSendDailyReminder,
  clearReminderSentMark,
  type ReminderSettings,
  type ReminderTime,
  type NotificationPermission,
} from '@/utils/notifications';

export function useNotificationReminder() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ReminderSettings>(getReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isLoading, setIsLoading] = useState(false);
  const [nextReminderIn, setNextReminderIn] = useState<number>(getTimeUntilNextReminder());

  // 每分钟更新一次距离下次提醒的时间（仅用于 UI 显示）
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNextReminderIn(getTimeUntilNextReminder());
    }, 60000); // 60秒

    return () => clearInterval(intervalId);
  }, []);

  // 请求通知权限
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    setIsLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 启用提醒
  const enableNotifications = useCallback(async (time: ReminderTime): Promise<void> => {
    setIsLoading(true);
    try {
      await enableReminder(time);
      const updated = getReminderSettings();
      setSettings(updated);
      setNextReminderIn(getTimeUntilNextReminder());
    } catch (error) {
      console.error('启用提醒失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 禁用提醒
  const disableNotifications = useCallback(() => {
    disableReminder();
    const updated = getReminderSettings();
    setSettings(updated);
    setNextReminderIn(-1);
  }, []);

  // 更新提醒时间
  const updateReminderTime = useCallback((time: ReminderTime) => {
    const updated = updateReminderSettings({ time });
    setSettings(updated);
    setNextReminderIn(getTimeUntilNextReminder());
  }, []);

  // 立即开始思考（从通知点击跳转）
  const startThinking = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // 测试通知
  const testNotification = useCallback(() => {
    if (permission !== 'granted') {
      throw new Error('请先允许通知权限');
    }

    const { Notification } = window;
    if (!Notification) {
      throw new Error('浏览器不支持通知功能');
    }

    new Notification('🔔 测试通知', {
      body: '这是测试通知，如果你看到这条消息，说明通知功能正常！',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }, [permission]);

  // 获取调试信息
  const getDebugInfo = useCallback(() => {
    return getReminderDebugInfo();
  }, []);

  // 强制发送提醒（调试用）
  const forceSendReminder = useCallback(() => {
    if (permission !== 'granted') {
      throw new Error('请先允许通知权限');
    }
    forceSendDailyReminder();
  }, [permission]);

  // 清除已发送标记（调试用）
  const clearSentMark = useCallback(() => {
    clearReminderSentMark();
  }, []);

  return {
    // 状态
    settings,
    permission,
    isLoading,
    nextReminderIn,
    isEnabled: settings.enabled,
    reminderTime: settings.time,
    formattedTime: formatReminderTime(settings.time),

    // 方法
    requestPermission,
    enableNotifications,
    disableNotifications,
    updateReminderTime,
    startThinking,
    testNotification,
    getDebugInfo,
    forceSendReminder,
    clearSentMark,

    // 工具方法
    parseTime: parseReminderTime,
    formatTime: formatReminderTime,
  };
}
