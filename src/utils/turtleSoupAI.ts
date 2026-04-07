/**
 * 海龟汤智能问答系统
 * 根据汤底内容，判断玩家推理方向是否正确
 */

export type QuestionAnswer = 'correct' | 'wrong';

export interface QAPair {
  question: string;
  answer: QuestionAnswer;
  answerText: string;
  timestamp: Date;
}

/**
 * 从汤底中提取关键信息
 */
function extractKeywordsFromTruth(truth: string): string[] {
  const cleaned = truth.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ');
  const words = cleaned.split(/\s+/).filter(word => word.length >= 2);
  return Array.from(new Set(words));
}

/**
 * 关键词匹配算法
 * 判断玩家的推理方向是否正确
 */
function analyzeQuestion(question: string, truth: string, scenario: string): {
  answer: QuestionAnswer;
  confidence: number;
  reason: string;
} {
  const questionLower = question.toLowerCase();
  const scenarioLower = scenario.toLowerCase();

  const keywords = extractKeywordsFromTruth(truth);
  const questionWords = questionLower.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ').split(/\s+/);
  const matchCount = questionWords.filter(word =>
    word.length >= 2 && keywords.some(kw => kw.includes(word) || word.includes(kw))
  ).length;
  const matchRatio = matchCount / Math.max(questionWords.length, 1);

  const scenarioWords = scenarioLower.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ').split(/\s+/);
  const scenarioMatchCount = questionWords.filter(word =>
    word.length >= 2 && scenarioWords.some(sw => sw.includes(word) || word.includes(sw))
  ).length;

  // 与汤底关键词匹配度高 → 推理方向正确
  if (matchRatio > 0.3 || scenarioMatchCount >= 2) {
    return {
      answer: 'correct',
      confidence: 0.7,
      reason: '你的推理方向是对的，继续深入'
    };
  }

  // 有一定关联度
  if (matchRatio > 0.1 || scenarioMatchCount >= 1) {
    return {
      answer: 'correct',
      confidence: 0.5,
      reason: '有一定关联，可以继续探索'
    };
  }

  // 关联度低 → 推理方向错误
  return {
    answer: 'wrong',
    confidence: 0.6,
    reason: '这个方向不太对，试试从汤面的关键信息入手'
  };
}

/**
 * 格式化答案文本
 */
function formatAnswer(answer: QuestionAnswer, reason: string): string {
  switch (answer) {
    case 'correct':
      return `对，${reason}`;
    case 'wrong':
      return `错，${reason}`;
  }
}

/**
 * 主要的问答函数（规则引擎兜底）
 */
export function answerTurtleSoupQuestion(
  question: string,
  scenario: string,
  truth: string
): QAPair {
  const analysis = analyzeQuestion(question, truth, scenario);

  return {
    question,
    answer: analysis.answer,
    answerText: formatAnswer(analysis.answer, analysis.reason),
    timestamp: new Date()
  };
}

/**
 * 检查问题是否是有效的"是/否"问题
 * 放宽规则：只要能用"是/否"回答的问句都算有效
 */
export function isValidYesNoQuestion(question: string): boolean {
  const questionLower = question.toLowerCase();

  // 开放性疑问词 → 无效（这类问题无法用是/否回答）
  const invalidPatterns = [
    /为什么|怎么会/,
    /如何|怎样|怎么做到/,
    /是谁|什么人|什么东西|谁在/,
    /在哪|哪里|什么地方/,
    /多少|几(个|点|次|天)/,
    /请|告诉我|说说/,
  ];

  if (invalidPatterns.some(pattern => pattern.test(questionLower))) {
    return false;
  }

  // 以"吗"结尾、以问号结尾、或包含"是不是""有没有""是否"等判断句式 → 有效
  const validQuestionPatterns = [
    /吗[？?]?$/,
    /[？?]$/,
    /是不是|有没有|是否|会不会|能不能|是不是/,
  ];

  return validQuestionPatterns.some(pattern => pattern.test(question));
}

/**
 * 获取提示问题
 * 根据汤底内容，生成一些引导性的问题
 */
export function getSuggestedQuestions(_scenario: string, _truth: string): string[] {
  return [
    '死者是自然死亡吗？',
    '凶手是人类吗？',
    '案发现场是封闭空间吗？',
  ];
}
