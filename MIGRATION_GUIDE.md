# 待思考功能迁移指南

## 概述

已完成"待思考"功能从收藏模块中分离，创建独立的功能模块。

## 需要执行的步骤

### 1. 运行数据迁移 SQL

登录 Supabase Dashboard，在 SQL Editor 中执行以下 SQL：

```sql
-- 数据迁移：将 favorites 表中 is_later=true 的数据迁移到 later_questions 表
-- 然后删除 favorites 表的 is_later 字段

-- 步骤 1: 迁移数据到新表
INSERT INTO later_questions (user_id, question_id, notes, priority, created_at, updated_at)
SELECT
  user_id,
  question_id,
  notes,
  0 as priority,
  created_at,
  updated_at
FROM favorites
WHERE is_later = true
ON CONFLICT (user_id, question_id) DO NOTHING;

-- 步骤 2: 删除 favorites 表的 is_later 字段
ALTER TABLE favorites DROP COLUMN IF EXISTS is_later;

-- 验证迁移结果（可选）
SELECT COUNT(*) as total_later FROM later_questions;
```

### 2. 重启开发服务器

```bash
# 在终端中按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

### 3. 清除浏览器缓存

按 `Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）硬刷新

## 完成的修改

### 数据库层面
- ✅ 创建新表 `later_questions`
- ✅ 移除 `favorites.is_later` 字段（需要执行迁移 SQL）

### 代码层面
- ✅ 创建 `src/hooks/useLater.ts` - 独立的待思考管理 hook
- ✅ 创建 `src/pages/LaterPage.tsx` - 待思考列表页面
- ✅ 更新 `src/components/features/QuestionCard.tsx` - 使用独立的 hooks
- ✅ 更新 `src/App.tsx` - 添加 `/later` 路由
- ✅ 更新 `src/pages/HomePage.tsx` - 添加"待思考"导航入口
- ✅ 更新 `src/pages/FavoritesPage.tsx` - 移除待思考相关显示
- ✅ 更新 `src/types/collections.ts` - 移除 `isLater` 字段
- ✅ 更新 `src/hooks/useFavorites.ts` - 移除待思考相关方法

### 功能特性
- ✅ 收藏和待思考完全独立
- ✅ 可以只收藏不标记待思考
- ✅ 可以只标记待思考不收藏
- ✅ 原有数据会自动迁移到新表

## 测试检查清单

执行迁移后，请验证以下功能：

1. **首页测试**
   - [ ] 点击"待思考"按钮，问题不会自动添加到收藏
   - [ ] 点击"收藏"按钮，问题不会自动添加到待思考
   - [ ] 两个按钮可以同时激活

2. **收藏页面测试**
   - [ ] 不再显示"待思考"统计卡片
   - [ ] 筛选按钮中移除了"待答"选项
   - [ ] 只显示"总收藏"、"已回答"、"主题集合"三个统计

3. **待思考页面测试**
   - [ ] 可以通过导航栏"待思考"按钮进入
   - [ ] 显示待思考的问题列表
   - [ ] 可以移除待思考标记
   - [ ] 显示问题添加时间

## 常见问题

**Q: 如果迁移 SQL 执行失败怎么办？**
A: 检查 `later_questions` 表是否已创建。如果没有，先执行 `20250323_create_later_questions_table.sql` 中的 SQL。

**Q: 数据迁移后还是看不到变化？**
A: 确保重启了开发服务器，并且清除了浏览器缓存。

**Q: 旧数据会丢失吗？**
A: 不会。迁移脚本会将 `favorites` 表中 `is_later=true` 的数据全部迁移到 `later_questions` 表。
