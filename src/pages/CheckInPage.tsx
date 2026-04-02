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

const MOOD_BG_IMAGE: Record<MoodType, string> = {
  coral: '/UI-picture/UI-logic2.jpg',
  orange: '/UI-picture/UI-question1.jpg',
  blue: '/UI-picture/UI-writing1.jpg',
  green: '/UI-picture/UI-knowledge2.jpg',
};

const thinkingQuotes = [
  "逻辑不是知识的全部，却是所有知识的出发点。",
  "每一个坚实的结论背后，都站着一排无声的证据。",
  "推理的本质，是从已知的碎片中重构未知的全貌。",
  "如果前提是错的，再严密的逻辑也只会带你走向更远的谬误。",
  "因果律是世界的脊梁，而推理则是顺着脊梁攀爬的过程。",
  "排除所有不可能，剩下的无论多么不可思议，都是真相。",
  "定义不清的讨论，只是在不同频率上的无效呼喊。",
  "逻辑是思维的语法，确保我们不仅在说话，而且在表达意义。",
  "归纳法让我们认识世界，演绎法让我们理解世界。",
  "逻辑的力量在于：它能强迫你的头脑承认它并不想接受的结论。",
  "思考不是为了寻找标准答案，而是为了拆解问题的本质。",
  "伟大的发现往往源于对「理所当然」的第一次怀疑。",
  "洞察力是看穿表象的X射线，能发现事物间隐秘的关联。",
  "所谓直觉，往往是高度熟练后的瞬间推理。",
  "深度思考是孤独的，因为你需要穿过常识的丛林。",
  "最简单的问题，往往需要最深刻的推理才能回答。",
  "观察是收集拼图，而思考是拼合过程。",
  "能够站在对手的角度进行推理，是心智成熟的标志。",
  "偏见是思维的围墙，思考则是拆除围墙的锤子。",
  "真正的深刻，是能将复杂的事物归纳为简单的真理。",
  "怀疑不是终点，而是通往确信的必经之路。",
  "永远不要爱上你的第一个假设。",
  "批判性思维最重要的目标，是审视自己的思维模型。",
  "当所有人的想法都一样时，说明没有人真的在思考。",
  "警惕那些完美的逻辑，因为现实往往充满了随机的杂音。",
  "证伪比证实更有力量，因为它能剔除错误的幻想。",
  "知识的边界由逻辑划定，而认知的疆域由怀疑拓展。",
  "保持开放的心态，但别让你的大脑因为太开放而掉出来。",
  "推理的陷阱通常不在于计算错误，而在于情感倾向。",
  "所有的共识都值得被再次审视。",
  "思考的深度决定了选择的高度。",
  "决策是推理在现实世界中的落脚点。",
  "概率是理性的语言，世界并非非黑即白。",
  "平庸的思维寻找借口，优秀的思维寻找变量。",
  "长期主义的本质，是对未来因果链条的坚定推演。",
  "在信息不足的情况下保持冷静，也是一种高级的逻辑。",
  "推理不仅是向前预测，更是向后追溯失败的根源。",
  "最好的决策不是没有风险，而是算清了风险。",
  "思维模型就像工具箱，你拥有的工具越多，看世界的维度越广。",
  "战略是思考的艺术，而执行是逻辑的验证。",
  "我思故我在。",
  "思想的力量远比枪炮更有穿透力。",
  "思考是灵魂与自己的对话。",
  "逻辑是严寒中的火种，照亮混乱中的秩序。",
  "博学而不思，如同吃下食物却不消化。",
  "推理是连接已知岸边与未知彼岸的桥梁。",
  "智慧的增长不在于信息的积累，而在于对信息处理方式的进化。",
  "逻辑可以带你从A走到B，而想象力和推理能带你去任何地方。",
  "一个人的思维疆域，就是他世界的边界。",
  "终身思考者，永远不会在平庸中老去。",
];

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

  // 今日语录 - 基于日期固定，用户不可更改
  const todayQuote = useMemo(() => {
    const dateStr = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
    const index = parseInt(dateStr, 10) % thinkingQuotes.length;
    return thinkingQuotes[index];
  }, []);

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
      className="min-h-screen font-['Space_Grotesk',sans-serif] text-[#2D3436] overflow-hidden flex items-center justify-center relative"
    >
      {/* 背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-picture/bg-index.jpg')" }}
      />
      {/* 半透明渐变遮罩 */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 100%)' }} />
      <div className="hidden dark:block fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,41,0.75) 0%, rgba(15,23,41,0.55) 20%, rgba(15,23,41,0.4) 50%, rgba(15,23,41,0.6) 100%)' }} />

      {/* 主容器 */}
      <div className="relative w-full max-w-[900px] min-h-screen md:min-h-0 flex flex-col p-3 md:p-5">

        {/* ---- 固定顶部导航 ---- */}
        <header className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/60 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-lg md:text-2xl font-bold text-[#2D3436] tracking-tight">
              {monthNames[today.getMonth()]}日历
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-panel rounded-full px-2 md:px-3 py-1 text-[10px] md:text-xs text-[#636E72] font-medium hidden md:block">
              {formatDate()}
            </div>
            {totalDays > 0 && (
              <div className="glass-panel rounded-full px-2 md:px-3 py-1 flex items-center gap-1">
                <span className="text-xs md:text-sm">🔥</span>
                <span className="text-[10px] md:text-xs font-bold text-[#2D3436] tracking-wide">累计 {totalDays} 天</span>
              </div>
            )}
          </div>
        </header>

        {/* ---- 统计 + 语录 横排 ---- */}
        <div className="flex gap-3 mb-3 md:mb-4">
          {/* 累计打卡 */}
          <div className="glass-panel rounded-[16px] px-4 py-3 flex items-center gap-3 shrink-0">
            <div>
              <p className="text-[10px] md:text-xs text-[#636E72] font-medium">本月打卡</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-4xl font-bold text-[#f53d3d] tracking-tighter">{thisMonthRecords.length}</span>
                <span className="text-[#636E72] font-medium text-xs">天</span>
              </div>
            </div>
          </div>
          {/* 今日语录 */}
          <div className="glass-panel rounded-[16px] px-4 py-3 flex-1 min-w-0 relative overflow-hidden">
            {todayMood && MOOD_BG_IMAGE[todayMood] && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${MOOD_BG_IMAGE[todayMood]}')` }}
                />
                <div className="absolute inset-0 bg-white/60" />
              </>
            )}
            <div className="relative z-10">
              <p className="text-[10px] md:text-xs text-[#636E72] font-medium mb-1">今日语录</p>
              <p className="text-xs md:text-sm text-[#2D3436]/80 leading-relaxed italic line-clamp-2">
                "{todayQuote}"
              </p>
            </div>
          </div>
        </div>

          {/* 未签到时显示 Hero CTA 区域 */}
          <AnimatePresence mode="wait">
            {!isCheckedIn && !showMoodPicker && (
              <motion.div
                key="hero-cta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="glass-panel rounded-[20px] md:rounded-[24px] p-4 md:p-6 mb-2 md:mb-3 flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* 装饰光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl font-bold text-[#2D3436] mb-4 md:mb-6 text-center tracking-tight relative z-10"
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
                    className="glass-panel glass-button shadow-glass relative w-[140px] md:w-[180px] h-[56px] md:h-[68px] rounded-full flex items-center justify-center cursor-pointer animate-breathe focus:outline-none focus:ring-4 focus:ring-[#f53d3d]/30 overflow-hidden group"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                    <span className="text-[#f53d3d] font-bold text-base md:text-xl tracking-widest relative z-10 flex items-center gap-2">
                      立即揭晓
                      <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </span>
                  </motion.button>
                </div>

                <p className="mt-2 md:mt-4 text-[#636E72]/50 text-[10px] md:text-xs font-medium tracking-widest uppercase relative z-10">
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
                className="glass-panel rounded-[20px] md:rounded-[24px] p-3 md:p-4 mb-2 md:mb-3 flex items-center justify-center gap-4"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${todayMoodConfig.bgClass} ${todayMoodConfig.shadowClass} flex items-center justify-center`}>
                  {todayMoodConfig.icon}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[#2D3436]">今日已签到</h3>
                  <p className="text-[#636E72] text-xs">
                    心情: {todayMoodConfig.labelCn} ({todayMoodConfig.label}) · 累计 {totalDays} 天
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- 日历网格 ---- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-[20px] md:rounded-[24px] p-3 md:p-4 flex-1 flex flex-col min-h-0"
          >
            {/* 星期标题 (Monday first) */}
            <div className="grid grid-cols-7 gap-1 mb-1 md:mb-2 text-center">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-[#636E72] font-semibold text-[10px] md:text-xs py-0.5 ${i >= 5 ? 'opacity-50' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {monthData.map((dayInfo, idx) => {
                if (dayInfo.isEmpty) {
                  return <div key={`empty-${idx}`} className="py-2 md:py-3" />;
                }

                const isCheckDay = dayInfo.hasChecked;
                const isToday = dayInfo.isToday;
                const isFuture = dayInfo.isFuture;
                const moodCfg = dayInfo.mood ? MOODS.find((m) => m.type === dayInfo.mood) : null;

                const moodBg = isCheckDay && dayInfo.mood ? MOOD_BG_IMAGE[dayInfo.mood] : null;

                return (
                  <motion.div
                    key={dayInfo.date}
                    whileHover={!isFuture ? { scale: 1.05, y: -2 } : {}}
                    className={`
                      rounded-[8px] md:rounded-[12px] py-2 md:py-3
                      glass-cell flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden
                      ${isFuture ? 'opacity-40 cursor-default' : ''}
                    `}
                  >
                    {/* 日期背景图 */}
                    {moodBg ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${moodBg}')` }}
                        />
                        <div className="absolute inset-0 bg-white/40" />
                      </>
                    ) : !isFuture ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: "url('/UI-picture/UI-checkin.jpg')" }}
                        />
                        <div className="absolute inset-0 bg-white/40" />
                      </>
                    ) : null}
                    <span className={`text-[9px] md:text-xs font-bold relative z-10 ${
                      moodBg ? 'text-white drop-shadow-md' : isToday ? 'text-[#f53d3d]' : 'text-[#636E72]/60'
                    }`}>
                      {dayInfo.day}
                    </span>


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
                          className="absolute inset-0 rounded-[8px] md:rounded-[12px] border-2 border-white pointer-events-none"
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
            <div className="flex items-center justify-center gap-3 md:gap-5 mt-1 md:mt-2 text-[10px] md:text-xs text-[#636E72]/60">
              {MOODS.map((mood) => (
                <span key={mood.type} className="flex items-center gap-1">
                  <span className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${mood.dotClass}`} />
                  <span className="hidden md:inline">{mood.labelCn}</span>
                </span>
              ))}
            </div>
          </motion.div>
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
              className="glass-panel w-full max-w-[560px] rounded-[24px] shadow-glass flex flex-col items-center justify-center relative overflow-hidden p-8 md:p-12"
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
