/**
 * 灵感扩散器 - 输入栏
 * 支持历史记录建议
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface DiffuserInputBarProps {
  onSubmit: (word: string) => void;
  isLoading: boolean;
  recentWords?: string[];
}

export function DiffuserInputBar({ onSubmit, isLoading, recentWords = [] }: DiffuserInputBarProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = input.trim();
    if (!word || isLoading) return;
    onSubmit(word);
    setInput('');
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (!input.trim() && recentWords.length > 0) {
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    if (input.trim()) {
      setShowSuggestions(false);
    }
  }, [input]);

  const uniqueRecent = [...new Set(recentWords)].slice(0, 5);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md rounded-full border border-green-200/40 px-4 py-2 shadow-sm transition-all focus-within:border-green-400/50 focus-within:shadow-green-100/50">
        {isLoading ? (
          <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="输入词语，开始扩散..."
          className="flex-1 bg-transparent text-gray-700 dark:text-gray-200 text-sm placeholder:text-gray-400/70 outline-none min-w-0"
          disabled={isLoading}
        />
        {input.trim() && (
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-green-500/70 text-white text-xs font-medium hover:bg-green-400/80 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isLoading ? '生成中...' : '扩散'}
          </button>
        )}
      </div>

      {/* 最近词语建议 */}
      {showSuggestions && uniqueRecent.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white/90 backdrop-blur-md rounded-xl border border-green-200/30 shadow-lg py-1.5 z-20">
          <div className="px-3 py-1 text-[10px] text-gray-400 font-medium">最近使用</div>
          {uniqueRecent.map((word) => (
            <button
              key={word}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-green-50/60 hover:text-green-700 transition-colors"
              onMouseDown={() => {
                setInput(word);
                setShowSuggestions(false);
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
