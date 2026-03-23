/**
 * 导出对话框组件
 * 提供多种导出选项和预览功能
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Image,
  FileText,
  Share2,
  Check,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { Question, Answer } from '@/types';
import { ThoughtExportCard } from './ThoughtExportCard';
import {
  exportAsImage,
  exportAsPDF,
  exportAsMarkdown,
  generateSocialShareText,
  copyToClipboard,
  type ExportConfig,
} from '@/utils/export';
import { Button } from '@/components/ui/Button';

interface ExportDialogProps {
  question: Question;
  answer: Answer;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({
  question,
  answer,
  isOpen,
  onClose,
}: ExportDialogProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    includeQuestion: true,
    includeMetadata: true,
    includeTimestamp: true,
    theme: 'light',
    watermark: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      await exportAsImage(
        cardRef.current,
        `thought-${question.id}-${Date.now()}.png`
      );
      onClose();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      await exportAsPDF(
        cardRef.current,
        `thought-${question.id}-${Date.now()}.pdf`,
        question.content.substring(0, 20) + '...'
      );
      onClose();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    try {
      exportAsMarkdown(question, answer);
      onClose();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const handleCopyShareText = async (platform: 'twitter' | 'weibo' | 'wechat' | 'generic') => {
    const text = generateSocialShareText(question, answer, platform);
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('复制失败，请手动复制');
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    导出思维报告
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    选择导出格式或分享到社交媒体
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex h-[calc(90vh-180px)]">
                {/* 左侧：预览区域 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      预览
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExportConfig({ ...exportConfig, theme: 'light' })
                        }
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          exportConfig.theme === 'light'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        浅色
                      </button>
                      <button
                        onClick={() =>
                          setExportConfig({ ...exportConfig, theme: 'dark' })
                        }
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          exportConfig.theme === 'dark'
                            ? 'bg-gray-800 text-white shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        深色
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div ref={cardRef} className="w-full max-w-2xl">
                      <ThoughtExportCard
                        question={question}
                        answer={answer}
                        theme={exportConfig.theme}
                        showWatermark={exportConfig.watermark}
                      />
                    </div>
                  </div>
                </div>

                {/* 右侧：操作区域 */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
                  {/* 导出选项 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      导出格式
                    </h3>

                    <div className="space-y-3">
                      <Button
                        onClick={handleExportImage}
                        variant="secondary"
                        fullWidth
                        disabled={isExporting}
                        isLoading={isExporting}
                        className="justify-start"
                      >
                        <Image size={20} className="mr-2" />
                        导出为图片 (PNG)
                      </Button>

                      <Button
                        onClick={handleExportPDF}
                        variant="secondary"
                        fullWidth
                        disabled={isExporting}
                        isLoading={isExporting}
                        className="justify-start"
                      >
                        <FileText size={20} className="mr-2" />
                        导出为 PDF
                      </Button>

                      <Button
                        onClick={handleExportMarkdown}
                        variant="secondary"
                        fullWidth
                        className="justify-start"
                      >
                        <Download size={20} className="mr-2" />
                        导出为 Markdown
                      </Button>
                    </div>
                  </div>

                  {/* 配置选项 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      配置选项
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportConfig.watermark}
                          onChange={(e) =>
                            setExportConfig({ ...exportConfig, watermark: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          显示水印
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 社交分享 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      社交分享
                    </h3>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleCopyShareText('twitter')}
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="justify-start"
                      >
                        <Twitter size={16} className="mr-2" />
                        Twitter / X
                        {copied && <Check size={16} className="ml-auto text-green-600" />}
                      </Button>

                      <Button
                        onClick={() => handleCopyShareText('weibo')}
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="justify-start"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        微博
                        {copied && <Check size={16} className="ml-auto text-green-600" />}
                      </Button>

                      <Button
                        onClick={() => handleCopyShareText('wechat')}
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="justify-start"
                      >
                        <Share2 size={16} className="mr-2" />
                        微信
                        {copied && <Check size={16} className="ml-auto text-green-600" />}
                      </Button>
                    </div>

                    {copied && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-sm text-green-600 dark:text-green-400 text-center"
                      >
                        ✓ 已复制到剪贴板
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
