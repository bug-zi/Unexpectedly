/**
 * useFavorites Hook
 * 管理问题收藏功能
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';
import { FavoriteItem, FavoriteFilters, FavoriteStats } from '@/types/collections';

export function useFavorites(filters?: FavoriteFilters) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取收藏列表
   */
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        return;
      }

      let query = supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // 应用筛选条件
      if (filters?.isAnswered !== undefined) {
        query = query.eq('is_answered', filters.isAnswered);
      }
      if (filters?.collectionId) {
        query = query.eq('collection_id', filters.collectionId);
      }
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc'
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Supabase自动将snake_case转换为camelCase
      // 但需要正确映射字段
      const mappedData = data?.map(item => ({
        id: item.id,
        questionId: item.question_id,  // 手动映射
        userId: item.user_id,
        collectionId: item.collection_id,
        notes: item.notes,
        tags: item.tags,
        isAnswered: item.is_answered,
        sortOrder: item.sort_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [];

      setFavorites(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载收藏失败';
      setError(message);
      console.error('获取收藏失败:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 自动加载收藏列表
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        fetchFavorites();
      }, 100);
    };

    window.addEventListener('user-data-changed', handleDataChange);
    window.addEventListener('user-logged-out', handleDataChange);
    window.addEventListener('user-logged-in', handleDataChange);

    return () => {
      window.removeEventListener('user-data-changed', handleDataChange);
      window.removeEventListener('user-logged-out', handleDataChange);
      window.removeEventListener('user-logged-in', handleDataChange);
    };
  }, [fetchFavorites]);

  /**
   * 添加收藏
   */
  const addFavorite = useCallback(async (
    questionId: string,
    options?: {
      collectionId?: string;
      notes?: string;
      tags?: string[];
    }
  ): Promise<FavoriteItem | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      // 检查是否已收藏（使用函数式更新避免闭包问题）
      let existingItem: any = null;
      setFavorites(prev => {
        const existing = prev.find(f => f.questionId === questionId);
        if (existing) {
          existingItem = existing;
        }
        return prev;
      });

      if (existingItem) {
        toast.info('已在收藏中', { autoClose: 1500 });
        return existingItem;
      }

      const insertData = {
        user_id: user.id,
        question_id: questionId,
        collection_id: options?.collectionId || null,
        notes: options?.notes || null,
        tags: options?.tags || [],
        is_answered: false,
      };

      const { data, error } = await supabase
        .from('favorites')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        // 唯一约束冲突，说明已收藏
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('question_id', questionId)
            .single();

          if (existing) {
            // 映射 snake_case 到 camelCase
            const mappedData = {
              id: existing.id,
              questionId: existing.question_id,
              userId: existing.user_id,
              collectionId: existing.collection_id,
              notes: existing.notes,
              tags: existing.tags,
              isAnswered: existing.is_answered,
              sortOrder: existing.sort_order,
              createdAt: existing.created_at,
              updatedAt: existing.updated_at,
            };
            setFavorites(prev => [mappedData, ...prev]);
            return mappedData;
          }
        }
        throw error;
      }

      if (data) {
        // 映射 snake_case 到 camelCase
        const mappedData = {
          id: data.id,
          questionId: data.question_id,
          userId: data.user_id,
          collectionId: data.collection_id,
          notes: data.notes,
          tags: data.tags,
          isAnswered: data.is_answered,
          sortOrder: data.sort_order,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setFavorites(prev => [mappedData, ...prev]);
        return mappedData;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : '收藏失败';
      toast.error(message, { autoClose: 1500 });
      console.error('添加收藏失败:', err);
      return null;
    }
  }, []);

  /**
   * 移除收藏
   */
  const removeFavorite = useCallback(async (questionId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.questionId !== questionId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '取消收藏失败';
      toast.error(message, { autoClose: 1500 });
      console.error('移除收藏失败:', err);
      return false;
    }
  }, []);

  /**
   * 检查是否已收藏
   */
  const isFavorited = useCallback((questionId: string): boolean => {
    return favorites.some(f => f.questionId === questionId);
  }, [favorites]);

  /**
   * 获取收藏详情
   */
  const getFavorite = useCallback((questionId: string): FavoriteItem | undefined => {
    return favorites.find(f => f.questionId === questionId);
  }, [favorites]);

  /**
   * 更新收藏备注
   */
  const updateFavoriteNotes = useCallback(async (
    questionId: string,
    notes: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('favorites')
        .update({ notes } as any) // Type cast for Supabase type inference
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setFavorites(prev =>
        prev.map(f =>
          f.questionId === questionId ? { ...f, notes } : f
        )
      );

      toast.success('备注已更新', { autoClose: 1500 });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新失败';
      toast.error(message, { autoClose: 1500 });
      console.error('更新备注失败:', err);
      return false;
    }
  }, []);

  /**
   * 移动到指定集合
   */
  const moveToCollection = useCallback(async (
    questionId: string,
    collectionId: string | null
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('favorites')
        .update({ collection_id: collectionId } as any) // Type cast for Supabase type inference
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setFavorites(prev =>
        prev.map(f =>
          f.questionId === questionId ? { ...f, collectionId } : f
        )
      );

      toast.success(collectionId ? '已移动到集合' : '已从集合中移出', { autoClose: 1500 });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '移动失败';
      toast.error(message, { autoClose: 1500 });
      console.error('移动收藏失败:', err);
      return false;
    }
  }, []);

  /**
   * 标记为已回答
   */
  const markAsAnswered = useCallback(async (
    questionId: string,
    answered: boolean = true
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('favorites')
        .update({ is_answered: answered } as any) // Type cast for Supabase type inference
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setFavorites(prev =>
        prev.map(f =>
          f.questionId === questionId ? { ...f, isAnswered: answered } : f
        )
      );

      return true;
    } catch (err) {
      console.error('标记回答状态失败:', err);
      return false;
    }
  }, []);

  /**
   * 获取收藏统计
   */
  const getStats = useCallback((): FavoriteStats => {
    return {
      totalFavorites: favorites.length,
      answeredFavorites: favorites.filter(f => f.isAnswered).length,
      pendingFavorites: favorites.filter(f => !f.isAnswered).length,
      collectionsCount: new Set(
        favorites.map(f => f.collectionId).filter(Boolean) as string[]
      ).size,
    };
  }, [favorites]);

  return {
    favorites,
    loading,
    error,
    stats: getStats(),
    addFavorite,
    removeFavorite,
    isFavorited,
    getFavorite,
    updateFavoriteNotes,
    moveToCollection,
    markAsAnswered,
    refetch: fetchFavorites,
  };
}
