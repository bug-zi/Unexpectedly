/**
 * useCollections Hook
 * 管理主题集合功能
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';
import {
  Collection,
  CreateCollectionFormData,
  UpdateCollectionFormData,
  CollectionFilters,
} from '@/types/collections';

export function useCollections(filters?: CollectionFilters) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取集合列表
   */
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCollections([]);
        return;
      }

      let query = supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // 应用筛选条件
      if (filters?.status === 'active') {
        query = query.gt('progress', 0).lt('progress', 100);
      } else if (filters?.status === 'completed') {
        query = query.eq('progress', 100);
      } else if (filters?.status === 'not_started') {
        query = query.eq('progress', 0);
      }

      if (filters?.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc'
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      setCollections(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载集合失败';
      setError(message);
      console.error('获取集合失败:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * 创建新集合
   */
  const createCollection = useCallback(async (
    data: CreateCollectionFormData
  ): Promise<Collection | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { data: result, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          icon: data.icon || '📁',
          color: data.color || '#8B5CF6',
          questions: data.questions || [],
          question_count: (data.questions || []).length,
          answered_count: 0,
          progress: 0,
          is_public: false,
          is_template: false,
        } as any) // Type cast for Supabase type inference
        .select()
        .single();

      if (error) throw error;

      if (result) {
        setCollections(prev => [result, ...prev]);
        toast.success('✅ 集合创建成功');
        return result;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建失败';
      toast.error(message);
      console.error('创建集合失败:', err);
      return null;
    }
  }, []);

  /**
   * 更新集合
   */
  const updateCollection = useCallback(async (
    id: string,
    updates: UpdateCollectionFormData
  ): Promise<Collection | null> => {
    try {
      const updateData: any = { ...updates };

      // 处理问题数量更新
      if (updates.questions) {
        updateData.question_count = updates.questions.length;
      }

      const { data, error } = await supabase
        .from('collections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCollections(prev =>
          prev.map(c => (c.id === id ? data : c))
        );
        toast.success('✅ 集合已更新');
        return data;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新失败';
      toast.error(message);
      console.error('更新集合失败:', err);
      return null;
    }
  }, []);

  /**
   * 删除集合
   */
  const deleteCollection = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('🗑️ 集合已删除');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除失败';
      toast.error(message);
      console.error('删除集合失败:', err);
      return false;
    }
  }, []);

  /**
   * 添加问题到集合
   */
  const addQuestion = useCallback(async (
    collectionId: string,
    questionId: string
  ): Promise<boolean> => {
    try {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) {
        toast.error('集合不存在');
        return false;
      }

      if (collection.questions.includes(questionId)) {
        toast.info('问题已存在于集合中');
        return false;
      }

      const updatedQuestions = [...collection.questions, questionId];

      return await updateCollection(collectionId, {
        questions: updatedQuestions
      }) !== null;
    } catch (err) {
      console.error('添加问题失败:', err);
      return false;
    }
  }, [collections, updateCollection]);

  /**
   * 从集合移除问题
   */
  const removeQuestion = useCallback(async (
    collectionId: string,
    questionId: string
  ): Promise<boolean> => {
    try {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) {
        toast.error('集合不存在');
        return false;
      }

      const updatedQuestions = collection.questions.filter(q => q !== questionId);

      return await updateCollection(collectionId, {
        questions: updatedQuestions
      }) !== null;
    } catch (err) {
      console.error('移除问题失败:', err);
      return false;
    }
  }, [collections, updateCollection]);

  /**
   * 重新排序问题
   */
  const reorderQuestions = useCallback(async (
    collectionId: string,
    questions: string[]
  ): Promise<boolean> => {
    try {
      return await updateCollection(collectionId, {
        questions
      }) !== null;
    } catch (err) {
      console.error('重新排序失败:', err);
      return false;
    }
  }, [updateCollection]);

  /**
   * 复制集合
   */
  const duplicateCollection = useCallback(async (
    collectionId: string
  ): Promise<Collection | null> => {
    try {
      const original = collections.find(c => c.id === collectionId);
      if (!original) {
        toast.error('原集合不存在');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { data: result, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: `${original.name} (副本)`,
          description: original.description,
          icon: original.icon,
          color: original.color,
          questions: original.questions,
          question_count: original.questionCount,
          answered_count: 0,
          progress: 0,
          is_public: false,
          is_template: false,
        } as any) // Type cast for Supabase type inference
        .select()
        .single();

      if (error) throw error;

      if (result) {
        setCollections(prev => [result, ...prev]);
        toast.success('✅ 集合已复制');
        return result;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : '复制失败';
      toast.error(message);
      console.error('复制集合失败:', err);
      return null;
    }
  }, [collections]);

  /**
   * 更新提醒设置
   */
  const updateReminder = useCallback(async (
    collectionId: string,
    enabled: boolean,
    frequency?: 'daily' | 'weekly' | 'custom',
    time?: string
  ): Promise<boolean> => {
    try {
      return await updateCollection(collectionId, {
        reminderEnabled: enabled,
        reminderFrequency: frequency,
        reminderTime: time,
      }) !== null;
    } catch (err) {
      console.error('更新提醒失败:', err);
      return false;
    }
  }, [updateCollection]);

  /**
   * 获取集合统计
   */
  const getStats = useCallback(() => {
    return {
      totalCollections: collections.length,
      activeCollections: collections.filter(c => c.progress > 0 && c.progress < 100).length,
      completedCollections: collections.filter(c => c.progress === 100).length,
      totalQuestions: collections.reduce((sum, c) => sum + c.questionCount, 0),
      answeredQuestions: collections.reduce((sum, c) => sum + c.answeredCount, 0),
    };
  }, [collections]);

  // 初始加载
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        fetchCollections();
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
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    stats: getStats(),
    createCollection,
    updateCollection,
    deleteCollection,
    addQuestion,
    removeQuestion,
    reorderQuestions,
    duplicateCollection,
    updateReminder,
    refetch: fetchCollections,
  };
}

/**
 * useCollection Hook
 * 获取单个集合的详细信息
 */
export function useCollection(collectionId?: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    if (!collectionId) {
      setCollection(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (error) throw error;

      setCollection(data);
    } catch (err) {
      console.error('获取集合详情失败:', err);
      setCollection(null);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        fetchCollection();
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
  }, [fetchCollection]);

  return {
    collection,
    loading,
    refetch: fetchCollection,
  };
}
