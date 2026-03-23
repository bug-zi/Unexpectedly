-- 创建独立的"待思考"表
CREATE TABLE IF NOT EXISTS later_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,

  -- 扩展字段
  notes TEXT,
  priority INTEGER DEFAULT 0, -- 优先级，0=普通，1=高，2=紧急

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 唯一约束：每个用户对每个问题只能有一条待思考记录
  UNIQUE(user_id, question_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_later_questions_user_id ON later_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_later_questions_question_id ON later_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_later_questions_created_at ON later_questions(created_at DESC);

-- 添加注释
COMMENT ON TABLE later_questions IS '用户待思考问题列表，与收藏功能完全独立';
COMMENT ON COLUMN later_questions.user_id IS '用户ID';
COMMENT ON COLUMN later_questions.question_id IS '问题ID';
COMMENT ON COLUMN later_questions.notes IS '备注';
COMMENT ON COLUMN later_questions.priority IS '优先级：0=普通，1=高，2=紧急';

-- 启用 RLS
ALTER TABLE later_questions ENABLE ROW LEVEL SECURITY;

-- 创建 RSL 策略
CREATE POLICY "用户可以查看自己的待思考列表"
  ON later_questions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加待思考问题"
  ON later_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的待思考记录"
  ON later_questions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的待思考记录"
  ON later_questions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_later_questions_updated_at
  BEFORE UPDATE ON later_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
