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
let isInitializing = false;  // 标记是否正在初始化，防止 onAuthStateChange 冲突

// ============================================================
// 辅助函数
// ============================================================

async function loadProfile(userId: string, userEmail?: string): Promise<UserProfile | null> {
  try {
    console.log('📋 loadProfile 开始:', userId, 'email:', userEmail);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('📋 loadProfile 查询结果:', error.code, error.message);
      if (error.code === 'PGRST116') {
        // PGRST116 = 没有记录找到，尝试创建新 profile
        const email = userEmail || authState.user?.email;
        console.log('📋 创建新 profile:', { id: userId, email });
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email } as any)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ 创建 profile 失败:', insertError);
          return null;
        }
        console.log('✅ 创建 profile 成功:', newProfile);
        return newProfile ?? null;
      }
      console.error('❌ 加载 profile 失败:', error);
      return null;
    }
    console.log('✅ loadProfile 成功:', data);
    return data;
  } catch (error) {
    console.error('❌ 加载用户资料失败:', error);
    return null;
  }
}

async function handleLogin(userId: string, shouldSync: boolean = false) {
  console.log('🔑 handleLogin 开始:', userId, 'shouldSync:', shouldSync);
  console.log('   当前状态 - lastUserId:', authState.lastUserId, 'profile:', authState.profile ? '存在' : 'null');
  
  // 防止重复处理同一个用户
  // 注意：只有在 shouldSync=false 且已有 profile 时才跳过
  // 刷新页面时 shouldSync=false 但 profile 为 null，所以会正常加载
  if (authState.lastUserId === userId && !shouldSync && authState.profile) {
    console.log('👤 用户已处理过且已有 profile，跳过重复处理');
    return;
  }
  
  // 如果已经有 profile 且用户相同，也不重复加载（除非是强制同步）
  if (authState.profile?.id === userId && !shouldSync) {
    console.log('👤 当前已有该用户的 profile，跳过加载');
    return;
  }

  // 切换到该用户
  console.log('🔄 切换用户...');
  await switchUser(userId);

  // 迁移游客数据（如果有）
  console.log('🔄 迁移游客数据...');
  migrateGuestDataToUser(userId);

  // 设置当前用户ID
  console.log('🔄 设置当前用户ID...');
  setCurrentUserId(userId);

  // 加载用户资料（每次都要加载，确保刷新页面后能恢复）
  // 从 authState 获取 email，因为此时 user 可能还未设置
  const userEmail = authState.user?.email;
  console.log('📋 加载用户资料:', userId, 'email:', userEmail);
  const profile = await loadProfile(userId, userEmail);
  if (profile) {
    console.log('✅ 用户资料加载成功:', profile.username || profile.email);
  } else {
    console.warn('⚠️ 用户资料加载失败或不存在');
  }
  
  // 一次性更新所有状态（避免多次渲染）
  setAuthState({ profile, lastUserId: userId });
  console.log('✅ handleLogin 完成，状态已更新');

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
  const currentUserId = getCurrentUserId();
  console.log('🚪 handleLogout 开始，当前用户:', currentUserId);

  // 1. 触发登出事件（让其他组件有机会保存数据）
  window.dispatchEvent(new CustomEvent('user-logging-out'));

  // 2. 同步数据到云端（非阻塞，在后台执行）
  // 使用 Promise.race 设置超时，避免阻塞登出流程
  if (currentUserId) {
    const syncPromise = (async () => {
      try {
        const { syncLocalDataToCloud } = await import('@/utils/userStorage');
        await syncLocalDataToCloud(currentUserId);
        console.log('✅ 登出前数据同步完成');
      } catch (error) {
        console.warn('⚠️ 登出时同步数据失败（可忽略）:', error);
      }
    })();

    // 最多等待 2 秒，超时则放弃同步
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('同步超时')), 2000)
    );

    try {
      await Promise.race([syncPromise, timeoutPromise]);
    } catch (e) {
      console.log('⏱️ 同步超时或失败，继续登出流程');
    }
  }

  // 3. 清除本地状态（无论同步是否成功都要执行）
  console.log('🧹 清除本地状态...');
  clearCurrentUserId();
  await switchUser(null);

  // 4. 重置认证状态
  setAuthState({
    user: null,
    session: null,
    profile: null,
    loading: false,
    lastUserId: null,
  });
  console.log('✅ 认证状态已重置');

  // 5. 重置 Zustand store 并清除 localStorage
  try {
    const { useAppStore } = await import('@/stores/appStore');
    useAppStore.getState().resetAll();
    console.log('✅ Store 已重置');
  } catch (e) {
    console.warn('⚠️ 重置 store 失败:', e);
  }

  // 6. 触发登出完成事件
  window.dispatchEvent(new CustomEvent('user-logged-out'));
  window.dispatchEvent(new CustomEvent('user-data-changed'));

  console.log('✅ handleLogout 完成');
}

// ============================================================
// 全局初始化（只执行一次）
// ============================================================

