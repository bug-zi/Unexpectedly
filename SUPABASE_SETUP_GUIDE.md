# Supabase 集成实施指南

## ✅ 已完成的工作

### 1. 环境配置
- ✅ 创建 `.env.local` 文件
- ✅ 配置 Supabase URL 和 Anon Key
- ✅ 安装 `@supabase/supabase-js` 客户端库

### 2. 数据库设计
- ✅ 创建完整的数据库表结构 SQL 脚本
- ✅ 设计了用户表、回答表、问题表、进度表等
- ✅ 配置 Row Level Security (RLS) 策略
- ✅ 创建视图和触发器
- ✅ 定义 TypeScript 类型

### 3. 核心功能代码
- ✅ Supabase 客户端配置（`src/lib/supabase.ts`）
- ✅ 认证 Hook（`src/hooks/useAuth.ts`）
- ✅ 认证服务（`src/services/authService.ts`）
- ✅ 数据同步服务（`src/services/syncService.ts`）
- ✅ 登录页面（`src/pages/LoginPage.tsx`）
- ✅ 认证回调页面（`src/pages/AuthCallbackPage.tsx`）
- ✅ 更新路由配置

---

## 🔧 接下来需要你做的事情

### 第一步：在 Supabase 中执行 SQL 脚本（5分钟）

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目：Unexpectedly

2. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New Query"

3. **执行 SQL 脚本**
   - 打开项目中的 `supabase/setup.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮执行

4. **确认表创建成功**
   - 左侧菜单 → Database → Tables
   - 应该能看到这些表：
     - `profiles`
     - `questions`
     - `answers`
     - `user_progress`
     - `slot_machine_results`
     - `follows`
     - `likes`
     - `comments`

### 第二步：配置 GitHub OAuth（3分钟）

1. **在 GitHub 创建 OAuth App**
   - 访问：https://github.com/settings/developers
   - 点击 "New OAuth App"
   - 填写信息：
     - Application name: Unexpectedly
     - Homepage URL: `http://localhost:5173`
     - Authorization callback URL: `https://zvastmjlcgghgnyqjojt.supabase.co/auth/v1/callback`
   - 记录 Client ID 和 Client Secret

2. **在 Supabase 中配置**
   - Dashboard → Authentication → Providers
   - 找到 "GitHub" provider
   - 点击启用
   - 填入：
     - Client ID: [刚才获取的]
     - Client Secret: [刚才获取的]
   - 保存

### 第三步：测试功能（10分钟）

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问登录页面**
   - 打开：http://localhost:5173/login
   - 应该能看到登录界面

3. **测试邮箱注册**
   - 输入邮箱和密码
   - 点击"注册"
   - 检查是否成功

4. **测试 GitHub 登录**
   - 点击"使用 GitHub 继续"
   - 授权后应该自动登录

### 第四步：初始化问题库（5分钟）

创建一个初始化脚本，将现有的问题导入到 Supabase：

```typescript
// 在某个组件或脚本中运行
import { getAllQuestions } from '@/constants/questions';
import { initializeDatabase } from '@/services/syncService';

const questions = getAllQuestions();
await initializeDatabase(questions);
```

---

## 📝 后续开发步骤

### 阶段 2：集成数据同步到现有功能

1. **修改 HomePage.tsx**
   - 检查登录状态
   - 未登录显示"登录"按钮
   - 已登录显示用户信息

2. **修改 QuestionPage.tsx**
   - 保存回答时同步到云端
   - 使用 `uploadLocalData()` 或直接调用 Supabase API

3. **修改 GrowthTrackerPage.tsx**
   - 从云端加载数据
   - 实现实时同步

4. **添加同步状态指示器**
   - 显示"正在同步..."
   - 显示同步成功/失败

### 阶段 3：实现高级功能

1. **公开回答功能**
   - 添加"设为公开"按钮
   - 创建"发现"页面展示公开回答

2. **社交功能**
   - 点赞、评论功能
   - 关注用户

3. **数据统计仪表板**
   - 可视化展示数据

---

## 🐛 常见问题

### Q1: SQL 执行失败
**A:** 检查 Supabase 项目状态，确保项目已经完全创建（需要等待2-3分钟）

### Q2: GitHub OAuth 不工作
**A:**
- 检查 Callback URL 是否正确
- 确保在 GitHub 中正确配置了 URL
- 检查 Supabase Authentication → Providers 中的配置

### Q3: 登录后没有跳转
**A:** 检查浏览器控制台是否有错误，可能是路由配置问题

### Q4: 数据没有同步到云端
**A:** 确认：
- 用户已登录
- 网络连接正常
- RLS 策略正确配置

---

## 📞 需要帮助？

如果遇到问题，请告诉我：

1. 具体的错误信息
2. 错误发生的步骤
3. 浏览器控制台的输出

我会帮你解决！

---

## 🎉 完成后你将拥有

✅ 用户认证系统（邮箱 + GitHub）
✅ 云端数据存储
✅ 多设备数据同步
✅ 数据安全保障
✅ 社交功能基础

准备好开始了吗？按上面的步骤操作，完成后告诉我进度！💪
