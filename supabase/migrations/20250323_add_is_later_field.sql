-- 添加 is_later 字段到 favorites 表
-- 用于区分"收藏"和"稍后回答"

-- 添加 is_later 字段
ALTER TABLE favorites
ADD COLUMN IF NOT EXISTS is_later BOOLEAN DEFAULT FALSE NOT NULL;

-- 添加注释
COMMENT ON COLUMN favorites.is_later IS '是否为"稍后回答"（待思考清单）';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS favorites_is_later_idx
ON favorites(user_id, is_later);

-- 更新现有数据：将未回答且无 collection_id 的收藏标记为"稍后回答"
UPDATE favorites
SET is_later = TRUE
WHERE is_answered = FALSE
  AND collection_id IS NULL;
