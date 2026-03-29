# Supabase 数据库迁移文件

## 📋 文件说明

### 1. NEW_DATABASE.sql
**用途**: 完整的数据库结构初始化
**包含**:
- 用户表 (profiles)
- 问题表 (questions)
- 用户答案表 (user_data)
- 答案记录表 (answers)
- 各表的RLS策略和触发器

**何时使用**:
- 首次部署项目时
- 需要完全重建数据库时

**执行方式**: 在 Supabase Dashboard 的 SQL Editor 中执行

---

### 2. CREATE_AVATARS_BUCKET.sql
**用途**: 创建头像存储桶
**包含**:
- avatars 存储桶
- 文件上传策略
- 公开访问策略

**何时使用**:
- 启用头像上传功能时

**依赖**: 无

---

### 3. CREATE_FAVORITES_AND_LATER_SIMPLE.sql
**用途**: 创建收藏和待思考功能表
**包含**:
- favorites 表（收藏）
- later_questions 表（待思考）
- RLS 策略
- 索引和触发器

**何时使用**:
- 启用收藏和待思考功能时

**依赖**: 无

---

## 🚀 部署顺序

**首次部署**（按顺序执行）:
1. NEW_DATABASE.sql
2. CREATE_AVATARS_BUCKET.sql
3. CREATE_FAVORITES_AND_LATER_SIMPLE.sql

**添加功能**（按需执行）:
- 头像上传 → 执行 CREATE_AVATARS_BUCKET.sql
- 收藏/待思考 → 执行 CREATE_FAVORITES_AND_LATER_SIMPLE.sql

---

## ⚠️ 注意事项

1. **执行前备份**: 如果数据库已有数据，执行前请先备份
2. **顺序执行**: 首次部署必须按顺序执行所有文件
3. **权限检查**: 确保你有执行 DDL 操作的权限
4. **RLS 已启用**: 所有表都已启用行级安全策略

---

## 📝 维护建议

- 不要手动修改这些文件
- 新增表结构应该创建新的迁移文件
- 定期备份重要数据
- 保留所有已执行的迁移文件用于版本追踪
