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
 * 修复版：支持自动登录和邮箱确认两种情况
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    console.log('📧 开始注册流程...', { email, fullName });

    // 1. 注册用户 - 尝试自动登录（如果 Supabase 配置允许）
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        // 不设置 emailRedirectTo，让 Supabase 使用默认行为
      },
    });

    if (error) {
      console.error('❌ 注册失败:', error);
      
      // 处理特定错误类型
      if (error.message?.includes('already registered') || error.message?.includes('已存在')) {
        return {
          success: false,
          error: '该邮箱已注册，请直接登录',
        };
      }
      
      if (error.message?.includes('weak password') || error.message?.includes('密码')) {
        return {
          success: false,
          error: '密码强度不足，请使用至少6位字符',
        };
      }
      
      throw error;
    }

    console.log('✅ 注册请求成功', data);

    // 2. 如果注册成功且有会话（自动登录成功）
    // 注意：profile 会通过数据库触发器自动创建，不需要手动创建
    if (data.session && data.user) {
      console.log('✅ 自动登录成功');
      return { success: true, data };
    }

    // 3. 如果注册成功但没有会话（需要邮箱确认）
    if (data.user && !data.session) {
      console.log('✅ 注册成功，需要邮箱确认');
      
      // 尝试直接登录（某些 Supabase 配置允许未确认邮箱登录）
      try {
        console.log('🔄 尝试自动登录...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.session) {
          console.log('✅ 自动登录成功');
          return { success: true, data: signInData };
        }
      } catch (signInErr) {
        console.log('⚠️ 自动登录失败，需要邮箱确认');
      }

      // 返回需要邮箱确认的信息，但标记为成功（用户可以在邮件中确认）
      return {
        success: true,
        data: {
          ...data,
          needsEmailConfirmation: true,
        },
      };
    }

    // 4. 其他情况
    console.warn('⚠️ 未知状态:', data);
    return {
      success: false,
      error: '注册状态异常，请稍后重试',
    };

  } catch (error) {
    console.error('❌ 注册失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败，请检查网络连接后重试',
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
