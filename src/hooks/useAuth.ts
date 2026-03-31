/**
 * 认证相关的 Hook
 * 提供完整的用户认证、数据隔离和同步功能
 *
 * 架构：使用模块级共享状态 + useSyncExternalStore
 * 确保所有调用 useAuth() 的组件共享同一份认证状态
 */

import { useSyncExternalStore, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUserId,
  switchUser,
  migrateGuestDataToUser,
} from '@/utils/userStorage';
import { autoSyncOnLogout } from '@/services/syncService';
import { toast } from 'react-toastify';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  gender?: string;
  age?: number;
  birthday?: string;
}

// ============================================================
// 模块级共享状态 — 所有组件实例共享同一份数据
// ============================================================

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  lastUserId: string | null;
}

let authState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  lastUserId: null,
};

// 监听器集合：组件通过 subscribe 注册，状态变化时通知所有组件重渲染
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => {
    try { fn(); } catch (e) { console.error('useAuth listener error:', e); }
  });
}

function getSnapshot(): AuthState {
  return authState;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 模块级 setter，更新共享状态并通知所有监听者
function setAuthState(partial: Partial<AuthState>) {
  authState = { ...authState, ...partial };
  emitChange();
}

// ============================================================
// 初始化锁 — 确保全局只执行一次认证初始化
// ============================================================

let authInitializePromise: Promise<void> | null = null;
let hasAuthInitialized = false;
let hasSubscribed = false;

// ============================================================
// 辅助函数
// ============================================================

async function loadProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const email = authState.user?.email;
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: userId, email } as any)
          .select()
          .single();
        return newProfile ?? null;
      }
      return null;
    }
    return data;
  } catch (error) {
    console.error('加载用户资料失败:', error);
    return null;
  }
}

async function handleLogin(userId: string, shouldSync: boolean = false) {
  // 防止重复处理同一个用户
  if (authState.lastUserId === userId && !shouldSync) {
    return;
  }

  // 切换到该用户
  await switchUser(userId);

  // 迁移游客数据（如果有）
  migrateGuestDataToUser(userId);

  // 设置当前用户ID
  setCurrentUserId(userId);

  // 加载用户资料
  const profile = await loadProfile(userId);
  setAuthState({ profile });

  // 从云端加载数据（如果本地没有数据）
  try {
    const { loadCloudDataToLocal } = await import('@/utils/userStorage');
    const { getLocalDataStats } = await import('@/services/syncService');
    const localStats = getLocalDataStats();

    if (localStats.count === 0) {
      console.log('📥 本地无数据，从云端加载...');
      await loadCloudDataToLocal(userId);
    }
  } catch (error) {
    console.warn('⚠️ 从云端加载数据失败（可忽略）:', error);
  }

  // 更新上次登录的用户ID
  setAuthState({ lastUserId: userId });

  // 在后台确保问题库已初始化（不阻塞主流程）
  setTimeout(async () => {
    try {
      const { ensureQuestionsInitialized } = await import('@/utils/questionsSync');
      await ensureQuestionsInitialized();
    } catch (error) {
      console.warn('⚠️ 问题库初始化失败（可忽略）:', error);
    }
  }, 2000);

  // 触发数据同步（在后台）
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('user-logged-in'));
    window.dispatchEvent(new CustomEvent('user-data-changed'));
  }, 100);
}

async function handleLogout() {
  try {
    const currentUserId = getCurrentUserId();
    clearCurrentUserId();

    if (currentUserId) {
      try {
        const { syncLocalDataToCloud, clearCurrentLocalData } = await import('@/utils/userStorage');
        await syncLocalDataToCloud(currentUserId);
        clearCurrentLocalData(currentUserId);
      } catch (error) {
        console.warn('⚠️ 同步数据时出错（可忽略）:', error);
      }
    }

    setAuthState({
      user: null,
      session: null,
      profile: null,
      lastUserId: null,
    });

    window.dispatchEvent(new CustomEvent('user-logged-out'));
    window.dispatchEvent(new CustomEvent('user-data-changed'));
  } catch (error) {
    console.error('登出时同步数据失败:', error);
    clearCurrentUserId();
    setAuthState({
      user: null,
      session: null,
      profile: null,
      lastUserId: null,
    });
    window.dispatchEvent(new CustomEvent('user-logged-out'));
    window.dispatchEvent(new CustomEvent('user-data-changed'));
  }
}

// ============================================================
// 全局初始化（只执行一次）
// ============================================================

