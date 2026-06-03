# 万万没想到 (Unexpectedly)

> 每天抽一点时间，把脑子从惯性里拽出来。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)

## 这是什么

**万万没想到** 是一个思维训练和创意生成工具。它不假装帮你「提升生产力」，它更关心你今天有没有问出一个好问题、写下一段像样的文字、把一个旧想法撞出新角度。

当前版本包含四个主入口：

| 入口 | 做什么 |
| --- | --- |
| 逻辑推理 | 海龟汤、谜语、Yes or No、猜数字，用游戏逼自己认真推理 |
| 问题思考 | 精选问题卡片、AI 辩论堂、回答记录和思考统计 |
| 写作创造 | 灵感老虎机、文笔挑战、创作历史和字数统计 |
| 灵感源泉 | AI 生成灵感、灵感涟漪、灵感扩散画布和历史收藏 |

## 功能概览

### 问题思考

- 5 种思维维度：假设思维、逆向思考、联想创意、自我反思、未来设想。
- 5 种生活场景：职业发展、创意激发、人际关系、学习成长、生活哲学。
- 问题探索、分类浏览、回答页、收藏、待思考、自定义收藏夹。
- AI 辩论堂：选择立场，与 AI 辩手对话，并获得评委式反馈。
- 成长追踪：记录回答、查看思考次数和阶段变化。
- AI 问题生成器：用于生成新的思考题。

### 写作创造

- 灵感老虎机：随机词语组合，打破「我不知道写什么」的空转。
- 文笔挑战：给定一句开头，继续写出一个完整片段。
- 历史记录：老虎机与文笔挑战作品统一查看，支持编辑和删除。
- 创作统计：记录创作次数和累计字数。

### 逻辑推理

- 海龟汤：通过是/否提问还原故事真相，需要 AI 配置。
- 谜语人：基于内置谜题库训练联想和语言理解。
- Yes or No：AI 出题，你用是/否问题逼近答案，需要 AI 配置。
- 猜数字：经典 xAxB 数字推理，支持不同模式选择。
- 游戏记录与统计：查看历史局数、完成情况、提示次数和耗时。

### 灵感源泉

- 6 个灵感领域：文学创作、项目开发、沟通表达、学术探索、生活创意、人际关系。
- 3 种生成深度：火花、深潜、跨界碰撞。
- 灵感历史、收藏、统计、编辑和删除。
- 灵感涟漪：围绕一句输入继续追问、扩写、发散。
- 灵感扩散器：以节点画布展开词语联想，支持手动模式、自动模式、节点碰撞反应、笔记和收纳盒。

### 任务、签到与个人中心

- 随机小任务：通过扭蛋机生成创意、身体行动、社交互动、自我反思、探索发现、善意传递等任务。
- 任务中心：每日任务、完成记录和进度管理。
- 签到打卡：记录连续思考习惯。
- 通知提醒：本地通知设置与全局提醒。
- 个人中心：用户资料、主题偏好、AI 模型配置、数据同步入口。

## AI 配置

项目的主要 AI 功能使用 OpenAI 兼容的 Chat Completions 接口。API Key 在浏览器本地保存，不上传到项目后端。

内置服务商配置：

| 服务商 | 默认模型 |
| --- | --- |
| DeepSeek | `deepseek-chat` |
| 通义千问 | `qwen-plus` |
| 智谱 GLM | `glm-4-flash` |
| Kimi | `moonshot-v1-8k` |
| 豆包 | `doubao-pro-32k` |

进入 `个人中心` 后填写服务商、模型和 API Key，即可启用辩论堂、圆桌讨论、海龟汤 AI、Yes or No、灵感源泉、随机小任务等功能。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 18, TypeScript 5, Vite 5 |
| 路由 | React Router v6 |
| 样式 | Tailwind CSS, 自定义背景图与动效 |
| 动画 | Framer Motion |
| 状态 | Zustand |
| 后端 | Supabase Auth, PostgreSQL, Storage |
| AI | OpenAI 兼容接口，支持多服务商 |
| 拖拽 | dnd-kit |
| 图标 | Lucide React, Phosphor Icons, Iconify |
| 导出 | html2canvas, jsPDF |
| SEO | react-helmet-async, JSON-LD |
| 演示视频 | Remotion 子项目 |

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本
- 一个 Supabase 项目

### 安装依赖

```bash
git clone https://github.com/bug-zi/Unexpectedly.git
cd Unexpectedly
npm install
```

### 配置环境变量

在项目根目录新建 `.env.local`：

```env
VITE_SUPABASE_URL=你的 Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=你的 Supabase 匿名密钥
VITE_SITE_URL=http://localhost:5173
```

