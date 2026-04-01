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

// 同步标记 key，与 syncService.ts / appStore.ts 中的保持一致
const SYNCED_KEYS_KEY = 'wwx-synced-keys';

// 设置用户数据（只存储到本地）
export function setUserData<T>(key: string, data: T): void {
  const userKey = getUserStorageKey(key);
  localStorage.setItem(userKey, JSON.stringify(data));
  // 数据变更，清除同步标记以便 checkUnsyncedData 能检测到
  localStorage.removeItem(SYNCED_KEYS_KEY);
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
 * 优化版本：批量上传，减少网络请求
 */
export async function syncLocalDataToCloud(userId?: string): Promise<{ uploaded: number }> {
  const targetUserId = userId || getCurrentUserId();
  if (!targetUserId) {
    throw new Error('未登录，无法同步数据');
  }

  const prefix = `user-${targetUserId}-`;
  const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));

  if (keys.length === 0) {
    console.log('📭 没有需要同步的数据');
    return { uploaded: 0 };
  }

  console.log(`📤 开始同步 ${keys.length} 条数据到云端...`);

  // 收集所有数据
  const records = [];
  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;

      const dataKey = key.replace(prefix, '');
      const parsedData = JSON.parse(data);

      records.push({
        user_id: targetUserId,
        key: dataKey,
        data: parsedData,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn(`解析数据 ${key} 失败:`, err);
    }
  }

  if (records.length === 0) {
    return { uploaded: 0 };
  }

  // 批量上传（每次最多 100 条）
  const batchSize = 100;
  let uploadedCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert(batch, {
          onConflict: 'user_id,key'
        });

      if (error) {
        console.warn(`批量上传失败 (${i}-${i + batch.length}):`, error);
      } else {
        uploadedCount += batch.length;
        console.log(`✅ 已上传 ${uploadedCount}/${records.length} 条数据`);
      }
    } catch (err) {
      console.warn(`批量上传异常 (${i}-${i + batch.length}):`, err);
    }
  }

  console.log(`✅ 同步完成，共上传 ${uploadedCount} 条数据`);
  return { uploaded: uploadedCount };
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

        // 如果本地已有该 key 的数据，合并而非覆盖
        // 对于数组类型数据（如 answers, records），合并去重
        const existingRaw = localStorage.getItem(key);
        if (existingRaw && Array.isArray(item.data)) {
          try {
            const existingData = JSON.parse(existingRaw);

            if (Array.isArray(existingData)) {
              // 合并数组，基于 id 去重（本地数据优先）
              const existingIds = new Set(existingData.map((d: any) => d.id));
              const newItems = item.data.filter((d: any) => !existingIds.has(d.id));
              const merged = [...existingData, ...newItems];
              localStorage.setItem(key, JSON.stringify(merged));
              loadedCount++;
              return;
            }
          } catch {
            // 解析失败，直接用云端数据覆盖
          }
        }

        // 本地无数据或非数组类型，直接写入云端数据
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
