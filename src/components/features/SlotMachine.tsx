import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles } from 'lucide-react';
import {
  getRandomWords,
  checkSpecialCombination,
  checkTriple,
  getAllWords,
} from '@/constants/slotMachineWords';
import { EasterEgg } from '@/types';
import { Button } from '@/components/ui/Button';

interface SlotMachineProps {
  onSpinComplete: (words: [string, string, string], easterEgg?: EasterEgg) => void;
}

export function SlotMachine({ onSpinComplete }: SlotMachineProps) {
  const [words, setWords] = useState<[string, string, string] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState<EasterEgg | null>(null);
  const [spinningWords, setSpinningWords] = useState<[string, string, string] | null>(null);
  const allWords = getAllWords();

  // 模拟词语滚动效果
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpinning) {
      interval = setInterval(() => {
        const randomWords: [string, string, string] = [
          allWords[Math.floor(Math.random() * allWords.length)],
          allWords[Math.floor(Math.random() * allWords.length)],
          allWords[Math.floor(Math.random() * allWords.length)],
        ];
        setSpinningWords(randomWords);
      }, 60); // 加快切换速度到60毫秒
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning, allWords]);

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowEasterEgg(null);
    setSpinningWords(null);

    // 模拟老虎机动画
    setTimeout(() => {
      const newWords = getRandomWords();
      setWords(newWords);
      setSpinningWords(null);

      // 检查特殊组合
      const specialCombo = checkSpecialCombination(newWords);
      const isTriple = checkTriple(newWords);

      let easterEgg: EasterEgg | undefined;

      if (isTriple) {
        easterEgg = {
          type: 'triple',
          title: '缘分！',
          message: `这个词三倍出现必有深意：${newWords[0]}`,
          specialEffect: 'glow',
        };
        setShowEasterEgg(easterEgg);
      } else if (specialCombo) {
        easterEgg = {
          type: 'combination',
          title: '🎉 特殊组合！',
          message: specialCombo.message,
        };
        setShowEasterEgg(easterEgg);
      }

      setIsSpinning(false);
      onSpinComplete(newWords, easterEgg);
    }, 2000);
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Gamepad2 size={40} className="text-blue-500" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            灵感老虎机
          </h2>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400">
          抽取三个词语，展开联想...
        </p>
      </div>

      {/* 三个滚轮 */}
      <div className="flex justify-center items-center gap-4 md:gap-8 mb-12">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="relative w-28 h-36 md:w-40 md:h-48 bg-white dark:bg-gray-700 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-blue-200 dark:border-blue-800"
          >
            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center w-full"
                >
                  <motion.span
                    key={spinningWords?.[index] || 'loading'}
                    initial={{ y: -30, opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
                    animate={{
                      y: 0,
                      opacity: [0, 0.4, 0.7, 1],
                      scale: [0.8, 0.9, 0.95, 1],
                      filter: ['blur(2px)', 'blur(1px)', 'blur(0.5px)', 'blur(0px)']
                    }}
                    exit={{ y: 30, opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
                    transition={{
                      duration: 0.06,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white block px-2"
                  >
                    {spinningWords?.[index] || '准备中...'}
                  </motion.span>
                </motion.div>
              ) : words ? (
                <motion.span
                  key={words[index]}
                  initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
                  animate={{
                    scale: [0.3, 1.2, 1],
                    rotate: [ -15, 5, 0],
                    opacity: 1
                  }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center px-2"
                >
                  {words[index]}
                </motion.span>
              ) : (
                <motion.span
                  key="placeholder"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl md:text-5xl text-gray-300 dark:text-gray-600"
                >
                  ?
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* 彩蛋提示 */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={24} className="text-yellow-600" />
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                {showEasterEgg.title}
              </h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-400">
              {showEasterEgg.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 抽取按钮 */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleSpin}
          disabled={isSpinning}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 text-xl"
        >
          {isSpinning ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2 inline-block"
              >
                🎰
              </motion.span>
              抽取中...
            </>
          ) : (
            <>
              <span className="mr-2">🎰</span>
              抽取灵感
            </>
          )}
        </Button>
      </div>

      {/* 提示文字 */}
      {words && !isSpinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            💭 用这三个词语写一段话
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            可以是故事、感悟或联想...
          </p>
        </motion.div>
      )}
    </div>
  );
}
