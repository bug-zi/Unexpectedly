import { useEffect, useRef } from 'react';

/**
 * 自动保存Hook
 * @param content 要保存的内容
 * @param key 存储键名
 * @param delay 延迟时间（毫秒），默认30秒
 */
export function useAutoSave(content: string, key: string, delay: number = 30000) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');

  useEffect(() => {
    // 如果内容没有变化，不保存
    if (content === lastSavedContentRef.current) {
      return;
    }

    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 如果内容为空，不保存
    if (!content.trim()) {
      return;
    }

    // 设置新的定时器
    saveTimeoutRef.current = setTimeout(() => {
      // 保存到localStorage
      localStorage.setItem(
        `wwx-autosave-${key}`,
        JSON.stringify({
          content,
          savedAt: new Date().toISOString(),
        })
      );

      lastSavedContentRef.current = content;
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, key, delay]);

  /**
   * 清除自动保存的内容
   */
  const clearAutoSave = () => {
    localStorage.removeItem(`wwx-autosave-${key}`);
    lastSavedContentRef.current = '';
  };

  /**
   * 获取自动保存的内容
   */
  const getAutoSave = () => {
    const data = localStorage.getItem(`wwx-autosave-${key}`);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  return { clearAutoSave, getAutoSave };
}
