/**
 * 用户反馈服务
 */

import { supabase } from '@/lib/supabase';
import type { FeedbackFormData, FeedbackSubmitResult } from '@/types/feedback';

const RATE_LIMIT_KEY = 'wwx-feedback-last-submit';
const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 分钟冷却

/**
 * 检查客户端限频
 */
export function checkRateLimit(): { allowed: boolean; remainingMinutes?: number } {
  const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastSubmit) return { allowed: true };

  const elapsed = Date.now() - parseInt(lastSubmit, 10);
  if (elapsed >= RATE_LIMIT_MS) return { allowed: true };

  const remainingMs = RATE_LIMIT_MS - elapsed;
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  return { allowed: false, remainingMinutes };
}

/**
 * 提交用户反馈
 */
export async function submitFeedback(data: FeedbackFormData): Promise<FeedbackSubmitResult> {
  // 限频检查
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `请稍后再试，还需等待约 ${rateLimit.remainingMinutes} 分钟`,
    };
  }

  // 内容校验
  const trimmed = data.content.trim();
  if (trimmed.length < 5) {
    return { success: false, error: '反馈内容至少需要 5 个字' };
  }
  if (trimmed.length > 2000) {
    return { success: false, error: '反馈内容不能超过 2000 字' };
  }

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      content: trimmed,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      contact_email: data.contactEmail?.trim() || null,
    });

    if (error) {
      console.error('提交反馈失败:', error);
      return { success: false, error: '提交失败，请稍后重试' };
    }

    // 记录提交时间
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

    return { success: true };
  } catch (err) {
    console.error('提交反馈异常:', err);
    return { success: false, error: '网络异常，请稍后重试' };
  }
}
