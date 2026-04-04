/**
 * 用户菜单组件
 * 显示登录按钮或用户信息下拉菜单
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Cloud, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { manualSync } from '@/services/syncService';
import { Button } from '@/components/ui/Button';

export function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSignOut = async () => {
    setIsOpen(false);
    const result = await signOut();
    if (result.success) {
      toast.success('已退出登录', { autoClose: 1500 });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await manualSync();
      if (result.success) {
        toast.success(`✅ 已同步 ${result.uploaded || 0} 条数据到云端`);
      } else {
        toast.error('❌ 同步失败：' + result.error);
      }
    } catch {
      toast.error('❌ 同步失败，请稍后重试');
    }
    setSyncing(false);
    setIsOpen(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <Button
        onClick={() => (window.location.href = '/login')}
        variant="primary"
        size="sm"
      >
        登录 / 注册
      </Button>
    );
  }

  // 从 user metadata 中获取信息
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '用户';
  const avatarUrl = user.user_metadata?.avatar_url;
  const email = user.email;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          {fullName}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* 下拉菜单 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
            >
              {/* 用户信息 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {fullName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {email}
                    </div>
                  </div>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="p-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Cloud size={18} />
                  )}
                  <span>同步数据</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/notifications';
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings size={18} />
                  <span>设置</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>登出</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
