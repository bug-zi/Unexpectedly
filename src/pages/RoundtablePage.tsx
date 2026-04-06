import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Settings, Square, RotateCcw, FileText,
  Sparkles, Send, PenLine
} from 'lucide-react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { useRoundtable } from '@/hooks/useRoundtable';
import { getQuestionById } from '@/constants/questions';
import { getThinkerById } from '@/constants/thinkers';
import { getProviderConfig } from '@/services/llmService';
import { validateApiKey } from '@/services/llmService';
import { LLMProvider } from '@/types';
import { RoundtableChat } from '@/components/roundtable/RoundtableChat';
import { RoundtableBar } from '@/components/roundtable/RoundtableBar';
import { RoundtableSummary } from '@/components/roundtable/RoundtableSummary';
import { Button } from '@/components/ui/Button';
import { usePageSEO } from '@/hooks/usePageSEO';

export function RoundtablePage() {
  const navigate = useNavigate();
  const { SEORender } = usePageSEO({ seo: '/roundtable/discuss' });
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('q') || '';
  const thinkerIdsStr = searchParams.get('thinkers') || '';
  const roundsParam = Number(searchParams.get('rounds') || 2);
  const thinkerIds = thinkerIdsStr.split(',').filter(Boolean);

  const { llmConfig, setLLMConfig, sessions } = useRoundtableStore();
  const {
    startDiscussion,
    sendUserMessage,
    generateSummary,
    continueDiscussion,
    stopGeneration,
    isGenerating,
    streamingMessageId,
  } = useRoundtable();

  const question = getQuestionById(questionId);
  const [userInput, setUserInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [discussionStarted, setDiscussionStarted] = useState(false);

  // Settings form state
  const [settingsProvider, setSettingsProvider] = useState<LLMProvider>(llmConfig?.provider || 'deepseek');
  const [settingsApiKey, setSettingsApiKey] = useState(llmConfig?.apiKey || '');
  const [settingsModel, setSettingsModel] = useState(llmConfig?.model || '');
  const [validating, setValidating] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // 找到当前活跃的会话
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // 如果没有 API 配置，显示设置面板
  useEffect(() => {
    if (!llmConfig) {
      setShowSettings(true);
    }
  }, [llmConfig]);

  // 开始讨论 - 立即设置状态，讨论在后台进行
  const handleStartDiscussion = useCallback(() => {
    if (!question || !llmConfig || thinkerIds.length < 2) return;

    try {
      // startDiscussion 现在同步返回 sessionId，讨论在后台异步进行
      const sessionId = startDiscussion(
        question.content,
        question.id,
        thinkerIds,
        roundsParam,
      );
      setActiveSessionId(sessionId);
      setDiscussionStarted(true);
    } catch (err) {
      console.error('讨论启动失败:', err);
    }
  }, [question, llmConfig, thinkerIds, roundsParam, startDiscussion]);

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

  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;
    const msg = userInput.trim();
    setUserInput('');
    await sendUserMessage(msg);
  };

  const handleSummarize = async () => {
    if (!activeSessionId) return;
    await generateSummary(activeSessionId);
    setShowSummary(true);
  };

  const handleReflect = () => {
    if (question) {
      navigate(`/question/${question.id}?roundtable=${activeSessionId}`);
    }
  };

  // 参与人管理
  const handleRemoveThinker = (_id: string) => {
    // 简化：讨论中不动态移除，只影响显示
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">未找到问题</p>
          <Button onClick={() => navigate('/questions/explore')}>返回问题探索</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-amber-600"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">返回</span>
            </button>

            <h1 className="text-sm font-bold text-amber-700 dark:text-amber-300 truncate max-w-[50%]">
              {thinkerIds.map(id => getThinkerById(id)?.name).filter(Boolean).join(' · ')}
            </h1>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* 参与人栏 */}
          <RoundtableBar thinkerIds={thinkerIds} onRemove={handleRemoveThinker} />
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="pt-28 pb-48 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 问题展示 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {question.content}
              </p>
            </div>
          </motion.div>

          {/* 未开始 - 显示开始按钮 */}
          {!discussionStarted && !showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12"
            >
              <div className="flex gap-2 mb-6">
                {thinkerIds.map(id => {
                  const t = getThinkerById(id);
                  return t ? (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: t.color + '20' }}
                      >
                        {t.avatar}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{t.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {thinkerIds.length} 位大咖已就位，准备开始讨论
              </p>
              <Button
                onClick={handleStartDiscussion}
                className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-8"
              >
                开始讨论
              </Button>
            </motion.div>
          )}

          {/* 讨论内容 */}
          {activeSession && (
            <div className="space-y-4">
              <RoundtableChat
                messages={activeSession.messages}
                streamingMessageId={streamingMessageId}
              />

              {/* 摘要 */}
              <AnimatePresence>
                {showSummary && activeSession.summary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <RoundtableSummary
                      summary={activeSession.summary}
                      onClose={() => setShowSummary(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* 底部操作栏 */}
      {discussionStarted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-amber-200 dark:border-amber-800">
          <div className="max-w-3xl mx-auto p-3 space-y-2">
            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopGeneration}
                  className="text-red-500 border border-red-200"
                >
                  <Square size={14} className="mr-1" />
                  停止
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => activeSessionId && continueDiscussion(activeSessionId)}
                    className="border border-gray-200 dark:border-gray-700"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    继续讨论
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSummarize}
                    className="border border-gray-200 dark:border-gray-700"
                  >
                    <FileText size={14} className="mr-1" />
                    生成摘要
                  </Button>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    onClick={handleReflect}
                    className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                  >
                    <PenLine size={14} className="mr-1" />
                    沉淀思考
                  </Button>
                </>
              )}
            </div>

            {/* 输入框 */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="说点什么..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isGenerating}
                className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
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
                <Settings size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  API 设置
                </h3>
              </div>

              <div className="space-y-4">
                {/* Provider 选择 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    模型提供商
                  </label>
                  <div className="flex gap-2">
                    {(['deepseek', 'qwen'] as LLMProvider[]).map(p => {
                      const config = getProviderConfig(p);
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setSettingsProvider(p);
                            setSettingsModel('');
                            setSettingsError('');
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors
                            ${settingsProvider === p
                              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(false)}
                      fullWidth
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      取消
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveSettings}
                    isLoading={validating}
                    fullWidth
                    className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                  >
                    验证并保存
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
