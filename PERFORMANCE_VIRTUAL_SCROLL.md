# 虚拟滚动性能优化指南

## 安装依赖

```bash
npm install react-window
npm install -D @types/react-window
```

## 方案一：基础虚拟列表

### 1. 创建虚拟列表组件

```typescript
// src/components/virtualized/AnswerList.tsx
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Answer } from '@/types';
import { getQuestionById } from '@/constants/questions';

interface AnswerListProps {
  answers: Answer[];
  height: number; // 列表高度
  onAnswerClick?: (answer: Answer) => void;
}

// 单个回答项
const AnswerItem = ({ index, style, data }: ListChildComponentProps) => {
  const answer = data.answers[index];
  const question = getQuestionById(answer.questionId);

  return (
    <div style={style} className="px-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* 问题 */}
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          {question?.content || '未知问题'}
        </p>

        {/* 回答预览 */}
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {answer.content}
        </p>

        {/* 元数据 */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{answer.metadata.wordCount} 字</span>
          <span>{new Date(answer.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export function AnswerList({ answers, height, onAnswerClick }: AnswerListProps) {
  return (
    <List
      height={height} // 可见区域高度
      itemCount={answers.length} // 总项目数
      itemSize={150} // 每项高度（固定）
      itemData={{ answers, onAnswerClick }} // 传递数据
      width="100%"
    >
      {AnswerItem}
    </List>
  );
}
```

### 2. 在 GrowthTrackerPage 中使用

```typescript
// src/pages/GrowthTrackerPage.tsx
import { AnswerList } from '@/components/virtualized/AnswerList';

export function GrowthTrackerPage() {
  // ... 其他代码

  return (
    <div className="min-h-screen">
      {/* 计算可用高度：视口高度 - 导航栏 - 统计卡片 - 边距 */}
      <div style={{ height: 'calc(100vh - 400px)' }}>
        <AnswerList
          answers={filteredAnswers}
          height={600} // 或动态计算
          onAnswerClick={(answer) => {/* 处理点击 */}}
        />
      </div>
    </div>
  );
}
```

## 方案二：分组虚拟列表（适合按日期分组）

### 1. 创建可变高度的虚拟列表

```typescript
// src/components/virtualized/GroupedAnswerList.tsx
import { VariableSizeList as List } from 'react-window';
import { useRef, useEffect } from 'react';
import { Answer } from '@/types';

interface GroupedAnswers {
  date: string;
  answers: Answer[];
}

interface GroupedListProps {
  groupedData: GroupedAnswers[];
  height: number;
}

export function GroupedAnswerList({ groupedData, height }: GroupedListProps) {
  const listRef = useRef<List>(null);

  // 获取每组的高度
  const getItemSize = (index: number) => {
    const group = groupedData[index];
    // 日期头部高度 (60px) + 每个回答高度 (120px) * 回答数量
    return 60 + group.answers.length * 120;
  };

  // 当数据变化时重新计算
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [groupedData]);

  const GroupItem = ({ index, style }: any) => {
    const group = groupedData[index];

    return (
      <div style={style}>
        {/* 日期头部 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4">
          <h3 className="font-bold">{group.date}</h3>
          <span className="text-sm">{group.answers.length} 个回答</span>
        </div>

        {/* 该组的回答 */}
        <div className="space-y-2 p-4">
          {group.answers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={groupedData.length}
      itemSize={getItemSize}
      width="100%"
    >
      {GroupItem}
    </List>
  );
}
```

## 方案三：使用 react-virtuoso（推荐）

`react-virtuoso` 更强大，支持动态高度和分组。

```bash
npm install react-virtuoso
```

```typescript
// src/components/virtualized/VirtuosoAnswerList.tsx
import { Virtuoso } from 'react-virtuoso';
import { Answer } from '@/types';

interface VirtuosoListProps {
  answers: Answer[];
  loadMore?: () => void; // 无限滚动
}

export function VirtuosoAnswerList({ answers, loadMore }: VirtuosoListProps) {
  return (
    <Virtuoso
      style={{ height: '600px' }}
      data={answers}
      itemContent={(index, answer) => (
        <div className="p-4 border-b">
          <AnswerCard answer={answer} />
        </div>
      )}
      endReached={loadMore} // 滚动到底部触发
      overscan={200} // 预渲染上下各200px
    />
  );
}
```

## 性能对比

| 方案 | 1000项渲染时间 | 内存占用 | 适用场景 |
|------|---------------|---------|---------|
| 普通列表 | ~2000ms | 高 | < 100项 |
| react-window | ~50ms | 低 | 固定高度 |
| react-virtuoso | ~80ms | 低 | 动态高度 |

## 最佳实践

1. **计算可用高度**
```typescript
const getAvailableHeight = () => {
  const viewportHeight = window.innerHeight;
  const navbarHeight = 64;
  const statsHeight = 200;
  const padding = 100;

  return viewportHeight - navbarHeight - statsHeight - padding;
};
```

2. **配合无限滚动**
```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = () => {
  if (hasMore) {
    setPage(p => p + 1);
    // 加载更多数据
  }
};
```

3. **避免内联函数**
```typescript
// ❌ 不好 - 每次渲染创建新函数
<List itemData={{ answers, onClick: () => {...} }} />

// ✅ 好 - 使用 useCallback
const handleClick = useCallback((answer) => {
  // ...
}, []);
```

## 完整示例

```typescript
// src/pages/GrowthTrackerPage.tsx（优化后）
import { Virtuoso } from 'react-virtuoso';
import { useMemo } from 'react';

export function GrowthTrackerPage() {
  const answers = useAppStore(state => state.answers);

  // 扁平化数据
  const flatAnswers = useMemo(() => {
    return Object.entries(answersByDate).flatMap(([date, dayAnswers]) =>
      dayAnswers.map(answer => ({ ...answer, dateKey: date }))
    );
  }, [answersByDate]);

  return (
    <div>
      {/* 统计卡片 */}

      {/* 虚拟列表 */}
      <Virtuoso
        style={{ height: 'calc(100vh - 400px)' }}
        data={flatAnswers}
        itemContent={(index, answer) => (
          <AnswerListItem
            key={answer.id}
            answer={answer}
            date={answer.dateKey}
          />
        )}
        components={{
          Header: () => <div>...</div>, // 顶部内容
          Footer: () => <div>加载中...</div>, // 底部加载
        }}
      />
    </div>
  );
}
```
