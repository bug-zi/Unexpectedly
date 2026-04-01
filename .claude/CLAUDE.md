# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**万万没想到** (Wan Wan Xiang Dao) is a daily thinking improvement tool that uses carefully designed questions to guide personal reflection and enhance creativity. The core experience involves exploring questions through dual-category systems (Thinking Dimensions and Life Scenarios), recording thoughts, and tracking mental growth over time.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking without emitting

### Port Constraint
The dev server must run on port 5173. If the port is occupied, kill the process and restart. Do not use alternative ports like 5174.

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Backend**: Supabase (auth + database)
- **Build Tool**: Vite

### Project Structure

```
src/
├── pages/           # Route-level page components
├── components/
│   ├── features/    # Feature-specific components (SlotMachine, QuestionCard, etc.)
│   ├── collections/ # Collection management components
│   ├── virtualized/ # Virtualized list components
│   └── ui/          # Reusable UI primitives (Button, Input, Card, etc.)
├── stores/          # Zustand stores (appStore for global state)
├── hooks/           # Custom React hooks (useAuth, useFavorites, etc.)
├── services/        # External service integrations (authService, syncService)
├── utils/           # Utility functions (textAnalysis, export, notifications)
├── constants/       # Static data (questions, categories, slotMachineWords)
├── types/           # TypeScript type definitions
└── lib/             # Third-party client configurations (Supabase)
```

### Key Architectural Patterns

**State Management**: Uses Zustand with middleware for persistence. The main store (`appStore`) manages:
- Current question context
- User answers
- Slot machine state
- User progress
- UI loading states

**Data Layer**: Hybrid approach with localStorage for offline-first experience and Supabase for cloud sync and auth.

**Component Organization**:
- `pages/` - Route handlers, contain business logic
- `components/features/` - Feature-specific, potentially complex components
- `components/ui/` - Simple, reusable UI components
- `components/collections/` - Domain-specific collection management
- `components/virtualized/` - Performance-optimized virtualized lists

**Custom Hooks**: Encapsulate business logic and data fetching:
- `useAuth` - Authentication state and operations
- `useFavorites` - Favorite questions management
- `useCollections` - Collection CRUD operations
- `useLater` - "Read Later" functionality
- `useAutoSave` - Automatic draft saving

### Core Features

1. **Question Exploration System** - Dual-category navigation (Thinking Dimensions × Life Scenarios)
2. **Slot Machine** - Random word generation for creative inspiration with easter egg combinations
3. **Growth Tracking** - Timeline view, statistics, and thought change analysis
4. **Collections** - User-created collections for organizing questions
5. **Favorites/Later** - Personal question bookmarking
6. **Turtle Soup** - Mystery puzzle game mode
7. **Export** - PDF and Markdown export of user data

### Category System

**Thinking Dimensions** (思维维度):
- `hypothesis` - 假设思维 (What if scenarios)
- `reverse` - 逆向思考 (Inversion thinking)
- `creative` - 联想创意 (Creative associations)
- `reflection` - 自我反思 (Self-reflection)
- `future` - 未来设想 (Future envisioning)

**Life Scenarios** (生活场景):
- `career` - 职业发展
- `creative` - 创意激发
- `relationship` - 人际关系
- `learning` - 学习成长
- `philosophy` - 生活哲学

## Critical Constraints

### Port Management (MANDATORY)
**你只能占用5173端口，如果端口已经被占用了，就杀死进程，然后重新在5173部署。禁止你开启5174等这些端口。**

You must ONLY use port 5173 for the development server. If port 5173 is already occupied:
1. Find and kill the process using port 5173
2. Restart the dev server on port 5173
3. NEVER use alternative ports like 5174, 5175, etc.

**Port discovery commands:**
- Windows: `netstat -ano | findstr :5173` then `taskkill /PID <pid> /F`
- Unix/Linux/Mac: `lsof -ti:5173 | xargs kill -9`

### Code Modification Safety (MANDATORY)
**所有修改一定不能影响与本次修改无关的、功能已经正常实现的那些部分的代码。修改代码的时候，一定不能影响原来的其他功能正常实现，你在修改完代码后会自动检查其他功能是否仍然能够正常实现，如果不行想办法修复。**

