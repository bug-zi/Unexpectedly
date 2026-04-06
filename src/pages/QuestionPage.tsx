import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, Clock, Download, Heart, Plus, Lightbulb, X, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import { getQuestionById } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLater } from '@/hooks/useLater';
import { Answer } from '@/types';
import { saveAnswer } from '@/utils/storage';
import { calculateWordCount } from '@/utils/textAnalysis';
import { updateDailyTaskProgress, completeWeeklyTask } from '@/utils/taskManager';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { CategoryIcon } from '@/components/ui/Icon';
import { getCategoryConfig } from '@/constants/categories';
import { ExportDialog } from '@/components/features/ExportDialog';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { useLLMConfig } from '@/hooks/useLLMConfig';
import { streamChat } from '@/services/llmService';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { usePageSEO } from '@/hooks/usePageSEO';
import { JsonLd } from '@/components/seo/JsonLd';
import { getQAPageSchema } from '@/constants/structuredData';
import { getQuestionPageSEO } from '@/constants/seo';

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundtableSessionId = searchParams.get('roundtable');
  const { currentQuestion, addAnswer, answers } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const { addFavorite, removeFavorite, isFavorited, markAsAnswered } = useFavorites();
  const { addToLater, removeFromLater, isLater } = useLater();
  const { sessions } = useRoundtableStore();
  const { isConfigured: isLLMConfigured, llmConfig } = useLLMConfig();

  const { SEORender } = usePageSEO({ seo: getQuestionPageSEO(id || '', currentQuestion?.content) });

  // 获取关联的圆桌会话
  const roundtableSession = roundtableSessionId
    ? sessions.find(s => s.id === roundtableSessionId)
    : undefined;
  const [showRoundtableInspiration, setShowRoundtableInspiration] = useState(!!roundtableSession);

  const [content, setContent] = useState('');
  const [writingTime, setWritingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [savedAnswer, setSavedAnswer] = useState<Answer | null>(null);
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiReviewContent, setAiReviewContent] = useState('');
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const abortAiReviewRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();

  const question = id ? getQuestionById(id) : currentQuestion;

  useEffect(() => {
    if (!question) {
      navigate('/questions/explore');
      return;
    }

    // 启动计时器
    timerIntervalRef.current = setInterval(() => {
      setWritingTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [question, navigate]);

  // 自动保存逻辑
  useEffect(() => {
    if (!content.trim()) return;

    // 清除之前的定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // 设置新的自动保存（30秒后）
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content]);

  const handleAutoSave = () => {
    if (!question || !content.trim()) return;

    const answer: Answer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      userId: 'local-user',
      content,
      metadata: {
        wordCount: calculateWordCount(content),
        readingTime: 0,
        writingTime,
      },
      createdAt: new Date(),
    };

    // 保存到本地存储（标记为草稿）
    localStorage.setItem(`wwx-draft-${question.id}`, JSON.stringify(answer));
    setLastSavedTime(new Date());
  };

  const handleSave = async () => {
    if (!question || !content.trim()) return;

    setIsSaving(true);
    setSyncing(true);

    const answer: Answer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      userId: user?.id || 'local-user',
      content,
      metadata: {
        wordCount: calculateWordCount(content),
        readingTime: 0,
        writingTime,
      },
      createdAt: new Date(),
    };

    try {
      // 1. 保存到本地存储和状态
      saveAnswer(answer);
      addAnswer(answer);
      setSavedAnswer(answer);

      // 更新每日任务进度（问题思考）
      updateDailyTaskProgress('daily-question', 1);

      // 如果来自每周回顾任务，标记完成
      if (searchParams.get('source') === 'weekly-review') {
        completeWeeklyTask('weekly-review');
      }

      // 2. 标记收藏的问题为已回答
      if (question && isAuthenticated) {
        await markAsAnswered(question.id, true);
      }

      // 3. 清除草稿
      localStorage.removeItem(`wwx-draft-${question.id}`);

      // 4. 如果已登录，同步到云端
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('answers')
          .insert({
            id: answer.id,
            user_id: user.id,
            question_id: answer.questionId,
            content: answer.content,
            metadata: {
              wordCount: answer.metadata.wordCount,
              readingTime: answer.metadata.readingTime,
              writingTime: answer.metadata.writingTime,
            },
            is_public: false,
          });

        if (error) {
          console.error('云端同步失败:', error);
          // 不阻断用户操作，只记录错误
        }
      }

      // 保存成功后返回问题列表
      setTimeout(() => {
        setIsSaving(false);
        setSyncing(false);
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
          navigate(returnTo, { replace: true });
        } else {
          navigate('/questions/explore');
        }
      }, 500);
    } catch (error) {
      console.error('保存失败:', error);
      setIsSaving(false);
      setSyncing(false);
    }
  };

  const handleAIReview = useCallback(async () => {
    if (!question || !content.trim() || !llmConfig) return;

    setIsAiReviewing(true);
    setAiReviewContent('');
    setShowAIReview(true);
    abortAiReviewRef.current = false;

    const systemPrompt = `你是一位兼具"思考家"和"点评家"双重身份的导师。你的任务是对用户关于某个思考问题的回答进行多维度点评。

点评维度：
1. **思维深度** - 回答是否深入思考了问题的本质，还是停留在表面？
2. **逻辑严密性** - 论述是否有清晰的逻辑链条，是否存在逻辑漏洞？
3. **创新性** - 是否提出了独特、新颖的观点或角度？
4. **自省程度** - 是否体现了对自身想法的审视和反思？
5. **可行动性** - 思考是否能够转化为具体的行动或改变？

点评要求：
- 先肯定回答中的亮点和优点
- 再指出可以改进的方向
- 最后给出进一步完善建议
- 语言简洁有力，避免空话
- 总体评价给出一个1-10的分数

请用简洁、有启发性的语言进行点评。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `【思考问题】${question.content}\n\n【我的回答】${content}\n\n请从思考家和点评家的角度，对我的回答进行多维度点评。`,
      },
    ];

    try {
      let fullContent = '';
      for await (const token of streamChat(messages, llmConfig)) {
        if (abortAiReviewRef.current) break;
        fullContent += token;
        setAiReviewContent(fullContent);
      }
    } catch (error: unknown) {
      if (!abortAiReviewRef.current) {
        const msg = error instanceof Error ? error.message : 'AI点评失败，请稍后重试';
        setAiReviewContent(`点评生成失败：${msg}`);
      }
    } finally {
      setIsAiReviewing(false);
    }
  }, [question, content, llmConfig]);

  const handleExit = () => {
    if (content.trim() && !lastSavedTime) {
      setShowExitConfirm(true);
    } else {
      if (searchParams.get('returnTo')) {
        navigate(-1);
      } else {
        navigate('/questions/explore');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!question) {
    return null;
  }

  const category =
    question.category.primary === 'thinking'
      ? getCategoryConfig('thinking', question.category.secondary!)
      : null;

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
      {SEORender}
      <JsonLd schema={getQAPageSchema(
        currentQuestion?.content || '思考问题',
        answers.filter(a => a.questionId === id).map(a => a.content)
      )} />
      {/* 背景遮罩层 - 暖色主题融合 */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(255,251,235,0.82) 0%, rgba(254,243,199,0.75) 40%, rgba(255,237,213,0.78) 100%)' }} />
      <div className="hidden dark:block absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(30,20,10,0.85) 40%, rgba(17,24,39,0.88) 100%)' }} />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* 左侧返回 */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors z-10"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>

            {/* 中间显示问题内容 - 绝对定位居中 */}
            <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none px-12 sm:px-32">
              <h1 className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate max-w-md text-center">
                {question.content}
              </h1>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2 z-10">
              {category && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"
                >
                  <CategoryIcon
                    iconName={category.iconName || category.icon}
                    color="#d97706"
                    size={16}
                  />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{category.name}</span>
                </div>
              )}

              {/* 收藏按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (!question) return;
                  if (!isAuthenticated) {
                    toast.info('请先登录', { autoClose: 1500 });
                    navigate('/login');
                    return;
                  }

                  if (isFavorited(question.id)) {
                    removeFavorite(question.id);
                  } else {
                    addFavorite(question.id);
                  }
                }}
                disabled={!isAuthenticated}
              >
                <Heart
                  size={16}
                  className={isFavorited(question?.id || '') ? 'fill-red-500 text-red-500' : ''}
                />
                {isFavorited(question?.id || '') ? '已收藏' : '收藏'}
              </Button>

              {/* 待思考按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (!question) return;
                  if (!isAuthenticated) {
                    toast.info('请先登录', { autoClose: 1500 });
                    navigate('/login');
                    return;
                  }

                  if (isLater(question.id)) {
                    removeFromLater(question.id);
                  } else {
                    addToLater(question.id);
                  }
                }}
                disabled={!isAuthenticated}
              >
                <Clock
                  size={16}
                  className={isLater(question?.id || '') ? 'fill-blue-500 text-blue-500' : ''}
                />
                {isLater(question?.id || '') ? '已添加' : '待思考'}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // 检查是否有已保存的回答
                  const existingAnswer = answers.find(a => a.questionId === question!.id);
                  if (existingAnswer) {
                    setSavedAnswer(existingAnswer);
                    setShowExportDialog(true);
                  }
                }}
                disabled={!answers.find(a => a.questionId === question!.id)}
              >
                <Download size={16} className="mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 - 单栏布局 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* 圆桌启发卡片 */}
          {roundtableSession && showRoundtableInspiration && roundtableSession.summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-question3.jpg)' }} />
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/70" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      圆桌讨论启发
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRoundtableInspiration(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    收起
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {roundtableSession.summary}
                </p>
              </div>
            </motion.div>
          )}

          {/* 回答输入区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl shadow-lg border-2 border-amber-200/60 dark:border-amber-800/60 backdrop-blur-md bg-white/30 dark:bg-gray-800/30"
          >
            <div>
              <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
                <Icon icon="ph:chat-circle-text-duotone" width={22} height={22} className="text-gray-500/70 dark:text-gray-400/70" />
                你的思考
              </h3>
              <TextArea
                ref={textareaRef}
                placeholder="在这里写下你的想法...&#10;&#10;不必追求完美，真实就好。"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                autoResize
                className="min-h-[200px] text-base !bg-transparent border-amber-200/60 dark:border-amber-700/60 focus:border-amber-400 dark:focus:border-amber-600 placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70"
              />
            </div>
          </motion.div>

          {/* 思考状态和快捷操作并排 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* 思考状态 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-question4.jpg)' }} />
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/70" />
              <div className="relative">
                <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <Icon icon="ph:chart-bar-duotone" width={20} height={20} className="text-gray-500/70 dark:text-gray-400/70" />
                  思考状态
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Icon icon="ph:lightbulb-duotone" width={16} height={16} className="text-gray-500/70 dark:text-gray-400/70 flex-shrink-0" />
                    <span>不必追求完美，真实就好</span>
                  </div>
                  {writingTime > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <Clock size={16} />
                      <span>已思考 {formatTime(writingTime)}</span>
                    </div>
                  )}
                  {content.trim() && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {calculateWordCount(content)} 字
                    </div>
                  )}
                  {lastSavedTime && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check size={16} />
                      <span>已自动保存</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 快捷操作 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/UI-picture/UI-question4.jpg)' }} />
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/70" />
              <div className="relative">
                <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <Icon icon="ph:lightning-duotone" width={20} height={20} className="text-gray-500/70 dark:text-gray-400/70" />
                  快捷操作
                </h3>
                <div className="space-y-2">
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      onClick={handleAIReview}
                      disabled={!isLLMConfigured || !content.trim() || isAiReviewing}
                      isLoading={isAiReviewing}
                      fullWidth
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      AI点评
                    </Button>
                    {!isLLMConfigured && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        请配置AI大模型后体验
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSave}
                    disabled={!content.trim() || isSaving}
                    isLoading={isSaving}
                    fullWidth
                    className="border border-gray-200 dark:border-gray-700"
                  >
                    保存回答
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* AI点评弹窗 */}
      <AnimatePresence>
        {showAIReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI 点评
                </h3>
                <button
                  onClick={() => {
                    abortAiReviewRef.current = true;
                    setShowAIReview(false);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {aiReviewContent ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {aiReviewContent}
                    {isAiReviewing && (
                      <span className="inline-block w-2 h-4 bg-amber-500 animate-pulse ml-0.5" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-2 text-sm">AI正在分析你的回答...</span>
                    </div>
                  </div>
                )}
              </div>
              {!isAiReviewing && aiReviewContent && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => setShowAIReview(false)}
                    fullWidth
                  >
                    继续完善回答
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 退出确认弹窗 */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              确定要离开吗？
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              你的回答还没有保存，离开后将丢失这些内容。
            </p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowExitConfirm(false)}
                fullWidth
              >
                继续思考
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (searchParams.get('returnTo')) {
                    navigate(-1);
                  } else {
                    navigate('/questions/explore');
                  }
                }}
                fullWidth
              >
                确定离开
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 导出对话框 */}
      {showExportDialog && savedAnswer && question && (
        <ExportDialog
          question={question}
          answer={savedAnswer}
          isOpen={showExportDialog}
          onClose={() => {
            setShowExportDialog(false);
            navigate('/questions/explore');
          }}
        />
      )}
      </div>
      </div>
  );
}
