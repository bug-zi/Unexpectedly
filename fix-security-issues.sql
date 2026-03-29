-- ============================================================================
-- Supabase 安全问题修复脚本
-- ============================================================================
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本
--
-- 修复的问题：
-- 1. Security Definer View - public_answers
-- 2. RLS Disabled - public.questions
-- 3. RLS Disabled - public.collection_templates
-- ============================================================================

-- ============================================================================
-- 问题 1: 修复 public_answers 视图（Security Definer → Security Invoker）
-- ============================================================================

-- 删除旧的视图并使用 SECURITY INVOKER 重新创建
DROP VIEW IF EXISTS public_answers CASCADE;

CREATE VIEW public_answers
WITH (security_invoker = true) AS
SELECT
  a.id,
  a.question_id,
  a.content,
  a.metadata,
  a.created_at,
  a.updated_at,
  q.content AS question_content,
  q.category_primary,
  q.category_secondary,
  q.difficulty,
  q.tags AS question_tags,
  p.username,
  p.full_name,
  p.avatar_url,
  (SELECT COUNT(*) FROM likes l WHERE l.answer_id = a.id) AS like_count,
  (SELECT COUNT(*) FROM comments c WHERE c.answer_id = a.id AND c.deleted_at IS NULL) AS comment_count
FROM answers a
JOIN questions q ON a.question_id = q.id
LEFT JOIN profiles p ON a.user_id = p.id
WHERE a.is_public = true AND a.deleted_at IS NULL;

-- ============================================================================
-- 问题 2: 确保 questions 表启用 RLS
-- ============================================================================

-- 启用 RLS（如果尚未启用）
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;

-- 创建正确的策略
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

-- ============================================================================
-- 问题 3: 为 collection_templates 表启用 RLS
-- ============================================================================

-- 启用 RLS
ALTER TABLE collection_templates ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view templates" ON collection_templates;
DROP POLICY IF EXISTS "Auth users can create templates" ON collection_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON collection_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON collection_templates;

-- 创建新的 RLS 策略

-- 所有人都可以查看模板
CREATE POLICY "Anyone can view templates"
  ON collection_templates FOR SELECT
  USING (true);

-- 已认证用户可以创建模板
CREATE POLICY "Auth users can create templates"
  ON collection_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 用户只能更新自己创建的模板
CREATE POLICY "Users can update own templates"
  ON collection_templates FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (created_by IS NULL OR auth.uid() = created_by)
  );

-- 用户只能删除自己创建的模板
CREATE POLICY "Users can delete own templates"
  ON collection_templates FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    (created_by IS NULL OR auth.uid() = created_by)
  );

-- ============================================================================
-- 验证修复
-- ============================================================================

-- 检查 RLS 是否已启用
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('questions', 'collection_templates')
ORDER BY tablename;

-- 检查视图是否使用 SECURITY INVOKER
SELECT
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE viewname = 'public_answers';

-- 检查 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('questions', 'collection_templates')
ORDER BY tablename, policyname;

-- ============================================================================
-- 完成！
-- ============================================================================
-- 执行完成后，回到 Supabase Dashboard 的 Security Advisors 页面
-- 刷新页面，这 3 个安全问题应该已经解决了
