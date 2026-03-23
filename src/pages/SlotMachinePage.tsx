import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Dice5, Sparkles, Lightbulb, Save } from 'lucide-react';
import { SlotMachine } from '@/components/features/SlotMachine';
import { EasterEgg } from '@/types';
import { saveSlotMachineResult } from '@/utils/storage';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function SlotMachinePage() {
  const navigate = useNavigate();
  const [words, setWords] = useState<[string, string, string] | null>(null);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);
  const [response, setResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSpinComplete = (
    spinWords: [string, string, string],
    egg?: EasterEgg
  ) => {
    setWords(spinWords);
    setEasterEgg(egg || null);
  };

  const handleSave = () => {
    if (!words || !response.trim()) return;

    setIsSaving(true);

    const result = {
      id: `slot-${Date.now()}`,
      words,
      userId: 'local-user',
      response,
      easterEgg: easterEgg || undefined,
      createdAt: new Date(),
    };

    saveSlotMachineResult(result);

    setTimeout(() => {
      setIsSaving(false);
      navigate('/');
    }, 500);
  };

  const handleNewSpin = () => {
    setWords(null);
    setEasterEgg(null);
    setResponse('');
  };

  const [wordCount, setWordCount] = useState(0);

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Gamepad2 size={28} className="text-purple-500" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles size={14} className="text-pink-500" />
                </motion.div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                灵感老虎机
              </h1>
            </motion.div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl mb-6 warm-glow">
              <Gamepad2 size={40} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              灵感老虎机
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              三个随机词语碰撞出你意想不到的创意火花
            </p>
          </motion.div>

          {/* 老虎机 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: customEasing.unexpected }}
            className="mb-12"
          >
            <SlotMachine onSpinComplete={handleSpinComplete} />
          </motion.div>

          {/* 联想写作区 */}
          <AnimatePresence>
            {words && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ ease: customEasing.elastic }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-purple-200 dark:border-purple-800 warm-glow"
              >
                {/* 抽取结果展示 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, ease: customEasing.elastic }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles size={24} className="text-purple-500" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      你的灵感词语
                    </h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {words.map((word, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20, rotate: -10 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                          ease: customEasing.elastic,
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`px-6 py-3 rounded-2xl text-2xl font-bold shadow-lg ${
                          index === 0
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                            : index === 1
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        }`}
                      >
                        {word}
                      </motion.div>
                    ))}
                  </div>
                  {easterEgg && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-300 dark:border-yellow-700"
                    >
                      <Lightbulb size={18} className="text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        {easterEgg.message}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* 提示信息 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-6 border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb size={24} className="text-purple-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        展开联想
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        用上面三个词语写一段话，可以是故事、感悟或联想...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        💡 没有标准答案，让思维自由飞翔吧！
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* 文本输入区 */}
                <TextArea
                  placeholder="在这里写下你的联想...

示例：这三个词语让我想到...

（开始写作吧，让思维流淌）"
                  value={response}
                  onChange={(e) => {
                    setResponse(e.target.value);
                    setWordCount(e.target.value.length);
                  }}
                  fullWidth
                  autoResize
                  className="min-h-[200px] mb-6 text-lg border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 rounded-2xl"
                />

                {/* 字数统计 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    已写 {wordCount} 字
                  </div>
                  {wordCount > 0 && wordCount < 50 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-orange-600 dark:text-orange-400"
                    >
                      💪 再写一点，发挥你的想象力！
                    </motion.div>
                  )}
                  {wordCount >= 50 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-green-600 dark:text-green-400"
                    >
                      🎉 很棒的联想！
                    </motion.div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant="ghost"
                      onClick={handleNewSpin}
                      fullWidth
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-4"
                    >
                      <Dice5 size={20} className="mr-2" />
                      再次抽取
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleSave}
                      disabled={!response.trim() || isSaving}
                      isLoading={isSaving}
                      fullWidth
                      className="rounded-2xl py-4 text-lg"
                    >
                      <Save size={20} className="mr-2" />
                      保存联想
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
