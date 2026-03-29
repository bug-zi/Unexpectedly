/**
 * 写作创造主页面 - 包含老虎机和文笔挑战两个模块
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, PenTool, BookOpen, BarChart3, Shuffle, X, History, Clock, Edit, Trash2, Save } from 'lucide-react';
import { getSlotMachineResults } from '@/utils/storage';
import { setUserData, getUserData, getUserDataSync } from '@/utils/userStorage';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function WritingPage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [writingStats, setWritingStats] = useState({
    totalSlotMachines: 0,
    totalChallenges: 0,
    totalWords: 0
  });
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 写作模块配置
  const writingModules = [
    {
      id: 'slot-machine',
      title: '灵感老虎机',
      path: '/slot-machine',
      icon: Sparkles
    },
    {
      id: 'writing-challenge',
      title: '文笔挑战',
      path: '/writing-challenge',
      icon: PenTool
    }
  ];

  // 加载统计数据
  useEffect(() => {
    loadWritingStats();
  }, []);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        loadWritingStats();
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

  const loadWritingStats = () => {
    // 从工具函数加载老虎机记录
    const slotMachineRecords = getSlotMachineResults();

    // 使用getUserDataSync加载文笔挑战记录（同步版本）
    const challengeRecords = getUserDataSync<any[]>('writing-challenge-works', []);

    // 计算总字数（老虎机使用response字段，文笔挑战使用content字段）
    const slotMachineWords = slotMachineRecords.reduce((sum: number, r: any) => {
      return sum + (r.response?.length || 0);
    }, 0);

    const challengeWords = challengeRecords.reduce((sum: number, r: any) => {
      return sum + (r.content?.length || 0);
    }, 0);

    const totalWords = slotMachineWords + challengeWords;

    setWritingStats({
      totalSlotMachines: slotMachineRecords.length,
      totalChallenges: challengeRecords.length,
      totalWords
    });
  };

  const startRandomModule = () => {
    const randomIndex = Math.floor(Math.random() * writingModules.length);
    navigate(writingModules[randomIndex].path);
  };

  const loadHistoryRecords = () => {
    // 加载老虎机记录
    const slotMachineRecords = getSlotMachineResults().map((r: any) => ({
      ...r,
      type: 'slot-machine' as const,
      title: '灵感老虎机',
      words: r.words || [],
      content: r.response || '',
      timestamp: new Date(r.createdAt).getTime()
    }));

    // 加载文笔挑战记录（使用getUserData以支持用户隔离）
    const challengeRecords = getUserDataSync<any[]>('writing-challenge-works', [])
      .map((r: any) => ({
        ...r,
        type: 'writing-challenge' as const,
        title: '文笔挑战',
        prompt: r.prompt || '',
        content: r.content || '',
        timestamp: new Date(r.createdAt).getTime()
      }));

    // 合并并按时间倒序排列（最新的在前）
    const allRecords = [...slotMachineRecords, ...challengeRecords]
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    setHistoryRecords(allRecords);
  };

  // 删除记录
  const handleDeleteRecord = (record: any) => {
    if (!confirm('确定要删除这条创作记录吗？此操作不可恢复。')) {
      return;
    }

    if (record.type === 'slot-machine') {
      // 删除老虎机记录
      const records = getSlotMachineResults();
      const updatedRecords = records.filter((r: any) => r.id !== record.id);
      setUserData('wwx-slot-machine', updatedRecords);
    } else if (record.type === 'writing-challenge') {
      // 删除文笔挑战记录
      const records = getUserData<any[]>('writing-challenge-works', []);
      const updatedRecords = records.filter((r: any) => r.id !== record.id);
      setUserData('writing-challenge-works', updatedRecords);
    }

    // 重新加载历史记录和统计
    loadHistoryRecords();
    loadWritingStats();
  };

  // 编辑记录 - 进入编辑模式
  const handleEditRecord = (record: any) => {
    setEditingId(record.id || record.promptId);
    setEditingContent(record.content || record.response || '');
  };

  // 保存编辑
  const handleSaveEdit = (record: any) => {
    if (record.type === 'slot-machine') {
      // 更新老虎机记录
      const records = getSlotMachineResults();
      const updatedRecords = records.map((r: any) =>
        r.id === record.id ? { ...r, response: editingContent } : r
      );
      setUserData('wwx-slot-machine', updatedRecords);
    } else if (record.type === 'writing-challenge') {
      // 更新文笔挑战记录
      const challengeRecords = getUserDataSync<any[]>('writing-challenge-works', []);
      const updatedRecords = challengeRecords.map((r: any) =>
        r.id === record.id ? { ...r, content: editingContent } : r
      );
      setUserData('writing-challenge-works', updatedRecords);
    }

    // 退出编辑模式并重新加载数据
    setEditingId(null);
    setEditingContent('');
    loadHistoryRecords();
    loadWritingStats();
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-blue-900/30 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
              >
                <PenTool size={20} className="text-white" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
                写作创造
              </h1>
            </motion.div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="模式说明"
              >
                <BookOpen size={18} />
                <span className="hidden md:inline">模式说明</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRandomModule}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="随机开始创作"
              >
                <Shuffle size={18} />
                <span className="hidden md:inline">随机开始</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadWritingStats();
                  setShowStats(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="查看创作统计"
              >
                <BarChart3 size={18} />
                <span className="hidden md:inline">创作统计</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  loadHistoryRecords();
                  setShowHistory(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="查看历史记录"
              >
                <History size={18} />
                <span className="hidden md:inline">历史记录</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 模式说明弹窗 */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-blue-200 dark:border-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">模式说明</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInstructions(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <Sparkles size={20} />
                      灵感老虎机
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      随机抽取三个词语，激发你的创意灵感。根据词语组合进行自由创作，打破思维定式。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">创意</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">联想</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">自由</span>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-2">
                      <PenTool size={20} />
                      文笔挑战
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      根据给定的一句话开头，续写出精彩的故事。锻炼文笔和情节构思能力。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">写作</span>
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">故事</span>
                      <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full">挑战</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">💡 使用建议</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>灵感老虎机</strong>适合打破创作瓶颈，激发全新创意</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span><strong>文笔挑战</strong>适合锻炼写作技巧，提升文字表达能力</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>两种模式可以结合使用，先获取灵感再进行深度创作</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创作统计弹窗 */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-blue-200 dark:border-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">创作统计</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStats(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                    {writingStats.totalWords}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">总字数</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{writingStats.totalSlotMachines}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">老虎机次数</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{writingStats.totalChallenges}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">文笔挑战次数</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {writingStats.totalWords > 0 ? (
                      <span>太棒了！你已经创作了 <strong className="text-blue-600 dark:text-blue-400">{writingStats.totalWords}</strong> 字</span>
                    ) : (
                      <span>开始你的第一次创作吧！✨</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 历史记录弹窗 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border-2 border-blue-200 dark:border-blue-800 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <History size={24} className="text-white" />
                  <h3 className="text-xl font-bold text-white">历史创作记录</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 内容 */}
              <div className="p-6 overflow-y-auto flex-1">
                {historyRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      还没有创作记录，开始你的第一次创作吧！✨
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyRecords.map((record: any, index: number) => (
                      <motion.div
                        key={record.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
                      >
                        {/* 类型标签和操作按钮 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                              {record.title}
                            </span>
                            {record.category && (
                              <span className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                                {record.category}
                              </span>
                            )}
                          </div>
                          {editingId !== (record.id || record.promptId) && (
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditRecord(record)}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                title="编辑"
                              >
                                <Edit size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteRecord(record)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {/* 老虎机：词语标签 */}
                        {record.type === 'slot-machine' && record.words && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {record.words.map((word: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 文笔挑战：题目 */}
                        {record.type === 'writing-challenge' && record.prompt && (
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-2 border-l-4 border-blue-500">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">题目：</p>
                            <p className="text-gray-700 dark:text-gray-300">{record.prompt}</p>
                          </div>
                        )}

                        {/* 创作内容 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                          {editingId === (record.id || record.promptId) ? (
                            // 编辑模式
                            <div className="space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full min-h-[120px] p-3 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-y"
                                placeholder="编辑你的创作内容..."
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                                >
                                  取消
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSaveEdit(record)}
                                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-md"
                                >
                                  保存
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            // 查看模式
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {record.content || record.response || '暂无内容'}
                            </p>
                          )}
                        </div>

                        {/* 时间和字数 */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {new Date(record.createdAt || record.timestamp).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span>{(record.content || record.response || '').length} 字</span>
                        </div>

                        {/* 彩蛋提示 */}
                        {record.easterEgg && (
                          <div className="mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg">
                            ✨ {record.easterEgg.title}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 底部统计 */}
              {historyRecords.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    共 <span className="font-bold text-blue-600 dark:text-blue-400">{historyRecords.length}</span> 条创作记录
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              选择创作方式
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              两种不同的创作模式，激发你的无限创意
            </p>
          </motion.div>

          {/* 两个模块卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 老虎机模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/slot-machine')}
                className="group relative w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-cyan-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/30 rounded-full"
                      />
                      <Sparkles size={20} className="text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Sparkles size={48} className="text-blue-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    灵感老虎机
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    随机词语组合，激发无限创意联想
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    开始创作
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* 文笔挑战模块 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ease: customEasing.unexpected }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/writing-challenge')}
                className="group relative w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-cyan-600 p-8 text-left overflow-hidden cursor-pointer"
              >
                {/* 背景动画 */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 rounded-full"
                    animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* 脉波效果 */}
                <div className="absolute top-6 right-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/30 rounded-full"
                      />
                      <PenTool size={20} className="text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <motion.div
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <PenTool size={48} className="text-blue-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    文笔挑战
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    给出一句话，续写出精彩后文
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    开始挑战
                  </div>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
