import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestionCard } from '@/components/features/QuestionCard';
import { UserMenu } from '@/components/features/UserMenu';
import { getRandomQuestion } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { Icon } from '@/components/ui/Icon';
import { Brain, Globe, Dice5, TrendingUp, Gamepad2, PlusCircle, Bell, Sparkles, ArrowRight, Star, Clock } from 'lucide-react';

// 自定义缓动曲线
const customEasing = {
  elastic: [0.68, -0.55, 0.265, 1.55],
  unexpected: [0.87, 0, 0.13, 1],
};

export function HomePage() {
  const navigate = useNavigate();
  const { setCurrentQuestion } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setQuestion] = useState(() => getRandomQuestion());

  const handleStartThinking = () => {
    setCurrentQuestion(currentQuestion);
    navigate(`/question/${currentQuestion.id}`);
  };

  const handleSkipQuestion = () => {
    if (selectedCategory) {
      const question = getRandomQuestion(selectedCategory);
      setQuestion(question);
    } else {
      const question = getRandomQuestion();
      setQuestion(question);
    }
  };

  const handleResetCategory = () => {
    setSelectedCategory(null);
    const question = getRandomQuestion();
    setQuestion(question);
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 导航栏 - 保持简洁 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2"
            >
              <Icon name="Sparkles" size={28} className="text-primary-500" />
              <h1 className="text-xl font-bold gradient-text">
                万万没想到
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/favorites')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                <Star size={18} />
                <span>收藏</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/later')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Clock size={18} />
                <span>待思考</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notifications')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Bell size={18} />
                <span>提醒</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/growth')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <TrendingUp size={18} />
                <span>成长足迹</span>
              </motion.button>
              <UserMenu />
            </motion.div>
          </div>
        </div>
      </nav>

      {/* 主要内容 - 非对称布局 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero 标题 - 左对齐，更有冲击力的文案 */}
          <div className="mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: customEasing.elastic }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-12 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full organic-border" />
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  今天你的大脑<br />
                  <span className="gradient-text-warm">会突破什么？</span>
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 ml-5">
                别再被同样的思维困住了。每天一个问题，让你脱口而出"万万没想到"。
              </p>
            </motion.div>
          </div>

          {/* 双栏布局 - 左侧问题卡片，右侧快捷入口 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 左侧：问题卡片（占8列） */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.2 }}
              className="lg:col-span-8"
            >
              <QuestionCard
                question={currentQuestion}
                onStart={handleStartThinking}
                onSkip={handleSkipQuestion}
              />

              {/* 分类选择 - 非对称设计 */}
              <div className="mt-12">
                {selectedCategory ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border-l-4 border-orange-500"
                  >
                    <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                      已选择"{selectedCategory}"分类
                    </p>
                    <button
                      onClick={handleResetCategory}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center gap-2"
                    >
                      <ArrowRight size={18} className="rotate-180" />
                      返回全部分类
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-8"
                    >
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        想玩点不一样的？
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        选择你的探索方式，或者直接开始回答当前问题
                      </p>
                    </motion.div>

                    {/* 分类标签 - 横向排列，带倾斜效果 */}
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/categories/thinking')}
                        className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium text-gray-900 dark:text-white border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 group"
                      >
                        <Brain size={28} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-lg">思维维度</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">批判、创新、系统</div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/categories/scenario')}
                        className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium text-gray-900 dark:text-white border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                      >
                        <Globe size={28} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-lg">生活场景</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">工作、关系、成长</div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResetCategory}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium text-white warm-glow-hover group"
                      >
                        <Dice5 size={28} className="group-hover:rotate-180 transition-transform duration-500" />
                        <div className="text-left">
                          <div className="text-lg">纯随机</div>
                          <div className="text-sm text-purple-100">完全随机，刺激</div>
                        </div>
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 右侧：快捷入口（占4列，固定定位效果） */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: customEasing.unexpected, delay: 0.4 }}
              className="lg:col-span-4 lg:sticky lg:top-24 space-y-6"
            >
              {/* 功能卡片 */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/slot-machine')}
                  className="w-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-left group relative overflow-hidden warm-glow-hover"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full group-hover:scale-150 transition-transform" />
                  <Gamepad2 size={40} className="mb-3 text-purple-500 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    灵感老虎机
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    三个随机词语，碰撞出你没想到的创意
                  </p>
                  <ArrowRight size={18} className="absolute bottom-6 right-6 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/growth')}
                  className="w-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full group-hover:scale-150 transition-transform" />
                  <TrendingUp size={40} className="mb-3 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    成长足迹
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    看看你的思维已经走了多远
                  </p>
                  <ArrowRight size={18} className="absolute bottom-6 right-6 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/question-generator')}
                  className="w-full p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-left group relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 warm-glow"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-bl-full group-hover:scale-150 transition-transform" />
                  <PlusCircle size={40} className="mb-3 text-orange-500 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    创建问题
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    好问题值得被更多人思考
                  </p>
                  <Sparkles size={18} className="absolute bottom-6 right-6 text-purple-400 group-hover:text-orange-500 group-hover:rotate-12 transition-all" />
                </motion.button>
              </div>

              {/* 每日提示 - 装饰性元素 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="p-4 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-xl border border-orange-200 dark:border-orange-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  💡 今天的灵感可能就在下一个问题里
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
