/**
 * useSync Hook
 * 自动同步本地数据到云端
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { syncAllData, getLastSyncTime, needsSync, SyncStatus, DetailedSyncResult } from '@/services/syncService';

export function useSync(autoSync: boolean = true) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [lastSync, setLastSync] = useState<Date | null>(getLastSyncTime());
  const [syncResult, setSyncResult] = useState<DetailedSyncResult | null>(null);
  const syncInProgress = useRef(false);

  /**
   * 执行同步
   */
  const sync = useCallback(async (showNotification: boolean = false) => {
    // 防止重复同步
    if (syncInProgress.current) {
      return;
    }

    syncInProgress.current = true;
    setSyncStatus(SyncStatus.SYNCING);

    try {
      const result = await syncAllData();

      if (result.status === SyncStatus.SUCCESS) {
        setSyncStatus(SyncStatus.SUCCESS);
        setSyncResult(result);
        setLastSync(new Date());

        // 计算总同步数
        const totalUploaded =
          result.answers.uploaded +
          result.slotMachine.uploaded +
          result.turtleSoup.uploaded +
          result.riddles.uploaded +
          result.yesOrNo.uploaded +
          result.guessNumber.uploaded;

        const totalDownloaded =
          result.answers.downloaded +
          result.slotMachine.downloaded +
          result.turtleSoup.downloaded +
          result.riddles.downloaded +
          result.yesOrNo.downloaded +
          result.guessNumber.downloaded;

        if (showNotification && (totalUploaded > 0 || totalDownloaded > 0)) {
          toast.success(
            `✅ 同步成功\n上传 ${totalUploaded} 条，下载 ${totalDownloaded} 条`,
            { autoClose: 3000 }
          );
        }
      } else {
        setSyncStatus(SyncStatus.ERROR);
        if (showNotification) {
          toast.error(`❌ 同步失败: ${result.error}`, { autoClose: 5000 });
        }
      }
    } catch (error) {
      setSyncStatus(SyncStatus.ERROR);
      if (showNotification) {
        toast.error('❌ 同步失败，请稍后重试', { autoClose: 5000 });
      }
    } finally {
      syncInProgress.current = false;

      // 3秒后重置状态
      setTimeout(() => {
        if (syncStatus === SyncStatus.SUCCESS || syncStatus === SyncStatus.ERROR) {
          setSyncStatus(SyncStatus.IDLE);
        }
      }, 3000);
    }
  }, [syncStatus]);

  /**
   * 手动触发同步
   */
  const manualSync = useCallback(() => {
    sync(true);
  }, [sync]);

  // 自动同步
  useEffect(() => {
    if (!autoSync) return;

    // 延迟初始化同步，等待认证初始化完成
    const initTimer = setTimeout(() => {
      const shouldSync = needsSync();

      if (shouldSync) {
        console.log('🔄 自动同步触发...');
        sync(false);
      }
    }, 2000); // 延迟 2 秒，等待认证初始化完成

    // 每5分钟检查一次是否需要同步
    const interval = setInterval(() => {
      if (needsSync() && !syncInProgress.current) {
        console.log('🔄 定时同步触发...');
        sync(false);
      }
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [autoSync, sync]);

  // 窗口获得焦点时同步
  useEffect(() => {
    if (!autoSync) return;

    const handleFocus = () => {
      if (needsSync() && !syncInProgress.current) {
        sync(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [autoSync, sync]);

  return {
    syncStatus,
    lastSync,
    syncResult,
    isSyncing: syncStatus === SyncStatus.SYNCING,
    needsSync: needsSync(),
    manualSync,
  };
}
