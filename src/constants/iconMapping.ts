import {
  Sparkles,
  RefreshCw,
  Link2,
  Lightbulb,
  Rocket,
  Briefcase,
  Palette,
  Heart,
  BookOpen,
  Sprout,
  Dice5,
  TrendingUp,
  Gamepad2,
  Clock,
  ArrowLeft,
  Check,
  X,
  Save,
  AlertCircle,
  Brain,
  Globe,
} from 'lucide-react';

/**
 * 图标映射配置
 * 将原有的emoji映射到Lucide React图标组件
 */
export const ICON_MAP = {
  // 思维维度图标
  '🔮': Sparkles,        // 假设思维
  '🔄': RefreshCw,       // 逆向思考
  '🔗': Link2,           // 联想创意
  '💡': Lightbulb,       // 自我反思
  '🚀': Rocket,          // 未来设想

  // 生活场景图标
  '💼': Briefcase,       // 职业发展
  '🎨': Palette,         // 创意激发
  '❤️': Heart,           // 人际关系
  '📚': BookOpen,        // 学习成长
  '🌱': Sprout,          // 生活哲学

  // 功能图标
  '🧠': Brain,           // 思维维度
  '🌍': Globe,           // 生活场景
  '🎲': Dice5,           // 随机
  '📈': TrendingUp,      // 成长足迹
  '🎰': Gamepad2,        // 灵感老虎机
  '⏱️': Clock,           // 时间/计时
  '←': ArrowLeft,        // 返回
  '✓': Check,            // 成功
  '✨': Sparkles,         // 星星/开始
} as const;

/**
 * 获取图标组件
 */
export function getIconComponent(emoji: string) {
  return ICON_MAP[emoji as keyof typeof ICON_MAP] || Sparkles;
}
