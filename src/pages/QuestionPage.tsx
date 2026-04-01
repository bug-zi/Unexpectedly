import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, Clock, Download, Heart, Plus, Lightbulb } from 'lucide-react';
import { getQuestionById } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLater } from '@/hooks/useLater';
import { Answer } from '@/types';
import { saveAnswer } from '@/utils/storage';
import { calculateWordCount } from '@/utils/textAnalysis';
import { updateDailyTaskProgress } from '@/utils/taskManager';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { CategoryIcon } from '@/components/ui/Icon';
import { getCategoryConfig } from '@/constants/categories';
import { ExportDialog } from '@/components/features/ExportDialog';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

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
        navigate('/questions/explore');
      }, 500);
    } catch (error) {
      console.error('保存失败:', error);
      setIsSaving(false);
      setSyncing(false);
    }
  };

  const handleExit = () => {
    if (content.trim() && !lastSavedTime) {
      setShowExitConfirm(true);
    } else {
      navigate('/questions/explore');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>

            {/* 中间显示问题内容 */}
            <div className="flex-1 flex items-center justify-center px-8">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate max-w-md">
                {question.content}
              </h2>
            </div>

            <div className="flex items-center gap-2">
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
              className="mb-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-4"
            >
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
            </motion.div>
          )}

          {/* 回答输入区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800"
          >
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-4">
              💭 你的思考
            </h3>
            <TextArea
              ref={textareaRef}
              placeholder="在这里写下你的想法...&#10;&#10;不必追求完美，真实就好。"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              autoResize
              className="min-h-[200px] text-base border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600"
            />
          </motion.div>

          {/* 思考状态和快捷操作并排 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* 思考状态 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800"
            >
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-3">
                📊 思考状态
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>💡 不必追求完美，真实就好</span>
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
            </motion.div>

            {/* 快捷操作 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800"
            >
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-3">
                ⚡ 快捷操作
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleExit}
                  fullWidth
                  className="border border-gray-200 dark:border-gray-700"
                >
                  放弃思考
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!content.trim() || isSaving}
                  isLoading={isSaving}
                  fullWidth
                  className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  保存回答
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

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
                onClick={() => navigate('/questions/explore')}
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
  );
}
