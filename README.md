# 万万没想到 (Unexpectedly)

> 每日思维提升工具 — 通过精心设计的问题引导深度思考，激发创造力，记录成长轨迹。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)

---

## 项目简介

**万万没想到** 是一个交互式思维训练平台，通过不同维度的问题引导用户进行深度思考。整合了问题探索、AI 辩论、大咖圆桌、创意写作、逻辑推理等多种模块，帮助用户打破思维定式，发现新的可能。

### 核心理念

- **深度思考** — 每天 5 分钟，通过精心设计的问题启发思考
- **创意激发** — 多维度问题库 + 随机词汇组合，激发无限可能
- **成长追踪** — 记录思考轨迹，见证思维成长
- **游戏化学习** — 逻辑推理游戏 + 每日任务系统，让思考更有趣
- **AI 赋能** — 辩论对手、大咖圆桌、智能问答，AI 全程参与思维训练

---

## 功能概览

### 问题思考

| 功能 | 说明 |
|------|------|
| 双类别导航 | 思维维度 (5 类) x 生活场景 (5 类) = 25 种问题组合 |
| 问题探索 | 175+ 精选问题，涵盖假设、逆向、联想、反思、未来五大思维维度 |
| 深度回答 | 富文本编辑，支持自动保存草稿 |
| 收藏 & 待思考 | 个人书签系统，随时回顾 |
| 自定义收藏夹 | 用户自建收藏夹，灵活管理问题 |
| 数据导出 | 支持 PDF / Markdown 格式导出 |

**思维维度**：假设思维 / 逆向思考 / 联想创意 / 自我反思 / 未来设想

**生活场景**：职业发展 / 创意激发 / 人际关系 / 学习成长 / 生活哲学

### AI 辩论堂

- AI 自动生成辩题，支持正方/反方立场选择
- 实时辩论对话，AI 作为对手即时回应
- 评委评价系统，给出辩论表现评分和改进建议
- 辩论历史记录，随时回顾

### 大咖圆桌

- 30+ 历史与当代思想家（苏格拉底、爱因斯坦、老子、乔布斯等）
- 每位思想家拥有独特的思维风格和系统提示词
- 多人圆桌讨论，从不同视角探讨同一问题
- 智能匹配：根据问题类别自动推荐适合的思想家

### 写作创造

| 工具 | 说明 |
|------|------|
| 灵感老虎机 | 697 个词汇，27 个类别，随机三词组合激发创意 |
| 文笔挑战 | 100 道续写题目，涵盖奇幻/悬疑/情感/探险等 10 大类，随机出题，已完成题目不再出现 |

**老虎机特殊彩蛋**：特定词汇组合（如"哲学家" + "编程" + "咖啡"）会触发隐藏效果。

### 逻辑推理

| 游戏 | 玩法 |
|------|------|
| 海龟汤 | 通过是/否问题推理离奇故事真相，支持 AI 提示 |
| 谜语人 | 猜谜语，锻炼联想思维，17 道精选谜题 |
| 猜数字 | 经典 xAxB 推理，猜出四位不重复数字 |
| Yes or No | AI 出题，通过是/否提问猜出 AI 心中的词语 |

### 知识科普

- **世界之最** — 有趣的世界纪录和知识
- **系统思维** — 理解系统与流程的思维方式
- **健康主理** — 健康知识与管理
- **AI 问答** — 基于 AI 的知识问答系统

### 成长系统

| 功能 | 说明 |
|------|------|
| 时间轴视图 | 按时间查看所有思考记录 |
| 统计分析 | 思考次数、字数统计、成长曲线 |
| 思维变化 | 对比不同时期对同一问题的看法 |
| 每日任务 | 问题思考 / 写作创作 / 逻辑推理三类每日挑战 |
| 每周任务 | 回顾与总结，养成思考习惯 |
| 签到打卡 | 连续打卡记录，连续天数追踪 |
| 成就系统 | 里程碑奖励，持续激励 |

### 数据管理

