/**
 * 灵感涟漪组件
 * 用户输入自己的点子，AI 用多种创意思维方法帮助拓展思路
 * 支持多轮对话，持续深化灵感
 */

import { renderCompactContent } from '@/utils/formatContent';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Waves, AlertTriangle, User, Sparkles, RotateCcw } from 'lucide-react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildRipplePrompt } from '@/utils/brainstormPrompt';
import type { ChatMessage } from '@/types';

interface InspirationRippleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function InspirationRipple({ isOpen, onClose }: InspirationRippleProps) {
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, []);

  const handleSend = useCallback(async () => {
    if (!llmConfig || !input.trim() || isLoading) return;

    abortRef.current = false;
    const userContent = input.trim();
    setInput('');
    setError(null);

    const configSnapshot = { ...llmConfig };
    let messages: ChatMessage[];

    if (chatHistory.length === 0) {
      // 首次输入：使用头脑风暴 prompt
      messages = buildRipplePrompt(userContent);
    } else {
      // 后续追问：追加到对话历史
      messages = [...chatHistory, { role: 'user' as const, content: userContent }];
    }

    // 立即显示用户消息
    setDisplayMessages((prev) => [...prev, { role: 'user', content: userContent }]);
    setChatHistory(messages);
    setIsLoading(true);
    setStreamingText('');
    scrollToBottom();

    try {
      let fullText = '';

      for await (const token of streamChat(messages, configSnapshot, {
        temperature: 0.9,
        max_tokens: 3000,
      })) {
        if (abortRef.current) break;
        fullText += token;
        setStreamingText(fullText);
        scrollToBottom();
      }

      if (fullText.trim()) {
        // 更新对话历史（加入 AI 回复）和显示消息
        const assistantMsg: ChatMessage = { role: 'assistant', content: fullText.trim() };
        setChatHistory((prev) => [...prev, assistantMsg]);
        setDisplayMessages((prev) => [...prev, { role: 'assistant', content: fullText.trim() }]);
      }
    } catch (err) {
      if (!abortRef.current) {
        const msg = err instanceof Error ? err.message : '生成失败，请重试';
        setError(msg);
        // 移除刚才添加的用户消息（因为失败了）
        setDisplayMessages((prev) => prev.slice(0, -1));
        setChatHistory(messages.slice(0, -1));
        setInput(userContent); // 恢复输入
      }
    } finally {
      setIsLoading(false);
      setStreamingText('');
      inputRef.current?.focus();
    }
  }, [llmConfig, input, isLoading, chatHistory, scrollToBottom]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    // 保留已流式输出的部分作为回复
    setStreamingText((prev) => {
      if (prev.trim()) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: prev.trim() };
        setChatHistory((history) => [...history, assistantMsg]);
        setDisplayMessages((msgs) => [...msgs, { role: 'assistant', content: prev.trim() }]);
      }
      return '';
    });
    setIsLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    if (isLoading) {
      abortRef.current = true;
    }
    setChatHistory([]);
    setDisplayMessages([]);
    setStreamingText('');
    setInput('');
    setError(null);
    setIsLoading(false);
    inputRef.current?.focus();
  }, [isLoading]);

  const handleClose = useCallback(() => {
    if (isLoading) {
      abortRef.current = true;
    }
    setChatHistory([]);
    setDisplayMessages([]);
    setStreamingText('');
    setInput('');
    setError(null);
    setIsLoading(false);
    onClose();
  }, [isLoading, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const hasConversation = displayMessages.length > 0;

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
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <Waves size={18} className="text-white" />
                </div>
                灵感涟漪
              </h2>
              <div className="flex items-center gap-1">
                {hasConversation && (
                  <button
                    onClick={handleReset}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="重新开始"
                  >
                    <RotateCcw size={16} className="text-gray-500" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
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

            {/* 对话展示区域 */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
            >
              {!hasConversation && !isLoading && (
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

              {/* 对话消息列表 */}
              {displayMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles size={12} className="text-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">灵感拓展</span>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">{msg.role === 'assistant' ? renderCompactContent(msg.content) : msg.content}</div>
                  </div>
                </motion.div>
              ))}

              {/* 流式输出中的 AI 回复 */}
              {isLoading && streamingText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex justify-start"
                >
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-green-500" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">灵感拓展</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {streamingText}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 加载中占位 */}
              {isLoading && !streamingText && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center gap-3">
                      <Loader2 size={16} className="text-green-500 animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        思维涟漪正在扩散中...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 text-center">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* 底部输入区域 */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasConversation
                      ? '继续追问，深入拓展你的灵感...'
                      : '分享你的点子或灵感，让 AI 帮你拓展思路...'
                  }
                  disabled={!llmConfig || isLoading}
                  rows={2}
                  className="flex-1 p-3 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 dark:focus:border-green-600 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={isLoading ? handleStop : handleSend}
                    disabled={!llmConfig || (!input.trim() && !isLoading)}
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isLoading
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? <X size={18} /> : <Send size={18} />}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                Enter 发送 · Shift+Enter 换行
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
