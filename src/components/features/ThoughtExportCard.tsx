/**
 * 思维导出卡片组件
 * 用于生成精美的思维报告卡片（支持导出为图片和 PDF）
 */

import { useRef } from 'react';
import { Answer, Question } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CategoryIcon } from '@/components/ui/Icon';
import { getCategoryConfig } from '@/constants/categories';

interface ThoughtExportCardProps {
  question: Question;
  answer: Answer;
  theme?: 'light' | 'dark';
  showWatermark?: boolean;
  className?: string;
}

export function ThoughtExportCard({
  question,
  answer,
  theme = 'light',
  showWatermark = true,
  className = '',
}: ThoughtExportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const category =
    question.category.primary === 'thinking'
      ? getCategoryConfig('thinking', question.category.secondary!)
      : null;

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-900';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const subTextColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  return (
    <div
      ref={cardRef}
      className={`${className} ${bgColor} rounded-2xl overflow-hidden`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* 顶部装饰条 */}
      {category && (
        <div className="h-2" style={{ backgroundColor: category.color }} />
      )}

      <div className="p-8">
        {/* 头部：分类和日期 */}
        <div className="flex items-center justify-between mb-6">
          {category && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: category.light,
                color: category.dark,
              }}
            >
              <CategoryIcon
                iconName={category.iconName || category.icon}
                color={category.dark}
                size={16}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          )}

          <div className={`${subTextColor} text-sm`}>
            {formatDate(new Date(answer.createdAt))}
          </div>
        </div>

        {/* 问题内容 */}
        <div className="mb-6">
          <div className={`${textColor} text-xl md:text-2xl font-medium leading-relaxed mb-2`}>
            {question.content}
          </div>

          {/* 难度星级 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < question.difficulty ? 'text-yellow-400' : 'text-gray-300'}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* 回答内容 */}
        <div
          className={`${subTextColor} leading-relaxed whitespace-pre-wrap mb-6`}
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
          }}
        >
          {answer.content}
        </div>

        {/* 底部元数据 */}
        <div className={`flex items-center justify-between pt-4 border-t ${borderColor}`}>
          <div className={`${subTextColor} text-sm space-y-1`}>
            <div>⏱️ 思考时间：{formatTime(answer.metadata.writingTime)}</div>
            <div>📝 字数：{answer.metadata.wordCount} 字</div>
          </div>

          {/* 标签 */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 水印 */}
        {showWatermark && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className={`${subTextColor} text-xs text-center`}>
              💭 由「万万没想到」生成 · 每日思维提升工具
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
