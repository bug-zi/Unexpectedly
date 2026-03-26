/**
 * 知识科普数据常量
 */

export interface KnowledgeItem {
  title: string;
  content: string;
  category?: string;
}

export interface KnowledgeModule {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  gradient: string;
  items: KnowledgeItem[];
}

// 世界之最数据
export const worldRecordsData: KnowledgeItem[] = [
  {
    title: "世界上最高的山峰",
    content: "珠穆朗玛峰海拔8848.86米，是世界最高峰。它位于中国和尼泊尔边境，每年都在以约4毫米的速度生长。"
  },
  {
    title: "世界上最大的沙漠",
    content: "南极沙漠是世界上最大的沙漠，面积约1400万平方公里。虽然被冰雪覆盖，但年降水量极低，符合沙漠定义。"
  },
  {
    title: "世界上最长的河流",
    content: "尼罗河全长约6650公里，是世界最长河流。它流经非洲东北部，孕育了古埃及文明。亚马逊河虽然长度第二，但流量最大。"
  },
  {
    title: "世界上最深的海洋",
    content: "太平洋马里亚纳海沟的挑战者深渊，深达11034米，是地球已知最深点。如果将珠穆朗玛峰放入其中，山顶仍距海面2000多米。"
  },
  {
    title: "世界上最大的哺乳动物",
    content: "蓝鲸是地球历史上已知最大的动物，长达30米，重达170吨。它的心脏有一辆小汽车那么大，主动脉可以让一个人爬过。"
  },
  {
    title: "世界上最小的国家",
    content: "梵蒂冈面积仅0.44平方公里，人口约800人。它是天主教会总部，拥有自己的军队、邮局和电台，是世界上最小的主权国家。"
  },
  {
    title: "世界上最大的湖泊",
    content: "里海面积达371000平方公里，是世界最大的湖泊（咸水湖）。它位于欧洲和亚洲之间，实际上是一个内陆海。"
  },
  {
    title: "世界上运行最快的动物",
    content: "猎豹在短距离冲刺时可达120公里/小时，从0加速到100公里/小时仅需3秒，比大多数跑车还快。"
  },
  {
    title: "世界上最大的生物",
    content: "美国俄勒冈州的奥勒蜜蘑菇占地约9平方公里，重约6000吨，已存活2400多年，是地球上最大的已知生物体。"
  },
  {
    title: "世界上最古老的树",
    content: "瑞典的老吉克云杉树龄约9500年，是世界上已知最古老的树木。它的根系虽古老，但树干相对年轻。"
  }
];

// 系统思维数据 - 多学科知识
export const systemsThinkingData: KnowledgeItem[] = [
  // 心理学
  {
    title: "认知失调（心理学）",
    content: "当人的信念与行为冲突时，会产生不适感，促使人改变信念或行为来缓解。这解释了为什么我们即使错了也难以承认。",
    category: "心理学"
  },
  {
    title: "镜像神经元（心理学/神经科学）",
    content: "这类神经元在我们观察他人行为时会激活，帮助我们理解和模仿。它是同理心和学习的神经基础。",
    category: "心理学"
  },
  // 社会学
  {
    title: "社会网络理论（社会学）",
    content: "每个人之间平均只隔着6个人。这个六度分隔理论揭示了现代社会的紧密连接和信息传播的强大力量。",
    category: "社会学"
  },
  {
    title: "马太效应（社会学）",
    content: "凡有的，还要加给他；凡没有的，连他所有的也要夺走。优势会累积，导致贫富差距和资源分配不均越来越严重。",
    category: "社会学"
  },
  // 科学
  {
    title: "混沌理论（科学/数学）",
    content: "复杂系统中，微小变化可能引发巨大影响。著名的蝴蝶效应：巴西的一只蝴蝶扇动翅膀，可能在德克萨斯引发龙卷风。",
    category: "科学"
  },
  {
    title: "临界点（科学/系统论）",
    content: "系统在达到临界点后会突然改变状态。如水达到100℃沸腾，生态系统被破坏到一定程度会崩溃。认识临界点有助于预防灾难。",
    category: "科学"
  },
  // 数学
  {
    title: "幂律分布（数学/统计学）",
    content: "在许多系统中，少数元素占据大部分资源。如20%的人掌握80%的财富，少数词汇占据文本的大部分。理解它能优化资源分配。",
    category: "数学"
  },
  {
    title: "博弈论（数学/经济学）",
    content: "研究决策主体在策略互动中的选择。囚徒困境说明个体理性决策可能导致集体非理性，合作需要信任和机制设计。",
    category: "数学"
  },
  // 哲学
  {
    title: "第一性原理（哲学/思维）",
    content: "追溯到事物最基本的真理，然后从零开始推理。埃隆·马斯克用此方法打破常规，在电动车和航天领域实现突破。",
    category: "哲学"
  },
  {
    title: "奥卡姆剃刀（哲学/科学方法）",
    content: "如无必要，勿增实体。在解释现象时，最简单的解释往往最可能是正确的。这提醒我们避免不必要的复杂化。",
    category: "哲学"
  },
  // 医学
  {
    title: "安慰剂效应（医学/心理学）",
    content: "相信治疗有效就能改善症状，展示了大脑对身体的强大控制力。这提醒我们信念和心态在健康中的重要作用。",
    category: "医学"
  },
  {
    title: "睡眠记忆巩固（医学/神经科学）",
    content: "睡眠时，大脑会整理和巩固白天的记忆。睡眠不足会严重影响学习能力、情绪和判断力。充分睡眠是高效学习的基础。",
    category: "医学"
  }
];

