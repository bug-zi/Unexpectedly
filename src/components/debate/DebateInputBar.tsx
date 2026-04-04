import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, RefreshCw } from 'lucide-react';

interface DebateInputBarProps {
  onSend: (content: string) => void;
  onEndDebate: () => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  disabled?: boolean;
}

export function DebateInputBar({ onSend, onEndDebate, isGenerating, onStopGeneration, disabled }: DebateInputBarProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    // 发送后回到底部模式
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 输入内容变化时同步焦点状态
  useEffect(() => {
    if (input.trim().length > 0 && !isFocused) {
      setIsFocused(true);
    }
  }, [input, isFocused]);

  const hasContent = input.trim().length > 0;
  // 有内容或聚焦时居中显示
  const showCentered = isFocused || hasContent;

  return (
    <AnimatePresence mode="wait">
      {showCentered ? (
        <motion.div
          key="centered"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
        >
          {/* 半透明遮罩 */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!hasContent) {
                setIsFocused(false);
                textareaRef.current?.blur();
              }
            }}
          />

          {/* 居中对话框 */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200/50 dark:border-amber-800/50 overflow-hidden"
          >
            {/* 顶部提示 */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-xs text-gray-400">输入你的论点</span>
              <button
                onClick={() => {
                  setIsFocused(false);
                  textareaRef.current?.blur();
                }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                收起
              </button>
            </div>

            <div className="flex gap-2.5 items-end px-4 pb-4">
              {/* 结束辩论按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isGenerating ? onStopGeneration : onEndDebate}
                className={`shrink-0 p-2.5 rounded-xl transition-colors ${
                  isGenerating
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/50 dark:border-red-800/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isGenerating ? '停止生成' : '结束辩论'}
              >
                <Square size={18} />
              </motion.button>

              {/* 输入框 */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  placeholder={isGenerating ? 'AI正在思考...' : '输入你的论点...'}
                  disabled={disabled || isGenerating}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-gray-50/80 dark:bg-gray-700/80 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 dark:focus:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  autoFocus
                />
              </div>

              {/* 发送按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || disabled || isGenerating}
                className="shrink-0 p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-amber-500/20"
              >
                {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="bottom"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white/95 via-white/90 to-white/70 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/70 backdrop-blur-xl border-t border-amber-200/40 dark:border-amber-800/40 px-4 py-3 sm:py-4"
        >
          <div className="max-w-3xl mx-auto flex gap-2.5 items-end">
            {/* 结束辩论按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isGenerating ? onStopGeneration : onEndDebate}
              className={`shrink-0 p-2.5 rounded-xl transition-colors ${
                isGenerating
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/50 dark:border-red-800/50'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60'
              }`}
              title={isGenerating ? '停止生成' : '结束辩论'}
            >
              <Square size={18} />
            </motion.button>

            {/* 输入框 */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                placeholder={isGenerating ? 'AI正在思考...' : '输入你的论点...'}
                disabled={disabled || isGenerating}
                rows={1}
                className="w-full resize-none rounded-2xl border border-amber-200/60 dark:border-amber-800/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 dark:focus:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ maxHeight: '120px' }}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>

            {/* 发送按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || disabled || isGenerating}
              className="shrink-0 p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-amber-500/20"
            >
              {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
