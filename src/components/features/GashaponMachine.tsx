import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, SkipForward, RotateCcw, Sparkles, Clock } from 'lucide-react';
import type { RandomQuest } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS } from '@/constants/randomQuestConfig';

type MachineState = 'idle' | 'spinning' | 'revealing' | 'displaying';

interface GashaponMachineProps {
  onDispense: () => void;
  currentQuest: RandomQuest | null;
  isGenerating: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onRetry: () => void;
}

// 扭蛋胶囊颜色列表（马卡龙色系）
const CAPSULE_COLORS = [
  'bg-gradient-to-br from-rose-300 to-pink-200',
  'bg-gradient-to-br from-violet-300 to-purple-200',
  'bg-gradient-to-br from-sky-300 to-blue-200',
  'bg-gradient-to-br from-emerald-300 to-green-200',
  'bg-gradient-to-br from-amber-300 to-yellow-200',
  'bg-gradient-to-br from-teal-300 to-cyan-200',
];

// 随机选一个胶囊颜色
function getRandomCapsuleColor() {
  return CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)];
}

export function GashaponMachine({
  onDispense,
  currentQuest,
  isGenerating,
  onComplete,
  onSkip,
  onRetry,
}: GashaponMachineProps) {
  const [machineState, setMachineState] = useState<MachineState>('idle');
  const [spinningColor, setSpinningColor] = useState(0);
  const [revealColor, setRevealColor] = useState(getRandomCapsuleColor());
  const [showEncouragement, setShowEncouragement] = useState(false);

  // spinning 状态下快速轮换颜色
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (machineState === 'spinning') {
      interval = setInterval(() => {
        setSpinningColor((prev) => (prev + 1) % CAPSULE_COLORS.length);
      }, 80);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [machineState]);

  // 当 currentQuest 从 null 变为有值，进入 revealing
  useEffect(() => {
    if (currentQuest && machineState === 'spinning') {
      setRevealColor(getRandomCapsuleColor());
      const timer = setTimeout(() => {
        setMachineState('revealing');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuest, machineState]);

  // revealing 1秒后进入 displaying
  useEffect(() => {
    if (machineState === 'revealing') {
      const timer = setTimeout(() => {
        setMachineState('displaying');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [machineState]);

  const handleDispense = useCallback(() => {
    if (isGenerating || machineState !== 'idle') return;
    setMachineState('spinning');
    setShowEncouragement(false);
    onDispense();
  }, [isGenerating, machineState, onDispense]);

  const handleComplete = useCallback(() => {
    setShowEncouragement(true);
    setTimeout(() => {
      onComplete();
      setMachineState('idle');
      setShowEncouragement(false);
    }, 1500);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    onSkip();
    setMachineState('idle');
    setShowEncouragement(false);
  }, [onSkip]);

  const handleRetry = useCallback(() => {
    onRetry();
    setMachineState('idle');
    setShowEncouragement(false);
  }, [onRetry]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* 扭蛋机主体 */}
      <div className="relative w-full">
        {/* 闪光粒子效果 (idle/spinning) */}
        <AnimatePresence>
          {(machineState === 'idle' || machineState === 'spinning') && (
            <>
              {[
                { x: '15%', y: '20%', delay: 0 },
                { x: '75%', y: '15%', delay: 0.5 },
                { x: '85%', y: '55%', delay: 1 },
                { x: '10%', y: '60%', delay: 1.5 },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300/60"
                  style={{ left: pos.x, top: pos.y }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                    y: [0, -10, -20],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: pos.delay,
                    ease: 'easeInOut',
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* 扭蛋机玻璃罩 */}
        <motion.div
          animate={
            machineState === 'spinning'
              ? { rotate: [-1, 1, -1], y: [-2, 2, -2] }
              : { rotate: 0, y: 0 }
          }
          transition={
            machineState === 'spinning'
              ? { duration: 0.1, repeat: Infinity }
              : { duration: 0.3 }
          }
          className="relative bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl p-6 border border-white/30 dark:border-gray-600/30 shadow-xl"
        >
          {/* 扭蛋胶囊区域 */}
          <div className={`relative flex items-center justify-center transition-all duration-500 ${machineState === 'displaying' ? 'min-h-[240px]' : 'h-40 overflow-hidden'}`}>
            <AnimatePresence mode="wait">
              {machineState === 'idle' && (
                <motion.div
                  key="idle-capsules"
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-12 h-12 rounded-full ${CAPSULE_COLORS[i]} shadow-lg`}
                      animate={{
                        y: [0, -6, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {machineState === 'spinning' && (
                <motion.div
                  key="spinning"
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-12 h-12 rounded-full ${CAPSULE_COLORS[(spinningColor + i) % CAPSULE_COLORS.length]} shadow-lg`}
                      animate={{ scale: [1, 0.9, 1] }}
                      transition={{ duration: 0.15, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              )}

              {machineState === 'revealing' && (
                <motion.div
                  key="revealing"
                  className={`w-16 h-16 rounded-full ${revealColor} shadow-xl`}
                  initial={{ scale: 0.5, y: -20, rotate: -180 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                />
              )}

              {machineState === 'displaying' && currentQuest && (
                <motion.div
                  key="displaying"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="w-full"
                >
                  {showEncouragement ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="text-2xl mb-2">✨</div>
                      <p className="text-base text-gray-700 dark:text-gray-200 font-medium">
                        {currentQuest.encouragement}
                      </p>
                    </motion.div>
                  ) : (
                    <QuestCard
                      quest={currentQuest}
                      onComplete={handleComplete}
                      onSkip={handleSkip}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 出口装饰 */}
          <div className="flex justify-center mt-2">
            <div className="w-16 h-3 bg-gray-300/50 dark:bg-gray-600/50 rounded-b-lg" />
          </div>
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <AnimatePresence mode="wait">
        {machineState === 'idle' && !isGenerating && (
          <motion.button
            key="dispense-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDispense}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full text-lg font-semibold shadow-lg shadow-pink-500/30 transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Sparkles size={20} />
            抽一个！
          </motion.button>
        )}

        {isGenerating && machineState === 'spinning' && (
          <motion.div
            key="loading"
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={16} />
            </motion.div>
            正在想一个好玩的任务...
          </motion.div>
        )}

        {machineState === 'displaying' && showEncouragement && (
          <motion.button
            key="retry-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/20 dark:bg-gray-700/40 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 rounded-full font-medium border border-white/30 dark:border-gray-600/30 transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <RotateCcw size={16} />
            再来一个
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// 任务卡片子组件
function QuestCard({
  quest,
  onComplete,
  onSkip,
}: {
  quest: RandomQuest;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[quest.category];
  const categoryLabel = CATEGORY_LABELS[quest.category];
  const difficultyLabel = DIFFICULTY_LABELS[quest.difficulty];

  return (
    <div className="text-center space-y-3 py-1">
      {/* 类别和难度标签 */}
      <div className="flex items-center justify-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor.bg} text-white`}>
          {categoryLabel}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200/60 dark:bg-gray-600/60 text-gray-600 dark:text-gray-300">
          {difficultyLabel}
        </span>
      </div>

      {/* 任务标题 */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {quest.title}
      </h3>

      {/* 任务描述 */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {quest.description}
      </p>

      {/* 预计时间 */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <Clock size={12} />
        <span>预计 {quest.estimatedMinutes} 分钟</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <SkipForward size={14} />
          换一个
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-md shadow-green-500/20 transition-all"
        >
          <Check size={14} />
          完成了
        </motion.button>
      </div>
    </div>
  );
}
