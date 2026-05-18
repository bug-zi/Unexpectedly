/**
 * 灵感扩散器 - 空状态引导
 * 浮动粒子动画
 */

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface DiffuserEmptyStateProps {
  isConfigured: boolean;
}

const FLOATING_WORDS = ['灵感', '创意', '联想', '想象', '思维', '发散', '探索'];

export function DiffuserEmptyState({ isConfigured }: DiffuserEmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 浮动词语粒子 */}
      {FLOATING_WORDS.map((word, i) => (
        <motion.span
          key={word}
          className="absolute text-green-400/20 text-sm font-medium select-none"
          initial={{
            x: Math.cos((i / FLOATING_WORDS.length) * Math.PI * 2) * 120,
            y: Math.sin((i / FLOATING_WORDS.length) * Math.PI * 2) * 80,
            opacity: 0,
          }}
          animate={{
            x: [
              Math.cos((i / FLOATING_WORDS.length) * Math.PI * 2) * 120,
              Math.cos((i / FLOATING_WORDS.length) * Math.PI * 2 + 0.5) * 140,
              Math.cos((i / FLOATING_WORDS.length) * Math.PI * 2) * 120,
            ],
            y: [
              Math.sin((i / FLOATING_WORDS.length) * Math.PI * 2) * 80,
              Math.sin((i / FLOATING_WORDS.length) * Math.PI * 2 + 0.5) * 100,
              Math.sin((i / FLOATING_WORDS.length) * Math.PI * 2) * 80,
            ],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ left: '50%', top: '50%' }}
        >
          {word}
        </motion.span>
      ))}

      {/* 中心提示 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/15 backdrop-blur-sm flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-10 h-10 text-green-500/50" />
        </motion.div>
        {isConfigured ? (
          <>
            <h3 className="text-lg font-medium text-gray-500/80 mb-2">输入一个词开始思维扩散</h3>
            <p className="text-sm text-gray-400/70">在上方输入框输入任意词语，AI 将为你生成关联联想网络</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-500/80 mb-2">灵感扩散器</h3>
            <p className="text-sm text-amber-500/70">请先在「大咖圆桌」中配置 AI 模型后使用</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
