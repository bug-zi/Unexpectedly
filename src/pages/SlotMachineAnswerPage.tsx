import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lightbulb, Save, Dices } from 'lucide-react';
import { EasterEgg } from '@/types';
import { saveSlotMachineResult } from '@/utils/storage';
import { updateDailyTaskProgress } from '@/utils/taskManager';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

interface SlotMachineAnswerPageProps {
  words?: [string, string, string];
  easterEgg?: EasterEgg | null;
}

export function SlotMachineAnswerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [words, setWords] = useState<[string, string, string] | null>(null);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);
  const [response, setResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // 从路由状态获取数据
    if (location.state?.words && location.state?.easterEgg !== undefined) {
      setWords(location.state.words);
      setEasterEgg(location.state.easterEgg);
    } else {
      // 如果没有数据，返回首页
      navigate('/slot-machine');
    }
  }, [location.state, navigate]);

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

    // 更新写作创作任务进度
    updateDailyTaskProgress('daily-writing', 1);

    setTimeout(() => {
      setIsSaving(false);
      navigate('/writing');
    }, 500);
  };

  const handleNewSpin = () => {
    navigate('/slot-machine');
  };

  const handleBack = () => {
    navigate('/slot-machine');
  };

  if (!words) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ backgroundImage: 'url(/bg-picture/bg-wirting.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: 'url(/bg-picture/bg-wirting.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                灵感联想
              </h1>
            </motion.div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* 联想写作区 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ease: customEasing.elastic }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-5 border-2 border-blue-200 dark:border-blue-800 warm-glow"
          >
            {/* 抽取结果展示 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, ease: customEasing.elastic }}
              className="text-center mb-4"
            >
              <div className="inline-flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  你的灵感词语
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
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
                    className={`px-5 py-2 rounded-xl text-xl font-bold shadow-lg ${
                      index === 0
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : index === 1
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                        : 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
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
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-300 dark:border-yellow-700"
                >
                  <Lightbulb size={14} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
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
              className="bg-gradient-to-r from-blue-50/60 to-cyan-50/60 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm rounded-xl p-3 mb-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                    展开联想
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    用上面三个词语写一段话，可以是故事、感悟或联想...
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    没有标准答案，让思维自由飞翔吧！
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
              className="min-h-[280px] mb-4 text-base border-2 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 rounded-xl"
            />

            {/* 字数统计 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                已写 {wordCount} 字
              </div>
              {wordCount > 0 && wordCount < 50 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-orange-600 dark:text-orange-400"
                >
                  💪 再写一点，发挥你的想象力！
                </motion.div>
              )}
              {wordCount >= 50 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-green-600 dark:text-green-400"
                >
                  🎉 很棒的联想！
                </motion.div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <button
                  onClick={handleNewSpin}
                  className="w-full py-3 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <Dices size={16} className="mr-2 inline-block text-gray-500/70" />
                  再次抽取
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <button
                  onClick={handleSave}
                  disabled={!response.trim() || isSaving}
                  className="relative w-full py-3 text-sm font-medium rounded-xl text-white overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icon-picture/icon-writing1.jpg)' }} />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    <Save size={18} />
                    保存联想
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
