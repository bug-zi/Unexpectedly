/**
 * 用户数据存储工具
 *
 * 存储策略：
 * - 登录用户：优先使用本地存储，手动或自动同步到云端
 * - 游客用户：始终使用本地存储，不上传云端
 */

import { supabase } from '@/lib/supabase';

// 获取当前用户ID
export function getCurrentUserId(): string | null {
  const userId = sessionStorage.getItem('current-user-id');
  return userId || null;
}

// 设置当前用户ID
export function setCurrentUserId(userId: string): void {
  sessionStorage.setItem('current-user-id', userId);
}

// 清除当前用户ID
export function clearCurrentUserId(): void {
  sessionStorage.removeItem('current-user-id');
}

// 检查是否为游客模式
export function isGuestMode(): boolean {
  return getCurrentUserId() === null;
}

// 生成用户专属的存储键
export function getUserStorageKey(baseKey: string): string {
  const userId = getCurrentUserId();
  if (!userId) {
    // 游客模式，使用 guest 前缀
    return `guest-${baseKey}`;
  }
  // 登录用户，使用 user-{userId} 前缀
  return `user-${userId}-${baseKey}`;
}

// 获取用户数据（优先本地，fallback云端）
export async function getUserData<T>(key: string, defaultValue: T): Promise<T> {
  // 1. 先尝试从本地存储读取
  const userKey = getUserStorageKey(key);
  const localData = localStorage.getItem(userKey);

  if (localData) {
    try {
      return JSON.parse(localData) as T;
    } catch {
      return defaultValue;
    }
  }

  // 2. 如果本地没有数据，且是登录用户，从云端加载
  const userId = getCurrentUserId();
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (!error && data) {
        // 从云端加载到本地
        const parsedData = JSON.parse(data.data) as T;
        localStorage.setItem(userKey, JSON.stringify(parsedData));
        return parsedData;
      }
    } catch (err) {
      console.warn('从云端加载数据失败:', err);
    }
  }

  return defaultValue;
}

// 同步版本的 getUserData（仅从本地读取，不访问云端）
export function getUserDataSync<T>(key: string, defaultValue: T): T {
  const userKey = getUserStorageKey(key);
  const localData = localStorage.getItem(userKey);

  if (localData) {
    try {
      return JSON.parse(localData) as T;
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

// 设置用户数据（只存储到本地）
export function setUserData<T>(key: string, data: T): void {
  const userKey = getUserStorageKey(key);
  localStorage.setItem(userKey, JSON.stringify(data));
}

// 删除用户数据（本地和云端）
export async function removeUserData(key: string): Promise<void> {
  const userKey = getUserStorageKey(key);

  // 删除本地数据
  localStorage.removeItem(userKey);

  // 如果是登录用户，也删除云端数据
  const userId = getCurrentUserId();
  if (userId) {
    try {
      await supabase
        .from('user_data')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);
    } catch (err) {
      console.warn('删除云端数据失败:', err);
    }
  }
}

// 清除当前用户的所有本地数据
export function clearCurrentLocalData(userId?: string): void {
  // 如果提供了userId，使用它；否则获取当前用户ID
  const targetUserId = userId || getCurrentUserId();
  const prefix = targetUserId ? `user-${targetUserId}-` : 'guest-';
  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}

// 检查本地是否有未同步的数据
export function hasUnsyncedData(): boolean {
  const userId = getCurrentUserId();
  if (!userId) return false; // 游客不需要检查

  const prefix = `user-${userId}-`;
  const keys = Object.keys(localStorage);
  return keys.some(key => key.startsWith(prefix));
}

// 切换用户
export async function switchUser(newUserId: string | null): Promise<void> {
  const oldUserId = getCurrentUserId();

  // 如果是登录用户切换，先同步数据
  if (oldUserId && oldUserId !== newUserId) {
    try {
      await syncLocalDataToCloud(oldUserId);
    } catch (err) {
      console.warn('切换用户时同步失败:', err);
    }
  }

  if (newUserId) {
    setCurrentUserId(newUserId);
  } else {
    clearCurrentUserId();
  }
}

// 获取所有用户ID（用于管理多个账号的数据）
export function getAllUserIds(): string[] {
  const keys = Object.keys(localStorage);
  const userIds = new Set<string>();

  keys.forEach(key => {
    const match = key.match(/^user-([^-]+)-/);
    if (match) {
      userIds.add(match[1]);
    }
  });

  return Array.from(userIds);
}

// 删除指定用户的所有数据（用于账号注销）
export async function deleteUserData(userId: string): Promise<void> {
  const keys = Object.keys(localStorage);
  const prefix = `user-${userId}-`;

  // 删除本地数据
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });

  // 删除云端数据
  try {
    await supabase
      .from('user_data')
      .delete()
      .eq('user_id', userId);
  } catch (err) {
    console.warn('删除云端数据失败:', err);
  }
}

// 导出用户数据（用于备份或迁移）
export function exportUserData(userId: string): Record<string, any> {
  const keys = Object.keys(localStorage);
  const prefix = `user-${userId}-`;
  const userData: Record<string, any> = {};

  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      const originalKey = key.replace(prefix, '');
      const data = localStorage.getItem(key);
      if (data) {
        try {
          userData[originalKey] = JSON.parse(data);
        } catch {
          userData[originalKey] = data;
        }
      }
    }
  });

  return userData;
}

// 迁移游客数据到用户账号（注册/登录时）
export function migrateGuestDataToUser(userId: string): void {
  const guestKeys = Object.keys(localStorage).filter(key => key.startsWith('guest-'));

  guestKeys.forEach(guestKey => {
    const originalKey = guestKey.replace('guest-', '');
    const userKey = `user-${userId}-${originalKey}`;
    const data = localStorage.getItem(guestKey);

    if (data && !localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, data);
    }

    localStorage.removeItem(guestKey);
  });
}

// ==================== 新增：同步相关函数 ====================

/**
 * 将本地数据同步到云端（不清空本地数据）
 */
export async function syncLocalDataToCloud(userId?: string): Promise<{ uploaded: number }> {
  const targetUserId = userId || getCurrentUserId();
  if (!targetUserId) {
    throw new Error('未登录，无法同步数据');
  }

  const prefix = `user-${targetUserId}-`;
  const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));

  let uploadedCount = 0;

  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;

      const dataKey = key.replace(prefix, '');
      const parsedData = JSON.parse(data);

      // 上传到云端
      await supabase
        .from('user_data')
        .upsert({
          user_id: targetUserId,
          key: dataKey,
          data: parsedData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      uploadedCount++;
    } catch (err) {
      console.warn(`同步数据 ${key} 失败:`, err);
    }
  }

  // 不再清空本地数据，保持本地优先

  return {
    uploaded: uploadedCount,
  };
}

/**
 * 从云端加载数据到本地
 */
export async function loadCloudDataToLocal(userId?: string): Promise<{ loaded: number }> {
  const targetUserId = userId || getCurrentUserId();
  if (!targetUserId) {
    throw new Error('未登录，无法加载数据');
  }

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('key, data')
      .eq('user_id', targetUserId);

    if (error) throw error;

    let loadedCount = 0;
    const prefix = `user-${targetUserId}-`;

    if (data) {
      data.forEach(item => {
        const key = `${prefix}${item.key}`;
        localStorage.setItem(key, JSON.stringify(item.data));
        loadedCount++;
      });
    }

    return { loaded: loadedCount };
  } catch (err) {
    console.error('从云端加载数据失败:', err);
    throw err;
  }
}
