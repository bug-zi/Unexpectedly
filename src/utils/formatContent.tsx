/**
 * AI内容格式化渲染工具
 * 将AI原始输出（含markdown标记）转换为结构化的React元素
 */

/** 处理行内格式：**加粗** */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

/** 将AI原始输出转换为结构化的React元素 */
export function renderFormattedContent(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 空行 → 间距
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // ### 标题
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          {line.replace('### ', '').replace(/\*+/g, '')}
        </h3>
      );
      continue;
    }

    // - 标签：值 模式（如 "- 介绍：xxx"、"- 面向人群：xxx"）
    const labelMatch = line.match(/^- (.+?)([：:])(.+)$/);
    if (labelMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="font-semibold text-teal-600 dark:text-teal-400 shrink-0">{labelMatch[1]}{labelMatch[2]}</span>
          <span className="text-gray-700 dark:text-gray-300">{renderInlineFormatting(labelMatch[3].trim())}</span>
        </div>
      );
      continue;
    }

    // - 普通列表项
    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-teal-500 dark:text-teal-400 mt-1.5 shrink-0">•</span>
          <span className="text-gray-700 dark:text-gray-300">{renderInlineFormatting(line.replace('- ', ''))}</span>
        </div>
      );
      continue;
    }

    // ①②③ 编号项
    const numberedMatch = line.match(/^[①②③④⑤⑥⑦⑧⑨⑩](.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">{line[0]}</span>
          <span className="text-gray-700 dark:text-gray-300">{renderInlineFormatting(numberedMatch[1])}</span>
        </div>
      );
      continue;
    }

    // 普通段落
    elements.push(
      <p key={i} className="text-gray-700 dark:text-gray-300">{renderInlineFormatting(line)}</p>
    );
  }

  return <>{elements}</>;
}

/** 简化版格式化，用于气泡/卡片等小空间场景，不含标题底线等重样式 */
export function renderCompactContent(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <p key={i} className="font-semibold text-gray-900 dark:text-white">{line.replace('### ', '').replace(/\*+/g, '')}</p>
      );
      continue;
    }

    const labelMatch = line.match(/^- (.+?)([：:])(.+)$/);
    if (labelMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5">
          <span className="font-semibold text-teal-600 dark:text-teal-400 shrink-0">{labelMatch[1]}{labelMatch[2]}</span>
          <span>{renderInlineFormatting(labelMatch[3].trim())}</span>
        </div>
      );
      continue;
    }

    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-0.5">
          <span className="text-teal-500 dark:text-teal-400 mt-0.5 shrink-0">•</span>
          <span>{renderInlineFormatting(line.replace('- ', ''))}</span>
        </div>
      );
      continue;
    }

    const numberedMatch = line.match(/^[①②③④⑤⑥⑦⑧⑨⑩](.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5">
          <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">{line[0]}</span>
          <span>{renderInlineFormatting(numberedMatch[1])}</span>
        </div>
      );
      continue;
    }

    elements.push(<p key={i}>{renderInlineFormatting(line)}</p>);
  }

  return <>{elements}</>;
}
