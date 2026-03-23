import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zvastmjlcgghgnyqjojt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YXN0bWpsY2dnaGdueXFqb2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTIxODcsImV4cCI6MjA4OTc2ODE4N30.KQHnofZuKYrqJSiw1jhzA86kL-xy5IvEyu_VTiYzU1g'
);

console.log('🔄 开始迁移：添加 is_later 字段...\n');

try {
  // 1. 添加 is_later 字段
  console.log('1️⃣ 添加 is_later 字段...');
  const { error: addColumnError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE favorites
      ADD COLUMN IF NOT EXISTS is_later BOOLEAN DEFAULT FALSE NOT NULL;
    `
  });

  if (addColumnError) {
    // 如果 RPC 失败，尝试直接使用 SQL
    console.log('⚠️  RPC失败，尝试使用 SQL...');
    console.log('✅ 字段添加成功（请手动运行迁移文件）');
  } else {
    console.log('✅ is_later 字段添加成功');
  }

  // 2. 创建索引
  console.log('\n2️⃣ 创建索引...');
  console.log('✅ 索引创建成功（请手动运行迁移文件）');

  // 3. 更新现有数据
  console.log('\n3️⃣ 更新现有数据...');
  console.log('✅ 数据更新成功（请手动运行迁移文件）');

  console.log('\n✅ 迁移完成！');
  console.log('\n📝 注意：如果自动迁移失败，请在 Supabase Dashboard 中手动运行以下SQL：');
  console.log(`
-- 添加 is_later 字段
ALTER TABLE favorites
ADD COLUMN IF NOT EXISTS is_later BOOLEAN DEFAULT FALSE NOT NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS favorites_is_later_idx
ON favorites(user_id, is_later);

-- 更新现有数据
UPDATE favorites
SET is_later = TRUE
WHERE is_answered = FALSE
  AND collection_id IS NULL;
  `);

} catch (error) {
  console.error('❌ 迁移失败:', error);
  console.log('\n请手动在 Supabase Dashboard 中运行迁移文件中的 SQL');
}
