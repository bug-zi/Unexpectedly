import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, History, Trash2 } from 'lucide-react';
import { useDebateStore } from '@/stores/debateStore';
import { useDebate } from '@/hooks/useDebate';
import { getProviderConfig, validateApiKey } from '@/services/llmService';
import { LLMProvider, DebateStance } from '@/types';
import { DebateTopicCard } from '@/components/debate/DebateTopicCard';
import { DebateChat } from '@/components/debate/DebateChat';
import { DebateInputBar } from '@/components/debate/DebateInputBar';
import { DebateJudgeResult } from '@/components/debate/DebateJudgeResult';

/**
 * 辩论堂页面
 * 完整的辩论流程：生成辩题 → 选择立场 → 辩论 → 评委评价
 */
export function DebateHallPage() {
  const navigate = useNavigate();
  const { llmConfig, setLLMConfig, sessions, setActiveSession, deleteSession } = useDebateStore();
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

  // 设置面板
  const [showSettings, setShowSettings] = useState(false);
  const [settingsProvider, setSettingsProvider] = useState<LLMProvider>(llmConfig?.provider || 'deepseek');
  const [settingsApiKey, setSettingsApiKey] = useState(llmConfig?.apiKey || '');
  const [settingsModel, setSettingsModel] = useState(llmConfig?.model || '');
  const [validating, setValidating] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // 历史面板
  const [showHistory, setShowHistory] = useState(false);

  // 当前活跃的辩论会话
  const activeSession = sessions.find(s => s.id === activeDebateId);

  // 如果没有 API 配置，显示设置面板
  useEffect(() => {
    if (!llmConfig) {
      setShowSettings(true);
    }
  }, [llmConfig]);

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

  // 设置面板保存
  const handleSaveSettings = async () => {
    if (!settingsApiKey.trim()) {
      setSettingsError('请输入 API Key');
      return;
    }

    setValidating(true);
    setSettingsError('');

    const providerConfig = getProviderConfig(settingsProvider);
    const model = settingsModel || providerConfig.defaultModel;

    const config = {
      provider: settingsProvider,
      apiKey: settingsApiKey.trim(),
      model,
    };

    const isValid = await validateApiKey(config);
    setValidating(false);

    if (isValid) {
      setLLMConfig(config);
      setShowSettings(false);
    } else {
      setSettingsError('API Key 验证失败，请检查');
    }
  };

  const completedSessions = sessions.filter(s => s.status === 'judged');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-purple-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-violet-200 dark:border-violet-800">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate('/questions')}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-violet-600"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">返回</span>
            </button>

            <h1 className="text-sm font-bold text-violet-700 dark:text-violet-300">辩论堂</h1>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400"
              >
                <History size={18} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className={`pt-20 ${phase === 'debating' ? 'pb-32' : 'pb-8'} px-4`}>
        <div className="max-w-2xl mx-auto">
          {/* 辩题展示（辩论中） */}
          {activeSession && phase === 'debating' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-violet-100/50 dark:bg-violet-900/20 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-500 shrink-0">辩题</span>
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
          )}

          {/* 空闲 / 生成辩题阶段 */}
          {(phase === 'idle' || phase === 'topic_generated') && (
            <DebateTopicCard
              topic={topic}
              isGenerating={isGeneratingTopic}
              onGenerate={handleGenerateTopic}
              onSelectStance={handleSelectStance}
            />
          )}

          {/* 辩论阶段 */}
          {phase === 'debating' && activeSession && (
            <DebateChat
              messages={activeSession.messages}
              userStance={activeSession.userStance}
              streamingMessageId={streamingMessageId}
            />
          )}

          {/* 评委评价阶段 */}
          {phase === 'judged' && judgeResult && activeSession && (
            <div className="space-y-4">
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

      {/* 设置弹窗 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <Settings size={20} className="text-violet-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">API 设置</h3>
              </div>

              <div className="space-y-4">
                {/* Provider 选择 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    模型提供商
                  </label>
                  <div className="flex gap-2">
                    {(['deepseek', 'qwen', 'glm', 'kimi', 'doubao'] as LLMProvider[]).map(p => {
                      const config = getProviderConfig(p);
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setSettingsProvider(p);
                            setSettingsModel('');
                            setSettingsError('');
                          }}
                          className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-colors
                            ${settingsProvider === p
                              ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300'
                            }`}
                        >
                          {config.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder={`输入 ${getProviderConfig(settingsProvider).name} API Key`}
                    value={settingsApiKey}
                    onChange={(e) => { setSettingsApiKey(e.target.value); setSettingsError(''); }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    模型
                  </label>
                  <select
                    value={settingsModel || getProviderConfig(settingsProvider).defaultModel}
                    onChange={(e) => setSettingsModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                  >
                    {getProviderConfig(settingsProvider).models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {settingsError && (
                  <p className="text-sm text-red-500">{settingsError}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  {llmConfig && (
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  )}
                  <button
                    onClick={handleSaveSettings}
                    disabled={validating}
                    className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors"
                  >
                    {validating ? '验证中...' : '保存'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );
}
