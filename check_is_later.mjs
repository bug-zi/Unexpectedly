import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zvastmjlcgghgnyqjojt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YXN0bWpsY2dnaGdueXFqb2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTIxODcsImV4cCI6MjA4OTc2ODE4N30.KQHnofZuKYrqJSiw1jhzA86kL-xy5IvEyu_VTiYzU1g'
);

console.log('🔍 检查 is_later 字段是否存在...\n');

const { data, error } = await supabase
  .from('favorites')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ 查询失败:', error);
  process.exit(1);
}

if (data && data.length > 0) {
  const firstItem = data[0];
  console.log('✅ 查询成功！');
  console.log('\n第一条数据结构：');
  console.log(JSON.stringify(firstItem, null, 2));

  if ('is_later' in firstItem) {
    console.log('\n✅ is_later 字段已存在');
    console.log(`   值: ${firstItem.is_later}`);
  } else {
    console.log('\n❌ is_later 字段不存在');
    console.log('请在 Supabase Dashboard 中手动运行迁移 SQL');
  }
} else {
  console.log('⚠️  表中没有数据');
}

console.log('\n当前所有收藏项的 is_later 状态：');
const { data: allFavorites } = await supabase
  .from('favorites')
  .select('question_id, is_later, is_answered');

if (allFavorites) {
  allFavorites.forEach((f, i) => {
    console.log(`${i + 1}. question_id: ${f.question_id}, is_later: ${f.is_later}, is_answered: ${f.is_answered}`);
  });
}
