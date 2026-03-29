/**
 * 任务卡片组件
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Target, Calendar } from 'lucide-react';
import { DailyTask, WeeklyTask } from '@/types/tasks';

interface DailyTaskCardProps {
  task: DailyTask & { progress: number };
}

export function DailyTaskCard({ task }: DailyTaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {task.completed ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Circle size={20} className="text-gray-400" />
          )}
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {task.title}
          </h4>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {task.current}/{task.target}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {task.description}
      </p>

      {/* 进度条 */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${
            task.completed
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
        />
      </div>
    </motion.div>
  );
}

interface WeeklyTaskCardProps {
  task: WeeklyTask & { completedAt?: string };
  onTaskClick?: (task: WeeklyTask & { completedAt?: string }) => void;
}

export function WeeklyTaskCard({ task, onTaskClick }: WeeklyTaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: task.completed ? 1 : 1.02 }}
      whileTap={task.completed ? {} : { scale: 0.98 }}
      onClick={() => !task.completed && onTaskClick?.(task)}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all cursor-pointer ${
        task.completed
          ? 'border-green-200 dark:border-green-800 opacity-60'
          : 'border-purple-200 dark:border-purple-800 hover:border-purple-400'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {task.completed ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Circle size={20} className="text-gray-400" />
          )}
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {task.title}
          </h4>
        </div>
        {task.completed && (
          <span className="text-xs text-gray-500">
            已完成
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {task.description}
      </p>
    </motion.div>
  );
}

interface TaskProgressHeaderProps {
  streak: number;
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
}

export function TaskProgressHeader({
  streak,
  dailyCompleted,
  weeklyCompleted,
}: TaskProgressHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-1">每日任务</h3>
          <p className="text-blue-100 text-sm">
            {dailyCompleted ? '🎉 今日任务已全部完成！' : '加油，继续坚持！'}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <Target size={20} />
            <span className="text-3xl font-bold">{streak}</span>
          </div>
          <p className="text-blue-100 text-sm">连续天数</p>
        </div>
      </div>

      {weeklyCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span className="font-medium">🎊 本周任务也已全部完成！</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
