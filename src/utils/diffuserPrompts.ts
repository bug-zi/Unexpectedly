/**
 * 灵感扩散器 - Prompt 构建器
 * 词语扩充：综合化多元联想
 * 笔记本 / 碰撞反应：创业创新导向
 */

import type { ChatMessage } from '@/types';

const SYSTEM_PROMPT = `你是一个思维发散助手。用户给你一个词语，你需要生成与它相关的联想词，帮助用户打开思路。

核心约束：
- 只生成名词，禁止动词、形容词、副词
- 必须是日常常见、通俗易懂的名词
- 与原词的关联要直观，让人一看就懂
- 每个联想词的关联角度必须不同

联想角度（每条选不同角度，自然发散）：
- 同类：同一个大类下的其他事物（"咖啡"→"茶"、"果汁"）
- 场景：生活中出现的地方或时刻（"咖啡"→"早晨"、"办公室"）
- 搭配：经常一起出现或使用的东西（"咖啡"→"牛奶"、"甜点"）
- 组成：它的组成部分或原料（"咖啡"→"咖啡豆"、"水"）
- 联想：看到它脑子里自然冒出来的东西（"咖啡"→"熬夜"、"提神"）
- 延伸：由它引申出的相关事物（"咖啡"→"咖啡师"、"咖啡馆"）

相关性控制：
- relevance 在0.8-1.0之间，均匀分布
- 至少3个词在0.9以上
- 禁止低于0.8

输出格式（严格遵守）：
纯 JSON 数组，每个元素含 word、relation（2-4字）、relevance。
[{"word":"茶","relation":"同类","relevance":0.95},{"word":"早晨","relation":"场景","relevance":0.92},{"word":"牛奶","relation":"搭配","relevance":0.88}]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建生成关联词的 prompt
 */
export function buildDiffuserPrompt(
  word: string,
  count: number = 8,
  existingWords: string[] = []
): ChatMessage[] {
  let userContent = `请为「${word}」生成 ${count} 个多维度的联想词。`;

  if (existingWords.length > 0) {
    userContent += `\n\n已有的关联词（不要重复，要往新方向发散）：${existingWords.join('、')}`;
  }

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/** 笔记本 AI 想法建议 - 系统提示（创业视角） */
const NOTE_SYSTEM_PROMPT = `你是一个创业思维助手。用户给你一个词语或概念，你需要从创业和商业角度提供简短但有洞察力的思考启发。

核心约束：
- 每条想法不超过30个字
- 提供3-5条想法
- 每条想法从不同商业角度出发
- 语言务实有洞察力，聚焦可落地的思考

思考角度（每条选不同角度）：
- 市场需求：这个概念解决什么真实痛点？
- 目标用户：谁会为这个付费？他们的特征是什么？
- 商业模式：怎么赚钱？收入结构是什么？
- 竞争壁垒：什么是别人难以复制的优势？
- 落地路径：最小可行产品（MVP）长什么样？
- 风险挑战：最大的不确定性或难点在哪里？

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
  let userContent = `请从创业角度为「${word}」提供一些思考启发。`;

  if (existingNotes.length > 0) {
    userContent += `\n\n已有的笔记（不要重复，要有新角度）：${existingNotes.join('；')}`;
  }

  return [
    { role: 'system', content: NOTE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/** 词语碰撞反应 - 系统提示（创业灵感引擎） */
const REACTION_SYSTEM_PROMPT = `你是一个务实的创业灵感碰撞引擎。用户给你两个词语，你将它们在商业维度上碰撞融合，产出可落地的创业灵感。

输出维度（每条结果必须从不同维度出发）：
- 产品雏形：碰撞出的具体产品或服务，说明核心功能和解决什么问题
- 市场机会：揭示的未被满足的需求，指出具体的目标人群和市场规模信号
- 商业模式：如何赚钱，包含收费方式和成本结构的简要说明
- 用户场景：描述一个具体的人在什么情境下用什么功能解决什么问题
- 创新组合：两个概念跨界结合产生的新业态，说明为什么现在时机对
- 痛点洞察：暴露的消费者真实痛点，用具体行为或数据佐证

核心约束：
- 每条content不超过60个字
- 生成6条结果，覆盖至少5个不同维度
- type字段只能是以下之一：产品雏形、市场机会、商业模式、用户场景、创新组合、痛点洞察
- 必须接地气：说清楚"谁、在什么场景、用什么方式、解决什么具体问题"
- 禁止空洞概念：不许出现"沉浸式体验""跨界融合""社交分享需求"这类空话，换成具体描述
- 优先考虑已有技术能实现、小团队可启动、有明确付费意愿的方向
- 好的例子："一个蓝牙咖啡杯盖，喝到不同温度时播放对应旋律提醒"（具体产品+技术可行）
- 坏的例子："咖啡与音乐疗愈跨界融合，提供沉浸式品饮体验"（空话无指向）

输出格式（严格遵守）：
用纯 JSON 数组输出，每个元素包含 content 和 type。
[{"content":"蓝牙咖啡杯盖，根据饮品温度变化播放不同旋律提醒最佳饮用时机","type":"产品雏形"},{"content":"写字楼白领午休碎片时间需要一个5分钟音乐+咖啡组合放松方案，现有咖啡馆未覆盖","type":"用户场景"}]

只输出JSON数组，不要任何其他文字。`;

/**
 * 构建词语碰撞反应的 prompt
 */
export function buildReactionPrompt(wordA: string, wordB: string): ChatMessage[] {
  return [
    { role: 'system', content: REACTION_SYSTEM_PROMPT },
    { role: 'user', content: `请让「${wordA}」和「${wordB}」碰撞出创业灵感。` },
  ];
}