可选变量：

```env
VITE_GLM_API_KEY=用于 AI 问题生成器的智谱 API Key
```

### 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/migrations/` 目录下的 SQL 文件。新库优先从 `NEW_DATABASE.sql` 开始；已有库按实际缺失表结构执行对应迁移。

### 启动开发环境

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

## 常用脚本

```bash
npm run dev          # 启动 Vite 开发服务器
npm run build        # 生产构建
npm run build:check  # TypeScript 检查 + 生产构建
npm run preview      # 预览生产构建
npm run lint         # ESLint 检查
npm run format       # 格式化 src 下的 TS/TSX/CSS
npm run type-check   # TypeScript 类型检查
```

## 目录结构

```text
src/
├── pages/          # 路由页面
├── components/     # UI、功能模块、辩论、圆桌、灵感扩散等组件
├── hooks/          # 认证、同步、AI、通知、收藏等 Hooks
├── stores/         # Zustand 状态
├── services/       # Supabase、LLM、反馈等服务
├── utils/          # 存储、导出、迁移、提示词、布局等工具
├── constants/      # 问题库、分类、SEO、题库、灵感领域配置
├── types/          # TypeScript 类型
├── lib/            # Supabase 客户端
└── styles/         # 全局样式和落地页样式

supabase/
├── setup.sql
└── migrations/     # 数据库迁移

public/
├── landing/        # 静态介绍页
├── check/          # 检查页
└── *.html          # 数据恢复、应急修复、演示页面

video/              # Remotion 演示视频项目
landing-page/       # 独立静态落地页草稿
```

## 主要路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/questions` | 问题思考中心 |
| `/questions/explore` | 问题探索 |
| `/question/:id` | 问题回答 |
| `/questions/growth` 或 `/growth` | 成长追踪 |
| `/questions/question-generator` 或 `/question-generator` | AI 问题生成器 |
| `/debate` | AI 辩论堂 |
| `/writing` | 写作创造 |
| `/slot-machine` | 灵感老虎机 |
| `/slot-machine/answer` | 老虎机构思写作 |
| `/writing-challenge` | 文笔挑战 |
| `/logic-reasoning` | 逻辑推理中心 |
| `/turtle-soup` | 海龟汤 |
| `/logic-reasoning/riddle` | 谜语人 |
| `/logic-reasoning/yes-or-no` | Yes or No |
| `/logic-reasoning/guess-number` | 猜数字 |
| `/inspiration` | 灵感源泉 |
| `/inspiration/diffuser` | 灵感扩散器 |
| `/inspiration/:domainId` | 灵感领域详情 |
| `/random-quest` | 随机小任务 |
| `/roundtable/setup` | 圆桌讨论设置 |
| `/roundtable/discuss` | 圆桌讨论 |
| `/favorites` | 我的收藏 |
| `/later` | 待思考 |
| `/collections/:id` | 收藏夹详情 |
| `/tasks` | 任务中心 |
| `/checkin` | 签到打卡 |
| `/notifications` | 通知设置 |
| `/profile` | 个人中心 |
| `/login` | 登录 |
| `/auth/callback` | 登录回调 |

## 数据与同步

- 本地优先：思考、创作、游戏、任务等记录优先保存在浏览器本地。
- 用户隔离：本地存储通过用户前缀区分不同账号数据。
- 云端同步：登录后使用 Supabase 同步用户资料、回答、收藏、稍后思考和用户数据。
- 自动迁移：应用启动时会执行旧数据迁移逻辑。

常见本地存储键：

| Key | 内容 |
| --- | --- |
| `wwx-answers` | 问题回答 |
| `wwx-slot-machine` | 灵感老虎机记录 |
| `wwx-debate` | 辩论记录 |
| `wwx-turtle-soup` | 海龟汤记录 |
| `wwx-riddle` | 谜语记录 |
| `wwx-guess-number` | 猜数字记录 |
| `wwx-yes-or-no` | Yes or No 记录 |
| `writing-challenge-works` | 文笔挑战作品 |
| `wanwan-task-progress` | 任务进度 |

## 演示视频

`video/` 是独立的 Remotion 项目：

```bash
cd video
npm install
npm run studio
npm run render
```

渲染输出位置为 `video/out/demo.mp4`。

## 部署

项目包含 `vercel.json`，可部署到 Vercel。生产环境至少需要配置：

```env
VITE_SUPABASE_URL=你的 Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=你的 Supabase 匿名密钥
VITE_SITE_URL=你的正式站点 URL
```

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

Made by [bug-zi](https://github.com/bug-zi)
