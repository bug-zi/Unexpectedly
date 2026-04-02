/**
 * 文笔挑战页面 - 给出一句话，续写后文
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PenTool, RotateCw, Save, Eye, EyeOff } from 'lucide-react';
import { setUserData, getUserData, getUserDataSync } from '@/utils/userStorage';
import { updateDailyTaskProgress } from '@/utils/taskManager';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

// 文笔挑战题目库
const writingPrompts = [
  {
    id: 1,
    prompt: "那天早上，我推开窗户，发现整个城市都消失了，只剩下...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 2,
    prompt: "他说那句话时，眼神里藏着某种我从未见过的情绪，让我突然意识到...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 3,
    prompt: "这本泛黄的日记本最后一页写着：如果你看到了这行字，那么...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 4,
    prompt: "时间倒流回十年前的那个夏天，空气中弥漫着...",
    category: "怀旧",
    difficulty: "中等",
  },
  {
    id: 5,
    prompt: "那扇门后传来的声音很熟悉，但又说不出在哪里听过，直到...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 6,
    prompt: "当时钟敲响第十二下时，镜子里的倒影突然...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 7,
    prompt: "她从未想过，一次偶然的选择会让她的人生轨迹彻底改变，从那天起...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 8,
    prompt: "那条从未有人走过的小路尽头，矗立着...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 9,
    prompt: "如果当初我没有登上那趟列车，也许现在...",
    category: "人生",
    difficulty: "困难",
  },
  {
    id: 10,
    prompt: "暴雨夜，陌生人敲响了我的门，浑身湿透的他只说了一句话：...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 11,
    prompt: "那把钥匙在我家传了三代，没人知道它能打开什么，直到今天我...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 12,
    prompt: "当我睁开眼，发现自己躺在一个完全陌生的地方，周围是...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 13,
    prompt: "他的最后一封信里写着：原谅我的不辞而别，因为...",
    category: "情感",
    difficulty: "中等",
  },
  {
    id: 14,
    prompt: "那个梦太真实了，真实到醒来后我发现在枕头下竟然有...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 15,
    prompt: "所有人都说那地方去不得，但我还是去了，因为我...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 16,
    prompt: "那个总是出现在我梦境中的人，今天竟然真的出现了，就在...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 17,
    prompt: "当年我们立下的约定，我竟然还记得，于是...",
    category: "情感",
    difficulty: "简单",
  },
  {
    id: 18,
    prompt: "那个被遗忘在角落的旧箱子里，藏着一个改变一切的秘密...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 19,
    prompt: "如果人生可以重来，我会选择不一样的路，但现在...",
    category: "人生",
    difficulty: "中等",
  },
  {
    id: 20,
    prompt: "那天，我遇见了十年前的自己，他/她对我说...",
    category: "奇幻",
    difficulty: "困难",
  },
];

export function WritingChallengePage() {
  const navigate = useNavigate();
  const [currentPrompt, setCurrentPrompt] = useState(writingPrompts[0]);
  const [userWriting, setUserWriting] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedWorks, setSavedWorks] = useState<any[]>([]);

  // 从 localStorage 加载保存的作品
  useEffect(() => {
    const saved = getUserDataSync<any[]>('writing-challenge-works', []);
    setSavedWorks(saved);
  }, []);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        const saved = getUserDataSync<any[]>('writing-challenge-works', []);
        setSavedWorks(saved);
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

  // 切换到下一个题目
  const handleNextPrompt = () => {
    setIsRotating(true);
    setTimeout(() => {
      const currentIndex = writingPrompts.findIndex(p => p.id === currentPrompt.id);
      const nextIndex = (currentIndex + 1) % writingPrompts.length;
      setCurrentPrompt(writingPrompts[nextIndex]);
      setUserWriting(''); // 清空用户输入
      setShowPreview(false);
      setIsRotating(false);
    }, 300);
  };

  // 保存当前作品
  const handleSave = () => {
    if (!userWriting.trim()) {
      return;
    }

    const newWork = {
      id: Date.now(),
      promptId: currentPrompt.id,
      prompt: currentPrompt.prompt,
      content: userWriting,
      category: currentPrompt.category,
      difficulty: currentPrompt.difficulty,
      createdAt: new Date().toISOString(),
    };

    const updatedWorks = [newWork, ...savedWorks];
    setSavedWorks(updatedWorks);
    setUserData('writing-challenge-works', updatedWorks);

    // 更新每日任务进度（写作创作）
    updateDailyTaskProgress('daily-writing', 1);

    alert('作品已保存！');
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '中等':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '困难':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '奇幻':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case '悬疑':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '怀旧':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case '人生':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '探险':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '情感':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-wirting.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/writing')}
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
                文笔挑战
              </h1>
            </motion.div>
            <div className="flex items-center gap-2">
              {savedWorks.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* TODO: 显示保存的作品列表 */}}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Save size={16} />
                  <span>{savedWorks.length}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              文笔挑战
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              发挥想象力，续写精彩故事
            </p>
          </motion.div>

          {/* 题目卡片 */}
          <motion.div
            key={currentPrompt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-200 dark:border-blue-800"
          >
            {/* 题目标签 */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentPrompt.category)}`}>
                {currentPrompt.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentPrompt.difficulty)}`}>
                {currentPrompt.difficulty}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                题目 {currentPrompt.id} / {writingPrompts.length}
              </span>
            </div>

            {/* 题目内容 */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <PenTool size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    "{currentPrompt.prompt}"
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                <RotateCw size={18} className={isRotating ? 'animate-spin' : ''} />
                <span>换一题</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 写作区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                你的续写
              </h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPreview ? '编辑' : '预览'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-md hover:shadow-lg"
                  disabled={!userWriting.trim()}
                >
                  <Save size={16} />
                  <span>保存</span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[300px] p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                >
                  {userWriting ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {userWriting}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                      还没有内容，开始写作吧！
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <textarea
                    value={userWriting}
                    onChange={(e) => setUserWriting(e.target.value)}
                    placeholder="在这里续写故事...发挥你的想象力，让故事继续下去..."
                    className="w-full min-h-[300px] p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all resize-none text-gray-800 dark:text-gray-200 text-lg leading-relaxed placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>字数: {userWriting.length}</span>
                    <span>建议字数: 100-500字</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 提示信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 写作提示：</strong>尽情发挥想象力，让故事朝着意想不到的方向发展。没有标准答案，你的创意就是最好的答案！
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
