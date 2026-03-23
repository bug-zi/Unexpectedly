/**
 * 认证服务
 * 提供登录、注册、登出等功能
 */

import { supabase } from '@/lib/supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 邮箱密码登录
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败',
    };
  }
}

/**
 * 邮箱密码注册
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败',
    };
  }
}

/**
 * GitHub OAuth 登录
 */
export async function signInWithGitHub(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('GitHub 登录失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GitHub 登录失败',
    };
  }
}

/**
 * 登出
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('登出失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '登出失败',
    };
  }
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('密码重置失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '密码重置失败',
    };
  }
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('密码更新失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '密码更新失败',
    };
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, data: user };
  } catch (error) {
    console.error('获取用户失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户失败',
    };
  }
}
