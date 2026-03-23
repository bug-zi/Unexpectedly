-- 数据迁移：将 favorites 表中 is_later=true 的数据迁移到 later_questions 表
-- 然后删除 favorites 表的 is_later 字段

-- 步骤 1: 迁移数据到新表
INSERT INTO later_questions (user_id, question_id, notes, priority, created_at, updated_at)
SELECT
  user_id,
  question_id,
  notes,
  0 as priority, -- 默认普通优先级
  created_at,
  updated_at
FROM favorites
WHERE is_later = true
ON CONFLICT (user_id, question_id) DO NOTHING; -- 如果已存在则跳过

-- 步骤 2: 删除 favorites 表的 is_later 字段
ALTER TABLE favorites DROP COLUMN IF EXISTS is_later;

-- 验证迁移结果
-- 运行以下查询查看迁移了多少数据（注释掉，仅作参考）
-- SELECT COUNT(*) as migrated_count FROM later_questions;
