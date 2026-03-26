import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Answer } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Icon } from '@iconify/react';
import { getCategoryConfig } from '@/constants/categories';
import { getQuestionById } from '@/constants/questions';

interface VirtualizedAnswerListProps {
  answersByDate: Record<string, Answer[]>;
  expandedAnswers: Set<string>;
  onToggleExpansion: (answerId: string) => void;
  height?: string | number;
}

export const VirtualizedAnswerList = memo(({
  answersByDate,
  expandedAnswers,
  onToggleExpansion,
  height = 'calc(100vh - 400px)',
}: VirtualizedAnswerListProps) => {
  // 将分组数据扁平化为虚拟列表可用的格式
  const flatData = Object.entries(answersByDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .flatMap(([dateKey, dayAnswers]) => [
      { type: 'header' as const, dateKey, count: dayAnswers.length },
      ...dayAnswers.map(answer => ({ type: 'item' as const, answer, dateKey })),
    ]);

  const itemContent = (index: number, data: any) => {
    if (data.type === 'header') {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Icon icon="ph:calendar-blank-duotone" width={22} height={22} className="text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {format(new Date(data.dateKey), 'yyyy年MM月dd日', {
                    locale: zhCN,
                  })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(data.dateKey), 'EEEE', { locale: zhCN })}
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {data.count} 个回答
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 回答项
    const answer: Answer = data.answer;
    const question = getQuestionById(answer.questionId);
    const isExpanded = expandedAnswers.has(answer.id);

    return (
      <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        {/* 问题标题 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 mt-1">
            <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
              <Icon icon="ph:question-duotone" width={18} height={18} className="text-orange-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              {question?.content || '未知问题'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Icon icon="ph:text-aa" width={14} height={14} />
                {answer.metadata.wordCount} 字
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="ph:clock" width={14} height={14} />
                {format(new Date(answer.createdAt), 'HH:mm')}
              </span>
              {question?.category && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {getCategoryConfig(question.category.primary)?.label || question.category.primary}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onToggleExpansion(answer.id)}
            className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <Icon icon="ph:caret-up" width={20} height={20} className="text-gray-500" />
            ) : (
              <Icon icon="ph:caret-down" width={20} height={20} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* 回答内容（可展开） */}
        {isExpanded && (
          <div className="mt-4 ml-11">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {answer.content}
              </p>
              {answer.metadata.tags && answer.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {answer.metadata.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
      <Virtuoso
        style={{ height }}
        data={flatData}
        itemContent={itemContent}
        overscan={200}
        defaultItemHeight={150}
        components={{
          EmptyPlaceholder: () => (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                  <Icon icon="ph:calendar-x" width={36} height={36} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    还没有回答记录
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    开始思考，记录你的成长足迹吧！
                  </p>
                </div>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
});

VirtualizedAnswerList.displayName = 'VirtualizedAnswerList';
