/**
 * 每日签到页面 - Glassmorphism 柔光主题
 * 灵感来源: code1(Calendar Vault), code2(Mood Selection), code3(Hero CTA)
 * 记录用户的每日签到情况，支持心情选择
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Flame, Droplets, Leaf, X } from 'lucide-react';
import { getUserDataSync, setUserData } from '@/utils/userStorage';

// ---------- 类型 ----------

interface CheckInRecord {
  date: string;
  timestamp: number;
  mood?: MoodType;
}

type MoodType = 'coral' | 'orange' | 'blue' | 'green';

interface MoodConfig {
  type: MoodType;
  label: string;
  labelCn: string;
  icon: React.ReactNode;
  dotClass: string;
  bgClass: string;
  shadowClass: string;
  ringClass: string;
}

const STORAGE_KEYS = {
  HISTORY: 'checkin-history',
};

const MOODS: MoodConfig[] = [
  {
    type: 'coral',
    label: 'Passionate',
    labelCn: '热情',
    icon: <Heart size={36} className="text-white" />,
    dotClass: 'bg-[#FF6B6B] shadow-[0_0_12px_rgba(255,107,107,0.6)]',
    bgClass: 'bg-[#FF6B6B]',
    shadowClass: 'shadow-[0_10px_20px_rgba(255,107,107,0.4)]',
    ringClass: 'focus:ring-[#FF6B6B]/30',
  },
  {
    type: 'orange',
    label: 'Energetic',
    labelCn: '活力',
    icon: <Flame size={36} className="text-white" />,
    dotClass: 'bg-[#FF9F43] shadow-[0_0_12px_rgba(255,159,67,0.6)]',
    bgClass: 'bg-[#FF9F43]',
    shadowClass: 'shadow-[0_10px_20px_rgba(255,159,67,0.4)]',
    ringClass: 'focus:ring-[#FF9F43]/30',
  },
  {
    type: 'blue',
    label: 'Calm',
    labelCn: '平静',
    icon: <Droplets size={36} className="text-white" />,
    dotClass: 'bg-[#48DBFB] shadow-[0_0_12px_rgba(72,219,251,0.6)]',
    bgClass: 'bg-[#48DBFB]',
    shadowClass: 'shadow-[0_10px_20px_rgba(72,219,251,0.4)]',
    ringClass: 'focus:ring-[#48DBFB]/30',
  },
  {
    type: 'green',
    label: 'Fresh',
    labelCn: '清新',
    icon: <Leaf size={36} className="text-white" />,
    dotClass: 'bg-[#1DD1A1] shadow-[0_0_12px_rgba(29,209,161,0.6)]',
    bgClass: 'bg-[#1DD1A1]',
    shadowClass: 'shadow-[0_10px_20px_rgba(29,209,161,0.4)]',
    ringClass: 'focus:ring-[#1DD1A1]/30',
  },
];

// ---------- 主页面 ----------

export function CheckInPage() {
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodType | null>(null);

  useEffect(() => {
    loadCheckInData();
    checkTodayStatus();
  }, []);

  useEffect(() => {
    const handleDataChange = () => {
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
  };

  const checkTodayStatus = () => {
    const today = getTodayDateString();
    const records = getUserDataSync<CheckInRecord[]>(STORAGE_KEYS.HISTORY, []);
    const todayRecord = records.find((r) => r.date === today);
    setIsCheckedIn(!!todayRecord);
    if (todayRecord?.mood) {
      setTodayMood(todayRecord.mood);
    }
  };

  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleOpenMoodPicker = useCallback(() => {
    if (isCheckedIn) return;
    setShowMoodPicker(true);
  }, [isCheckedIn]);

  const handleSelectMood = useCallback((mood: MoodType) => {
    const today = getTodayDateString();
    const record: CheckInRecord = { date: today, timestamp: Date.now(), mood };
    const history = getUserDataSync<CheckInRecord[]>(STORAGE_KEYS.HISTORY, []);
    const newHistory = [...history, record];
    setUserData(STORAGE_KEYS.HISTORY, newHistory);
    setIsCheckedIn(true);
    setTodayMood(mood);
    setCheckInHistory(newHistory);
    setTotalDays(newHistory.length);
    setShowMoodPicker(false);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  }, []);

  // ---------- 日历数据 ----------

  const getMonthData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay(): 0=Sunday, need Monday-first: (day + 6) % 7
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, date: '', hasChecked: false, isToday: false, isFuture: true, isEmpty: true, mood: undefined as MoodType | undefined });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const record = checkInHistory.find((r) => r.date === dateString);
      days.push({
        day: i,
        date: dateString,
        hasChecked: !!record,
        isToday: i === now.getDate(),
        isFuture: i > now.getDate(),
        isEmpty: false,
        mood: record?.mood,
      });
    }
    return days;
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const monthData = getMonthData();
  const today = new Date();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  // ---------- 统计 ----------

  const thisMonthRecords = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return checkInHistory.filter((r) => r.date.startsWith(prefix));
  }, [checkInHistory]);

  const dominantMood = useMemo((): MoodConfig | null => {
    const moodCounts: Record<string, number> = {};
    thisMonthRecords.forEach((r) => {
      if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });
    const entries = Object.entries(moodCounts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return MOODS.find((m) => m.type === entries[0][0]) || null;
  }, [thisMonthRecords]);

  // 签到庆祝粒子
  const celebrationParticles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (360 / 16) * i,
      distance: 60 + Math.random() * 50,
      size: Math.random() * 6 + 3,
      color: ['#FF6B6B', '#FF9F43', '#48DBFB', '#1DD1A1', '#fbbf24'][i % 5],
    })), []);

  const todayMoodConfig = todayMood ? MOODS.find((m) => m.type === todayMood) : null;

  // 日期格式化
  const formatDate = () => {
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()];
    return `${y}年${m}月${d}日 · 星期${dayOfWeek}`;
  };

  return (
    <div
      className="min-h-screen font-['Space_Grotesk',sans-serif] text-[#2D3436] overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FFEBF0 0%, #E0F7FA 50%, #F5F7FA 100%)' }}
    >
      {/* 背景装饰 */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,159,67,0.15))', filter: 'blur(100px)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(225deg, rgba(72,219,251,0.15), rgba(29,209,161,0.15))', filter: 'blur(120px)' }} />

      {/* 主容器 */}
      <div className="relative w-full max-w-[1200px] min-h-screen md:min-h-0 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">

        {/* ---- 左侧栏 (Sidebar) ---- */}
        <aside
          className="glass-panel w-full md:w-[240px] rounded-[24px] md:rounded-[32px] p-5 md:p-6 flex flex-row md:flex-col justify-between md:justify-between shrink-0 relative z-10"
        >
          <div className="flex-1 md:flex-none">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-8 text-[#2D3436]/80">
              本月 <span className="text-sm font-normal text-[#636E72]">(This Month)</span>
            </h2>
            <div className="mb-4 md:mb-10">
              <p className="text-xs md:text-sm text-[#636E72] mb-1 md:mb-2 font-medium">累计打卡 (Total Days)</p>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-4xl md:text-6xl font-bold text-[#f53d3d] tracking-tighter">{thisMonthRecords.length}</span>
                <span className="text-[#636E72] font-medium text-sm">天</span>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-[#636E72] mb-4 font-medium">主导心情 (Dominant Mood)</p>
              {dominantMood ? (
                <div className="flex items-center gap-3 bg-white/30 rounded-full p-3 border border-white/50">
                  <div className={`w-10 h-10 rounded-full ${dominantMood.bgClass} ${dominantMood.shadowClass} flex items-center justify-center`}>
                    {dominantMood.icon}
                  </div>
                  <span className="font-bold text-[#2D3436]">{dominantMood.labelCn} ({dominantMood.label})</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white/30 rounded-full p-3 border border-white/50">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-white text-lg">?</span>
                  </div>
                  <span className="font-bold text-[#636E72]">暂无数据</span>
                </div>
              )}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="hidden md:flex w-full h-32 rounded-2xl bg-gradient-to-t from-white/40 to-transparent border border-white/20 items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <span className="text-[#636E72]/50 text-sm font-medium z-10 relative">
              {isCheckedIn ? 'Great job! ✨' : 'Keep it up! ✨'}
            </span>
          </div>

          {/* 移动端返回按钮 */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/60 transition-colors"
            >
              <ArrowLeft size={18} />
            </motion.button>
          </div>
        </aside>

        {/* ---- 右侧主区域 ---- */}
        <main className="flex-1 flex flex-col relative z-0">
          {/* 顶部栏 */}
          <header className="flex justify-between items-center mb-3 md:mb-5 h-10 md:h-12">
            <div className="flex items-center gap-3">
              {/* 返回按钮 - 桌面端 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="hidden md:flex w-12 h-12 glass-panel rounded-full items-center justify-center hover:bg-white/60 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </motion.button>
              <h1 className="text-xl md:text-3xl font-bold text-[#2D3436] tracking-tight">
                {monthNames[today.getMonth()]}日历{' '}
                <span className="text-base md:text-xl font-normal text-[#636E72] ml-1 md:ml-2">
                  {today.toLocaleDateString('en-US', { month: 'long' })} Vault
                </span>
              </h1>
            </div>
            {/* 日期药丸 + 连续天数 */}
            <div className="flex items-center gap-2">
              <div className="glass-panel rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-[#636E72] font-medium hidden md:block">
                {formatDate()}
              </div>
              {totalDays > 0 && (
                <div className="glass-panel rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1 md:gap-2">
                  <span className="text-sm md:text-lg">🔥</span>
                  <span className="text-xs md:text-sm font-bold text-[#2D3436] tracking-wide">累计 {totalDays} 天</span>
                </div>
              )}
            </div>
          </header>

          {/* 未签到时显示 Hero CTA 区域 */}
          <AnimatePresence mode="wait">
            {!isCheckedIn && !showMoodPicker && (
              <motion.div
                key="hero-cta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="glass-panel rounded-[24px] md:rounded-[32px] p-6 md:p-10 mb-3 md:mb-5 flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* 装饰光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#2D3436] mb-8 md:mb-16 text-center tracking-tight relative z-10"
                >
                  今日份的<span className="text-[#f53d3d] opacity-90">万万没想到...</span>
                </motion.h2>

                <div className="relative z-10">
                  {/* 庆祝粒子 */}
                  <AnimatePresence>
                    {showCelebration && celebrationParticles.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                          y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenMoodPicker}
                    className="glass-panel glass-button shadow-glass relative w-[180px] md:w-[240px] h-[72px] md:h-[88px] rounded-full flex items-center justify-center cursor-pointer animate-breathe focus:outline-none focus:ring-4 focus:ring-[#f53d3d]/30 overflow-hidden group"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                    <span className="text-[#f53d3d] font-bold text-lg md:text-2xl tracking-widest relative z-10 flex items-center gap-2">
                      立即揭晓
                      <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </span>
                  </motion.button>
                </div>

                <p className="mt-4 md:mt-8 text-[#636E72]/50 text-xs md:text-sm font-medium tracking-widest uppercase relative z-10">
                  Click to check in
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 已签到时显示完成状态 */}
          <AnimatePresence>
            {isCheckedIn && todayMoodConfig && (
              <motion.div
                key="checked-in"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-[24px] md:rounded-[32px] p-5 md:p-6 mb-3 md:mb-5 flex flex-col items-center justify-center"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${todayMoodConfig.bgClass} ${todayMoodConfig.shadowClass} flex items-center justify-center mb-4`}>
                  {todayMoodConfig.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#2D3436] mb-2">今日已签到</h3>
                <p className="text-[#636E72] text-sm">
                  心情: {todayMoodConfig.labelCn} ({todayMoodConfig.label})
                </p>
                <p className="text-[#636E72]/50 text-xs mt-2">累计签到 {totalDays} 天</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- 日历网格 ---- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex-1 flex flex-col min-h-0"
          >
            {/* 星期标题 (Monday first) */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-3 text-center">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-[#636E72] font-semibold text-xs md:text-sm py-1 ${i >= 5 ? 'opacity-50' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {monthData.map((dayInfo, idx) => {
                if (dayInfo.isEmpty) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const isCheckDay = dayInfo.hasChecked;
                const isToday = dayInfo.isToday;
                const isFuture = dayInfo.isFuture;
                const moodCfg = dayInfo.mood ? MOODS.find((m) => m.type === dayInfo.mood) : null;

                return (
                  <motion.div
                    key={dayInfo.date}
                    whileHover={!isFuture ? { scale: 1.05, y: -2 } : {}}
                    className={`
                      aspect-square rounded-[10px] md:rounded-[14px]
                      glass-cell flex flex-col items-center justify-center relative group cursor-pointer
                      ${isFuture ? 'opacity-40 cursor-default' : ''}
                    `}
                  >
                    <span className={`text-[10px] md:text-sm font-bold mb-0.5 ${
                      isToday ? 'text-[#f53d3d]' : 'text-[#636E72]/60'
                    }`}>
                      {dayInfo.day}
                    </span>

                    {/* 心情点 */}
                    {isCheckDay && moodCfg && (
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${moodCfg.dotClass} ${isToday ? 'animate-pulse' : ''}`} />
                    )}
                    {isCheckDay && !moodCfg && (
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#636E72]/30" />
                    )}

                    {/* 今天标记 - 脉冲边框 */}
                    {isToday && (
                      <>
                        <style>{`
                          @keyframes pulseBorder {
                            0%, 100% { border-color: rgba(255, 255, 255, 0.4); }
                            50% { border-color: rgba(255, 255, 255, 1); }
                          }
                        `}</style>
                        <div
                          className="absolute inset-0 rounded-[10px] md:rounded-[16px] border-2 border-white pointer-events-none"
                          style={{ animation: 'pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                        />
                      </>
                    )}

                    {/* Tooltip (桌面端悬停) */}
                    {isCheckDay && moodCfg && (
                      <div className="tooltip absolute bottom-[calc(100%+12px)] left-1/2 w-48 md:w-64 glass-panel rounded-xl p-3 md:p-4 shadow-xl pointer-events-none hidden md:block">
                        <div className="text-xs text-[#636E72] mb-1 font-bold">
                          {(() => { const p = dayInfo.date.split('-'); return `${p[0]}年${p[1]}月${p[2]}日`; })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${moodCfg.dotClass}`} />
                          <span className="text-sm font-bold text-[#2D3436]">{moodCfg.labelCn}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* 图例 */}
            <div className="flex items-center justify-center gap-4 md:gap-6 mt-2 md:mt-4 text-xs text-[#636E72]/60">
              {MOODS.map((mood) => (
                <span key={mood.type} className="flex items-center gap-1 md:gap-1.5">
                  <span className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${mood.dotClass}`} />
                  <span className="hidden md:inline">{mood.labelCn}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      {/* ---- 心情选择弹窗 ---- */}
      <AnimatePresence>
        {showMoodPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            onClick={() => setShowMoodPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-panel w-full max-w-[500px] rounded-[24px] shadow-glass flex flex-col items-center justify-center relative overflow-hidden p-8 md:p-12"
              style={{ minHeight: '320px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 内部光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[24px]" />

              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMoodPicker(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-[#2D3436]/40 hover:text-[#2D3436] transition-colors focus:outline-none z-20"
              >
                <X size={24} />
              </motion.button>

              {/* 标题 */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-[32px] font-bold text-[#2D3436] mb-8 md:mb-12 relative z-10 tracking-tight"
              >
                此刻心情如何？
              </motion.h2>

              {/* 心情选择按钮 + 标签 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-5 md:gap-8 relative z-10"
              >
                {MOODS.map((mood, index) => (
                  <motion.div
                    key={mood.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.button
                      whileHover={{ y: -10, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectMood(mood.type)}
                      className={`w-16 h-16 md:w-[80px] md:h-[80px] rounded-full ${mood.bgClass} ${mood.shadowClass} flex items-center justify-center focus:outline-none focus:ring-4 ${mood.ringClass} transition-all`}
                    >
                      {mood.icon}
                    </motion.button>
                    <span className="text-xs text-[#636E72] text-center font-medium">
                      {mood.labelCn}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全局样式 */}
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-left: 1px solid rgba(255, 255, 255, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .glass-cell {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .glass-cell:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 24px rgba(31, 38, 135, 0.1);
        }

        .glass-button {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform-style: preserve-3d;
        }

        .glass-button:hover {
          transform: scale(1.05) translateZ(10px);
        }

        .glass-button:active {
          transform: scale(0.95);
        }

        .tooltip {
          opacity: 0;
          pointer-events: none;
          transform: translateY(10px) translateX(-50%);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-cell:hover .tooltip {
          opacity: 1;
          transform: translateY(-10px) translateX(-50%);
          z-index: 50;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-4px); }
        }

        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
