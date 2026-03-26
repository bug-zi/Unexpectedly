/**
 * 谜语游戏数据
 */

export interface Riddle {
  id: string;
  category: string;
  difficulty: '简单' | '中等' | '困难';
  question: string;
  answer: string;
  hints: string[];
}

export const riddles: Riddle[] = [
  {
    id: 'riddle-1',
    category: '动物',
    difficulty: '简单',
    question: '耳朵像蒲扇，身子像小山，鼻子长又长，帮人把活干。',
    answer: '大象',
    hints: ['一种大型动物', '有长鼻子', '可以帮助人类干活']
  },
  {
    id: 'riddle-2',
    category: '物品',
    difficulty: '简单',
    question: '独木造高楼，没瓦没砖头，人在水下走，水在人上流。',
    answer: '雨伞',
    hints: ['下雨时常用', '可以遮雨', '一个人使用']
  },
  {
    id: 'riddle-3',
    category: '自然',
    difficulty: '中等',
    question: '有时挂在天边，有时挂在树梢，有时像个圆盘，有时像把镰刀。',
    answer: '月亮',
    hints: ['天上的东西', '形状会变化', '晚上出现']
  },
  {
    id: 'riddle-4',
    category: '物品',
    difficulty: '中等',
    question: '身穿绿衣裳，肚里红壤壤，生的子儿多，个个黑脸膛。',
    answer: '西瓜',
    hints: ['一种水果', '夏天常见', '里面是红色的']
  },
  {
    id: 'riddle-5',
    category: '动物',
    difficulty: '困难',
    question: '头戴红帽子，身穿五彩衣，从来不唱戏，喜欢吊嗓子。',
    answer: '公鸡',
    hints: ['家禽', '早上会叫', '有红冠']
  },
  {
    id: 'riddle-6',
    category: '物品',
    difficulty: '简单',
    question: '有脚不会走，有嘴不开口，脸儿圆又光，说话滴答响。',
    answer: '钟表',
    hints: ['日常用品', '显示时间', '会发出声音']
  },
  {
    id: 'riddle-7',
    category: '自然',
    difficulty: '中等',
    question: '云儿见它让路，小树见它招手，禾苗见它弯腰，花儿见它点头。',
    answer: '风',
    hints: ['看不见摸不着', '能吹动东西', '自然界的一种现象']
  },
  {
    id: 'riddle-8',
    category: '物品',
    difficulty: '困难',
    question: '像糖不是糖，有圆也有方，帮你改错字，自己怕脏脏。',
    answer: '橡皮',
    hints: ['学习用品', '可以擦除字迹', '会变脏']
  },
  {
    id: 'riddle-9',
    category: '动物',
    difficulty: '简单',
    question: '身披花棉袄，唱歌吱吱叫，田里捉害虫，丰收立功劳。',
    answer: '青蛙',
    hints: ['两栖动物', '会跳', '吃害虫']
  },
  {
    id: 'riddle-10',
    category: '物品',
    difficulty: '中等',
    question: '小小一间房，只有一扇窗，唱歌又演戏，天天翻花样。',
    answer: '电视机',
    hints: ['家用电器', '有屏幕', '可以看节目']
  },
  {
    id: 'riddle-11',
    category: '自然',
    difficulty: '困难',
    question: '千条线，万条线，掉到水里看不见。',
    answer: '雨',
    hints: ['从天上掉下来', '水的一种形态', '打湿地面']
  },
  {
    id: 'riddle-12',
    category: '动物',
    difficulty: '中等',
    question: '叫猫不是猫，眼戴太阳镜，竹子是粮食，珍贵又稀少。',
    answer: '熊猫',
    hints: ['国宝', '黑白相间', '喜欢吃竹子']
  },
  {
    id: 'riddle-13',
    category: '物品',
    difficulty: '简单',
    question: '你也长，我也长，刀儿砍，斧儿忙，只有不砍不长，一砍就长得长。',
    answer: '头发',
    hints: ['人体的一部分', '会不断生长', '需要定期修剪']
  },
  {
    id: 'riddle-14',
    category: '自然',
    difficulty: '困难',
    question: '天上一只鸟，用线拴得牢，不怕大风吹，就怕细雨飘。',
    answer: '风筝',
    hints: ['需要线牵着', '在天上飞', '春天常见']
  },
  {
    id: 'riddle-15',
    category: '物品',
    difficulty: '中等',
    question: '看看没有，摸摸倒有，像冰不化，像水不流。',
    answer: '镜子',
    hints: ['日常用品', '可以看到自己', '表面光滑']
  }
];

export function getRandomRiddle(): Riddle {
  const randomIndex = Math.floor(Math.random() * riddles.length);
  return riddles[randomIndex];
}

export function getRiddleById(id: string): Riddle | undefined {
  return riddles.find(riddle => riddle.id === id);
}

export function getRiddlesByDifficulty(difficulty: Riddle['difficulty']): Riddle[] {
  return riddles.filter(riddle => riddle.difficulty === difficulty);
}

export function getRiddlesByCategory(category: string): Riddle[] {
  return riddles.filter(riddle => riddle.category === category);
}

/**
 * 检查答案是否正确
 * 支持模糊匹配和同义词
 */
export function checkRiddleAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => {
    return str.trim().toLowerCase().replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, '');
  };

  const normalizedUserAnswer = normalize(userAnswer);
  const normalizedCorrectAnswer = normalize(correctAnswer);

  // 完全匹配
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return true;
  }

  // 包含正确答案（例如：答案是"大象"，用户回答"是大象"）
  if (normalizedUserAnswer.includes(normalizedCorrectAnswer) || normalizedCorrectAnswer.includes(normalizedUserAnswer)) {
    return true;
  }

  return false;
}

/**
 * 获取相似度评分（用于提示用户答案的接近程度）
 */
export function getAnswerSimilarity(userAnswer: string, correctAnswer: string): number {
  const normalize = (str: string) => {
    return str.trim().toLowerCase().replace(/[，。！？、；：""''（）《》\s,\.!\?;:"'\(\)\[\]]/g, '');
  };

  const normalizedUserAnswer = normalize(userAnswer);
  const normalizedCorrectAnswer = normalize(correctAnswer);

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return 100;
  }

  if (normalizedUserAnswer.includes(normalizedCorrectAnswer) || normalizedCorrectAnswer.includes(normalizedUserAnswer)) {
    return 80;
  }

  // 计算字符相似度
  let commonChars = 0;
  const longer = normalizedUserAnswer.length > normalizedCorrectAnswer.length ? normalizedUserAnswer : normalizedCorrectAnswer;
  const shorter = normalizedUserAnswer.length > normalizedCorrectAnswer.length ? normalizedCorrectAnswer : normalizedUserAnswer;

  for (const char of shorter) {
    if (longer.includes(char)) {
      commonChars++;
    }
  }

  return Math.round((commonChars / longer.length) * 100);
}
