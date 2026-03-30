/**
 * 认证相关的 Hook
 * 提供完整的用户认证、数据隔离和同步功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

// 全局初始化锁，确保整个应用只有一个认证初始化在运行
let authInitializePromise: Promise<void> | null = null;
let isAuthInitializing = false;
let hasAuthInitialized = false; // 标记是否已经初始化过

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUserId, setLastUserId] = useState<string | null>(null); // 追踪上次登录的用户

  /**
   * 加载用户资料
   */
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 如果资料不存在，创建默认资料
        if (error.code === 'PGRST116') {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email,
            })
            .select()
            .single();

          if (newProfile) {
            setProfile(newProfile);
          }
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  }, [user]);

  /**
   * 登录后的初始化
   */
  const handleLogin = useCallback(async (userId: string, shouldSync: boolean = false) => {
    // 防止重复处理同一个用户
    if (lastUserId === userId && !shouldSync) {
      return;
    }

    // 切换到该用户
    await switchUser(userId);

    // 迁移游客数据（如果有）
    migrateGuestDataToUser(userId);

    // 设置当前用户ID
    setCurrentUserId(userId);

    // 加载用户资料
    await loadProfile(userId);

    // 从云端加载数据（如果本地没有数据）
    try {
      const { loadCloudDataToLocal } = await import('@/utils/userStorage');
      const { getLocalDataStats } = await import('@/services/syncService');
      const localStats = getLocalDataStats();

      // 如果本地没有数据，从云端加载
      if (localStats.count === 0) {
        console.log('📥 本地无数据，从云端加载...');
        await loadCloudDataToLocal(userId);
      }
    } catch (error) {
      console.warn('⚠️ 从云端加载数据失败（可忽略）:', error);
    }

    // 更新上次登录的用户ID
    setLastUserId(userId);

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
      // 这里可以触发全局的同步事件和数据刷新事件
      window.dispatchEvent(new CustomEvent('user-logged-in'));
      window.dispatchEvent(new CustomEvent('user-data-changed'));
    }, 100);
  }, [loadProfile, lastUserId]);

  /**
   * 登出前的清理
   */
  const handleLogout = useCallback(async () => {
    try {
      // 1. 获取当前用户ID（在清除之前）
      const currentUserId = getCurrentUserId();

      // 2. 先清除当前用户ID（防止重新登录）
      clearCurrentUserId();

      // 3. 自动同步数据到云端（传入用户ID，避免依赖getCurrentUserId）
      if (currentUserId) {
        try {
          const { syncLocalDataToCloud, clearCurrentLocalData } = await import('@/utils/userStorage');
          await syncLocalDataToCloud(currentUserId);

          // 清空本地数据（传入用户ID，确保使用正确的前缀）
          clearCurrentLocalData(currentUserId);
        } catch (error) {
          console.warn('⚠️ 同步数据时出错（可忽略）:', error);
        }
      }

      // 4. 清空用户状态
      setUser(null);
      setSession(null);
      setProfile(null);
      setLastUserId(null); // 清除上次登录的用户ID

      // 5. 触发登出事件和数据刷新事件
      window.dispatchEvent(new CustomEvent('user-logged-out'));
      window.dispatchEvent(new CustomEvent('user-data-changed'));
    } catch (error) {
      console.error('登出时同步数据失败:', error);
      // 即使同步失败，也继续登出流程
      clearCurrentUserId();
      setUser(null);
      setSession(null);
      setProfile(null);
      setLastUserId(null); // 清除上次登录的用户ID
      window.dispatchEvent(new CustomEvent('user-logged-out'));
      window.dispatchEvent(new CustomEvent('user-data-changed'));
    }
  }, []);

  // 初始化：获取当前会话
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // 如果已经初始化过，为新组件实例同步当前 session
      if (hasAuthInitialized) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setSession(session);
            setUser(session.user);
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (data) setProfile(data);
          }
        } catch (e) {
          console.warn('同步已有 session 失败:', e);
        }
        setLoading(false);
        return;
      }

      // 检查是否已经在初始化中，如果是则等待
      if (authInitializePromise) {
        console.log('⏳ 认证初始化已在进行中，等待完成...');
        try {
          await authInitializePromise;
        } catch (error) {
          console.error('等待认证初始化失败:', error);
        }
        return;
      }

      // 标记正在初始化
      isAuthInitializing = true;

      // 创建新的初始化 Promise
      authInitializePromise = (async () => {
        try {
          // 添加延迟，避免多个组件同时初始化
          await new Promise(resolve => setTimeout(resolve, 100));

          // 只在真正执行初始化时打印日志
          console.log('🔐 开始初始化认证...');
          const { data: { session }, error } = await supabase.auth.getSession();

          if (!mounted) return;

          if (error) {
            // 如果是 Navigator Lock 错误，尝试重试一次
            if (error.message?.includes('NavigatorLockAcquireTimeoutError')) {
              console.warn('⚠️ 遇到 Navigator Lock 错误，等待后重试...');
              await new Promise(resolve => setTimeout(resolve, 1000));

              const retryResult = await supabase.auth.getSession();
              if (retryResult.error) {
                throw retryResult.error;
              }

              if (retryResult.data.session?.user && mounted) {
                setSession(retryResult.data.session);
                setUser(retryResult.data.session.user);
                await handleLogin(retryResult.data.session.user.id);
              }
            } else {
              throw error;
            }
          } else if (session?.user && mounted) {
            console.log('✅ 用户已登录:', session.user.email);
            setSession(session);
            setUser(session.user);
            await handleLogin(session.user.id);
          } else {
            // 游客模式
            const userId = getCurrentUserId();
            if (!userId) {
              console.log('👤 游客模式');
              switchUser(null);
            }
          }

          // 标记初始化完成
          hasAuthInitialized = true;
        } catch (error) {
          console.error('❌ 初始化认证失败:', error);
          // 不要抛出错误，允许应用以游客模式运行
        } finally {
          if (mounted) {
            setLoading(false);
          }
          // 清除初始化 Promise 和标志
          authInitializePromise = null;
          isAuthInitializing = false;
        }
      })();

      try {
        await authInitializePromise;
      } catch (error) {
        console.error('认证初始化失败:', error);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [handleLogin]);

  // 监听认证状态变化
  const hasSubscribed = useRef(false);

  useEffect(() => {
    // 使用 ref 避免重复订阅
    const subscriptionRef = { current: null };

    if (!hasSubscribed.current) {
      hasSubscribed.current = true;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // 减少日志输出，只记录重要事件
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🔐 认证状态变化:', event);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);

          // 只在新用户登录时触发完整流程
          if (lastUserId !== session.user.id) {
            await handleLogin(session.user.id, true);
            toast.success('🎉 登录成功！', { autoClose: 800 });
          }
        } else if (event === 'SIGNED_OUT') {
          handleLogout();
          toast.success('已退出登录', { autoClose: 800 });
          // 重置初始化标志，允许下次登录时重新初始化
          hasAuthInitialized = false;
        } else if (event === 'USER_UPDATED' && session?.user) {
          setSession(session);
          setUser(session.user);
          await loadProfile(session.user.id);
        }
      });

      subscriptionRef.current = subscription;
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        hasSubscribed.current = false;
      }
    };
  }, [handleLogin, handleLogout, loadProfile, lastUserId]);

  /**
   * 登出
   */
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. 获取当前用户ID（在清除之前）
      const currentUserId = getCurrentUserId();

      // 2. 先自动同步数据到云端（传入用户ID）
      if (currentUserId) {
        await autoSyncOnLogout(currentUserId);
      }

      // 3. 调用 Supabase 登出
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // 4. 执行清理操作
      await handleLogout();

      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      const errorMessage = error instanceof AuthError ? error.message : '登出失败';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [handleLogout]);

  /**
   * 更新用户资料
   */
  const updateProfile = useCallback(async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string; data?: UserProfile }> => {
    if (!user) {
      return { success: false, error: '未登录' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('资料已更新', { autoClose: 2000 });

      return { success: true, data };
    } catch (error) {
      console.error('更新资料失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  /**
   * 上传头像
   */
  const uploadAvatar = useCallback(async (
    file: File
  ): Promise<{ success: boolean; error?: string; url?: string }> => {
    if (!user) {
      return { success: false, error: '未登录' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('🔍 开始上传头像流程:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id
      });

      // 检查 bucket 是否存在
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ 获取 bucket 列表失败:', bucketsError);
        return { success: false, error: '无法连接到存储服务，请检查网络连接' };
      }

      console.log('✅ 成功获取 bucket 列表:', buckets.map(b => b.id));

      const avatarsBucket = buckets?.find(b => b.id === 'avatars');
      if (!avatarsBucket) {
        console.error('❌ avatars bucket 不存在');
        return {
          success: false,
          error: '存储服务未配置。请在 Supabase Dashboard 中打开 SQL Editor，执行 supabase/migrations/002_create_avatars_bucket.sql 文件中的 SQL 语句。'
        };
      }

      console.log('✅ avatars bucket 存在，准备上传文件');

      // 先删除用户的旧头像（如果存在）
      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
          const oldFilePaths = existingFiles.map(f => `${user.id}/${f.name}`);
          console.log('🗑️ 删除旧头像:', oldFilePaths);
          await supabase.storage.from('avatars').remove(oldFilePaths);
        }
      } catch (error) {
        console.warn('⚠️ 删除旧头像时出错（可以忽略）:', error);
      }

      // 上传文件到 Supabase Storage
      console.log('📤 正在上传文件到 Supabase Storage...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,  // 改为 true，允许覆盖
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ 上传失败:', uploadError);
        return {
          success: false,
          error: `上传失败: ${uploadError.message}。错误代码: ${uploadError.code || 'UNKNOWN'}`
        };
      }

      console.log('✅ 文件上传成功:', uploadData);

      // 获取公共URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log('✅ 上传成功，公共 URL:', publicUrl);

      // 更新用户资料
      console.log('💾 正在更新用户资料...');
      const result = await updateProfile({ avatar_url: publicUrl });

      if (result.success) {
        console.log('✅ 头像上传并更新成功！');
        return { success: true, url: publicUrl };
      } else {
        // 如果更新资料失败，删除已上传的文件
        console.error('❌ 更新资料失败，删除已上传的文件');
        await supabase.storage.from('avatars').remove([filePath]);
        return { success: false, error: result.error || '更新资料失败' };
      }
    } catch (error) {
      console.error('❌ 上传头像异常:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('错误详情:', error);
      return { success: false, error: `上传失败: ${errorMessage}` };
    }
  }, [user, updateProfile]);

  return {
    // 状态
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isGuest: !user,

    // 方法
    signOut,
    updateProfile,
    uploadAvatar,
  };
}
