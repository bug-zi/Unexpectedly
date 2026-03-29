/**
 * 问题库同步工具
 * 确保云端问题库与本地问题库一致
 */

import { supabase } from '@/lib/supabase';
import { QUESTIONS as allQuestions } from '@/constants/questions';
import type { Question } from '@/types';

/**
 * 检查云端是否有问题库数据
 */
export async function checkQuestionsExist(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('检查问题库失败:', error);
      return false;
    }

    const count = data?.length || 0;
    console.log(`📊 云端问题库数量: ${count}`);

    // 如果问题库数量小于预期，说明可能没有初始化
    return count >= allQuestions.length * 0.9; // 允许 10% 的误差
  } catch (error) {
    console.error('检查问题库异常:', error);
    return false;
  }
}

/**
 * 初始化云端问题库（批量插入问题）
 * 注意：这个问题库是只读的，由管理员管理
 */
export async function initializeQuestionsDatabase(): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    console.log(`🔧 开始初始化云端问题库，共 ${allQuestions.length} 个问题...`);

    // 分批插入，避免一次性插入太多数据
    const batchSize = 50;
    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);

      const { error } = await supabase
        .from('questions')
        .upsert(
          batch.map(q => ({
            id: q.id,
            category_primary: q.category.primary,
            category_secondary: q.category.secondary || null,
            content: q.content,
            difficulty: q.difficulty,
            tags: q.tags,
            created_at: q.createdAt.toISOString(),
            updated_at: (q.updatedAt || q.createdAt).toISOString(),
            answer_count: q.answerCount || 0,
          })),
          { onConflict: 'id' }
        );

      if (error) {
        console.error(`❌ 批次 ${i / batchSize + 1} 插入失败:`, error);
        totalErrors++;
      } else {
        totalInserted += batch.length;
        console.log(`✅ 批次 ${i / batchSize + 1} 完成: ${batch.length} 个问题`);
      }
    }

    if (totalErrors > 0) {
      console.warn(`⚠️ 初始化完成，但有 ${totalErrors} 个批次失败`);
    }

    console.log(`✅ 问题库初始化完成: ${totalInserted} 个问题`);
    return { success: true, count: totalInserted };
  } catch (error) {
    console.error('❌ 初始化问题库失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '初始化失败'
    };
  }
}

/**
 * 确保问题库已初始化
 * 如果云端问题库为空，则自动初始化
 */
export async function ensureQuestionsInitialized(): Promise<boolean> {
  try {
    // 检查问题库是否存在
    const exists = await checkQuestionsExist();

    if (exists) {
      console.log('✅ 云端问题库已存在，跳过初始化');
      return true;
    }

    console.log('⚠️ 云端问题库为空，开始初始化...');
    const result = await initializeQuestionsDatabase();

    if (result.success) {
      console.log(`✅ 问题库初始化成功: ${result.count} 个问题`);
      return true;
    } else {
      console.error('❌ 问题库初始化失败:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ 确保问题库初始化失败:', error);
    return false;
  }
}
