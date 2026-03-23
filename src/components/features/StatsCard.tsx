import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon size={24} className={color} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