When modifying code:
1. **Zero impact on unrelated code** - You MUST NOT modify, refactor, or alter any code that is unrelated to the current task, even if you think it could be "improved." If it works, leave it alone.
2. **Preserve all existing functionality** - Changes must NOT break any currently working features
3. **Automatic verification** - After making changes, you must automatically verify that other features still work correctly
4. **Fix any issues** - If something breaks, you MUST fix it before considering the task complete
5. **Test thoroughly** - Don't just test the modified code - test related features and user flows

**What "no impact on unrelated code" means:**
- Do NOT refactor code outside the scope of the task
- Do NOT rename variables, functions, or files that are not part of the change
- Do NOT add comments, type annotations, or formatting changes to unrelated code
- Do NOT change import statements in files not affected by the task
- Do NOT modify working utility functions to "improve" them
- If a file needs only a 1-line change, only change that 1 line — nothing else in that file

**Verification approach:**
- Identify all features that could be affected by your changes
- Test each potentially affected feature
- If you find a regression, fix it immediately
- Only mark the task as complete when everything works

### Disk Space Management (MANDATORY)
**尽量避免占用C盘的内存，如果有需要，把内容存到D盘的D:\Code\data这个位置。**

When working with files, data, or any content that requires storage:
1. **Prefer D drive** - Use `D:\Code\data` as the primary storage location
2. **Avoid C drive** - Minimize use of C drive for temporary files, caches, or data storage
3. **Environment variables** - Set paths to D drive when possible (e.g., `TEMP`, `TMP`)
4. **Node modules** - Consider moving `node_modules` to D drive if disk space is limited
5. **Build artifacts** - Configure build tools to use D drive for temporary files

**Examples:**
- Instead of `C:\Users\...\AppData\Local\Temp`, use `D:\Code\data\temp`
- For large file operations, use `D:\Code\data\files`
- For database dumps or exports, use `D:\Code\data\exports`

### Documentation Generation (MANDATORY)
**在我没有明确要求你生成说明文档的情况下，不要自己生成.md说明文档。**

1. **No automatic documentation** - Do NOT create .md documentation files unless explicitly requested
2. **Code comments only** - Use code comments and JSDoc for inline documentation instead
3. **User-requested only** - Only generate documentation when the user explicitly asks for it
4. **Avoid file clutter** - Keep the project directory clean by minimizing documentation files

**Examples:**
- ❌ Don't create: `FIX_GUIDE.md`, `SETUP_INSTRUCTIONS.md`, `FEATURE_EXPLANATION.md`
- ✅ Use instead: Code comments, JSDoc annotations, inline explanations
- ✅ Only when requested: "请生成一个使用指南" → Then create documentation

### Debugging and Testing (MANDATORY)
**你会自行调用浏览器工具调试修复，而不是让使用者自己去调试操作。**

1. **Automated browser testing** - Use browser automation tools to test and debug issues yourself
2. **Active debugging** - Proactively use Chrome DevTools or browser automation to identify and fix problems
3. **No user debugging** - Do NOT ask users to perform debugging steps or manual testing
4. **Full responsibility** - Take complete ownership of testing and debugging tasks

**Available tools:**
- Chrome DevTools integration via MCP tools
- Browser automation (navigate, click, fill forms, take screenshots)
- Console log inspection
- Network request monitoring
- Element inspection and interaction

**Process:**
1. Reproduce the issue in the browser
2. Use browser tools to diagnose the problem
3. Identify the root cause
4. Fix the issue in code
5. Verify the fix works in browser
6. Only report back when the issue is resolved

## Path Aliases

The project uses path aliases defined in both `vite.config.ts` and `tsconfig.json`:
- `@/` → `./src/`
- `@components/` → `./src/components/`
- `@hooks/` → `./src/hooks/`
- `@utils/` → `./src/utils/`
- `@types/` → `./src/types/`
- `@constants/` → `./src/constants/`
- `@stores/` → `./src/stores/`
- `@styles/` → `./src/styles/`

## Environment Variables

Required Supabase environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Type System

Core types are defined in `src/types/index.ts`:
- `Question` - Question structure with dual categorization
- `Answer` - User response with metadata
- `SlotMachineResult` - Slot machine word combinations
- `UserProgress` - User statistics and achievements
- `CategoryConfig` - Category styling and configuration
- Primary categories: `ThinkingDimension`, `LifeScenario`, `PrimaryCategory`
