/**
 * 同步状态指示器组件
 * 显示数据同步状态和最后同步时间
 */

import { motion } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { SyncStatus } from '@/services/syncService';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSync: Date | null;
  isSyncing: boolean;
  onManualSync?: () => void;
  showText?: boolean;
}

export function SyncStatusIndicator({
  status,
  lastSync,
  isSyncing,
  onManualSync,
  showText = true,
}: SyncStatusIndicatorProps) {
  /**
   * 格式化最后同步时间
   */
  const formatLastSync = (date: Date | null): string => {
    if (!date) return '未同步';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;

    return date.toLocaleDateString('zh-CN');
  };

  /**
   * 获取状态图标和颜色
   */
  const getStatusIcon = () => {
    switch (status) {
      case SyncStatus.SYNCING:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw size={16} className="text-blue-500" />
          </motion.div>
        );
      case SyncStatus.SUCCESS:
        return <CheckCircle size={16} className="text-green-500" />;
      case SyncStatus.ERROR:
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Cloud size={16} className="text-gray-400" />;
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = () => {
    switch (status) {
      case SyncStatus.SYNCING:
        return '同步中...';
      case SyncStatus.SUCCESS:
        return '同步成功';
      case SyncStatus.ERROR:
        return '同步失败';
      default:
        return formatLastSync(lastSync);
    }
  };

  /**
   * 获取状态提示
   */
  const getStatusTooltip = () => {
    if (lastSync) {
      return `最后同步: ${lastSync.toLocaleString('zh-CN')}`;
    }
    return '点击立即同步';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onManualSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isSyncing
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 cursor-not-allowed'
          : status === SyncStatus.SUCCESS
          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
          : status === SyncStatus.ERROR
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={getStatusTooltip()}
    >
      {getStatusIcon()}
      {showText && <span>{getStatusText()}</span>}
    </motion.button>
  );
}

/**
 * 简化版同步指示器（只显示图标）
 */
export function SyncStatusIcon({
  status,
  isSyncing,
  onManualSync,
  size = 20,
}: {
  status: SyncStatus;
  isSyncing: boolean;
  onManualSync?: () => void;
  size?: number;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onManualSync}
      disabled={isSyncing}
      className={`transition-colors ${
        isSyncing ? 'cursor-wait' : 'cursor-pointer hover:opacity-70'
      }`}
    >
      {status === SyncStatus.SYNCING ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={size} className="text-blue-500" />
        </motion.div>
      ) : status === SyncStatus.SUCCESS ? (
        <Cloud size={size} className="text-green-500" />
      ) : status === SyncStatus.ERROR ? (
        <CloudOff size={size} className="text-red-500" />
      ) : (
        <Cloud size={size} className="text-gray-400" />
      )}
    </motion.button>
  );
}
