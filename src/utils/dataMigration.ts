/**
 * 数据迁移工具
 * 帮助现有用户从旧的存储格式迁移到新的用户隔离格式
 */

import { getCurrentUserId, setCurrentUserId, getUserStorageKey } from '@/utils/userStorage';

/**
 * 检测是否需要迁移数据
 */
export function needsMigration(): boolean {
  // 检查是否存在旧格式的数据
  const oldKeys = [
    'wwx-answers',
    'wwx-slot-machine',
    'wwx-turtle-soup',
    'wwx-riddle',
    'wwx-yes-or-no',
    'wwx-guess-number',
    'wwx-progress',
    'wwx-favorites',
    'wwx-later',
    'wwx-collections',
  ];

  return oldKeys.some(key => localStorage.getItem(key) !== null);
}

/**
 * 执行数据迁移
 * 将旧格式的数据迁移到当前用户的隔离存储中
 */
export function migrateOldData(): boolean {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      console.error('无法迁移数据：未检测到用户ID');
      return false;
    }

    console.log('开始数据迁移...');

    const oldToNewKeys: Record<string, string> = {
      'wwx-answers': 'wwx-answers',
      'wwx-slot-machine': 'wwx-slot-machine',
      'wwx-turtle-soup': 'wwx-turtle-soup',
      'wwx-riddle': 'wwx-riddle',
      'wwx-yes-or-no': 'wwx-yes-or-no',
      'wwx-guess-number': 'wwx-guess-number',
      'wwx-progress': 'wwx-progress',
      'wwx-favorites': 'wwx-favorites',
      'wwx-later': 'wwx-later',
      'wwx-collections': 'wwx-collections',
    };

    let migratedCount = 0;

    Object.entries(oldToNewKeys).forEach(([oldKey, newKey]) => {
      const oldData = localStorage.getItem(oldKey);

      if (oldData !== null) {
        const userKey = getUserStorageKey(newKey);

        // 检查用户是否已有该数据
        if (!localStorage.getItem(userKey)) {
          // 迁移数据到用户隔离存储
          localStorage.setItem(userKey, oldData);
          migratedCount++;
          console.log(`✅ 已迁移: ${oldKey} -> ${userKey}`);
        } else {
          console.log(`⚠️ 跳过: ${oldKey} (用户数据已存在)`);
        }

        // 删除旧数据
        localStorage.removeItem(oldKey);
        console.log(`🗑️ 已删除旧数据: ${oldKey}`);
      }
    });

    console.log(`✅ 数据迁移完成！共迁移 ${migratedCount} 项数据`);

    // 标记迁移完成
    localStorage.setItem('data-migration-completed', 'true');
    localStorage.setItem('data-migration-date', new Date().toISOString());

    return true;
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    return false;
  }
}

/**
 * 清理所有旧格式的数据（不迁移）
 */
export function cleanupOldData(): void {
  const oldKeys = [
    'wwx-answers',
    'wwx-slot-machine',
    'wwx-turtle-soup',
    'wwx-riddle',
    'wwx-yes-or-no',
    'wwx-guess-number',
    'wwx-progress',
    'wwx-favorites',
    'wwx-later',
    'wwx-collections',
  ];

  oldKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ 旧数据已清理');
}

/**
 * 检查迁移状态
 */
export function getMigrationStatus(): { completed: boolean; date: string | null } {
  const completed = localStorage.getItem('data-migration-completed') === 'true';
  const date = localStorage.getItem('data-migration-date');

  return { completed, date };
}

/**
 * 获取迁移报告
 */
export function getMigrationReport(): {
  needsMigration: boolean;
  oldDataExists: boolean;
  migrationCompleted: boolean;
  migrationDate: string | null;
  oldDataCount: number;
} {
  const oldKeys = [
    'wwx-answers',
    'wwx-slot-machine',
    'wwx-turtle-soup',
    'wwx-riddle',
    'wwx-yes-or-no',
    'wwx-guess-number',
    'wwx-progress',
    'wwx-favorites',
    'wwx-later',
    'wwx-collections',
  ];

  const oldDataExists = oldKeys.some(key => localStorage.getItem(key) !== null);
  const oldDataCount = oldKeys.filter(key => localStorage.getItem(key) !== null).length;
  const { completed, date } = getMigrationStatus();

  return {
    needsMigration: oldDataExists && !completed,
    oldDataExists,
    migrationCompleted: completed,
    migrationDate: date,
    oldDataCount,
  };
}

/**
 * 自动迁移（在应用启动时调用）
 */
export function autoMigrate(): void {
  const report = getMigrationReport();

  if (report.needsMigration) {
    console.log('🔄 检测到旧数据，开始自动迁移...');
    const success = migrateOldData();

    if (success) {
      console.log('✅ 自动迁移完成！');
      // 可以显示通知给用户
      // toast.success('数据已自动迁移到新系统');
    } else {
      console.error('❌ 自动迁移失败');
      // 可以显示错误通知
      // toast.error('数据迁移失败，请联系客服');
    }
  } else if (report.oldDataExists && report.migrationCompleted) {
    console.log('✅ 数据已迁移，清理旧数据...');
    cleanupOldData();
  }
}
