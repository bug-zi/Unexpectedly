/**
 * 横向统计栏组件
 * 紧凑高效的统计数据展示
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface CompactStatsBarProps {
  stats: {
    totalAnswers: number;
    totalWords: number;
    currentStreak: number;
    averageWords: number;
  };
}

export const CompactStatsBar = memo(({ stats }: CompactStatsBarProps) => {
  const statItems = [
    {
      key: 'totalAnswers',
      label: '累计',
      value: stats.totalAnswers,
      icon: 'ph:chat-circle-text-duotone',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      key: 'totalWords',
      label: '总字数',
      value: stats.totalWords.toLocaleString(),
      icon: 'ph:text-aa-duotone',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      key: 'currentStreak',
      label: '连续',
      value: stats.currentStreak,
      icon: 'ph:flame-duotone',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      key: 'averageWords',
      label: '平均',
      value: stats.averageWords,
      icon: 'ph:chart-bar-duotone',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className={`
            flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl
            border-2 shadow-sm hover:shadow-md transition-all cursor-default
            ${stat.bgColor} border-gray-200 dark:border-gray-700
          `}
        >
          <div className={`p-2 rounded-lg ${stat.bgColor}`}>
            <Icon icon={stat.icon} width={24} height={24} className={stat.color} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

CompactStatsBar.displayName = 'CompactStatsBar';
