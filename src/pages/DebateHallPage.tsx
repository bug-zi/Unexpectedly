import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, History, Trash2, Settings, Swords } from 'lucide-react';
import { useDebateStore } from '@/stores/debateStore';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { useDebate } from '@/hooks/useDebate';
import { DebateStance } from '@/types';
import { DebateTopicCard } from '@/components/debate/DebateTopicCard';
import { DebateChat } from '@/components/debate/DebateChat';
import { DebateInputBar } from '@/components/debate/DebateInputBar';
import { DebateJudgeResult } from '@/components/debate/DebateJudgeResult';

// 自定义缓动曲线
const customEasing = {
  elastic: [0.68, -0.55, 0.265, 1.55],
  unexpected: [0.87, 0, 0.13, 1],
};

/**
 * 辩论堂页面
 * 完整的辩论流程：生成辩题 → 选择立场 → 辩论 → 评委评价
 */
export function DebateHallPage() {
  const navigate = useNavigate();
  const { sessions, setActiveSession, deleteSession } = useDebateStore();
  const llmConfig = useRoundtableStore(state => state.llmConfig);
  const {
    generateTopic,
    startDebate,
    sendUserMessage,
    requestJudge,
    stopGeneration,
    isGenerating,
    isGeneratingTopic,
    streamingMessageId,
  } = useDebate();

  // 页面状态
  const [topic, setTopic] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'topic_generated' | 'debating' | 'judged'>('idle');
  const [activeDebateId, setActiveDebateId] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<any>(null);

  // 历史面板
  const [showHistory, setShowHistory] = useState(false);

  // 当前活跃的辩论会话
  const activeSession = sessions.find(s => s.id === activeDebateId);

  // 是否处于空闲阶段（未开始辩论）
  const isIdlePhase = phase === 'idle' || phase === 'topic_generated';

  // 生成辩题
  const handleGenerateTopic = useCallback(async () => {
    try {
      const newTopic = await generateTopic();
      setTopic(newTopic);
      setPhase('topic_generated');
    } catch (err) {
      console.error('生成辩题失败:', err);
    }
  }, [generateTopic]);

  // 选择立场并开始辩论
  const handleSelectStance = useCallback((stance: DebateStance) => {
    if (!topic) return;
    try {
      const sessionId = startDebate(topic, stance);
      setActiveDebateId(sessionId);
      setPhase('debating');
    } catch (err) {
      console.error('开始辩论失败:', err);
    }
  }, [topic, startDebate]);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      await sendUserMessage(content);
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  }, [sendUserMessage]);

  // 结束辩论 - 请求评委评价
  const handleEndDebate = useCallback(async () => {
    try {
      const result = await requestJudge();
      if (result) {
        setJudgeResult(result);
        setPhase('judged');
      }
    } catch (err) {
      console.error('评委评价失败:', err);
    }
  }, [requestJudge]);

  // 新辩论
  const handleNewDebate = useCallback(() => {
    setTopic(null);
    setPhase('idle');
    setActiveDebateId(null);
    setJudgeResult(null);
  }, []);

  // 查看历史辩论
  const handleViewSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    setActiveDebateId(sessionId);
    setActiveSession(sessionId);
    setTopic(session.topic);
    if (session.status === 'judged' && session.judgeResult) {
      setJudgeResult(session.judgeResult);
      setPhase('judged');
    } else {
      setPhase('debating');
    }
    setShowHistory(false);
  }, [sessions, setActiveSession]);

  const completedSessions = sessions.filter(s => s.status === 'judged');

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-question2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 背景遮罩层 - 暖色主题融合 */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(255,251,235,0.82) 0%, rgba(254,243,199,0.75) 40%, rgba(255,237,213,0.78) 100%)' }} />
      <div className="hidden dark:block absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(30,20,10,0.85) 40%, rgba(17,24,39,0.88) 100%)' }} />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* 左侧：返回按钮 */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/questions')}
              className="flex items-center gap-1 px-2 py-1.5 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
              <span className="text-sm hidden sm:inline">返回</span>
            </motion.button>

            {/* 中间：标题 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
              className="flex items-center gap-2 px-2 min-w-0"
            >
              <Swords size={20} className="text-amber-500 shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300 truncate">
                辩论堂
              </h1>
            </motion.div>

            {/* 右侧：功能按钮 */}
            <div className="flex items-center gap-1 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                title="辩论历史"
              >
                <History size={16} />
                <span className="hidden lg:inline">历史</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                title="前往个人中心配置AI"
              >
                <Settings size={16} />
                <span className="hidden lg:inline">设置</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className={`pt-24 ${phase === 'debating' ? 'pb-32' : 'pb-12'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">

          {/* 未配置 API 时提示 */}
          {!llmConfig && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-amber-100/80 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700 text-center max-w-3xl mx-auto"
            >
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                请先在个人中心配置 AI 模型
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline"
              >
                前往配置
              </button>
            </motion.div>
          )}

          {/* 空闲阶段：页面标题 + 辩题卡片 */}
          {isIdlePhase && (
            <div className="flex flex-col items-center">
              {/* 页面标题 */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: customEasing.elastic }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  思维交锋
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  选择立场，与AI展开一场思维碰撞
                </p>
              </motion.div>

              {/* 辩题卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: customEasing.unexpected }}
                className="w-full max-w-3xl"
              >
                <DebateTopicCard
                  topic={topic}
                  isGenerating={isGeneratingTopic}
                  onGenerate={handleGenerateTopic}
                  onSelectStance={handleSelectStance}
                  disabled={!llmConfig}
                />
              </motion.div>
            </div>
          )}

          {/* 辩论中阶段 */}
          {phase === 'debating' && activeSession && (
            <div className="max-w-3xl mx-auto">
              {/* 辩题展示 */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-500 shrink-0">辩题</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {activeSession.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeSession.userStance === 'pro'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    你的立场：{activeSession.userStance === 'pro' ? '正方' : '反方'}
                  </span>
                </div>
              </motion.div>

              <DebateChat
                messages={activeSession.messages}
                userStance={activeSession.userStance}
                streamingMessageId={streamingMessageId}
              />
            </div>
          )}

          {/* 评委评价阶段 */}
          {phase === 'judged' && judgeResult && activeSession && (
            <div className="max-w-3xl mx-auto space-y-4">
              <DebateChat
                messages={activeSession.messages}
                userStance={activeSession.userStance}
                streamingMessageId={streamingMessageId}
              />
              <DebateJudgeResult
                result={judgeResult}
                userStance={activeSession.userStance}
                onNewDebate={handleNewDebate}
              />
            </div>
          )}
        </div>
      </main>

      {/* 辩论输入栏 */}
      {phase === 'debating' && (
        <DebateInputBar
          onSend={handleSendMessage}
          onEndDebate={handleEndDebate}
          isGenerating={isGenerating}
          onStopGeneration={stopGeneration}
        />
      )}

      {/* 历史辩论弹窗 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">辩论历史</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {completedSessions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无辩论记录</p>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {completedSessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleViewSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            session.userStance === 'pro'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {session.userStance === 'pro' ? '正方' : '反方'}
                          </span>
                          {session.judgeResult && (
                            <span className={`text-xs ${
                              session.judgeResult.winner === 'user' ? 'text-emerald-500' :
                              session.judgeResult.winner === 'draw' ? 'text-amber-500' : 'text-gray-400'
                            }`}>
                              {session.judgeResult.winner === 'user' ? '胜利' :
                               session.judgeResult.winner === 'draw' ? '平局' : '惜败'}
                              · {session.judgeResult.userScore}分
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
