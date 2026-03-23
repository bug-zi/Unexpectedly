-- ============================================================================
-- Unexpectedly 项目 - Supabase 数据库设置脚本
-- ============================================================================
-- 请在 Supabase Dashboard → SQL Editor 中执行此脚本
-- ============================================================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 用户配置表（扩展 auth.users）
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- 添加注释
COMMENT ON TABLE public.profiles IS '用户配置信息';
COMMENT ON COLUMN public.profiles.id IS '关联 auth.users 的 UUID';
COMMENT ON COLUMN public.profiles.username IS '用户名（唯一）';
COMMENT ON COLUMN public.profiles.bio IS '个人简介';

-- ============================================================================
-- 问题表（问题库）
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  category_primary TEXT NOT NULL CHECK (category_primary IN ('thinking', 'scenario', 'random')),
  category_secondary TEXT,
  content TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  answer_count INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS questions_category_idx ON public.questions(category_primary, category_secondary);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS questions_tags_idx ON public.questions USING GIN(tags);

COMMENT ON TABLE public.questions IS '问题库';
COMMENT ON COLUMN public.questions.category_primary IS '主分类：thinking(思维) / scenario(场景) / random(随机)';
COMMENT ON COLUMN public.questions.category_secondary IS '次分类：假设思维/逆向思考等';

-- ============================================================================
-- 回答表（用户的回答）
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.answers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb,

  -- 隐私设置
  is_public BOOLEAN DEFAULT false,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- 软删除
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS answers_user_id_idx ON public.answers(user_id);
CREATE INDEX IF NOT EXISTS answers_question_id_idx ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS answers_created_at_idx ON public.answers(created_at DESC);
CREATE INDEX IF NOT EXISTS answers_is_public_idx ON public.answers(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS answers_metadata_idx ON public.answers USING GIN(metadata);

COMMENT ON TABLE public.answers IS '用户回答';
COMMENT ON COLUMN public.answers.metadata IS '包含字数、阅读时间、写作时间、情绪、标签等';
COMMENT ON COLUMN public.answers.is_public IS '是否公开（公开后其他用户可见）';

-- ============================================================================
-- 用户进度表
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- 统计数据
  total_answers INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- 分类统计
  category_breakdown JSONB DEFAULT '{}'::jsonb,

  -- 老虎机统计
  slot_machine_plays INTEGER DEFAULT 0,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.user_progress IS '用户进度统计';

-- ============================================================================
-- 老虎机结果表
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.slot_machine_results (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  words TEXT[] NOT NULL,
  response TEXT,
  easter_egg JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS slot_machine_user_id_idx ON public.slot_machine_results(user_id);
CREATE INDEX IF NOT EXISTS slot_machine_created_at_idx ON public.slot_machine_results(created_at DESC);

COMMENT ON TABLE public.slot_machine_results IS '老虎机游戏结果';

-- ============================================================================
-- 社交功能：关注表
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id);

COMMENT ON TABLE public.follows IS '用户关注关系';

-- ============================================================================
-- 社交功能：点赞表
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer_id TEXT REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id, answer_id)
);

CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS likes_answer_id_idx ON public.likes(answer_id);

COMMENT ON TABLE public.likes IS '用户点赞记录';

-- ============================================================================
-- 社交功能：评论表
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer_id TEXT REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_answer_id_idx ON public.comments(answer_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

COMMENT ON TABLE public.comments IS '回答评论';

-- ============================================================================
-- 自动更新 updated_at 触发器
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) 策略
-- ============================================================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_machine_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- profiles 表策略
CREATE POLICY "用户可以查看所有配置" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的配置" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的配置" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- answers 表策略
CREATE POLICY "用户可以查看自己的回答" ON public.answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以查看公开的回答" ON public.answers FOR SELECT USING (is_public = true);
CREATE POLICY "用户可以插入自己的回答" ON public.answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以更新自己的回答" ON public.answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户可以删除自己的回答" ON public.answers FOR DELETE USING (auth.uid() = user_id);

-- user_progress 表策略
CREATE POLICY "用户可以查看自己的进度" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以插入自己的进度" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以更新自己的进度" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- slot_machine_results 表策略
CREATE POLICY "用户可以查看自己的老虎机结果" ON public.slot_machine_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以插入自己的老虎机结果" ON public.slot_machine_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- follows 表策略
CREATE POLICY "用户可以查看关注关系" ON public.follows FOR SELECT USING (true);
CREATE POLICY "用户可以管理自己的关注" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- likes 表策略
CREATE POLICY "用户可以查看点赞" ON public.likes FOR SELECT USING (true);
CREATE POLICY "用户可以管理自己的点赞" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- comments 表策略
CREATE POLICY "用户可以查看评论" ON public.comments FOR SELECT USING (true);
CREATE POLICY "用户可以插入评论" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以更新自己的评论" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户可以删除自己的评论" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 初始化问题库数据（从 constants/questions.ts 导入）
-- ============================================================================
-- 注意：这部分需要单独运行，需要从你的前端代码中提取问题数据

-- ============================================================================
-- 创建存储过程：自动创建用户配置
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：新用户注册时自动创建配置
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 创建视图：公开回答（用于社交功能）
-- ============================================================================
CREATE OR REPLACE VIEW public.public_answers AS
SELECT
  a.id,
  a.question_id,
  a.content,
  a.metadata,
  a.created_at,
  a.updated_at,
  q.content as question_content,
  q.category_primary,
  q.category_secondary,
  q.difficulty,
  q.tags as question_tags,
  p.username,
  p.full_name,
  p.avatar_url,
  (SELECT COUNT(*) FROM public.likes WHERE answer_id = a.id) as like_count,
  (SELECT COUNT(*) FROM public.comments WHERE answer_id = a.id) as comment_count
FROM public.answers a
JOIN public.questions q ON a.question_id = q.id
JOIN public.profiles p ON a.user_id = p.id
WHERE a.is_public = true AND a.deleted_at IS NULL;

COMMENT ON VIEW public.public_answers IS '公开回答视图（用于社交功能）';

-- ============================================================================
-- 完成！
-- ============================================================================
-- 数据库设置完成！
-- 下一步：
-- 1. 在 Supabase Dashboard → Authentication → Providers 中配置 GitHub OAuth
-- 2. 运行前端代码进行测试
