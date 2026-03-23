-- ==========================================
-- 问题收藏夹与主题集合功能
-- 数据库表结构
-- ==========================================

-- 1. 主题集合表
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '📁',
  color VARCHAR(20) DEFAULT '#8B5CF6',
  cover_image TEXT,

  -- 问题相关
  questions TEXT[] DEFAULT '{}',
  question_count INTEGER DEFAULT 0,
  answered_count INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,

  -- 时间追踪
  last_answered_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- 提醒设置
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_frequency VARCHAR(20),
  reminder_time VARCHAR(10),

  -- 社交设置
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  fork_count INTEGER DEFAULT 0,

  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 索引
  CONSTRAINT collections_name_not_empty CHECK (char_length(name) > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_is_template ON collections(is_template);
CREATE INDEX IF NOT EXISTS idx_collections_updated_at ON collections(updated_at DESC);

-- 2. 收藏记录表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,

  -- 用户数据
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_answered BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 唯一约束：每个用户对同一问题只能有一条收藏记录
  UNIQUE(user_id, question_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_collection_id ON favorites(collection_id);
CREATE INDEX IF NOT EXISTS idx_favorites_question_id ON favorites(question_id);
CREATE INDEX IF NOT EXISTS idx_favorites_is_answered ON favorites(is_answered);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- 3. 集合模板表
CREATE TABLE IF NOT EXISTS collection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),

  -- 问题配置
  questions JSONB NOT NULL,
  question_count INTEGER NOT NULL,

  -- 分类
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  estimated_time VARCHAR(20),

  -- 使用数据
  use_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,

  -- 元数据
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 约束
  CONSTRAINT templates_name_not_empty CHECK (char_length(name) > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_templates_category ON collection_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_difficulty ON collection_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_templates_use_count ON collection_templates(use_count DESC);

-- ==========================================
-- 触发器：自动更新集合进度
-- ==========================================

-- 更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- collections 表的 updated_at 触发器
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- favorites 表的 updated_at 触发器
CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 自动计算集合进度的函数
CREATE OR REPLACE FUNCTION update_collection_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collections
  SET
    answered_count = (
      SELECT COUNT(*)
      FROM favorites
      WHERE collection_id = NEW.collection_id
      AND is_answered = true
    ),
    question_count = (
      SELECT COUNT(*)
      FROM favorites
      WHERE collection_id = NEW.collection_id
    ),
    progress = (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE is_answered = true)::FLOAT / COUNT(*)::FLOAT) * 100)
      END
      FROM favorites
      WHERE collection_id = NEW.collection_id
    ),
    last_answered_at = CASE
      WHEN NEW.is_answered = true THEN NOW()
      ELSE collections.last_answered_at
    END,
    updated_at = NOW()
  WHERE id = NEW.collection_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_collection_progress ON favorites;
CREATE TRIGGER trigger_update_collection_progress
  AFTER INSERT OR UPDATE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_progress();

-- ==========================================
-- Row Level Security (RLS) 策略
-- ==========================================

-- 启用 RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- collections 表的 RLS 策略
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public collections"
  ON collections FOR SELECT
  USING (is_public = true);

-- favorites 表的 RLS 策略
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 默认集合创建函数
-- ==========================================

-- 为新用户创建默认集合
CREATE OR REPLACE FUNCTION create_default_collections_for_user()
RETURNS TRIGGER AS $$
DECLARE
  default_later_collection UUID;
BEGIN
  -- 创建"稍后思考"默认集合
  INSERT INTO collections (user_id, name, description, icon, color)
  VALUES (
    NEW.id,
    '稍后思考',
    '快速收藏，稍后思考',
    '⭐',
    '#F59E0B'
  )
  RETURNING id INTO default_later_collection;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 当用户注册时自动创建默认集合（需要根据实际的用户表结构调整）
-- DROP TRIGGER IF EXISTS trigger_create_default_collections ON auth.users;
-- CREATE TRIGGER trigger_create_default_collections
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_default_collections_for_user();

-- ==========================================
-- 预设模板数据
-- ==========================================

-- 插入预设模板（示例）
INSERT INTO collection_templates (name, description, icon, color, questions, question_count, category, difficulty, estimated_time) VALUES
  (
    '职业探索',
    '深入了解自己的职业倾向和理想工作',
    '💼',
    '#3B82F6',
    '[{"questionId": "career-01", "order": 0}, {"questionId": "career-02", "order": 1}, {"questionId": "career-03", "order": 2}]'::jsonb,
    3,
    'career',
    'beginner',
    '2周'
  ),
  (
    '关系深度思考',
    '探索人际关系中的自我',
    '💑',
    '#EC4899',
    '[{"questionId": "rel-01", "order": 0}, {"questionId": "rel-02", "order": 1}]'::jsonb,
    2,
    'relationship',
    'intermediate',
    '1周'
  )
ON CONFLICT DO NOTHING;

-- ==========================================
-- 完成提示
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '数据库表创建完成！';
  RAISE NOTICE '已创建的表：';
  RAISE NOTICE '  - collections (主题集合)';
  RAISE NOTICE '  - favorites (收藏记录)';
  RAISE NOTICE '  - collection_templates (集合模板)';
  RAISE NOTICE '========================================';
END $$;
