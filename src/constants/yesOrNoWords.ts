/**
 * Yes or No 游戏词汇库
 * AI从中随机选择一个词作为答案
 */

export interface WordCategory {
  name: string;
  words: string[];
}

export const yesOrNoCategories: WordCategory[] = [
  {
    name: '动物',
    words: [
      '猫', '狗', '鸟', '鱼', '兔子', '乌龟', '大象', '老虎', '狮子', '熊猫',
      '长颈鹿', '斑马', '袋鼠', '考拉', '企鹅', '海豚', '鲸鱼', '鲨鱼', '蛇', '青蛙',
      '鸡', '鸭', '鹅', '羊', '牛', '马', '猪', '猴子', '猩猩', '蝙蝠'
    ]
  },
  {
    name: '植物',
    words: [
      '玫瑰', '牡丹', '荷花', '菊花', '梅花', '樱花', '向日葵', '仙人掌', '竹子', '松树',
      '柳树', '杨树', '枫树', '银杏', '榕树', '苹果树', '桃树', '梨树', '草莓', '西瓜',
      '香蕉', '葡萄', '橙子', '柠檬', '芒果', '菠萝', '椰子', '水稻', '小麦', '玉米'
    ]
  },
  {
    name: '食物',
    words: [
      '米饭', '面条', '饺子', '包子', '馒头', '披萨', '汉堡', '三明治', '寿司', '刺身',
      '火锅', '烧烤', '炸鸡', '薯条', '蛋糕', '饼干', '巧克力', '冰淇淋', '奶茶', '咖啡',
      '豆浆', '油条', '粥', '面条', '炒饭', '沙拉', '牛排', '烤鸭', '烤鱼', '烤串'
    ]
  },
  {
    name: '物品',
    words: [
      '手机', '电脑', '电视', '冰箱', '洗衣机', '空调', '风扇', '台灯', '钟表', '镜子',
      '伞', '书包', '钱包', '钥匙', '锁', '剪刀', '尺子', '橡皮', '铅笔', '钢笔',
      '桌子', '椅子', '床', '沙发', '柜子', '窗户', '门', '杯子', '碗', '盘子'
    ]
  },
  {
    name: '职业',
    words: [
      '医生', '护士', '老师', '警察', '消防员', '司机', '厨师', '服务员', '售货员', '收银员',
      '会计', '律师', '工程师', '程序员', '设计师', '记者', '摄影师', '演员', '歌手', '作家',
      '画家', '音乐家', '运动员', '教练', '裁判', '导游', '翻译', '秘书', '经理', '老板'
    ]
  },
  {
    name: '地点',
    words: [
      '学校', '医院', '银行', '邮局', '图书馆', '博物馆', '动物园', '公园', '广场', '商场',
      '超市', '餐厅', '咖啡厅', '电影院', '剧院', '机场', '火车站', '地铁站', '公交站', '码头',
      '海滩', '山区', '森林', '沙漠', '草原', '岛屿', '城市', '乡村', '小镇', '村庄'
    ]
  },
  {
    name: '运动',
    words: [
      '足球', '篮球', '排球', '网球', '乒乓球', '羽毛球', '高尔夫', '棒球', '游泳', '跳水',
      '跑步', '跳高', '跳远', '举重', '射击', '射箭', '击剑', '拳击', '摔跤', '柔道',
      '瑜伽', '舞蹈', '滑冰', '滑雪', ' surfing', '攀岩', '登山', '骑自行车', '滑板', '轮滑'
    ]
  },
  {
    name: '自然现象',
    words: [
      '太阳', '月亮', '星星', '天空', '云', '雨', '雪', '风', '雷电', '彩虹',
      '雾', '霜', '露水', '冰雹', '龙卷风', '台风', '海啸', '地震', '火山', '山洪',
      '日出', '日落', '日食', '月食', '流星', '极光', '潮汐', '季节', '气候', '天气'
    ]
  }
];

/**
 * 从随机类别中获取一个随机词语
 */
export function getRandomWord(): { word: string; category: string } {
  const randomCategoryIndex = Math.floor(Math.random() * yesOrNoCategories.length);
  const category = yesOrNoCategories[randomCategoryIndex];
  const randomWordIndex = Math.floor(Math.random() * category.words.length);
  const word = category.words[randomWordIndex];

  return { word, category: category.name };
}

/**
 * 从指定类别中获取一个随机词语
 */
export function getRandomWordFromCategory(categoryName: string): string | null {
  const category = yesOrNoCategories.find(cat => cat.name === categoryName);
  if (!category) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * category.words.length);
  return category.words[randomIndex];
}

/**
 * 获取所有类别名称
 */
export function getCategories(): string[] {
  return yesOrNoCategories.map(cat => cat.name);
}

/**
 * 分析问题并返回答案
 * 基于简单的关键词匹配逻辑
 */
export function analyzeYesNoQuestion(question: string, targetWord: string, category: string): {
  answer: 'yes' | 'no';
  confidence: number;
  reason: string;
} {
  const questionLower = question.toLowerCase();
  const targetLower = targetWord.toLowerCase();

  // 检查是否包含目标词
  const hasTargetWord = questionLower.includes(targetLower) || targetLower.includes(questionLower);

  // 类别相关的关键词
  const categoryKeywords: Record<string, string[]> = {
    '动物': ['动物', '生物', '活', '动', '宠物'],
    '植物': ['植物', '花', '草', '树', '蔬菜', '水果'],
    '食物': ['吃', '食物', '喝', '美味', '好吃'],
    '物品': ['东西', '物品', '用品', '工具', '东西'],
    '职业': ['人', '工作', '职业', '做', '干'],
    '地点': ['地方', '地点', '地方', '场所', '位置'],
    '运动': ['运动', '玩', '比赛', '竞技'],
    '自然现象': ['自然', '现象', '天气', '天空', '景象']
  };

  const keywords = categoryKeywords[category] || [];

  // 检查问题是否包含类别相关关键词
  const hasCategoryKeyword = keywords.some(kw => questionLower.includes(kw));

  // 否定词
  const negativeWords = ['不', '没', '无', '非', '否', '不是', '没有'];
  const hasNegative = negativeWords.some(word => questionLower.includes(word));

  // 如果问题中直接包含目标词
  if (hasTargetWord) {
    if (hasNegative) {
      return {
        answer: 'no',
        confidence: 0.9,
        reason: '答案不是这个词'
      };
    } else {
      return {
        answer: 'yes',
        confidence: 0.9,
        reason: '正确！'
      };
    }
  }

  // 如果问题涉及类别
  if (hasCategoryKeyword) {
    if (hasNegative) {
      return {
        answer: 'no',
        confidence: 0.7,
        reason: `确实是${category}`
      };
    } else {
      return {
        answer: 'yes',
        confidence: 0.7,
        reason: `它属于${category}类`
      };
    }
  }

  // 默认策略：根据问题的否定词来决定
  if (hasNegative) {
    return {
      answer: 'no',
      confidence: 0.6,
      reason: '不是这样'
    };
  } else {
    return {
      answer: 'yes',
      confidence: 0.5,
      reason: '继续猜测吧'
    };
  }
}

/**
 * 检查是否是有效的"是/否"问题
 */
export function isValidYesOrNoQuestion(question: string): boolean {
  const invalidPatterns = [
    /是什么|是谁|是哪个/, // 是什么/谁/哪个
    /告诉我|说说|解释/, // 请求说明
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
    /是.*吗/, // 是...吗
  ];

  return validQuestionPatterns.some(pattern => pattern.test(question));
}