// 健康主理数据
export const healthKnowledgeData: KnowledgeItem[] = [
  {
    title: "睡眠的重要性",
    content: "成年人需要7-9小时睡眠。睡眠不足会增加患心脏病、糖尿病、抑郁症的风险，降低免疫力和认知能力。规律作息是健康的基础。"
  },
  {
    title: "运动指南",
    content: "每周至少150分钟中等强度有氧运动，或75分钟高强度运动。加上每周2次力量训练。运动不仅强身，还能改善情绪和认知功能。"
  },
  {
    title: "均衡饮食",
    content: "遵循餐盘法：一半蔬菜水果，四分之一全谷物，四分之一蛋白质。限制加工食品、添加糖和饱和脂肪。食物多样是营养均衡的关键。"
  },
  {
    title: "水分补充",
    content: "每天约需要2-3升水（包括食物中的水）。口渴已经是轻度脱水的信号。轻微脱水就会影响注意力和体能，定时饮水比口渴再喝更好。"
  },
  {
    title: "心血管健康",
    content: "高血压是沉默杀手，往往没有明显症状。每年检查血压，维持健康血压（低于120/80）可大幅降低心脏病和中风风险。"
  },
  {
    title: "心理健康",
    content: "焦虑和抑郁是常见问题，寻求帮助是强者的表现。正念冥想、规律运动、社交连接都能改善心理健康。必要时不要犹豫寻求专业帮助。"
  },
  {
    title: "防晒的重要性",
    content: "紫外线累积损伤皮肤，导致光老化和皮肤癌。每天使用SPF30+防晒，避免正午阳光，能显著降低皮肤癌风险和延缓衰老。"
  },
  {
    title: "口腔健康",
    content: "口腔健康与全身健康密切相关。牙龈疾病可能增加心脏病、糖尿病风险。每天刷牙两次，使用牙线，定期看牙医是必要的。"
  },
  {
    title: "久坐危害",
    content: "久坐是新型吸烟。即使每天运动，久坐仍会增加疾病风险。每坐30分钟起身活动几分钟，能显著改善健康指标。"
  },
  {
    title: "酒精适量",
    content: "过量饮酒损害肝脏、大脑和心血管。最新研究认为，即使适量饮酒也有健康风险。不饮酒或严格限制是最健康的选择。"
  },
  {
    title: "压力管理",
    content: "慢性压力会削弱免疫系统、影响睡眠和情绪。学会识别压力信号，通过运动、冥想、爱好或社交来管理压力，是长期健康的关键。"
  },
  {
    title: "预防性体检",
    content: "定期体检能及早发现潜在问题。根据年龄和风险因素，定期检查血压、血糖、胆固醇，以及相关癌症筛查，预防胜于治疗。"
  }
];

// 三个模块配置
export const knowledgeModules: KnowledgeModule[] = [
  {
    id: 'world-records',
    title: '世界之最',
    description: '探索世界纪录和极限，了解地球的奇迹',
    path: '/knowledge-popularize/world-records',
    icon: 'Trophy',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    items: worldRecordsData
  },
  {
    id: 'systems-thinking',
    title: '系统思维',
    description: '多学科知识体系，理解复杂世界的运作规律',
    path: '/knowledge-popularize/systems-thinking',
    icon: 'Network',
    color: 'green',
    gradient: 'from-emerald-500 to-teal-500',
    items: systemsThinkingData
  },
  {
    id: 'health-management',
    title: '健康主理',
    description: '重要健康知识普及，科学管理身体健康',
    path: '/knowledge-popularize/health-management',
    icon: 'HeartPulse',
    color: 'green',
    gradient: 'from-teal-500 to-green-500',
    items: healthKnowledgeData
  }
];
