/**
 * 用户个人资料页面
 * 显示用户信息、统计数据和设置
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Lock,
  Database,
  Download,
  Upload,
  Trash2,
  Calendar,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { exportDataAsJSON, importDataFromJSON, clearAllData } from '@/utils/storage';
import { getTurtleSoupRecords, getRiddleRecords, getYesOrNoRecords, getGuessNumberRecords } from '@/utils/storage';

interface UserStats {
  totalAnswers: number;
  totalCheckIns: number;
  totalTurtleSoup: number;
  totalRiddles: number;
  totalYesOrNo: number;
  totalGuessNumber: number;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalAnswers: 0,
    totalCheckIns: 0,
    totalTurtleSoup: 0,
    totalRiddles: 0,
    totalYesOrNo: 0,
    totalGuessNumber: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    // 加载统计数据
    const answersJson = localStorage.getItem('wwx-answers');
    const answers = answersJson ? JSON.parse(answersJson) : [];

    const checkInHistoryJson = localStorage.getItem('checkin-history');
    const checkInHistory = checkInHistoryJson ? JSON.parse(checkInHistoryJson) : [];

    const turtleSoupRecords = getTurtleSoupRecords();
    const riddleRecords = getRiddleRecords();
    const yesOrNoRecords = getYesOrNoRecords();
    const guessNumberRecords = getGuessNumberRecords();

    setStats({
      totalAnswers: answers.length,
      totalCheckIns: checkInHistory.length,
      totalTurtleSoup: turtleSoupRecords.length,
      totalRiddles: riddleRecords.length,
      totalYesOrNo: yesOrNoRecords.length,
      totalGuessNumber: guessNumberRecords.length
    });
  };

  const handleExport = () => {
    try {
      const data = exportDataAsJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wanwan-xiangdao-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importDataFromJSON(text);
        if (success) {
          alert('导入成功！');
          loadStats();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          alert('导入失败，请检查文件格式');
        }
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查文件格式');
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：这将删除所有答题记录、签到记录和游戏进度！')) {
        clearAllData();
        alert('数据已清除');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut();
      navigate('/');
    }
  };

  const bestStreak = parseInt(localStorage.getItem('checkin-best') || '0');
  const consecutiveDays = parseInt(localStorage.getItem('checkin-consecutive') || '0');

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <User size={24} className="text-blue-500" />
              <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                个人中心
              </h1>
            </div>

            <div className="w-16">
              {/* 占位，保持布局平衡 */}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <User size={40} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.email || '游客用户'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {user ? '已登录' : '未登录'}
                  </p>
                </div>
                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    退出登录
                  </motion.button>
                )}
                {!user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg text-sm font-medium transition-all"
                  >
                    去登录
                  </motion.button>
                )}
              </div>
            </div>

            {/* 用户统计 */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                学习统计
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} className="text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">答题总数</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalAnswers}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">签到天数</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalCheckIns}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={18} className="text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">最佳连续</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {bestStreak}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">当前连续</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {consecutiveDays}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 游戏统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-blue-500" />
              游戏统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">海龟汤</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.totalTurtleSoup}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">谜语人</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.totalRiddles}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yes or No</p>
                <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.totalYesOrNo}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">猜数字</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalGuessNumber}</p>
              </div>
            </div>
          </motion.div>

          {/* 设置卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              数据管理
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all"
              >
                <Download size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导出数据</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">备份所有数据到本地</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl transition-all"
              >
                <Upload size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导入数据</p>
                  <p className="text-sm text-green-600 dark:text-green-400">从备份文件恢复数据</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/notifications')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl transition-all"
              >
                <Bell size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">通知设置</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">管理提醒通知</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* 危险区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800"
          >
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
              <Database size={20} className="text-red-500" />
              危险操作
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl transition-all"
            >
              <Trash2 size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium">清除所有数据</p>
                <p className="text-sm text-red-600 dark:text-red-400">删除所有本地存储的数据（不可恢复）</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
