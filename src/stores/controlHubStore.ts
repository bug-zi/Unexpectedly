/**
 * 控制中枢 - 用户自定义规则持久化
 * 用户输入需求 → AI 生成普适性提示词规则 → 用户确认 → 注入 prompt
 * 规则分两类：seed（种子词/扩展词）和 idea（创意点子），互相独立
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RuleCategory = 'seed' | 'idea';

export interface ControlRule {
  id: string;
  /** 规则类别：seed=种子词/扩展词, idea=创意点子 */
  category: RuleCategory;
  /** 用户原始输入 */
  userRequirement: string;
  /** AI 生成的普适性规则 */
  generatedRule: string;
  /** 是否启用 */
  isActive: boolean;
  createdAt: number;
}

interface ControlHubState {
  rules: ControlRule[];

  addRule: (rule: Omit<ControlRule, 'id' | 'createdAt'>) => string;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  updateRule: (id: string, patch: Partial<Pick<ControlRule, 'generatedRule' | 'isActive'>>) => void;

  /** 按类别获取启用的规则文本，供 prompt 使用 */
  getActiveRulesText: (category: RuleCategory) => string;
}

let _ruleIdCounter = 0;

export const useControlHubStore = create<ControlHubState>()(
  persist(
    (set, get) => ({
      rules: [],

      addRule: (rule) => {
        const id = `rule_${Date.now()}_${++_ruleIdCounter}`;
        const newRule: ControlRule = {
          ...rule,
          id,
          createdAt: Date.now(),
        };
        set((s) => ({ rules: [...s.rules, newRule] }));
        return id;
      },

      removeRule: (id) =>
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

      toggleRule: (id) =>
        set((s) => ({
          rules: s.rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
        })),

      updateRule: (id, patch) =>
        set((s) => ({
          rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      getActiveRulesText: (category) => {
        const activeRules = get().rules.filter((r) => r.isActive && r.category === category);
        if (activeRules.length === 0) return '';
        return activeRules.map((r, i) => `${i + 1}. ${r.generatedRule}`).join('\n');
      },
    }),
    {
      name: 'control-hub-storage',
    }
  )
);
