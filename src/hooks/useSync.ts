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
  const syncStatusRef = useRef<SyncStatus>(SyncStatus.IDLE);

  // 保持 ref 与 state 同步
  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

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
        if (syncStatusRef.current === SyncStatus.SUCCESS || syncStatusRef.current === SyncStatus.ERROR) {
          setSyncStatus(SyncStatus.IDLE);
        }
      }, 3000);
    }
  }, []);

  /**
   * 手动触发同步
   */
  const manualSync = useCallback(() => {
    sync(true);
  }, [sync]);

  // 自动同步
  useEffect(() => {
    if (!autoSync) return;

    // 延迟初始化同步：始终执行双向同步，确保从云端拉取最新数据
    const initTimer = setTimeout(() => {
      if (!syncInProgress.current) {
        console.log('🔄 初始化双向同步触发...');
        sync(false);
      }
    }, 2000);

    // 每5分钟执行双向同步
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        console.log('🔄 定时双向同步触发...');
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
      if (!syncInProgress.current) {
        console.log('🔄 窗口切换双向同步触发...');
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
