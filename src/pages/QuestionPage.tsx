import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Check, Download, Cloud, CloudOff } from 'lucide-react';
import { getQuestionById } from '@/constants/questions';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Answer } from '@/types';
import { saveAnswer } from '@/utils/storage';
import { calculateWordCount } from '@/utils/textAnalysis';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { CategoryIcon } from '@/components/ui/Icon';
import { getCategoryConfig } from '@/constants/categories';
import { ExportDialog } from '@/components/features/ExportDialog';
import { supabase } from '@/lib/supabase';

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentQuestion, addAnswer, answers } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const { markAsAnswered } = useFavorites();

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
      navigate('/');
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

      // 延迟显示导出对话框
      setTimeout(() => {
        setIsSaving(false);
        setSyncing(false);
        setShowExportDialog(true);
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
      navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>

            {category && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: category.light,
                  color: category.dark,
                }}
              >
                <CategoryIcon
                  iconName={category.iconName || category.icon}
                  color={category.dark}
                  size={16}
                />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
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
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                isLoading={isSaving}
              >
                {isSaving && syncing ? '同步中...' : '保存'}
                {isSaving && !syncing && '保存'}
                {!isSaving && '保存'}
                {isSaving && isAuthenticated && (
                  <Cloud size={14} className={`ml-1 ${syncing ? 'animate-pulse' : ''}`} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* 问题显示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
          >
            <h1 className="font-serif text-2xl md:text-3xl font-medium leading-relaxed text-gray-900 dark:text-white">
              {question.content}
            </h1>
          </motion.div>

          {/* 回答输入区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <TextArea
              ref={textareaRef}
              placeholder="在这里写下你的想法...&#10;&#10;不必追求完美，真实就好。"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              autoResize
              className="min-h-[300px] text-lg"
            />
          </motion.div>

          {/* 提示和统计 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>💡 提示：不必追求完美，真实就好</span>
              {writingTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>已思考 {formatTime(writingTime)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              {content.trim() && (
                <span className="text-gray-600 dark:text-gray-400">
                  {calculateWordCount(content)} 字
                </span>
              )}
              {lastSavedTime && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check size={16} />
                  <span>已自动保存</span>
                </span>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={handleExit}
              className="border border-gray-200 dark:border-gray-700"
            >
              放弃思考
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              isLoading={isSaving}
              fullWidth
            >
              保存回答
            </Button>
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
                onClick={() => navigate('/')}
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
            navigate('/');
          }}
        />
      )}
    </div>
  );
}
