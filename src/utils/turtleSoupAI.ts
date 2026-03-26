/**
 * 海龟汤智能问答系统
 * 根据汤底内容，自动判断用户问题的答案
 */

export type QuestionAnswer = 'yes' | 'no' | 'irrelevant';

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
  // 移除标点符号，分词
  const cleaned = truth.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ');
  const words = cleaned.split(/\s+/).filter(word => word.length >= 2);

  // 返回去重后的关键词
  return Array.from(new Set(words));
}

/**
 * 简单的关键词匹配算法
 * 判断问题中是否包含汤底的关键词
 */
function analyzeQuestion(question: string, truth: string, scenario: string): {
  answer: QuestionAnswer;
  confidence: number;
  reason: string;
} {
  const questionLower = question.toLowerCase();
  const scenarioLower = scenario.toLowerCase();

  // 关键否定词
  const negativeWords = ['不', '没', '无', '非', '否', '不是', '没有', '无法'];
  // 关键肯定词
  const positiveWords = ['是', '有', '能', '会', '确实', '真的'];

  // 检查问题是否包含否定词
  const hasNegative = negativeWords.some(word => questionLower.includes(word));
  // 检查问题是否包含肯定词
  const hasPositive = positiveWords.some(word => questionLower.includes(word));

  // 提取汤底中的关键词
  const keywords = extractKeywordsFromTruth(truth);

  // 计算问题与汤底的重合度
  const questionWords = questionLower.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ').split(/\s+/);
  const matchCount = questionWords.filter(word =>
    word.length >= 2 && keywords.some(kw => kw.includes(word) || word.includes(kw))
  ).length;

  const matchRatio = matchCount / Math.max(questionWords.length, 1);

  // 特殊情况处理：问题与汤面直接相关
  const scenarioWords = scenarioLower.replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, ' ').split(/\s+/);
  const scenarioMatchCount = questionWords.filter(word =>
    word.length >= 2 && scenarioWords.some(sw => sw.includes(word) || word.includes(sw))
  ).length;

  // 判断逻辑
  if (matchRatio > 0.3 || scenarioMatchCount >= 2) {
    // 问题与汤底/汤面相关度高
    if (hasNegative) {
      return {
        answer: 'no',
        confidence: 0.7,
        reason: '汤底中不包含这种情况'
      };
    } else if (hasPositive) {
      return {
        answer: 'yes',
        confidence: 0.7,
        reason: '汤底中包含相关信息'
      };
    } else {
      return {
        answer: 'yes',
        confidence: 0.6,
        reason: '这个问题与故事相关'
      };
    }
  }

  // 常见问题模式的智能回复
  const commonPatterns = [
    {
      pattern: /为什么|怎么会|如何|怎样/,
      handler: () => ({
        answer: 'irrelevant',
        confidence: 0.9,
        reason: '请用是/否问题来提问，比如"这个人是盲人吗？"'
      })
    },
    {
      pattern: /是谁|什么人|谁在/,
      handler: () => ({
        answer: 'irrelevant',
        confidence: 0.9,
        reason: '请用是/否问题来提问，比如"这个人认识他吗？"'
      })
    },
    {
      pattern: /在哪|哪里|什么地方/,
      handler: () => ({
        answer: 'irrelevant',
        confidence: 0.9,
        reason: '请用是/否问题来提问，比如"是在海边吗？"'
      })
    },
    {
      pattern: /多少|几|数量/,
      handler: () => ({
        answer: 'irrelevant',
        confidence: 0.9,
        reason: '请用是/否问题来提问，比如"有多个吗？"'
      })
    }
  ];

  for (const { pattern, handler } of commonPatterns) {
    if (pattern.test(questionLower)) {
      return handler();
    }
  }

  // 如果问题与汤底/汤面关联度很低
  if (matchRatio < 0.1 && scenarioMatchCount === 0) {
    return {
      answer: 'irrelevant',
      confidence: 0.6,
      reason: '这个问题与故事关联不大，建议从汤面的关键信息入手'
    };
  }

  // 默认回答
  return {
    answer: 'yes',
    confidence: 0.5,
    reason: '继续探索吧'
  };
}

/**
 * 格式化答案文本
 */
function formatAnswer(answer: QuestionAnswer, reason: string): string {
  switch (answer) {
    case 'yes':
      return '是';
    case 'no':
      return '否';
    case 'irrelevant':
      return reason;
  }
}

/**
 * 主要的问答函数
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
 */
export function isValidYesNoQuestion(question: string): boolean {
  const invalidPatterns = [
    /为什么|怎么会|如何|怎样/, // 为什么问题
    /是谁|什么人|什么东西|谁在/, // 是谁问题
    /在哪|哪里|什么地方/, // 在哪问题
    /多少|几(个|点|次|天)/, // 多少问题
    /请|告诉我|说说/, // 请求式
  ];

  const questionLower = question.toLowerCase();

  // 如果包含无效模式，不是有效的yes/no问题
  if (invalidPatterns.some(pattern => pattern.test(questionLower))) {
    return false;
  }

  // 必须包含疑问词或疑问语气
  const validQuestionPatterns = [
    /吗[？?]?$/, // 吗结尾
    /吗$/,
    /[？?]$/, // 问号结尾
  ];

  return validQuestionPatterns.some(pattern => pattern.test(question));
}

/**
 * 获取提示问题
 * 根据汤底内容，生成一些引导性的问题
 */
export function getSuggestedQuestions(_scenario: string, _truth: string): string[] {
  // 这里返回一些通用的引导性问题
  // 在实际应用中，可以根据汤底内容生成更具体的问题
  return [
    '这个人的身份有什么特殊之处吗？',
    '汤面中提到的声音是什么？',
    '这个场景是在什么地方？',
    '有其他人物参与吗？',
    '时间有什么特殊意义吗？'
  ];
}