- **云端同步** — 基于 Supabase 的数据备份，登录即同步
- **本地优先** — 离线可用，联网后自动同步
- **用户隔离** — 每个用户数据完全独立
- **数据迁移** — 自动检测并迁移旧版本数据
- **数据导出** — 随时导出个人数据 (PDF / Markdown / JSON)

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 5 |
| 状态管理 | Zustand（持久化 + 中间件） |
| 路由 | React Router v6 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 图标 | Lucide React / Phosphor Icons / Iconify |
| 后端 | Supabase (Auth + PostgreSQL + Storage) |
| AI | OpenAI API |
| 导出 | html2canvas + jsPDF |
| 虚拟列表 | React Virtuoso |
| 拖拽 | dnd-kit |
| 日期 | date-fns |
| 通知 | react-toastify |

---

## 快速开始

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

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 Supabase 配置
```

`.env` 文件内容：

```env
VITE_SUPABASE_URL=你的 Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=你的 Supabase 匿名密钥
```

### 数据库初始化

在 Supabase Dashboard 的 SQL Editor 中按顺序执行 `supabase/migrations/` 目录下的迁移文件。

### 启动

```bash
npm run dev
# 打开 http://localhost:5173
```

---

## 项目结构

```
src/
├── pages/              # 路由页面组件（30+ 页面）
│   ├── HomePage.tsx            # 首页导航
│   ├── QuestionExplorerPage.tsx # 问题探索
│   ├── DebateHallPage.tsx      # AI 辩论堂
│   ├── RoundtablePage.tsx      # 大咖圆桌
│   ├── WritingChallengePage.tsx # 文笔挑战
│   ├── SlotMachinePage.tsx     # 灵感老虎机
│   ├── TurtleSoupPage.tsx      # 海龟汤
│   ├── GuessNumberPage.tsx     # 猜数字
│   ├── TaskPage.tsx            # 每日任务
│   ├── CheckInPage.tsx         # 签到打卡
│   ├── GrowthTrackerPage.tsx   # 成长追踪
│   └── ...
├── components/
│   ├── features/       # 功能组件（QuestionCard, SlotMachine 等）
│   ├── debate/         # 辩论模块组件
│   ├── roundtable/     # 圆桌模块组件
│   ├── collections/    # 收藏管理组件
│   ├── virtualized/    # 虚拟列表组件
│   └── ui/             # 基础 UI 组件（Button, Input, Card 等）
├── stores/             # Zustand 状态管理
│   ├── appStore.ts            # 全局应用状态
│   ├── debateStore.ts         # 辩论会话状态
│   └── roundtableStore.ts     # 圆桌会话状态
├── hooks/              # 自定义 Hooks
│   ├── useAuth.ts             # 认证状态
│   ├── useSync.ts             # 数据同步
│   ├── useDebate.ts           # 辩论逻辑
│   ├── useRoundtable.ts       # 圆桌逻辑
│   ├── useFavorites.ts        # 收藏管理
│   ├── useCollections.ts      # 收藏夹管理
│   └── useAutoSave.ts         # 自动保存
├── services/           # 外部服务集成
│   ├── authService.ts         # 认证服务
│   └── syncService.ts         # 同步服务
├── utils/              # 工具函数
│   ├── taskManager.ts         # 任务系统
│   ├── userStorage.ts         # 用户数据隔离
│   ├── storage.ts             # 存储工具
│   ├── export.ts              # 数据导出
│   ├── aiQuestionGenerator.ts # AI 问题生成
│   ├── turtleSoupAI.ts        # 海龟汤 AI
│   ├── thinkerMatcher.ts      # 思想家匹配
│   └── dataMigration.ts       # 数据迁移
├── constants/          # 静态数据
│   ├── questions.ts           # 问题库（175+）
│   ├── categories.ts          # 类别配置
│   ├── thinkers.ts            # 思想家（30+）
│   ├── turtleSoup.ts          # 海龟汤题库
│   ├── riddles.ts             # 谜语题库
│   ├── slotMachineWords.ts    # 老虎机词汇（697 个）
│   └── writingPrompts         # 文笔挑战（100 题，内嵌于页面）
├── types/              # TypeScript 类型定义
└── lib/                # 第三方客户端配置（Supabase）
```

---

## 路由一览

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页导航 |
| `/questions` | QuestionThinkingHubPage | 问题思考中心 |
| `/questions/explore` | QuestionExplorerPage | 问题探索 |
| `/question/:id` | QuestionPage | 回答问题 |
| `/debate` | DebateHallPage | AI 辩论堂 |
| `/roundtable/setup` | RoundtableSetupPage | 大咖圆桌设置 |
| `/roundtable/discuss` | RoundtablePage | 大咖圆桌讨论 |
| `/writing` | WritingPage | 写作创造中心 |
| `/writing-challenge` | WritingChallengePage | 文笔挑战 |
| `/slot-machine` | SlotMachinePage | 灵感老虎机 |
| `/slot-machine/answer` | SlotMachineAnswerPage | 老虎机创作 |
| `/logic-reasoning` | LogicReasoningPage | 逻辑推理中心 |
| `/turtle-soup` | TurtleSoupPage | 海龟汤 |
| `/logic-reasoning/riddle` | RiddlePage | 谜语人 |
| `/logic-reasoning/guess-number` | GuessNumberPage | 猜数字 |
| `/knowledge-popularize` | KnowledgePopularizePage | 知识科普中心 |
| `/knowledge-popularize/world-records` | WorldRecordsPage | 世界之最 |
| `/knowledge-popularize/systems-thinking` | SystemsThinkingPage | 系统思维 |
| `/knowledge-popularize/health-management` | HealthManagementPage | 健康主理 |
| `/knowledge-popularize/ai-ask` | KnowledgeAIAskPage | AI 问答 |
| `/questions/growth` | GrowthTrackerPage | 成长追踪 |
| `/tasks` | TaskPage | 每日任务 |
| `/checkin` | CheckInPage | 签到打卡 |
| `/favorites` | FavoritesPage | 我的收藏 |
| `/later` | LaterPage | 待思考 |
| `/profile` | ProfilePage | 个人中心 |
| `/login` | LoginPage | 登录 |

---

## 开发脚本

```bash
npm run dev          # 启动开发服务器 (port 5173)
npm run build        # 生产构建（TypeScript 检查 + Vite 构建）
npm run preview      # 预览生产构建
npm run lint         # ESLint 代码检查
npm run format       # Prettier 格式化
npm run type-check   # TypeScript 类型检查
```

---

## 数据架构

### 核心存储键

应用使用 localStorage 做本地持久化，通过 `user-{userId}-` 前缀实现用户数据隔离：

| 存储键 | 数据 |
|--------|------|
| `wwx-answers` | 用户回答记录 |
| `wwx-slot-machine` | 老虎机结果 |
| `wwx-debate` | 辩论会话记录 |
| `wwx-turtle-soup` | 海龟汤记录 |
| `wwx-riddle` | 谜语记录 |
| `wwx-guess-number` | 猜数字记录 |
| `wwx-yes-or-no` | Yes or No 记录 |
| `writing-challenge-works` | 文笔挑战作品 |
| `wanwan-task-progress` | 任务进度 |
| `wanwan-task-completed-days` | 完成天数 |

### Supabase 数据表

| 表名 | 用途 |
|------|------|
| `profiles` | 用户资料 |
| `questions` | 问题库 |
| `answers` | 用户回答 |
| `user_data` | 用户数据 |
| `favorites` | 收藏记录 |
| `later_questions` | 待思考记录 |

---

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 更新日志

### v1.0.0
- 问题思考系统（双类别导航、深度回答、收藏管理）
- AI 辩论堂（自动出题、实时辩论、评委评价）
- 大咖圆桌（30+ 思想家、多人讨论、智能匹配）
- 灵感老虎机（697 词库、27 类别、彩蛋系统）
- 文笔挑战（100 道续写题、随机出题、排除已完成）
- 逻辑推理游戏（海龟汤、谜语人、猜数字、Yes or No）
- 知识科普模块（世界之最、系统思维、健康主理、AI 问答）
- 成长追踪系统（时间轴、统计、思维变化对比）
- 每日任务 & 签到打卡 & 成就系统
- Supabase 云端同步 & 用户认证
- 深色模式 & 响应式设计
- 数据导出（PDF / Markdown / JSON）

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**用思考连接创意，用创意改变世界**

Made by [bug-zi](https://github.com/bug-zi)

</div>
