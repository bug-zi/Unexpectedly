import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Answer } from '@/types';
import { ThoughtChange } from '@/types';
import { extractKeywords, analyzeMood, analyzeDepth, collectEvidence } from '@/utils/textAnalysis';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ThoughtComparisonProps {
  oldAnswer: Answer;
  newAnswer: Answer;
}

export function ThoughtComparison({ oldAnswer, newAnswer }: ThoughtComparisonProps) {
  // 分析思维变化
  const thoughtChange = useMemo(() => {
    const oldKeywords = extractKeywords(oldAnswer.content);
    const newKeywords = extractKeywords(newAnswer.content);

    const keywordChanges = {
      added: newKeywords.filter((k) => !oldKeywords.includes(k)),
      removed: oldKeywords.filter((k) => !newKeywords.includes(k)),
      persistent: oldKeywords.filter((k) => newKeywords.includes(k)),
    };

    const moodChange = {
      from: analyzeMood(oldAnswer.content),
      to: analyzeMood(newAnswer.content),
    };

    const depthChange = {
      from: analyzeDepth(oldAnswer.content),
      to: analyzeDepth(newAnswer.content),
    };

    const evidence = collectEvidence(oldAnswer.content, newAnswer.content);

    return { keywordChanges, moodChange, depthChange, evidence };
  }, [oldAnswer, newAnswer]);

  // 情绪变化图标
  const MoodIcon = ({ mood }: { mood: 'positive' | 'neutral' | 'negative' }) => {
    const iconMap = {
      positive: '😊',
      neutral: '😐',
      negative: '😔',
    };
    return <span className="text-2xl">{iconMap[mood]}</span>;
  };

  // 深度变化指示器
  const DepthIndicator = ({ depth }: { depth: 'shallow' | 'medium' | 'deep' }) => {
    const depthMap = {
      shallow: { label: '浅层', color: 'bg-gray-300', width: 'w-1/3' },
      medium: { label: '中等', color: 'bg-yellow-400', width: 'w-2/3' },
      deep: { label: '深入', color: 'bg-green-500', width: 'w-full' },
    };
    const config = depthMap[depth];
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{config.label}</span>
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${config.color} ${config.width} transition-all`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 对比标题 */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          💭 思维变化分析
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          对比你两次回答的差异，看看思维如何进化
        </p>
      </div>

      {/* 回答对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              7天前的回答
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {format(new Date(oldAnswer.createdAt), 'yyyy年MM月dd日', {
                locale: zhCN,
              })}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {oldAnswer.content}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MoodIcon mood={thoughtChange.moodChange.from} />
              <DepthIndicator depth={thoughtChange.depthChange.from} />
            </div>
            <span className="text-gray-500">
              {oldAnswer.metadata.wordCount} 字
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              今天的回答
            </span>
            <span className="text-xs text-primary-400">
              {format(new Date(newAnswer.createdAt), 'yyyy年MM月dd日', {
                locale: zhCN,
              })}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {newAnswer.content}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MoodIcon mood={thoughtChange.moodChange.to} />
              <DepthIndicator depth={thoughtChange.depthChange.to} />
            </div>
            <span className="text-gray-500">
              {newAnswer.metadata.wordCount} 字
            </span>
          </div>
        </motion.div>
      </div>

      {/* 变化分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 详细分析
        </h4>

        <div className="space-y-4">
          {/* 关键词变化 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              关键词变化
            </h5>
            <div className="flex flex-wrap gap-2">
              {thoughtChange.keywordChanges.removed.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-red-500 dark:text-red-400">消失:</span>
                  {thoughtChange.keywordChanges.removed.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              {thoughtChange.keywordChanges.added.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-green-500 dark:text-green-400">新增:</span>
                  {thoughtChange.keywordChanges.added.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 情绪变化 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              情绪变化
            </h5>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MoodIcon mood={thoughtChange.moodChange.from} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {thoughtChange.moodChange.from === 'positive'
                    ? '积极'
                    : thoughtChange.moodChange.from === 'negative'
                    ? '消极'
                    : '中性'}
                </span>
              </div>
              {thoughtChange.moodChange.from !== thoughtChange.moodChange.to ? (
                <>
                  {thoughtChange.moodChange.to === 'positive' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : thoughtChange.moodChange.to === 'negative' ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <Minus className="text-gray-500" size={20} />
                  )}
                  <div className="flex items-center gap-2">
                    <MoodIcon mood={thoughtChange.moodChange.to} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {thoughtChange.moodChange.to === 'positive'
                        ? '积极'
                        : thoughtChange.moodChange.to === 'negative'
                        ? '消极'
                        : '中性'}
                    </span>
                  </div>
                </>
              ) : (
                <Minus className="text-gray-500" size={20} />
              )}
            </div>
          </div>

          {/* 思维深度 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              思维深度
            </h5>
            <div className="flex items-center gap-4">
              <DepthIndicator depth={thoughtChange.depthChange.from} />
              {thoughtChange.depthChange.from !== thoughtChange.depthChange.to && (
                <>
                  {thoughtChange.depthChange.to === 'deep' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : (
                    <TrendingDown className="text-orange-500" size={20} />
                  )}
                  <DepthIndicator depth={thoughtChange.depthChange.to} />
                </>
              )}
            </div>
          </div>

          {/* 证据 */}
          {thoughtChange.evidence.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                变化证据
              </h5>
              <ul className="space-y-1">
                {thoughtChange.evidence.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-primary-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
