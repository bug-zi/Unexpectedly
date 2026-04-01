import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { THINKERS } from '@/constants/thinkers';
import { THINKING_DIMENSIONS, LIFE_SCENARIOS } from '@/constants/categories';
import { ThinkerCard } from './ThinkerCard';

interface ThinkerGridProps {
  selectedIds: string[];
  onToggle: (thinkerId: string) => void;
  maxSelect?: number;
  recommendedIds?: string[];
}

const STYLE_FILTERS = [
  { id: 'all', label: '全部' },
  ...Object.entries(THINKING_DIMENSIONS).map(([key, val]) => ({ id: `thinking-${key}`, label: `💭 ${val.name}` })),
  ...Object.entries(LIFE_SCENARIOS).map(([key, val]) => ({ id: `scenario-${key}`, label: `🌍 ${val.name}` })),
];

export function ThinkerGrid({ selectedIds, onToggle, maxSelect = 5, recommendedIds }: ThinkerGridProps) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThinkers = THINKERS.filter(t => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !t.name.toLowerCase().includes(query) &&
        !t.nameEn.toLowerCase().includes(query) &&
        !t.domain.some(d => d.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // 分类过滤
    if (filter !== 'all') {
      const style = filter.replace(/^(thinking|scenario)-/, '');
      return t.thinkingStyle === style;
    }

    return true;
  });

  // 推荐的大咖
  const recommended = recommendedIds
    ? THINKERS.filter(t => recommendedIds.includes(t.id))
    : [];
  const others = recommendedIds
    ? filteredThinkers.filter(t => !recommendedIds.includes(t.id))
    : filteredThinkers;

  return (
    <div className="space-y-4">
      {/* 搜索和过滤 */}
      <div className="space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索大咖..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* 分类过滤标签 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {STYLE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filter === f.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 已选计数 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          已选 {selectedIds.length}/{maxSelect} 位
        </span>
        {selectedIds.length >= maxSelect && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            已达上限
          </span>
        )}
      </div>

      {/* 推荐区 */}
      <AnimatePresence>
        {recommended.length > 0 && filter === 'all' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-2">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                为你推荐
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recommended.map(t => (
                <ThinkerCard
                  key={t.id}
                  thinker={t}
                  selected={selectedIds.includes(t.id)}
                  onToggle={onToggle}
                  disabled={selectedIds.length >= maxSelect && !selectedIds.includes(t.id)}
                />
              ))}
            </div>

            <div className="my-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">更多大咖</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 大咖列表 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {others.map(t => (
          <ThinkerCard
            key={t.id}
            thinker={t}
            selected={selectedIds.includes(t.id)}
            onToggle={onToggle}
            disabled={selectedIds.length >= maxSelect && !selectedIds.includes(t.id)}
          />
        ))}
      </div>

      {filteredThinkers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          没有找到匹配的大咖
        </div>
      )}
    </div>
  );
}