async function ensureAuthInitialized() {
  if (hasAuthInitialized) return;

  if (authInitializePromise) {
    await authInitializePromise;
    return;
  }

  authInitializePromise = (async () => {
    try {
      console.log('🔐 开始初始化认证...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        if (error.message?.includes('NavigatorLockAcquireTimeoutError')) {
          console.warn('⚠️ 遇到 Navigator Lock 错误，等待后重试...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryResult = await supabase.auth.getSession();
          if (retryResult.error) throw retryResult.error;

          if (retryResult.data.session?.user) {
            const userId = retryResult.data.session.user.id;
            setAuthState({
              session: retryResult.data.session,
              user: retryResult.data.session.user,
              loading: false,
            });
            await handleLogin(userId);
          }
        } else {
          throw error;
        }
      } else if (session?.user) {
        console.log('✅ 用户已登录:', session.user.email);
        const userId = session.user.id;
        setAuthState({
          session,
          user: session.user,
          loading: false,
        });
        await handleLogin(userId);
      } else {
        const userId = getCurrentUserId();
        if (!userId) {
          console.log('👤 游客模式');
          switchUser(null);
        }
      }

      hasAuthInitialized = true;
    } catch (error) {
      console.error('❌ 初始化认证失败:', error);
    } finally {
      setAuthState({ loading: false });
      authInitializePromise = null;
    }
  })();

  await authInitializePromise;
}

// 全局订阅 Supabase 认证状态变化（只订阅一次）
function ensureAuthSubscription() {
  if (hasSubscribed) return;
  hasSubscribed = true;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      console.log('🔐 认证状态变化:', event);
    }

    if (event === 'SIGNED_IN' && session?.user) {
      const userId = session.user.id;
      setAuthState({ session, user: session.user, loading: false });

      if (authState.lastUserId !== userId) {
        await handleLogin(userId, true);
        toast.success('🎉 登录成功！', { autoClose: 800 });
      }
    } else if (event === 'SIGNED_OUT') {
      await handleLogout();
      toast.success('已退出登录', { autoClose: 800 });
      hasAuthInitialized = false;
    } else if (event === 'USER_UPDATED' && session?.user) {
      setAuthState({ session, user: session.user });
      const profile = await loadProfile(session.user.id);
      setAuthState({ profile });
    }
  });
}

// 首次导入时自动触发初始化和订阅
ensureAuthInitialized();
ensureAuthSubscription();

// ============================================================
// React Hook — 消费共享状态
// ============================================================

export function useAuth() {
  // useSyncExternalStore 保证所有组件读取同一个 snapshot
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        await autoSyncOnLogout(currentUserId);
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await handleLogout();
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      const errorMessage = error instanceof AuthError ? error.message : '登出失败';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProfile = useCallback(async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string; data?: UserProfile }> => {
    if (!authState.user) {
      return { success: false, error: '未登录' };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = supabase.from('profiles') as any;
      const { data, error } = await query
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState({ profile: data });
      toast.success('资料已更新', { autoClose: 2000 });
      return { success: true, data };
    } catch (error) {
      console.error('更新资料失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadAvatar = useCallback(async (
    file: File
  ): Promise<{ success: boolean; error?: string; url?: string }> => {
    if (!authState.user) {
      return { success: false, error: '未登录' };
    }

    const user = authState.user;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('🔍 开始上传头像流程:', {
        fileName, filePath, fileSize: file.size, fileType: file.type, userId: user.id
      });

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ 获取 bucket 列表失败:', bucketsError);
        return { success: false, error: '无法连接到存储服务，请检查网络连接' };
      }

      const avatarsBucket = buckets?.find(b => b.id === 'avatars');
      if (!avatarsBucket) {
        return {
          success: false,
          error: '存储服务未配置。请在 Supabase Dashboard 中打开 SQL Editor，执行 supabase/migrations/002_create_avatars_bucket.sql 文件中的 SQL 语句。'
        };
      }

      // 删除旧头像
      try {
        const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const oldFilePaths = existingFiles.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(oldFilePaths);
        }
      } catch (error) {
        console.warn('⚠️ 删除旧头像时出错（可以忽略）:', error);
      }

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        return { success: false, error: `上传失败: ${uploadError.message}` };
      }

      console.log('✅ 文件上传成功:', uploadData);

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const result = await updateProfile({ avatar_url: publicUrl });
      if (result.success) {
        return { success: true, url: publicUrl };
      } else {
        await supabase.storage.from('avatars').remove([filePath]);
        return { success: false, error: result.error || '更新资料失败' };
      }
    } catch (error) {
      console.error('❌ 上传头像异常:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return { success: false, error: `上传失败: ${errorMessage}` };
    }
  }, [updateProfile]);

  return {
    // 状态（来自共享 snapshot）
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: !!state.user,
    isGuest: !state.user,

    // 方法
    signOut,
    updateProfile,
    uploadAvatar,
  };
}
