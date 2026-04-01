import { motion } from 'framer-motion';
import { Scale, Trophy, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { JudgeResult } from '@/types';

interface DebateJudgeResultProps {
  result: JudgeResult;
  userStance: 'pro' | 'con';
  onNewDebate?: () => void;
}

export function DebateJudgeResult({ result, userStance, onNewDebate }: DebateJudgeResultProps) {
  const stanceLabel = userStance === 'pro' ? '正方' : '反方';
  const isWinner = result.winner === 'user';
  const isDraw = result.winner === 'draw';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700 rounded-3xl p-6 space-y-5"
    >
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
          <Scale size={20} className="text-violet-600 dark:text-violet-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">评委点评</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI评委的综合评价</p>
        </div>
      </div>

      {/* 胜负结果 */}
      <div className={`text-center py-4 rounded-2xl ${
        isWinner ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700' :
        isDraw ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' :
        'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700'
      }`}>
        <Trophy size={32} className={`mx-auto mb-2 ${
          isWinner ? 'text-emerald-500' : isDraw ? 'text-amber-500' : 'text-rose-500'
        }`} />
        <p className={`text-lg font-bold ${
          isWinner ? 'text-emerald-700 dark:text-emerald-300' : isDraw ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'
        }`}>
          {isWinner ? '你赢了！' : isDraw ? '势均力敌！' : '对手获胜'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          你（{stanceLabel}）{result.userScore}分 vs AI对手 {result.opponentScore}分
        </p>
      </div>

      {/* 总评 */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">总评</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* 优点 */}
      {result.userStrengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">你的优点</h4>
          </div>
          <ul className="space-y-1">
            {result.userStrengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 不足 */}
      {result.userWeaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-amber-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">改进建议</h4>
          </div>
          <ul className="space-y-1">
            {result.userWeaknesses.map((w, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 关键交锋 */}
      {result.keyClashes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-violet-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">关键交锋</h4>
          </div>
          <ul className="space-y-1">
            {result.keyClashes.map((c, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">-</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 建议 */}
      <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-bold text-violet-600 dark:text-violet-400">提升建议：</span>
          {result.advice}
        </p>
      </div>

      {/* 再来一局 */}
      {onNewDebate && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewDebate}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-shadow"
        >
          再来一局
        </motion.button>
      )}
    </motion.div>
  );
}
