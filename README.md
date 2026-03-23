# 万万没想到 (Unexpectedly)

> 每日思维提升工具，通过精心设计的问题引导深度思考

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green.svg)

[在线演示](#) • [快速开始](#快速开始) • [功能特性](#功能特性) • [贡献指南](#贡献指南)

</div>

## 📖 项目简介

**万万没想到**是一个每日思维提升工具，通过精心设计的问题引导用户深度思考，提升思维能力和创造力。项目名取自"柳暗花明又一村"的意境，旨在激发用户思维的意外性和洞察力。

### 🎯 设计理念

- **极简主义** - 专注思维，减少干扰
- **意外惊喜** - 每个问题都旨在激发"万万没想到"的灵感
- **渐进式** - 从简单到复杂，引导深度思考
- **个性化** - 根据用户进度推荐合适难度的问题

## ✨ 功能特性

### 🎲 灵感老虎机
- 三个随机词组合激发创造性思维
- 多重彩蛋系统（组合彩蛋、三连彩蛋、语义彩蛋、时间彩蛋）
- 炫酷特效（发光、彩纸、震动）

### 💭 深度思考
- **思维维度**：假设思维、逆向思考、联想创意、自我反思、未来设想
- **生活场景**：职业发展、创意激发、人际关系、学习成长、生活哲学
- **难度分级**：1-5星难度，渐进式挑战
- **随机抽取**：每个问题都有惊喜

### 📝 回答记录
- 自由回答模式，支持Markdown
- 元数据记录（字数、阅读时间、写作时间、情绪、标签）
- 实时自动保存
- 收藏和待思考功能（完全独立）

### 📊 成长追踪
- 连续打卡统计
- 分类进度可视化
- 思维深度变化追踪
- 成就系统

### 📤 多格式导出
- **图片导出**：PNG格式，精美卡片设计
- **PDF文档**：A4标准格式
- **Markdown**：纯文本格式
- **批量导出**：支持导出所有回答
- **社交媒体分享**：预设分享模板

### 👥 社交功能
- 用户认证系统
- 公开回答分享
- 关注、点赞、评论
- 主题收藏夹

### 🔔 智能提醒
- 自定义提醒时间
- 提醒频率设置
- 浏览器通知支持

## 🛠️ 技术栈

### 前端
- **框架**: React 18.3.1 + TypeScript 5.4.5
- **构建工具**: Vite 5.1.6
- **路由**: React Router DOM 6.22.3
- **UI框架**: Tailwind CSS 3.4.1
- **状态管理**: Zustand 4.5.2
- **动画**: Framer Motion 11.0.14
- **图标**: Lucide React + Iconify
- **通知**: React Toastify

### 后端
- **BaaS**: Supabase 2.99.3
- **数据库**: PostgreSQL
- **认证**: Supabase Auth

### 工具库
- **导出**: html2canvas + jsPDF
- **日期**: date-fns
- **工具**: clsx

## 📦 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/bug-zi/Unexpectedly.git
cd Unexpectedly

# 安装依赖
npm install
```

### 配置

1. 创建 Supabase 项目
   - 访问 [Supabase](https://supabase.com) 并创建新项目
   - 获取项目的 URL 和 anon key

2. 配置环境变量

创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中运行 `supabase/setup.sql`

### 开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

访问 http://localhost:5173 查看应用

## 📁 项目结构

```
万万没想到/
├── src/
│   ├── components/          # 组件库
│   │   ├── ui/             # 基础UI组件
│   │   ├── features/       # 功能组件
│   │   └── collections/    # 收藏功能组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义Hooks
│   ├── stores/            # 状态管理
│   ├── lib/               # 工具库
│   ├── types/             # 类型定义
│   ├── constants/         # 常量配置
│   └── services/          # 业务逻辑
├── supabase/              # 数据库相关
│   ├── setup.sql         # 数据库初始化脚本
│   └── migrations/       # 数据库迁移
└── public/               # 静态资源
```

## 🗄️ 数据库模型

### 主要表结构

| 表名 | 说明 |
|------|------|
| `profiles` | 用户信息表 |
| `questions` | 问题库表 |
| `answers` | 用户回答表 |
| `user_progress` | 用户进度表 |
| `favorites` | 收藏表 |
| `later_questions` | 待思考表 |
| `collections` | 主题收藏夹表 |
| `slot_machine_results` | 老虎机结果表 |
| `follows` | 关注关系表 |
| `likes` | 点赞记录表 |
| `comments` | 评论内容表 |

## 🎨 核心功能

### 问题分类

#### 思维维度
- **假设思维** - "如果...会怎样"
- **逆向思考** - 反向思考问题
- **联想创意** - 自由联想
- **自我反思** - 内省式思考
- **未来设想** - 展望未来

#### 生活场景
- **职业发展** - 工作相关思考
- **创意激发** - 灵感来源
- **人际关系** - 社交思考
- **学习成长** - 个人提升
- **生活哲学** - 人生思考

### 难度等级

- ⭐ (1星) - 入门级，轻松开始
- ⭐⭐ (2星) - 简单，适合日常思考
- ⭐⭐⭐ (3星) - 中等，需要一些思考
- ⭐⭐⭐⭐ (4星) - 困难，深度思考
- ⭐⭐⭐⭐⭐ (5星) - 挑战，突破思维边界

## 📸 截图

<!-- 添加项目截图 -->

## 🚀 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 其他平台

项目是标准的 React + Vite 应用，可以部署到任何支持静态网站的平台：
- Netlify
- Cloudflare Pages
- GitHub Pages
- 自建服务器

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 是 |

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 规范
- 编写有意义的提交信息
- 添加必要的注释

## 📝 更新日志

### v1.0.0 (2025-03-24)

#### 新增
- ✨ 初始版本发布
- 🎲 灵感老虎机功能
- 💭 深度思考问题系统
- 📝 回答记录功能
- 📊 成长追踪系统
- 📤 多格式导出功能
- 👥 社交功能（关注、点赞、评论）
- 🔔 智能提醒系统
- ⭐ 收藏功能
- 🕐 待思考功能（独立于收藏）
- 📁 主题收藏夹

#### 优化
- 🎨 全新的UI设计
- ⚡ 性能优化
- 📱 响应式设计改进
- 🔒 数据隐私保护

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- **bug-zi** - [GitHub](https://github.com/bug-zi)

## 🙏 致谢

- [Supabase](https://supabase.com) - 提供后端服务
- [Vercel](https://vercel.com) - 提供部署服务
- [React](https://react.dev) - 前端框架
- [Tailwind CSS](https://tailwindcss.com) - CSS框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库

## 📮 联系方式

如有问题或建议，欢迎：
- 提交 [Issue](https://github.com/bug-zi/Unexpectedly/issues)
- 发送 [Pull Request](https://github.com/bug-zi/Unexpectedly/pulls)
- 关注作者获取最新动态

---

<div align="center">
  <b>让每一天都有"万万没想到"的思考 💡</b>
</div>