async function ensureAuthInitialized() {
  console.log('🔐 ensureAuthInitialized 被调用, hasAuthInitialized:', hasAuthInitialized);
  
  if (hasAuthInitialized) {
    console.log('🔐 已经初始化过，跳过');
    return;
  }

  if (authInitializePromise) {
    console.log('🔐 初始化正在进行中，等待...');
    await authInitializePromise;
    return;
  }

  authInitializePromise = (async () => {
    isInitializing = true;  // 标记开始初始化
    try {
      console.log('🔐 开始初始化认证...');
      console.log('   初始状态:', { 
        user: authState.user?.id, 
        profile: authState.profile ? '有' : '无',
        lastUserId: authState.lastUserId 
      });
      
      // 获取当前存储的用户ID（用于验证会话一致性）
      const storedUserId = getCurrentUserId();
      console.log('   storedUserId:', storedUserId);
      
      let session = null;
      let sessionError = null;

      try {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        sessionError = result.error;
      } catch (e) {
        sessionError = e;
      }

      // 处理 Navigator Lock 错误
      if ((sessionError as any)?.message?.includes('NavigatorLockAcquireTimeoutError')) {
        console.warn('⚠️ 遇到 Navigator Lock 错误，等待后重试...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryResult = await supabase.auth.getSession();
          session = retryResult.data.session;
          sessionError = retryResult.error;
        } catch (e) {
          sessionError = e;
        }
      }

      // 会话验证成功
      if (session?.user) {
        const userId = session.user.id;
        
        // 验证会话用户ID与存储的用户ID是否一致
        if (storedUserId && storedUserId !== userId) {
          console.warn('⚠️ 会话用户ID与存储不一致，清理本地状态');
          clearCurrentUserId();
        }
        
        console.log('✅ 用户已登录:', session.user.email);
        setAuthState({
          session,
          user: session.user,
          loading: false,
        });
        
        // 等待 handleLogin 完成（包括加载 profile）
        await handleLogin(userId);
        console.log('✅ 用户登录处理完成');
      } else {
        // 无有效会话，进入游客模式
        console.log('👤 无有效会话，进入游客模式');
        
        // 如果之前有登录用户但会话失效，清理相关状态
        if (storedUserId) {
          console.log('🧹 清理过期的登录状态');
          clearCurrentUserId();
        }
        
        // 切换到游客模式
        await switchUser(null);
        
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
        });
      }

      hasAuthInitialized = true;
      isInitializing = false;  // 标记初始化完成
    } catch (error) {
      console.error('❌ 初始化认证失败:', error);
      // 出错时默认进入游客模式
      clearCurrentUserId();
      await switchUser(null);
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
      });
    } finally {
      setAuthState({ loading: false });
      authInitializePromise = null;
      isInitializing = false;  // 确保无论如何都重置标记
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
      console.log('🔐 认证状态变化:', event, 'isInitializing:', isInitializing);
    }

    if (event === 'SIGNED_IN' && session?.user) {
      const userId = session.user.id;
      
      // 如果正在初始化中，跳过（让 ensureAuthInitialized 处理）
      if (isInitializing) {
        console.log('⏳ 正在初始化中，跳过 SIGNED_IN 事件处理');
        return;
      }
      
      // 更新基本状态
      setAuthState({ session, user: session.user, loading: false });
      
      // 总是重新加载 profile，确保数据最新
      if (authState.lastUserId !== userId || !authState.profile) {
        console.log('🔄 处理 SIGNED_IN 事件，加载用户数据');
        await handleLogin(userId, true);
      }
    } else if (event === 'SIGNED_OUT') {
      // 如果正在初始化中，跳过
      if (isInitializing) {
        console.log('⏳ 正在初始化中，跳过 SIGNED_OUT 事件处理');
        return;
      }
      await handleLogout();
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
      console.log('🚪 开始登出流程...');
      
      // 1. 先执行本地登出逻辑（同步数据 + 清理状态）
      // 这样即使 supabase.signOut() 失败，本地状态也已清理
      await handleLogout();
      console.log('✅ 本地登出逻辑完成');

      // 2. 然后调用 Supabase 登出（清除服务器端会话）
      // 使用 scope: 'local' 只清除本地会话，避免网络问题导致登出失败
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) {
          console.warn('⚠️ Supabase 登出警告（可忽略）:', error.message);
        } else {
          console.log('✅ Supabase 登出成功');
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 登出失败（可忽略）:', supabaseError);
      }

      toast.success('已安全退出登录', { autoClose: 2000 });
      
      // 3. 延迟刷新页面，确保状态完全清理并重新初始化 store
      // 这是必要的，因为 Zustand persist 使用固定的存储键，需要重新加载才能切换
      setTimeout(() => {
        console.log('🔄 刷新页面以重新初始化...');
        window.location.reload();
      }, 500);
      
      return { success: true };
    } catch (error) {
      console.error('❌ 登出失败:', error);
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
