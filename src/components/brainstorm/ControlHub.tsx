/**
 * 控制中枢 - 用户自定义创意规则
 * 种子词规则和点子生成规则互相独立
 * 用户输入需求 → AI 生成普适规则 → 确认后注入对应阶段 prompt
 */

import { useState, useCallback } from 'react';
import { Settings, Check, X, Trash2, ToggleLeft, ToggleRight, Loader2, Sparkles, Sprout, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useControlHubStore, type RuleCategory } from '@/stores/controlHubStore';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';
import { buildRuleGenerationPrompt, BUILT_IN_RULES } from '@/utils/brainstormPrompts';
import type { ChatMessage } from '@/types';

interface ControlHubProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'input' | 'preview' | 'list';

const CATEGORY_META: Record<RuleCategory, { label: string; icon: typeof Sprout; desc: string; placeholder: string }> = {
  seed: {
    label: '种子词规则',
    icon: Sprout,
    desc: '约束 AI 如何选择种子词和扩展词',
    placeholder: '例如：种子词应该是日常生活中能接触到的东西，不要生僻的专业术语...',
  },
  idea: {
    label: '点子生成规则',
    icon: Lightbulb,
    desc: '约束 AI 如何碰撞生成创意点子',
    placeholder: '例如：生成的灵感应该更具有现实意义，像那种无聊的冷笑话场景就算了...',
  },
};

export function ControlHub({ isOpen, onClose }: ControlHubProps) {
  const rules = useControlHubStore((s) => s.rules);
  const addRule = useControlHubStore((s) => s.addRule);
  const removeRule = useControlHubStore((s) => s.removeRule);
  const toggleRule = useControlHubStore((s) => s.toggleRule);

  const llmConfig = useRoundtableStore((s) => s.llmConfig);

  const [activeTab, setActiveTab] = useState<RuleCategory>('seed');
  const [inputText, setInputText] = useState('');
  const [generatedRule, setGeneratedRule] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<Step>('list');
  const [error, setError] = useState('');

  const categoryRules = rules.filter((r) => r.category === activeTab);
  const activeCount = rules.filter((r) => r.isActive).length;
  const activeSeedCount = rules.filter((r) => r.isActive && r.category === 'seed').length;
  const activeIdeaCount = rules.filter((r) => r.isActive && r.category === 'idea').length;
  const meta = CATEGORY_META[activeTab];
  const TabIcon = meta.icon;

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() || !llmConfig) return;
    setIsGenerating(true);
    setError('');
    try {
      const messages: ChatMessage[] = buildRuleGenerationPrompt(inputText.trim());
      let fullText = '';
      for await (const token of streamChat(messages, { ...llmConfig }, { temperature: 0.3, max_tokens: 200 })) {
        fullText += token;
      }
      const match = fullText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('parse');
      const parsed = JSON.parse(match[0]);
      if (!parsed?.rule) throw new Error('empty');
      setGeneratedRule(parsed.rule);
      setStep('preview');
    } catch {
      setError('规则生成失败，请重试或换个说法');
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, llmConfig]);

  const handleConfirm = useCallback(() => {
    if (!generatedRule || !inputText.trim()) return;
    addRule({
      category: activeTab,
      userRequirement: inputText.trim(),
      generatedRule,
      isActive: true,
    });
    setInputText('');
    setGeneratedRule('');
    setStep('list');
  }, [generatedRule, inputText, addRule, activeTab]);

  const handleReject = useCallback(() => {
    setGeneratedRule('');
    setStep('input');
  }, []);

  const handleStartNew = useCallback(() => {
    setInputText('');
    setGeneratedRule('');
    setError('');
    setStep('input');
  }, []);

  const handleTabChange = useCallback((tab: RuleCategory) => {
    setActiveTab(tab);
    setInputText('');
    setGeneratedRule('');
    setError('');
    setStep('list');
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {/* 面板 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-200/40 dark:border-green-700/40 w-[560px] max-w-[92vw] max-h-[82vh] flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-green-200/30 dark:border-green-700/30">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <Settings size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex-1">
                控制中枢
              </h2>
              {activeCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
                  {activeCount} 条规则生效中
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab 切换 */}
            <div className="flex gap-0 px-5 pt-3">
              {(['seed', 'idea'] as RuleCategory[]).map((cat) => {
                const m = CATEGORY_META[cat];
                const Icon = m.icon;
                const count = cat === 'seed' ? activeSeedCount : activeIdeaCount;
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleTabChange(cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-green-600 dark:text-green-400 border-green-500'
                        : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {m.label}
                    {count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 主体 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 内置规则展示 */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  内置{meta.label}
                </div>
                <div className="rounded-xl bg-gray-50/60 dark:bg-gray-700/20 border border-gray-200/40 dark:border-gray-600/30 px-3 py-2.5 space-y-1.5">
                  {BUILT_IN_RULES[activeTab].map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-gray-300 dark:text-gray-500 mt-px flex-shrink-0">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 新建规则区 */}
              {step === 'input' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {meta.desc}，告诉 AI 你的要求
                  </p>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={meta.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-700/80 border border-green-200/50 dark:border-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-gray-400 resize-none"
                  />
                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={!inputText.trim() || isGenerating || !llmConfig}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {isGenerating ? '提炼中...' : '提炼规则'}
                  </button>
                </div>
              )}

              {/* 预览确认区 */}
              {step === 'preview' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 mb-1">你的原始要求：</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    {inputText}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-green-500" />
                    AI 提炼的{meta.label}：
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50 rounded-lg px-3 py-2 font-medium">
                    {generatedRule}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <Check size={14} />
                      确认添加
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <X size={14} />
                      重新生成
                    </button>
                  </div>
                </div>
              )}

              {/* 当前类别规则列表 */}
              {categoryRules.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    自定义{meta.label}
                  </div>
                  {categoryRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`rounded-xl px-3 py-2.5 border transition-colors ${
                        rule.isActive
                          ? 'bg-green-50/60 dark:bg-green-900/15 border-green-200/50 dark:border-green-700/50'
                          : 'bg-gray-50/40 dark:bg-gray-700/20 border-gray-200/30 dark:border-gray-600/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className="mt-0.5 flex-shrink-0"
                          title={rule.isActive ? '已启用' : '已禁用'}
                        >
                          {rule.isActive ? (
                            <ToggleRight size={18} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={18} className="text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                            {rule.generatedRule}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            原始要求：{rule.userRequirement}
                          </div>
                        </div>
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="flex-shrink-0 p-1 rounded hover:bg-red-100/50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                          title="删除规则"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 空状态 */}
              {step === 'list' && categoryRules.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <TabIcon size={32} className="mb-2 opacity-25" />
                  <p className="text-sm">还没有自定义{meta.label}</p>
                  <p className="text-xs mt-1">添加规则来引导{activeTab === 'seed' ? '种子词选择' : '创意生成'}方向</p>
                </div>
              )}
            </div>

            {/* 底部操作栏 */}
            <div className="px-5 py-3 border-t border-green-200/30 dark:border-green-700/30 flex justify-between items-center">
              {step !== 'input' ? (
                <button
                  onClick={handleStartNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50/60 dark:hover:bg-green-900/20 transition-colors"
                >
                  <Sparkles size={14} />
                  添加{meta.label}
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
