# 收藏与稍后回答功能分离

## 📋 功能说明

### 概念区分
- **⭐ 收藏（Favorites）** = 我喜欢这个问题，想保存下来（类似书签）
- **🕐 稍后回答（Later）** = 我想回答这个问题，但不是现在（类似任务清单）

### 用户交互
1. **点击五角星（⭐）** → 加入"总收藏夹"
2. **点击时钟（🕐）** → 加入"稍后回答"，并自动切换到下一个问题

## 🔧 技术实现

### 数据模型
```typescript
interface FavoriteItem {
  // ... 其他字段
  isAnswered: boolean;  // 是否已回答
  isLater: boolean;     // 是否为"稍后回答"（新增）
}
```

### UI 变更
**问题卡片右上角按钮**：
```
[🕐 稍后回答] [⭐ 收藏]
```

### Hook 新增方法
```typescript
const {
  // ... 原有方法
  isLater,          // 检查是否为"稍后回答"
  addToLater,       // 添加到"稍后回答"
  removeFromLater,  // 从"稍后回答"移除
} = useFavorites();
```

## 📦 数据库迁移

### 必须手动执行的 SQL

在 **Supabase Dashboard → SQL Editor** 中运行：

```sql
-- 1. 添加 is_later 字段
ALTER TABLE favorites
ADD COLUMN IF NOT EXISTS is_later BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. 添加注释
COMMENT ON COLUMN favorites.is_later IS '是否为"稍后回答"（待思考清单）';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS favorites_is_later_idx
ON favorites(user_id, is_later);

-- 4. 更新现有数据（可选）
-- 将未回答且无 collection_id 的收藏标记为"稍后回答"
UPDATE favorites
SET is_later = TRUE
WHERE is_answered = FALSE
  AND collection_id IS NULL;
```

### 迁移文件位置
- `supabase/migrations/20250323_add_is_later_field.sql`

## 🎯 用户体验流程

### 场景 1：收藏喜欢的问题
1. 用户看到感兴趣的问题
2. 点击 ⭐ → 加入收藏
3. 问题保存在"总收藏"中

### 场景 2：稍后回答
1. 用户看到想回答但暂时没时间的问题
2. 点击 🕐 → 加入"稍后回答"
3. 自动切换到下一个问题
4. 问题保存在"待思考"清单中

### 场景 3：从待思考到已回答
1. 用户进入"稍后回答"清单
2. 选择一个问题开始思考
3. 回答完成后，自动标记为"已回答"
4. 问题从"待思考"移到"已回答"

## 🔄 数据流转

```
新问题
  ↓
点击 🕐 稍后回答
  ↓
favorites: { is_later: true, is_answered: false }
  ↓
点击 开始思考
  ↓
回答问题
  ↓
favorites: { is_later: true, is_answered: true }
  ↓
移入"已回答"
```

## 📊 收藏页面显示

### 统计卡片
- **总收藏**：所有收藏的问题数
- **已回答**：已回答的问题数
- **待思考**：标记为 is_later 的问题数
- **主题集合**：集合数量

### 筛选按钮
- **全部**：显示所有收藏
- **已答**：只显示 is_answered: true
- **稍后**：只显示 is_later: true（新增）

## 🐛 注意事项

1. **数据库迁移**：必须在 Supabase Dashboard 中手动运行 SQL
2. **向后兼容**：is_later 字段有默认值 false，不影响现有数据
3. **索引优化**：创建了 is_later 索引，查询性能更好
4. **自动切换**：点击"稍后回答"后自动跳转下一个问题

## 🎨 UI/UX 优化

### 按钮状态
- **未激活**：灰色图标
- **已激活**：彩色图标 + 背景色
  - ⭐ 收藏：黄色
  - 🕐 稍后回答：蓝色

### 动画效果
- 点击时：缩放 + 旋转
- 鼠标悬停：放大 1.1 倍

## 📝 后续优化建议

1. **稍后回答清单页面**
   - 独立页面显示所有"稍后回答"的问题
   - 支持批量操作（全部标记为已回答）

2. **智能提醒**
   - 根据用户活跃度推送"稍后回答"的问题
   - 设置定时提醒

3. **数据统计**
   - "稍后回答"的平均响应时间
   - 从"稍后回答"到"已回答"的转化率

## ✅ 完成清单

- [x] 数据模型添加 isLater 字段
- [x] Hook 新增 isLater, addToLater, removeFromLater 方法
- [x] QuestionCard 添加"稍后回答"按钮
- [x] 点击"稍后回答"自动切换下一个问题
- [x] 创建数据库迁移文件
- [ ] 在 Supabase Dashboard 中执行迁移 SQL ← **需要手动操作**
- [ ] 测试完整流程
