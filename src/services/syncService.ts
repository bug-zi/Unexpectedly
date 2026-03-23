/**
 * 数据同步服务
 * 负责在本地存储和 Supabase 之间同步数据
 */

import { supabase } from '@/lib/supabase';
import type { Answer, Question, SlotMachineResult } from '@/types';
import { getAnswers, getSlotMachineResults } from '@/utils/storage';
import { saveAnswer, saveSlotMachineResult } from '@/utils/storage';

export interface SyncResult {
  success: boolean;
  uploaded?: number;
  downloaded?: number;
  error?: string;
}

/**
 * 初始化数据库表（导入问题库）
 */
export async function initializeDatabase(questions: Question[]): Promise<SyncResult> {
  try {
    // 批量插入问题
    const { error } = await supabase
      .from('questions')
      .upsert(
        questions.map(q => ({
          id: q.id,
          category_primary: q.category.primary,
          category_secondary: q.category.secondary || null,
          content: q.content,
          difficulty: q.difficulty,
          tags: q.tags,
          created_at: q.createdAt.toISOString(),
          updated_at: (q.updatedAt || q.createdAt).toISOString(),
          answer_count: q.answerCount,
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;

    console.log('✅ 数据库初始化成功');
    return { success: true };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '数据库初始化失败',
    };
  }
}

/**
 * 上传本地数据到云端
 */
export async function uploadLocalData(): Promise<SyncResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 获取本地数据
    const localAnswers = getAnswers();
    const localSlotMachine = getSlotMachineResults();

    let uploadedCount = 0;

    // 上传回答
    if (localAnswers.length > 0) {
      const { error: answersError } = await supabase
        .from('answers')
        .upsert(
          localAnswers.map(answer => ({
            id: answer.id,
            user_id: user.id,
            question_id: answer.questionId,
            content: answer.content,
            metadata: {
              wordCount: answer.metadata.wordCount,
              readingTime: answer.metadata.readingTime,
              writingTime: answer.metadata.writingTime,
              mood: answer.metadata.mood,
              tags: answer.metadata.tags,
            },
            is_public: false, // 默认私有
            created_at: answer.createdAt.toISOString(),
            updated_at: (answer.updatedAt || answer.createdAt).toISOString(),
          })),
          { onConflict: 'id' }
        );

      if (answersError) throw answersError;
      uploadedCount += localAnswers.length;
    }

    // 上传老虎机结果
    if (localSlotMachine.length > 0) {
      const { error: slotError } = await supabase
        .from('slot_machine_results')
        .upsert(
          localSlotMachine.map(result => ({
            id: result.id,
            user_id: user.id,
            words: result.words,
            response: result.response,
            easter_egg: result.easterEgg,
            created_at: result.createdAt.toISOString(),
          })),
          { onConflict: 'id' }
        );

      if (slotError) throw slotError;
      uploadedCount += localSlotMachine.length;
    }

    console.log(`✅ 上传成功: ${uploadedCount} 条记录`);
    return { success: true, uploaded: uploadedCount };
  } catch (error) {
    console.error('上传失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    };
  }
}

/**
 * 从云端下载数据并合并本地数据
 */
export async function downloadCloudData(): Promise<SyncResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    let downloadedCount = 0;

    // 获取本地现有数据
    const localAnswers = getAnswers();
    const localAnswerIds = new Set(localAnswers.map(a => a.id));

    // 下载回答
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (answersError) throw answersError;

    if (answers && answers.length > 0) {
      // 合并云端和本地数据，使用 Set 去重
      const mergedAnswers = [...localAnswers];

      for (const answer of (answers as any[])) {
        // 如果云端数据在本地不存在，则添加
        if (!localAnswerIds.has(answer.id)) {
          const formattedAnswer: Answer = {
            id: answer.id,
            questionId: answer.question_id,
            userId: answer.user_id,
            content: answer.content,
            metadata: {
              wordCount: (answer.metadata as any).wordCount || 0,
              readingTime: (answer.metadata as any).readingTime || 0,
              writingTime: (answer.metadata as any).writingTime || 0,
              mood: (answer.metadata as any).mood,
              tags: (answer.metadata as any).tags,
            },
            createdAt: new Date(answer.created_at),
            updatedAt: new Date(answer.updated_at),
          };
          mergedAnswers.push(formattedAnswer);
          downloadedCount++;
        }
      }

      // 一次性保存合并后的数据
      localStorage.setItem('wwx-answers', JSON.stringify(mergedAnswers));
    }

    // 获取本地老虎机结果
    const localSlotResults = getSlotMachineResults();
    const localSlotIds = new Set(localSlotResults.map(r => r.id));

    // 下载老虎机结果
    const { data: slotResults, error: slotError } = await supabase
      .from('slot_machine_results')
      .select('*')
      .eq('user_id', user.id);

    if (slotError) throw slotError;

    if (slotResults && slotResults.length > 0) {
      // 合并云端和本地数据
      const mergedSlotResults = [...localSlotResults];

      for (const result of (slotResults as any[])) {
        if (!localSlotIds.has(result.id)) {
          const formattedResult: SlotMachineResult = {
            id: result.id,
            words: result.words as [string, string, string],
            userId: result.user_id,
            response: result.response || undefined,
            easterEgg: result.easter_egg as any,
            createdAt: new Date(result.created_at),
          };
          mergedSlotResults.push(formattedResult);
          downloadedCount++;
        }
      }

      // 一次性保存合并后的数据
      localStorage.setItem('wwx-slot-machine', JSON.stringify(mergedSlotResults));
    }

    console.log(`✅ 下载成功: ${downloadedCount} 条新记录`);
    return { success: true, downloaded: downloadedCount };
  } catch (error) {
    console.error('下载失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '下载失败',
    };
  }
}

/**
 * 双向同步（合并本地和云端数据）
 *
 * 同步策略：
 * 1. 先上传本地所有数据到云端（upsert 会处理重复）
 * 2. 再下载云端数据并合并到本地（基于 ID 去重）
 * 3. 确保本地和云端数据最终一致
 */
export async function syncData(): Promise<SyncResult> {
  try {
    // 步骤1: 先上传本地数据到云端
    const uploadResult = await uploadLocalData();
    if (!uploadResult.success) return uploadResult;

    // 步骤2: 下载云端数据并合并到本地
    const downloadResult = await downloadCloudData();
    if (!downloadResult.success) return downloadResult;

    return {
      success: true,
      uploaded: uploadResult.uploaded,
      downloaded: downloadResult.downloaded,
    };
  } catch (error) {
    console.error('同步失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '同步失败',
    };
  }
}

/**
 * 监听云端数据变化（实时同步）
 */
export function subscribeToAnswersChanges(callback: () => void) {
  return supabase
    .channel('answers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'answers',
        filter: `user_id=eq.${(supabase.auth.getUser() as any).data?.user?.id}`,
      },
      callback
    )
    .subscribe();
}
