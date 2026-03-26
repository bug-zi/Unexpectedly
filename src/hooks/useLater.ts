/**
 * useLater Hook
 * 管理问题"待思考"功能，与收藏功能完全独立
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';

export interface LaterQuestion {
  id: string;
  questionId: string;
  userId: string;
  notes: string | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useLater() {
  const [laterQuestions, setLaterQuestions] = useState<LaterQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 自动加载待思考列表
  useEffect(() => {
    fetchLaterQuestions();
  }, []);

  /**
   * 获取待思考列表
   */
  const fetchLaterQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLaterQuestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('later_questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data?.map(item => ({
        id: item.id,
        questionId: item.question_id,
        userId: item.user_id,
        notes: item.notes,
        priority: item.priority,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      })) || [];

      setLaterQuestions(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载待思考列表失败';
      setError(message);
      console.error('获取待思考列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 添加到待思考
   */
  const addToLater = useCallback(async (questionId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      // 检查是否已在待思考列表中（使用函数式更新避免闭包问题）
      let alreadyExists = false;
      setLaterQuestions(prev => {
        if (prev.some(l => l.questionId === questionId)) {
          alreadyExists = true;
        }
        return prev;
      });

      if (alreadyExists) {
        toast.info('已在待思考列表中', { autoClose: 1500 });
        return false;
      }

      const insertData = {
        user_id: user.id,
        question_id: questionId,
        priority: 0,
      };

      const { data, error } = await supabase
        .from('later_questions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // 唯一约束冲突，说明已存在
        if (error.code === '23505') {
          toast.info('已在待思考列表中', { autoClose: 1500 });
          return false;
        }
        throw error;
      }

      if (data) {
        setLaterQuestions(prev => [{
          id: data.id,
          questionId: data.question_id,
          userId: data.user_id,
          notes: data.notes,
          priority: data.priority,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        }, ...prev]);
        return true;
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败';
      toast.error(message, { autoClose: 1500 });
      console.error('添加到待思考失败:', err);
      return false;
    }
  }, []);

  /**
   * 从待思考移除
   */
  const removeFromLater = useCallback(async (questionId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('later_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setLaterQuestions(prev => prev.filter(l => l.questionId !== questionId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败';
      toast.error(message, { autoClose: 1500 });
      console.error('移除失败:', err);
      return false;
    }
  }, []);

  /**
   * 检查是否在待思考列表中
   */
  const isLater = useCallback((questionId: string): boolean => {
    return laterQuestions.some(l => l.questionId === questionId);
  }, [laterQuestions]);

  /**
   * 获取待思考记录详情
   */
  const getLaterQuestion = useCallback((questionId: string): LaterQuestion | undefined => {
    return laterQuestions.find(l => l.questionId === questionId);
  }, [laterQuestions]);

  /**
   * 更新备注
   */
  const updateNotes = useCallback(async (
    questionId: string,
    notes: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('later_questions')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setLaterQuestions(prev =>
        prev.map(l =>
          l.questionId === questionId ? { ...l, notes } : l
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
   * 更新优先级
   */
  const updatePriority = useCallback(async (
    questionId: string,
    priority: number
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('later_questions')
        .update({ priority })
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setLaterQuestions(prev =>
        prev.map(l =>
          l.questionId === questionId ? { ...l, priority } : l
        )
      );

      return true;
    } catch (err) {
      console.error('更新优先级失败:', err);
      return false;
    }
  }, []);

  /**
   * 获取统计
   */
  const getStats = useCallback(() => {
    return {
      total: laterQuestions.length,
      highPriority: laterQuestions.filter(l => l.priority === 2).length,
      normalPriority: laterQuestions.filter(l => l.priority === 0).length,
    };
  }, [laterQuestions]);

  // 初始加载
  useEffect(() => {
    fetchLaterQuestions();
  }, [fetchLaterQuestions]);

  return {
    laterQuestions,
    loading,
    error,
    stats: getStats(),
    addToLater,
    removeFromLater,
    isLater,
    getLaterQuestion,
    updateNotes,
    updatePriority,
    refetch: fetchLaterQuestions,
  };
}
