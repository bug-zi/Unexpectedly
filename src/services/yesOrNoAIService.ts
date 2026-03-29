/**
 * Yes Or No 游戏的AI判断服务
 * 使用OpenAI API进行智能判断
 */

import { supabase } from '@/lib/supabase';

export interface AIJudgmentResult {
  answer: 'yes' | 'no';
  confidence: number;
  reason: string;
}

/**
 * 使用AI判断Yes/No问题
 * @param question 用户的问题
 * @param targetWord AI心中的答案词
 * @param category 答案所属类别
 * @returns AI的判断结果
 */
export async function judgeYesNoQuestionWithAI(
  question: string,
  targetWord: string,
  category: string
): Promise<AIJudgmentResult> {
  try {
    // 调用Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('yesorno-ai-judge', {
      body: {
        question,
        targetWord,
        category
      }
    });

    if (error) {
      console.error('AI判断失败:', error);
      // 如果AI失败，回退到规则判断
      return fallbackToRuleBasedJudgment(question, targetWord, category);
    }

    return data as AIJudgmentResult;
  } catch (error) {
    console.error('AI判断服务异常:', error);
    // 如果AI服务异常，回退到规则判断
    return fallbackToRuleBasedJudgment(question, targetWord, category);
  }
}

/**
 * 回退到规则判断（当AI服务不可用时）
 */
function fallbackToRuleBasedJudgment(
  question: string,
  targetWord: string,
  category: string
): AIJudgmentResult {
  // 这里使用原来的规则逻辑作为后备
  const { analyzeYesNoQuestion } = require('@/constants/yesOrNoWords');
  return analyzeYesNoQuestion(question, targetWord, category);
}

/**
 * 检查AI判断服务是否可用
 */
export async function checkAIServiceAvailable(): Promise<boolean> {
  try {
    // 发送一个简单的测试请求
    const { data, error } = await supabase.functions.invoke('yesorno-ai-judge', {
      body: {
        question: '测试',
        targetWord: '测试',
        category: '测试'
      },
      timeout: 5000 // 5秒超时
    });

    return !error;
  } catch {
    return false;
  }
}
