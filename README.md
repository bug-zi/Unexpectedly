# 万万没想到 (Unexpectedly) 🧠✨

> 一个每日思维提升工具，通过精心设计的问题引导深度思考，激发创造力，记录成长轨迹。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

![Preview](https://img.shields.io/badge/Status-Active-success)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)

---

## 📖 项目简介

**万万没想到** 是一个交互式的思维训练平台，通过不同维度的问题引导用户进行深度思考。无论是每日反思、创意激发，还是逻辑推理，都能帮助你打破思维定式，发现新的可能。

### 核心理念

- 🎯 **深度思考** - 每天5分钟，通过精心设计的问题启发思考
- 💡 **创意激发** - 多维度、多场景的问题库，激发无限可能
- 📊 **成长追踪** - 记录你的思考轨迹，见证思维成长
- 🎮 **游戏化学习** - 逻辑推理游戏，让思考更有趣

---

## ✨ 核心功能

### 🎯 每日问题思考
- **双类别系统**：思维维度 × 生活场景
  - 思维维度：假设思维、逆向思考、联想创意、自我反思、未来设想
  - 生活场景：职业发展、创意激发、人际关系、学习成长、生活哲学
- **智能推荐**：随机问题推送，打破思维定式
- **深度记录**：富文本编辑器，支持长时间思考
- **导出分享**：支持导出为 PDF、Markdown 格式

### 🎨 创意激发工具
- **老虎机**：随机词汇组合，激发创意灵感
  - 8大类别：人物、动物、物品、地点、动作、情感、自然、抽象概念
  - 智能组合算法，创造有趣的碰撞
  - 特殊彩蛋组合（如"哲学家"+"编程"+"咖啡"）

### 🧩 逻辑推理游戏
- **海龟汤**：通过是/否问题，推理离奇故事真相
- **谜语人**：猜谜语，锻炼联想思维
- **猜数字**：xAxB提示，逻辑推理猜出四位数
- **Yes or No**：AI出题，你提问！猜出AI心中的词语

### 📈 成长追踪系统
- **时间轴视图**：按时间查看所有思考记录
- **统计分析**：思考次数、字数统计、成长曲线
- **思维变化**：对比不同时期对同一问题的看法
- **成就系统**：连续打卡、里程碑奖励

### 🔐 数据同步与安全
- **云端同步**：基于 Supabase 的数据备份
- **用户隔离**：每个用户数据完全独立
- **本地优先**：离线可用，联网后自动同步
- **数据导出**：随时导出个人数据

---

## 🛠️ 技术栈

### 前端技术
- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **状态管理**：Zustand（轻量级状态管理）
- **路由**：React Router v6
- **UI库**：Tailwind CSS
- **动画**：Framer Motion
- **图标**：Lucide React、Iconify
- **虚拟列表**：React Virtuoso
- **拖拽排序**：DnD Kit

### 后端服务
- **BaaS平台**：Supabase
  - 认证系统：Supabase Auth
  - 数据库：PostgreSQL
  - 文件存储：Supabase Storage
  - 实时订阅：Supabase Realtime

### 开发工具
- **代码规范**：ESLint + Prettier
- **包管理器**：npm
- **版本控制**：Git
- **类型检查**：TypeScript

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/bug-zi/Unexpectedly.git
cd Unexpectedly
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

> 💡 如何获取 Supabase 配置：
> 1. 访问 [supabase.com](https://supabase.com) 并创建项目
> 2. 进入 Project Settings → API
> 3. 复制 Project URL 和 anon public key

4. **初始化数据库**

在 Supabase Dashboard 的 SQL Editor 中执行：
```sql
-- 按顺序执行以下迁移文件
-- 1. supabase/migrations/NEW_DATABASE.sql
-- 2. supabase/migrations/CREATE_AVATARS_BUCKET.sql
-- 3. supabase/migrations/CREATE_FAVORITES_AND_LATER_SIMPLE.sql
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **打开浏览器**
```
http://localhost:5173
```

---

## 📁 项目结构

```
万万没想到/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── features/      # 功能组件
│   │   ├── ui/            # UI基础组件
│   │   ├── collections/   # 收藏管理组件
│   │   └── virtualized/   # 虚拟列表组件
│   ├── pages/             # 页面组件
│   ├── stores/            # Zustand状态管理
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # 外部服务集成
│   ├── utils/             # 工具函数
│   ├── constants/         # 常量配置
│   │   ├── questions.ts   # 问题库
│   │   ├── categories.ts  # 类别配置
│   │   └── ...
│   ├── types/             # TypeScript类型定义
│   └── lib/               # 第三方客户端配置
├── supabase/
│   └── migrations/        # 数据库迁移文件
├── index.html             # HTML入口
├── vite.config.ts         # Vite配置
├── tailwind.config.js     # Tailwind配置
├── tsconfig.json          # TypeScript配置
└── package.json           # 项目依赖

```

---

## 🎮 使用指南

### 每日思考

1. **选择问题类别**
   - 浏览 8 个思维维度 × 5 个生活场景 = 40 种组合
   - 或使用随机功能，让系统为你选择

2. **深入思考**
   - 在富文本编辑器中记录你的想法
   - 不必追求完美，真实就好
   - 可以随时暂停，支持自动保存草稿

3. **保存回顾**
   - 保存到个人记录
   - 添加收藏或标记"待思考"
   - 导出为 PDF/Markdown 分享

### 逻辑推理游戏

#### 海龟汤
- 阅读离奇的故事汤面
- 通过"是/否"问题逐步揭示真相
- 查看提示，获取额外线索
- 推理出完整的故事背景

#### 谜语人
- 阅读谜面
- 输入你的答案
- 查看正确答案和解析
- 收集你解开的谜语

#### 猜数字
- 系统生成4位不重复数字
- 输入你的猜测
- 根据 xAxB 提示推理
  - A：数字和位置都对
  - B：数字对但位置错
- 最少次数猜中答案

#### Yes or No
- AI从8大类别中随机选择词语
- 你通过"是/否"问题提问
- 用最少问题猜出答案

### 老虎机创意激发

1. **点击拉杆**
2. **获得随机组合**
   - 人物 × 2 个随机词汇
3. **开始头脑风暴**
   - 这个组合让你想到什么？
   - 可以创作一个故事？
   - 可以解决什么问题？

---

## 🔧 开发指南

### 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 添加新问题

编辑 `src/constants/questions.ts`：

```typescript
export const MY_NEW_QUESTIONS: Question[] = [
  {
    id: 'my-question-001',
    category: {
      primary: 'thinking',
      secondary: 'hypothesis'
    },
    content: '如果你的生命只剩下24小时，你会做什么？',
    difficulty: 3,
    tags: ['假设', '价值观', '生死'],
    createdAt: new Date(),
    answerCount: 0,
  }
];
```

### 添加新游戏类别

1. 创建新的页面组件 `src/pages/YourGamePage.tsx`
2. 添加路由到 `src/App.tsx`
3. 在 `src/pages/LogicReasoningPage.tsx` 添加入口卡片

---

## 📊 数据库架构

### 核心表结构

```sql
-- 用户表
profiles (id, email, username, avatar_url, created_at)

-- 问题库
questions (id, content, category, difficulty, tags, answer_count)

-- 用户答案
user_data (id, user_id, question_id, content, metadata, created_at)

-- 回答记录
answers (id, user_id, question_id, content, metadata, is_public, created_at)

-- 收藏
favorites (id, user_id, question_id, notes, tags, created_at)

-- 待思考
later_questions (id, user_id, question_id, priority, created_at)
```

详细架构请参考 `supabase/migrations/` 目录。

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 代码规范

- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 添加适当的注释
- 更新相关文档

---

## 📝 更新日志

### v1.0.0 (2025-03-29)
- ✨ 初始版本发布
- ✅ 每日问题思考功能
- ✅ 老虎机创意工具
- ✅ 四个逻辑推理游戏
- ✅ 成长追踪系统
- ✅ 云端数据同步
- ✅ 用户认证和资料管理

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- [React](https://react.dev/) - 前端框架
- [Supabase](https://supabase.com/) - 后端服务
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库

---

## 📮 联系方式

- 项目主页：[https://github.com/bug-zi/Unexpectedly](https://github.com/bug-zi/Unexpectedly)
- 问题反馈：[GitHub Issues](https://github.com/bug-zi/Unexpectedly/issues)

---

<div align="center">

**用思考连接创意，用创意改变世界** 💡✨

Made with ❤️ by [bug-zi](https://github.com/bug-zi)

</div>
