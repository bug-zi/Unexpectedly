/**
 * 批量导出对话框
 * 支持批量导出多个回答为 PDF 或图片
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image, Loader2 } from 'lucide-react';
import { createRoot, Root } from 'react-dom/client';
import { Answer } from '@/types';
import { Button } from '@/components/ui/Button';
import { ThoughtExportCard } from './ThoughtExportCard';
import { getQuestionById } from '@/constants/questions';

interface BatchExportDialogProps {
  answers: Answer[];
  isOpen: boolean;
  onClose: () => void;
}

export function BatchExportDialog({
  answers,
  isOpen,
  onClose,
}: BatchExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'image'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setCompletedCount(0);

    try {
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const question = getQuestionById(answer.questionId);

        if (!question) continue;

        // 渲染并导出单个回答
        await exportSingleAnswerAsImageOrPDF(answer, question, i + 1);

        setCompletedCount(i + 1);
        setCurrentProgress(((i + 1) / answers.length) * 100);
      }

      // 全部导出完成
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setCurrentProgress(0);
        setCompletedCount(0);
      }, 1000);
    } catch (error) {
      console.error('批量导出失败:', error);
      alert('批量导出失败，请重试');
      setIsExporting(false);
    }
  };

  const exportSingleAnswerAsImageOrPDF = async (answer: Answer, question: any, index: number) => {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '600px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '20px';
    document.body.appendChild(tempContainer);

    let root: Root | null = null;

    try {
      // 创建 React root 并渲染组件
      root = createRoot(tempContainer);
      root.render(
        <ThoughtExportCard
          question={question}
          answer={answer}
          theme="light"
          showWatermark={true}
          className=""
        />
      );

      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 导入导出函数
      const { exportAsImage, exportAsPDF } = await import('@/utils/export');

      const filename = `thought-${answer.questionId}-${index}`;

      if (exportFormat === 'pdf') {
        await exportAsPDF(tempContainer, `${filename}.pdf`);
      } else {
        await exportAsImage(tempContainer, `${filename}.png`);
      }
    } finally {
      // 清理
      if (root) {
        root.unmount();
      }
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 对话框 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    批量导出
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    导出 {answers.length} 条思考记录
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* 内容 */}
              <div className="p-6">
                {/* 导出格式选择 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    选择导出格式
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'pdf'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FileText
                        size={24}
                        className={`mx-auto mb-2 ${
                          exportFormat === 'pdf' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        PDF 文档
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        适合打印和分享
                      </div>
                    </button>

                    <button
                      onClick={() => setExportFormat('image')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'image'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Image
                        size={24}
                        className={`mx-auto mb-2 ${
                          exportFormat === 'image'
                            ? 'text-purple-600'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        PNG 图片
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        适合社交媒体
                      </div>
                    </button>
                  </div>
                </div>

                {/* 导出进度 */}
                {isExporting && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        导出进度
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {completedCount} / {answers.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentProgress}%` }}
                        className="bg-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    fullWidth
                    disabled={isExporting}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleExport}
                    fullWidth
                    disabled={isExporting}
                    isLoading={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        导出中...
                      </>
                    ) : (
                      <>
                        <Download size={18} className="mr-2" />
                        开始导出
                      </>
                    )}
                  </Button>
                </div>

                {/* 提示信息 */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    💡 提示：批量导出会为每条思考记录生成单独的文件，保存在您的下载文件夹中。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
