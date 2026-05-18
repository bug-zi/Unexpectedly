/**
 * 灵感扩散器 - Prompt 构建器
 */

import type { ChatMessage } from '@/types';

const SYSTEM_PROMPT = `你是一个词语联想引擎。用户给你一个词语，你需要生成与它有明确关联的联想词。

核心约束（最重要）：
- 只生成名词，禁止动词、形容词、副词
- 联想词必须是日常生活中常见的词汇，不要生僻词或过于细分的词
- 联想词必须与原词有直接、明显的关联，不要过度发散

相关性控制：
- 每个联想词与原词的相关度必须在0.8-1.0之间
- 1.0 = 几乎是同范畴或近义词
- 0.9 = 联系非常明显，几乎不需要思考
- 0.8 = 能直接看出联系
- 禁止低于0.8的过度发散
- 相关度分配要均匀分散在0.8-1.0区间，不要扎堆在同一个值
- 至少要有3个相关度0.9以上的强关联词

联想维度（保证多样性，但必须是直接关联的常见名词）：
- 同类并列：同一范畴的其他事物（如"咖啡"→"茶"、"果汁"）
- 组成要素：构成部分、原材料（如"咖啡"→"咖啡豆"、"牛奶"）
- 配套器物：搭配使用的物品（如"咖啡"→"咖啡杯"、"搅拌棒"）
- 典型场所：相关的具体地点（如"咖啡"→"咖啡馆"）
- 具体种类：下属分类或品种（如"咖啡"→"拿铁"、"美式"）
- 伴随事物：经常一起出现的事物（如"咖啡"→"甜点"、"面包"）

词语质量要求：
- 必须是中文常见名词，不要生造词或偏僻词
- 不要过于细分或小众（如"拿铁拉花"→应简化为"拿铁"）
- 每个联想词的关联方式必须不同

输出格式（严格遵守）：
用纯 JSON 数组输出，每个元素包含 word、relation 和 relevance。
relation 用2-4个字概括关联方式。
relevance 为0.8到1.0之间的数值，表示与原词的相关程度。
[{"word":"咖啡豆","relation":"组成要素","relevance":0.95},{"word":"牛奶","relation":"组成要素","relevance":0.92},{"word":"咖啡馆","relation":"典型场所","relevance":0.90}]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建生成关联词的 prompt
 */
export function buildDiffuserPrompt(
  word: string,
  count: number = 8,
  existingWords: string[] = []
): ChatMessage[] {
  let userContent = `请为「${word}」生成 ${count} 个创意联想词。`;

  if (existingWords.length > 0) {
    userContent += `\n\n已有的关联词（不要重复，要往新方向发散）：${existingWords.join('、')}`;
  }

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/** 笔记本 AI 想法建议 - 系统提示 */
const NOTE_SYSTEM_PROMPT = `你是一个创意思考助手。用户给你一个词语，你需要从不同角度提供简短的思考启发。

核心约束：
- 每条想法不超过30个字
- 提供3-5条想法
- 每条想法从不同角度出发（用途、感受、联想、场景、比喻、反思等）
- 语言简洁有启发性，不要空泛
- 不要重复已有的想法

输出格式（严格遵守）：
用纯 JSON 数组输出，每个元素是一个想法字符串。
["想法1","想法2","想法3","想法4","想法5"]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建笔记 AI 想法建议的 prompt
 */
export function buildNotebookPrompt(
  word: string,
  existingNotes: string[] = []
): ChatMessage[] {
  let userContent = `请为「${word}」提供一些思考启发和想法。`;

  if (existingNotes.length > 0) {
    userContent += `\n\n已有的笔记（不要重复，要有新角度）：${existingNotes.join('；')}`;
  }

  return [
    { role: 'system', content: NOTE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/** 词语碰撞反应 - 系统提示 */
const REACTION_SYSTEM_PROMPT = `你是一个创意融合引擎。用户给你两个词语，你需要将它们碰撞融合，从不同维度产出创意内容。

输出维度（每条结果必须从不同维度出发）：
- 故事灵感：以两个词为核心的一句故事设定
- 奇妙比喻：将两个词联系在一起的独特比喻
- 深思问题：两个词碰撞引发的深层思考问题
- 新奇视角：从意想不到的角度看待两个词的关系
- 融合概念：两个词合成的新概念或新事物名称+简述
- 有趣场景：两个词共存的有趣画面或场景描述

核心约束：
- 每条内容的content不超过40个字
- 生成5条结果，覆盖至少4个不同维度
- type字段只能是以下之一：故事灵感、奇妙比喻、深思问题、新奇视角、融合概念、有趣场景
- 语言要有画面感和想象力，避免平淡

输出格式（严格遵守）：
用纯 JSON 数组输出，每个元素包含 content 和 type。
[{"content":"在宇宙尽头有一家咖啡店，用星光烘焙豆子","type":"故事灵感"},{"content":"咖啡是舌尖上的黑洞，一口吞掉整个下午","type":"奇妙比喻"}]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建词语碰撞反应的 prompt
 */
export function buildReactionPrompt(wordA: string, wordB: string): ChatMessage[] {
  return [
    { role: 'system', content: REACTION_SYSTEM_PROMPT },
    { role: 'user', content: `请让「${wordA}」和「${wordB}」碰撞出创意火花。` },
  ];
}
