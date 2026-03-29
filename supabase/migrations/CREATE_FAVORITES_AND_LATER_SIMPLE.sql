-- 创建收藏表（不依赖 collections 表）
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  collection_id UUID,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_answered BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建唯一约束（每个用户对每个问题只能收藏一次）
DROP INDEX IF EXISTS favorites_user_question_idx;
CREATE UNIQUE INDEX favorites_user_question_idx ON public.favorites(user_id, question_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_is_answered_idx ON public.favorites(is_answered);

-- 启用RLS（Row Level Security）
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- 收藏表的RLS策略
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
ON public.favorites FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 创建待思考表
CREATE TABLE IF NOT EXISTS public.later_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建唯一约束（每个用户对每个问题只能添加一次到待思考）
DROP INDEX IF EXISTS later_questions_user_question_idx;
CREATE UNIQUE INDEX later_questions_user_question_idx ON public.later_questions(user_id, question_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS later_questions_user_id_idx ON public.later_questions(user_id);
CREATE INDEX IF NOT EXISTS later_questions_priority_idx ON public.later_questions(priority);

-- 启用RLS（Row Level Security）
ALTER TABLE public.later_questions ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own later questions" ON public.later_questions;
DROP POLICY IF EXISTS "Users can insert their own later questions" ON public.later_questions;
DROP POLICY IF EXISTS "Users can update their own later questions" ON public.later_questions;
DROP POLICY IF EXISTS "Users can delete their own later questions" ON public.later_questions;

-- 待思考表的RLS策略
CREATE POLICY "Users can view their own later questions"
ON public.later_questions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own later questions"
ON public.later_questions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own later questions"
ON public.later_questions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own later questions"
ON public.later_questions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 创建更新时间戳的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS update_favorites_updated_at ON public.favorites;
DROP TRIGGER IF EXISTS update_later_questions_updated_at ON public.later_questions;

-- 创建新触发器
CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_later_questions_updated_at
  BEFORE UPDATE ON public.later_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
