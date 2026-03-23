/**
 * 导出功能工具
 * 支持导出为图片、PDF、Markdown 格式
 */

import { Answer, Question } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 导出格式类型
 */
export type ExportFormat = 'image' | 'pdf' | 'markdown';

/**
 * 导出配置
 */
export interface ExportConfig {
  includeQuestion?: boolean;
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
  theme?: 'light' | 'dark';
  watermark?: boolean;
}

/**
 * 导出为图片
 */
export async function exportAsImage(
  element: HTMLElement,
  filename: string = `thought-${Date.now()}.png`
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    } as any);

    // 创建下载链接
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('导出图片失败:', error);
    throw new Error('导出图片失败，请重试');
  }
}

/**
 * 导出为 PDF
 */
export async function exportAsPDF(
  element: HTMLElement,
  filename: string = `thought-${Date.now()}.pdf`,
  _title: string = '思维报告'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  try {
    // 生成图片
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    } as any);

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 宽度 (mm)
    const pageHeight = 297; // A4 高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加新页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 保存 PDF
    pdf.save(filename);
  } catch (error) {
    console.error('导出 PDF 失败:', error);
    throw new Error('导出 PDF 失败，请重试');
  }
}

/**
 * 导出为 Markdown
 */
export function exportAsMarkdown(
  question: Question,
  answer: Answer,
  filename?: string
): void {
  const date = format(new Date(answer.createdAt), 'yyyy-MM-dd HH:mm', {
    locale: zhCN,
  });

  const markdown = `# ${question.content}

> 💡 **思考时间**：${formatTime(answer.metadata.writingTime)} | **字数**：${answer.metadata.wordCount}

---

${answer.content.split('\n').map(line => line).join('\n')}

---

**思考日期**：${date}
**问题分类**：${question.category.primary}
**难度等级**：${'⭐'.repeat(question.difficulty)}

${question.tags.length > 0 ? `**标签**：${question.tags.map(tag => `#${tag}`).join(' ')}` : ''}

---

*由「万万没想到」生成*
`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.download = filename || `thought-${question.id}-${Date.now()}.md`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * 格式化时间
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins} 分 ${secs} 秒`;
  }
  return `${secs} 秒`;
}

/**
 * 生成社交媒体分享文本
 */
export function generateSocialShareText(
  question: Question,
  answer: Answer,
  platform: 'twitter' | 'weibo' | 'wechat' | 'generic'
): string {
  const formattedTime = formatTime(answer.metadata.writingTime);
  const date = format(new Date(answer.createdAt), 'MM月dd日', { locale: zhCN });

  const templates = {
    twitter: `🤔 ${question.content.substring(0, 50)}...

我用了 ${formattedTime} 深度思考这个问题，获得了 ${answer.metadata.wordCount} 字的思考。

#万万没想到 #深度思考 #自我提升`,
    weibo: `【万万没想到】${question.content.substring(0, 40)}...

💡 思考时间：${formattedTime}
📝 字数：${answer.metadata.wordCount}
📅 ${date}

每天一个问题，遇见未知的自己。✨

#万万没想到 #思维提升 #自我成长`,
    wechat: `🤔 ${question.content}

我花了 ${formattedTime} 深度思考这个问题，写下了 ${answer.metadata.wordCount} 字的思考。

每天一个问题，遇见未知的自己。

—— 来自「万万没想到」`,
    generic: `🤔 ${question.content}

⏱️ 思考时间：${formattedTime}
📝 字数：${answer.metadata.wordCount}

—— 来自「万万没想到」思维提升工具`,
  };

  return templates[platform];
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 生成分享链接（如果支持在线分享）
 */
export function generateShareLink(
  questionId: string,
  answerId: string
): string {
  // 这里可以根据实际需求生成分享链接
  // 例如：加密分享内容、生成短链接等
  return `${window.location.origin}/share?q=${questionId}&a=${answerId}`;
}
