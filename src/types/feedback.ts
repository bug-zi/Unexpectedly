/**
 * 用户反馈类型定义
 */

export interface FeedbackFormData {
  content: string;
  contactEmail?: string;
}

export interface FeedbackSubmitResult {
  success: boolean;
  error?: string;
}
