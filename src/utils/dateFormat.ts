/**
 * 日期格式化工具
 */
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期为中文
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: zhCN });
}

/**
 * 格式化相对时间（如"3天前"）
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { locale: zhCN, addSuffix: true });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm');
}

/**
 * 格式化简短日期
 */
export function formatShortDate(date: Date | string): string {
  return formatDate(date, 'MM月dd日');
}
