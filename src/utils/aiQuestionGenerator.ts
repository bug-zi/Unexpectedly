/**
 * AI智能问题生成器
 * 使用智谱AI API生成高质量的思考问题
 */

interface GenerateQuestionParams {
  category: string;
  difficulty: number;
  count?: number;
  keywords?: string[];
}

interface GeneratedQuestion {
  content: string;
  suggestedTags: string[];
  difficultyReasoning: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  // 思维维度
  hypothesis: '假设思维',
  reverse: '逆向思考',
  creative: '联想创意',
  reflection: '自我反思',
  future: '未来设想',
  // 生活场景
  career: '职业发展',
  'scenario-creative': '创意激发',
  relationship: '人际关系',
  learning: '学习成长',
  philosophy: '生活哲学',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '很简单（轻松入手，容易回答）',
  2: '简单（有一定思考空间）',
  3: '中等（需要深入思考）',
  4: '困难（挑战性较强）',
  5: '很困难（极具挑战性）',
};

/**
 * 生成问题提示词
 */
function buildPrompt(params: GenerateQuestionParams): string {
  const { category, difficulty, count = 1, keywords = [] } = params;
  const categoryName = CATEGORY_NAMES[category] || category;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];

  let prompt = `你是一个专业的问题设计专家，擅长创作能激发深度思考的问题。

请根据以下要求生成${count}个问题：

**思维维度：**${categoryName}
**难度等级：**${difficultyLabel}
${keywords.length > 0 ? `**关键词提示：**${keywords.join('、')}\n` : ''}

**要求：**
1. 问题应该是开放式的，避免是非题
2. 问题要有启发性，能引发深入思考
3. 保持中立，避免引导性
4. 长度适中，20-50字为佳
5. 可以留有想象空间，让回答者自行发挥
6. ${getCategorySpecificGuidance(category)}

**输出格式（JSON）：**
\`\`\`json
{
  "questions": [
    {
      "content": "问题内容",
      "suggestedTags": ["标签1", "标签2", "标签3"],
      "difficultyReasoning": "为什么这个问题符合该难度等级的简短说明"
    }
  ]
}
\`\`\`

请只返回JSON格式的结果，不要包含其他内容。`;

  return prompt;
}

/**
 * 获取特定类别的设计指导
 */
function getCategorySpecificGuidance(category: string): string {
  const guidance: Record<string, string> = {
    // 思维维度
    hypothesis: '假设思维应该以"如果..."开头，设置想象情境',
    reverse: '逆向思考应该问"如何故意..."来反向思考问题',
    creative: '联想创意应该是"A + B = ？"的形式，或结合两个看似无关的概念',
    reflection: '自我反思应该关注个人内心世界、价值观、感受和成长',
    future: '未来设想应该关注时间维度（5年、10年）和长远目标',
    // 生活场景
    career: '职业发展应该关注工作、技能、成长、职业选择和职场关系',
    'scenario-creative': '创意激发应该鼓励非常规思考、创新想法和突破常规的想象力',
    relationship: '人际关系应该关注朋友、家人、伴侣、社交、沟通和情感连接',
    learning: '学习成长应该关注技能获取、知识学习、个人发展和自我提升',
    philosophy: '生活哲学应该探讨人生意义、价值观、幸福和生活态度',
  };
  return guidance[category] || '';
}

/**
 * 调用智谱AI API生成问题
 */
export async function generateQuestionsWithAI(
  params: GenerateQuestionParams
): Promise<GeneratedQuestion[]> {
  const apiKey = import.meta.env.VITE_GLM_API_KEY;

  if (!apiKey) {
    throw new Error('未配置智谱AI API Key，请在.env文件中设置VITE_GLM_API_KEY');
  }

  try {
    const prompt = buildPrompt(params);

    // 智谱AI API调用
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash', // 使用快速模型，成本更低
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8, // 较高的创造性
        top_p: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // 提取生成的内容
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI返回的内容为空');
    }

    // 解析JSON响应
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('无法从AI响应中提取JSON');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('AI返回的数据格式不正确');
    }

    return parsed.questions;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI返回的内容格式错误，请重试');
    }
    throw error;
  }
}

/**
 * AI优化现有问题
 */
export async function optimizeQuestionWithAI(questionContent: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GLM_API_KEY;

  if (!apiKey) {
    throw new Error('未配置智谱AI API Key，请在.env文件中设置VITE_GLM_API_KEY');
  }

  try {
    const prompt = `请优化以下问题，使其更具启发性和思考深度，同时保持原意：

原问题：${questionContent}

要求：
1. 保持开放性
2. 增强启发性
3. 20-50字之间
4. 只返回优化后的问题内容，不要其他解释`;

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('AI返回的内容为空');
    }

    return content;
  } catch (error) {
    throw error;
  }
}
