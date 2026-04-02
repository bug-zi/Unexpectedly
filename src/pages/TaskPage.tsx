/**
 * 任务页面 - 粉红色主题设计
 * 每日任务和每周任务分离展示
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Trophy,
  Flame,
  Star,
  Award,
  TrendingUp,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getDailyTasks,
  getWeeklyTasks,
  getTaskStreak,
  getTodayTaskProgress,
  getCompletedDaysCount,
  repairTaskProgressFromRecords,
} from '@/utils/taskManager';
import { WeeklyTask } from '@/types/tasks';
import { toast } from 'react-toastify';

export function TaskPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'calendar'>('daily');
  const [dailyTasks, setDailyTasks] = useState<ReturnType<typeof getDailyTasks>>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<ReturnType<typeof getWeeklyTasks>>([]);
  const [streak, setStreak] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [weeklyCompleted, setWeeklyCompleted] = useState(false);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 加载任务数据
  const loadTasks = () => {
    setDailyTasks(getDailyTasks());
    setWeeklyTasks(getWeeklyTasks());

    // 使用累计完成任务的天数（只有完成所有每日任务才算）
    const completedDays = getCompletedDaysCount();
    setStreak(completedDays);

    const progress = getTodayTaskProgress();
    setDailyCompleted(progress.dailyCompleted);
    setWeeklyCompleted(progress.weeklyCompleted);

    // 加载完成日期
    loadCompletedDates();
  };

  // 加载完成日期
  const loadCompletedDates = () => {
    // 扫描所有可能的任务进度键，找到有数据的那个
    const taskSuffix = 'wanwan-task-progress';
    let saved: string | null = null;

    // 先尝试当前用户的键
    const userId = sessionStorage.getItem('current-user-id');
    const prefix = userId ? `user-${userId}-` : 'guest-';
    const currentKey = prefix + taskSuffix;
    saved = localStorage.getItem(currentKey);

    // 如果当前键没有数据，扫描其他用户键
    if (!saved) {
      for (const key of Object.keys(localStorage)) {
        if (key.endsWith(taskSuffix) && key !== currentKey) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (parsed && typeof parsed === 'object') {
                saved = val;
                break;
              }
            } catch { /* ignore */ }
          }
        }
      }
    }

    if (!saved) {
      setCompletedDates(new Set());
      return;
    }

    try {
      const allProgress: Record<string, any> = JSON.parse(saved);
      const completed = new Set<string>();

      Object.entries(allProgress).forEach(([date, progress]: [string, any]) => {
        if (progress.dailyCompleted === true) {
          completed.add(date);
        }
      });

      setCompletedDates(completed);
    } catch (error) {
      console.error('加载完成日期失败:', error);
      setCompletedDates(new Set());
    }
  };

  useEffect(() => {
    // 先从游戏记录中修复可能丢失的任务进度
    repairTaskProgressFromRecords();
    loadTasks();

    // 每5秒刷新一次任务状态
    const interval = setInterval(loadTasks, 5000);

    return () => clearInterval(interval);
  }, []);

  // 处理每周任务点击
  const handleWeeklyTaskClick = (task: WeeklyTask & { completedAt?: string }) => {
    if (task.completed) return;

    if (task.id === 'weekly-review') {
      navigate('/history');
      toast.info('在历史记录中选择一个最值得思考的问题吧！');
    } else if (task.id === 'weekly-summary') {
      navigate('/writing');
      toast.info('开始写你的周末总结吧！');
    }
  };

  // 计算每日任务完成百分比
  const dailyProgressPercent = dailyTasks.length > 0
    ? (dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100
    : 0;

  // 计算每周任务完成百分比
  const weeklyProgressPercent = weeklyTasks.length > 0
    ? (weeklyTasks.filter(t => t.completed).length / weeklyTasks.length) * 100
    : 0;

  // 生成日历数据
  const getCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 是周日

    const calendar = [];

    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push({ day: null, date: null });
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isCompleted = completedDates.has(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      calendar.push({
        day,
        date: dateString,
        isCompleted,
        isToday
      });
    }

    return calendar;
  };

  // 切换月份
  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };

  const calendarData = getCalendarData();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-picture/bg-index.jpg)' }}
      />
      {/* 半透明渐变遮罩 - 顶部更实，底部自然过渡 */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 100%)' }} />
      <div className="hidden dark:block fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,41,0.75) 0%, rgba(15,23,41,0.55) 20%, rgba(15,23,41,0.4) 50%, rgba(15,23,41,0.6) 100%)' }} />

      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-pink-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-pink-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
                任务中心
              </h1>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl shadow-2xl p-6 mb-8 text-white"
          >
            {/* 背景图片 */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/UI-picture/UI-tasks1.jpg)' }}
            />
            {/* 半透明遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/60 via-rose-400/50 to-sky-400/60" />

            <div className="relative">
              {/* 顶部标签 */}
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trophy size={18} className="text-yellow-300" />
                  <span className="text-sm font-semibold">累计完成</span>
                </motion.div>

                {streak >= 7 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 bg-yellow-400/30 backdrop-blur-sm rounded-full px-3 py-1"
                  >
                    <Star size={16} className="text-yellow-200 fill-yellow-200" />
                    <span className="text-xs font-bold">一周达成</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <motion.span
                      key={streak}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-7xl font-black"
                    >
                      {streak}
                    </motion.span>
                    <span className="text-pink-100 text-2xl font-medium">天</span>
                  </div>

                  {dailyCompleted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"
                    >
                      <Zap size={18} className="text-yellow-300" />
                      <span className="font-medium">今日任务已全部完成！</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2 text-pink-100">
                      <TrendingUp size={18} />
                      <span className="text-sm">加油，继续坚持！</span>
                    </div>
                  )}
                </div>

                <motion.div
                  animate={
                    dailyCompleted
                      ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                  <Trophy
                    size={80}
                    className="relative text-pink-200/60 drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* 底部成就指示 */}
              {streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4"
                >
                  <span className="text-sm text-pink-100">
                    已完成 {streak} 天，继续加油！
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 标签页切换 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl shadow-xl p-2 mb-6 overflow-hidden"
          >
            {/* 背景图片 */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/UI-picture/UI-tasks-tabs.jpg)' }}
            />
            {/* 半透明遮罩 */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('daily')}
                className="relative flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Target size={18} />
                  <span className="text-sm">每日任务</span>
                  {dailyCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 rounded-full p-0.5"
                    >
                      <CheckCircle2 size={14} className="text-white" />
                    </motion.div>
                  )}
                </div>
                {activeTab === 'daily' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl shadow-lg bg-cover bg-center overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(219,39,119,0.65), rgba(14,165,233,0.65)), url(/UI-picture/UI-tasks-tabs.jpg)'
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeTab === 'daily' && (
                  <span className="relative z-10 text-white text-sm">每日任务</span>
                )}
                {activeTab !== 'daily' && !dailyCompleted && (
                  <span className="text-gray-600 text-sm">每日任务</span>
                )}
                {activeTab !== 'daily' && dailyCompleted && (
                  <span className="text-green-600 text-sm">每日任务</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('weekly')}
                className="relative flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Calendar size={18} />
                  <span className="text-sm">每周任务</span>
                  {weeklyCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 rounded-full p-0.5"
                    >
                      <CheckCircle2 size={14} className="text-white" />
                    </motion.div>
                  )}
                </div>
                {activeTab === 'weekly' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl shadow-lg bg-cover bg-center overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(219,39,119,0.65), rgba(14,165,233,0.65)), url(/UI-picture/UI-tasks-tabs.jpg)'
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeTab === 'weekly' && (
                  <span className="relative z-10 text-white text-sm">每周任务</span>
                )}
                {activeTab !== 'weekly' && !weeklyCompleted && (
                  <span className="text-gray-600 text-sm">每周任务</span>
                )}
                {activeTab !== 'weekly' && weeklyCompleted && (
                  <span className="text-green-600 text-sm">每周任务</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className="relative flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Trophy size={18} />
                  <span className="text-sm">完成情况</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                  >
                    {completedDates.size}
                  </motion.div>
                </div>
                {activeTab === 'calendar' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl shadow-lg bg-cover bg-center overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(219,39,119,0.65), rgba(14,165,233,0.65)), url(/UI-picture/UI-tasks-tabs.jpg)'
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeTab === 'calendar' && (
                  <span className="relative z-10 text-white text-sm">完成情况</span>
                )}
                {activeTab !== 'calendar' && (
                  <span className="text-gray-600 text-sm">完成情况</span>
                )}
              </button>
            </div>
          </motion.div>

          {/* 任务内容 */}
          <AnimatePresence mode="wait">
            {activeTab === 'calendar' ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* 日历视图 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6"
                >
                  {/* 月份导航 */}
                  <div className="flex items-center justify-between mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => changeMonth(-1)}
                      className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100 hover:from-pink-200 hover:to-sky-200 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-pink-600" />
                    </motion.button>

                    <div className="text-center">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
                        {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        完成天数: {Array.from(completedDates).filter(date => {
                          const d = new Date(date);
                          return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                        }).length} 天
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => changeMonth(1)}
                      className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100 hover:from-pink-200 hover:to-sky-200 transition-colors"
                    >
                      <ChevronRight size={20} className="text-sky-600" />
                    </motion.button>
                  </div>

                  {/* 星期标题 */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                      <div
                        key={index}
                        className="text-center text-sm font-semibold text-gray-600 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 日历格子 */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.map((dayInfo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        whileHover={dayInfo.day ? { scale: 1.1 } : {}}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                          !dayInfo.day
                            ? 'bg-transparent'
                            : dayInfo.isToday
                            ? 'bg-gradient-to-br from-pink-400 to-sky-400 text-white shadow-lg'
                            : dayInfo.isCompleted
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {dayInfo.day && (
                          <span className="relative">
                            {dayInfo.day}
                            {dayInfo.isCompleted && !dayInfo.isToday && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                                      />
                                    )}
                            {dayInfo.isToday && (
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                                    )}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* 图例 */}
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300"></div>
                      <span className="text-sm text-gray-600">已完成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-100"></div>
                      <span className="text-sm text-gray-600">未完成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-400 to-sky-400"></div>
                      <span className="text-sm text-gray-600">今天</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : activeTab === 'daily' ? (
              <motion.div
                key="daily"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* 每日任务进度条 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-5 mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100">
                        <TrendingUp size={18} className="text-pink-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">今日进度</span>
                    </div>
                    <motion.div
                      key={dailyProgressPercent}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="flex items-baseline gap-1"
                    >
                      <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
                        {Math.round(dailyProgressPercent)}
                      </span>
                      <span className="text-sm font-bold text-gray-600">%</span>
                    </motion.div>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyProgressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{dailyTasks.filter(t => t.completed).length} / {dailyTasks.length} 已完成</span>
                    {dailyProgressPercent === 100 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-green-600 font-semibold"
                      >
                        <Award size={12} />
                        全部达成
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* 每日任务列表 */}
                <div className="space-y-4">
                  {dailyTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                        task.completed
                          ? 'border-2 border-green-200 shadow-green-100/50'
                          : 'border-2 border-pink-200 hover:border-sky-400 hover:shadow-sky-200/50'
                      }`}
                    >
                      {/* 背景装饰 */}
                      {!task.completed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ rotate: task.completed ? 0 : 90 }}
                              transition={{ duration: 0.3 }}
                              className={`p-3 rounded-2xl ${
                                task.completed
                                  ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                                  : 'bg-gradient-to-br from-pink-100 to-sky-100'
                              }`}
                            >
                              {task.completed ? (
                                <CheckCircle2 size={26} className="text-green-600" />
                              ) : (
                                <Circle size={26} className="text-pink-600" />
                              )}
                            </motion.div>

                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                {task.title}
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`text-center px-4 py-2 rounded-xl ${
                              task.completed
                                ? 'bg-green-100'
                                : 'bg-gradient-to-br from-pink-100 to-sky-100'
                            }`}
                          >
                            <div className="text-3xl font-black bg-gradient-to-br from-pink-600 to-sky-600 bg-clip-text text-transparent">
                              {task.current}
                            </div>
                            <div className="text-xs text-gray-600 font-medium mt-0.5">
                              / {task.target}
                            </div>
                          </motion.div>
                        </div>

                        {/* 进度条 */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full rounded-full relative overflow-hidden ${
                                task.completed
                                  ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'
                                  : 'bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400'
                              }`}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                  x: ['-100%', '100%'],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              />
                            </motion.div>
                          </div>

                          {/* 进度百分比标签 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-1 right-0 transform translate-y-full"
                          >
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                task.completed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {Math.round(task.progress)}%
                            </span>
                          </motion.div>
                        </div>

                        {task.completed && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Award size={18} className="text-green-600" />
                            </motion.div>
                            <span className="text-green-700 font-semibold text-sm">
                              太棒了！任务已完成
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* 每周任务进度条 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-5 mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100">
                        <Calendar size={18} className="text-sky-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">本周进度</span>
                    </div>
                    <motion.div
                      key={weeklyProgressPercent}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="flex items-baseline gap-1"
                    >
                      <span className="text-2xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        {Math.round(weeklyProgressPercent)}
                      </span>
                      <span className="text-sm font-bold text-gray-600">%</span>
                    </motion.div>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weeklyProgressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{weeklyTasks.filter(t => t.completed).length} / {weeklyTasks.length} 已完成</span>
                    {weeklyProgressPercent === 100 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-sky-600 font-semibold"
                      >
                        <Star size={12} className="fill-current" />
                        周目标达成
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* 每周任务列表 */}
                <div className="space-y-4">
                  {weeklyTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={task.completed ? {} : { scale: 1.02, y: -2 }}
                      whileTap={task.completed ? {} : { scale: 0.98 }}
                      onClick={() => handleWeeklyTaskClick(task)}
                      className={`group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                        task.completed
                          ? 'border-2 border-green-200 opacity-70'
                          : 'border-2 border-sky-200 hover:border-blue-400 hover:shadow-sky-200/50 cursor-pointer'
                      }`}
                    >
                      {/* 背景装饰 */}
                      {!task.completed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      <div className="relative p-6">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: task.completed ? 0 : 90 }}
                            transition={{ duration: 0.3 }}
                            className={`p-3 rounded-2xl flex-shrink-0 ${
                              task.completed
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                                : 'bg-gradient-to-br from-sky-100 to-blue-100'
                            }`}
                          >
                            {task.completed ? (
                              <CheckCircle2 size={26} className="text-green-600" />
                            ) : (
                              <Circle size={26} className="text-sky-600" />
                            )}
                          </motion.div>

                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {task.description}
                            </p>

                            {task.completed && task.completedAt && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2"
                              >
                                <Award size={16} className="text-green-600" />
                                <span className="text-green-700 text-sm font-medium">
                                  完成于 {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                              </motion.div>
                            )}

                            {!task.completed && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="mt-3 flex items-center gap-2 text-sky-600 text-sm font-medium"
                              >
                                <Sparkles size={14} />
                                <span>点击开始任务</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 提示信息 */}
          {!dailyCompleted && activeTab === 'daily' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-br from-pink-50 to-rose-50 backdrop-blur-lg border-2 border-pink-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="p-2 rounded-xl bg-pink-100 flex-shrink-0"
                >
                  <Sparkles size={20} className="text-pink-600" />
                </motion.div>
                <div className="flex-1">
                  <h5 className="font-bold text-pink-900 mb-1">小贴士</h5>
                  <p className="text-sm text-pink-800 leading-relaxed">
                    完成任务后，进度会自动更新。每天坚持一点点，培养深度思考习惯！
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!weeklyCompleted && activeTab === 'weekly' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-br from-sky-50 to-blue-50 backdrop-blur-lg border-2 border-sky-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="p-2 rounded-xl bg-sky-100 flex-shrink-0"
                >
                  <Target size={20} className="text-sky-600" />
                </motion.div>
                <div className="flex-1">
                  <h5 className="font-bold text-sky-900 mb-1">每周任务</h5>
                  <p className="text-sm text-sky-800 leading-relaxed">
                    周末是回顾本周思考、总结收获的好时机。点击任务卡片即可开始！
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
