import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-2xl mx-auto flex gap-2 items-end">
        {/* 结束辩论按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isGenerating ? onStopGeneration : onEndDebate}
          className={`shrink-0 p-2.5 rounded-xl transition-colors ${
            isGenerating
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={isGenerating ? '停止生成' : '结束辩论'}
        >
          {isGenerating ? <Square size={20} /> : <Square size={20} />}
        </motion.button>

        {/* 输入框 */}
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerating ? 'AI正在思考...' : '输入你的论点...'}
            disabled={disabled || isGenerating}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="shrink-0 p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
        </motion.button>
      </div>
    </div>
  );
}
