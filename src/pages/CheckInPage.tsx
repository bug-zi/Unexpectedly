/**
 * 每日签到页面
 * 记录用户的每日签到情况
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Trophy,
  Flame,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';
import { getUserData, getUserDataSync, setUserData } from '@/utils/userStorage';

interface CheckInRecord {
  date: string;
  timestamp: number;
}

// 存储键
const STORAGE_KEYS = {
  HISTORY: 'checkin-history',
};

export function CheckInPage() {
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    loadCheckInData();
    checkTodayStatus();
  }, []);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        loadCheckInData();
        checkTodayStatus();
      }, 100);
    };

    window.addEventListener('user-data-changed', handleDataChange);
    window.addEventListener('user-logged-out', handleDataChange);
    window.addEventListener('user-logged-in', handleDataChange);

    return () => {
      window.removeEventListener('user-data-changed', handleDataChange);
      window.removeEventListener('user-logged-out', handleDataChange);
      window.removeEventListener('user-logged-in', handleDataChange);
    };
  }, []);

  const loadCheckInData = () => {
    const history = getUserDataSync<CheckInRecord[]>(STORAGE_KEYS.HISTORY, []);
    setCheckInHistory(history);
    setTotalDays(history.length);

    // 获取最后一次签到时间
    if (history.length > 0) {
      const lastRecord = history[history.length - 1];
      setLastCheckIn(lastRecord.date);
    }
  };

  const checkTodayStatus = () => {
    const today = getTodayDateString();
    const todayRecords = getUserDataSync<CheckInRecord[]>(STORAGE_KEYS.HISTORY, []);
    const hasCheckedToday = todayRecords.some(record => record.date === today);
    setIsCheckedIn(hasCheckedToday);
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleCheckIn = () => {
    if (isCheckedIn) return;

    const today = getTodayDateString();
    const record: CheckInRecord = {
      date: today,
      timestamp: Date.now()
    };

    // 更新历史记录
    const newHistory = [...checkInHistory, record];
    setUserData(STORAGE_KEYS.HISTORY, newHistory);

    // 更新状态
    setIsCheckedIn(true);
    setCheckInHistory(newHistory);
    setTotalDays(newHistory.length);

    // 同步到任务系统 - 完成每日签到任务
    import('@/utils/taskManager').then(({ updateDailyTaskProgress }) => {
      updateDailyTaskProgress('daily-question', 1); // 签到算作完成一次问题思考
    });
  };

  const getStreakMessage = () => {
    if (totalDays === 0) return '开始签到，培养好习惯！';
    if (totalDays < 7) return '继续坚持，养成习惯！';
    if (totalDays < 30) return '很棒！继续保持！';
    if (totalDays < 100) return '太厉害了！坚持不懈！';
    return '你是签到大师！';
  };

  const getMonthData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const hasChecked = checkInHistory.some(record => record.date === dateString);
      const isToday = i === now.getDate();
      const isFuture = i > now.getDate();

      days.push({
        day: i,
        date: dateString,
        hasChecked,
        isToday,
        isFuture
      });
    }

    return days;
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthData = getMonthData();

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-green-500" />
              <h1 className="text-xl font-bold text-green-700 dark:text-green-300">
                每日签到
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
          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={24} className="text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">累计签到</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalDays}
                <span className="text-lg ml-1">天</span>
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <Star size={24} className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">今日状态</span>
              </div>
              <p className={`text-2xl font-bold ${isCheckedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {isCheckedIn ? '已签到 ✓' : '未签到'}
              </p>
            </div>
          </motion.div>

          {/* 签到卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-green-200 dark:border-green-800 mb-8"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {isCheckedIn ? '今日已签到 ✓' : '立即签到'}
              </motion.h2>
              <p className="text-green-100 text-sm">
                {isCheckedIn ? '明天继续加油！' : getStreakMessage()}
              </p>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* 签到按钮 */}
                <motion.button
                  whileHover={{ scale: isCheckedIn ? 1 : 1.05 }}
                  whileTap={{ scale: isCheckedIn ? 1 : 0.95 }}
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className={`w-full max-w-md px-8 py-6 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                    isCheckedIn
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-xl'
                  }`}
                >
                  {isCheckedIn ? (
                    <>
                      <CheckCircle size={32} />
                      <span>已签到</span>
                    </>
                  ) : (
                    <>
                      <Target size={32} />
                      <span>立即签到</span>
                    </>
                  )}
                </motion.button>

                {/* 签到提示 */}
                {totalDays > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                      {getStreakMessage()}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp size={20} className="text-green-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        已累计签到 <span className="font-bold text-green-600 dark:text-green-400">{totalDays}</span> 天
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 上次签到时间 */}
                {lastCheckIn && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    上次签到: {lastCheckIn}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* 月历视图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-green-500" />
              本月签到记录
            </h3>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期格子 */}
            <div className="grid grid-cols-7 gap-2">
              {monthData.map((dayInfo) => (
                <motion.div
                  key={dayInfo.date}
                  whileHover={dayInfo.isToday && !dayInfo.isFuture ? { scale: 1.1 } : {}}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    dayInfo.isFuture
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                      : dayInfo.isToday
                      ? dayInfo.hasChecked
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
                      : dayInfo.hasChecked
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {dayInfo.day}
                  {dayInfo.hasChecked && !dayInfo.isToday && (
                    <CheckCircle size={12} className="ml-1" />
                  )}
                  {dayInfo.isToday && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
