/**
 * 灵感涟漪组件
 * 用户输入自己的点子，AI 用多种创意思维方法帮助拓展思路
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Waves, AlertTriangle } from 'lucide-react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildRipplePrompt } from '@/utils/brainstormPrompt';

interface InspirationRippleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InspirationRipple({ isOpen, onClose }: InspirationRippleProps) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const [userIdea, setUserIdea] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!llmConfig || !userIdea.trim() || isLoading) return;

    abortRef.current = false;
    setIsLoading(true);
    setError(null);
    setResponse('');

    const configSnapshot = { ...llmConfig };
    const messages = buildRipplePrompt(userIdea.trim());

    try {
      let fullText = '';

      for await (const token of streamChat(messages, configSnapshot, {
        temperature: 0.9,
        max_tokens: 3000,
      })) {
        if (abortRef.current) break;
        fullText += token;
        setResponse(fullText);
        // 自动滚动到底部
        responseRef.current?.scrollTo({
          top: responseRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      if (!abortRef.current) {
        const msg = err instanceof Error ? err.message : '生成失败，请重试';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [llmConfig, userIdea, isLoading]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isLoading) {
      handleStop();
    }
    setUserIdea('');
    setResponse('');
    setError(null);
    onClose();
  }, [isLoading, handleStop, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500">
                  <Waves size={18} className="text-white" />
                </div>
                灵感涟漪
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* AI 未配置提示 */}
            {!llmConfig && (
              <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  请先配置 AI 模型才能使用灵感涟漪
                </p>
              </div>
            )}

            {/* 输入区域 */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                <textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="分享你的点子或灵感，让 AI 帮你拓展思路..."
                  disabled={!llmConfig || isLoading}
                  rows={2}
                  className="flex-1 p-3 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 dark:focus:border-green-600 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                />
                <button
                  onClick={isLoading ? handleStop : handleGenerate}
                  disabled={!llmConfig || (!userIdea.trim() && !isLoading)}
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isLoading
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isLoading ? <X size={18} /> : <Send size={18} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                Enter 发送 · Shift+Enter 换行
              </p>
            </div>

            {/* 回答展示区域 */}
            <div
              ref={responseRef}
              className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
            >
              {isLoading && !response && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <Loader2 size={20} className="text-green-500 animate-spin" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    思维涟漪正在扩散中...
                  </span>
                </div>
              )}

              {error && (
                <div className="py-8 text-center">
                  <p className="text-red-500 text-sm">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 text-sm text-green-500 hover:text-green-600 transition-colors"
                  >
                    重试
                  </button>
                </div>
              )}

              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {response}
                  </div>
                </motion.div>
              )}

              {!response && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Waves size={40} className="text-gray-200 dark:text-gray-600 mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">
                    投入你的点子，看思维涟漪如何扩散
                  </p>
                  <p className="text-gray-300 dark:text-gray-600 text-xs">
                    AI 将运用 SCAMPER、六顶思考帽、逆向思考等方法拓展你的灵感
                  </p>
                </div>
              )}
            </div>

            {/* 底部状态 */}
            {isLoading && response && (
              <div className="px-6 py-2 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    正在生成中...
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
