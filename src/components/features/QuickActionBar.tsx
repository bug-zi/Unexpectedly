/**
 * 快速操作栏组件
 * 紧凑高效的核心功能入口
 */

import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp, Brain, Globe, Sparkles, PlusCircle } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

export const QuickActionBar = memo(() => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'slot-machine',
      label: '灵感老虎机',
      icon: 'ph:game-controller-duotone',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: '随机词语碰撞创意',
      onClick: () => navigate('/slot-machine'),
    },
    {
      id: 'thinking',
      label: '思维维度',
      icon: 'ph:brain-duotone',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: '批判、创新、系统',
      onClick: () => navigate('/categories/thinking'),
    },
    {
      id: 'scenario',
      label: '生活场景',
      icon: 'ph:globe-hemisphere-west-duotone',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      description: '工作、关系、成长',
      onClick: () => navigate('/categories/scenario'),
    },
    {
      id: 'growth',
      label: '成长足迹',
      icon: 'ph:trend-up-duotone',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      description: '查看思维成长',
      onClick: () => navigate('/growth'),
    },
    {
      id: 'create',
      label: '创建问题',
      icon: 'ph:plus-circle-duotone',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      description: '贡献好问题',
      onClick: () => navigate('/question-generator'),
    },
  ];

  return (
    <div className="mb-6">
      {/* 紧凑横向布局 */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={action.onClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
              border-2 shadow-sm hover:shadow-md transition-all
              ${action.bgColor} ${action.borderColor}
              hover:border-opacity-50
            `}
          >
            <Icon icon={action.icon} width={20} height={20} className={`bg-gradient-to-br ${action.color} bg-clip-text text-transparent`} />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {action.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                {action.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

QuickActionBar.displayName = 'QuickActionBar';
