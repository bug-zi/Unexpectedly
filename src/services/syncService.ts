/**
 * 数据同步服务（新版）
 *
 * 同步策略：
 * - 手动同步：用户点击"同步至云端"时执行
 * - 自动同步：退出登录或退出程序时执行
 * - 游客模式：不同步到云端
 */

import { supabase } from '@/lib/supabase';
import { syncLocalDataToCloud, loadCloudDataToLocal, getCurrentUserId, clearCurrentLocalData } from '@/utils/userStorage';

/**
 * 同步状态枚举
 */
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface SyncResult {
  success: boolean;
  uploaded?: number;
  loaded?: number;
  error?: string;
}

/**
 * 详细同步结果（用于 useSync hook）
 */
export interface DetailedSyncResult {
  status: SyncStatus;
  error?: string;
  answers: { uploaded: number; downloaded: number };
  slotMachine: { uploaded: number; downloaded: number };
  turtleSoup: { uploaded: number; downloaded: number };
  riddles: { uploaded: number; downloaded: number };
  yesOrNo: { uploaded: number; downloaded: number };
  guessNumber: { uploaded: number; downloaded: number };
}

const LAST_SYNC_KEY = 'wwx-last-sync-time';

/**
 * 获取最后同步时间
 */
export function getLastSyncTime(): Date | null {
  const data = localStorage.getItem(LAST_SYNC_KEY);
  if (!data) return null;
  try {
    return new Date(JSON.parse(data));
  } catch {
    return null;
  }
}

/**
 * 设置最后同步时间
 */
function setLastSyncTime(date: Date): void {
  localStorage.setItem(LAST_SYNC_KEY, JSON.stringify(date.toISOString()));
}

/**
 * 检查是否需要同步
 */
export function needsSync(): boolean {
  const userId = getCurrentUserId();
  if (!userId) return false; // 游客模式不需要同步

  return checkUnsyncedData();
}

/**
 * 同步所有数据（简化版，调用 manualSync）
 */
export async function syncAllData(): Promise<DetailedSyncResult> {
  const result: DetailedSyncResult = {
    status: SyncStatus.IDLE,
    answers: { uploaded: 0, downloaded: 0 },
    slotMachine: { uploaded: 0, downloaded: 0 },
    turtleSoup: { uploaded: 0, downloaded: 0 },
    riddles: { uploaded: 0, downloaded: 0 },
    yesOrNo: { uploaded: 0, downloaded: 0 },
    guessNumber: { uploaded: 0, downloaded: 0 },
  };

  try {
    const syncResult = await manualSync();

    if (syncResult.success) {
      result.status = SyncStatus.SUCCESS;
      const uploaded = syncResult.uploaded || 0;

      // 简化处理：将所有上传的数据分配给 answers
      result.answers.uploaded = uploaded;
      setLastSyncTime(new Date());
    } else {
      result.status = SyncStatus.ERROR;
      result.error = syncResult.error;
    }
  } catch (error) {
    result.status = SyncStatus.ERROR;
    result.error = error instanceof Error ? error.message : '同步失败';
  }

  return result;
}

/**
 * 登录时同步（从云端下载数据到本地）
 */
export async function syncOnLogin(): Promise<void> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('🏠 游客模式，跳过登录同步');
      return;
    }

    console.log('🔄 登录同步：从云端下载数据...');
    await loadFromCloud();
    console.log('✅ 登录同步完成');
  } catch (error) {
    console.error('❌ 登录同步失败:', error);
    // 不抛出错误，避免阻止登录流程
  }
}

/**
 * 手动同步：上传本地数据到云端并清空本地
 */
export async function manualSync(): Promise<SyncResult> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('未登录，无法同步数据');
    }

    console.log('🔄 开始手动同步...', { userId });

    // 1. 上传本地数据到云端
    const result = await syncLocalDataToCloud(userId);

    console.log('✅ 同步完成', result);

    return {
      success: true,
      uploaded: result.uploaded,
    };
  } catch (error) {
    console.error('❌ 同步失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '同步失败',
    };
  }
}

/**
 * 自动同步：退出登录时调用
 * @param userId 可选的用户ID，如果提供则使用该ID，否则从getCurrentUserId获取
 */
export async function autoSyncOnLogout(userId?: string): Promise<void> {
  try {
    // 如果没有提供userId，尝试获取
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) {
      console.log('🏠 游客模式，无需同步');
      return;
    }

    console.log('🔄 退出登录，自动同步数据...', { userId: targetUserId });

    // 上传本地数据到云端（使用传入的用户ID）
    await syncLocalDataToCloud(targetUserId);

    // 清空本地数据（使用传入的用户ID确定前缀）
    clearCurrentLocalData();

    console.log('✅ 自动同步完成');
  } catch (error) {
    console.error('❌ 自动同步失败:', error);
    // 不抛出错误，避免阻止退出流程
  }
}

/**
 * 从云端加载数据到本地
 */
export async function loadFromCloud(): Promise<SyncResult> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('未登录，无法加载数据');
    }

    console.log('📥 从云端加载数据...', { userId });

    const result = await loadCloudDataToLocal(userId);

    console.log('✅ 数据加载完成', result);

    return {
      success: true,
      loaded: result.loaded,
    };
  } catch (error) {
    console.error('❌ 加载数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '加载数据失败',
    };
  }
}

/**
 * 检查本地是否有未同步的数据
 */
export function checkUnsyncedData(): boolean {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const prefix = `user-${userId}-`;
  const keys = Object.keys(localStorage);
  return keys.some(key => key.startsWith(prefix));
}

/**
 * 获取本地数据统计
 */
export function getLocalDataStats(): { count: number; keys: string[] } {
  const userId = getCurrentUserId();
  if (!userId) {
    // 游客模式
    const guestKeys = Object.keys(localStorage).filter(key => key.startsWith('guest-'));
    return { count: guestKeys.length, keys: guestKeys };
  }

  // 登录用户
  const userKeys = Object.keys(localStorage).filter(key => key.startsWith(`user-${userId}-`));
  return { count: userKeys.length, keys: userKeys };
}
