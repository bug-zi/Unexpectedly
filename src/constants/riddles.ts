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
    category: '字谜',
    difficulty: '简单',
    question: '上面正差一横，下面少去一点，合起一个字，把你迷半天。',
    answer: '步',
    hints: ['与"行走"有关', '上面是"止"的变形', '常见于"跑步"']
  },
  {
    id: 'riddle-2',
    category: '字谜',
    difficulty: '简单',
    question: '有心办坏事，无心反成全，若要去心字，只能走半天。',
    answer: '悔',
    hints: ['与心理活动有关', '去掉心字旁是"每"', '常见于"后悔"']
  },
  {
    id: 'riddle-3',
    category: '字谜',
    difficulty: '中等',
    question: '一个人站在山旁边，猜一个字。',
    answer: '仙',
    hints: ['人 + 山', '与神话有关', '常见于"仙人"']
  },
  {
    id: 'riddle-4',
    category: '脑筋急转弯',
    difficulty: '简单',
    question: '什么东西越洗越脏？',
    answer: '水',
    hints: ['它本身是用来清洁的', '洗完东西后它自身会变浑浊', '液体']
  },
  {
    id: 'riddle-5',
    category: '脑筋急转弯',
    difficulty: '简单',
    question: '什么东西有头无脚，有尾无手，却能在地上留下痕迹？',
    answer: '蛇',
    hints: ['一种爬行动物', '没有四肢', '会蜕皮']
  },
  {
    id: 'riddle-6',
    category: '脑筋急转弯',
    difficulty: '中等',
    question: '两个人一起走，一个向东一个向西，但他们之间的距离没有变。为什么？',
    answer: '他们背对背站在旋转木马上',
    hints: ['他们脚下的东西在动', '不需要自己走路', '一种娱乐设施']
  },
  {
    id: 'riddle-7',
    category: '逻辑推理',
    difficulty: '中等',
    question: '房间里有三盏灯，门外有三个开关分别控制它们。你只能进房间一次，如何判断哪个开关控制哪盏灯？',
    answer: '先打开第一个开关等几分钟，然后关掉第一个、打开第二个，进房间。亮的灯对应第二个开关，摸起来热但不亮的灯对应第一个开关，冷且不亮的灯对应第三个开关',
    hints: ['除了"亮与不亮"，灯还有另一种可感知的状态', '利用热学原理', '答案是利用温度区分']
  },
  {
    id: 'riddle-8',
    category: '逻辑推理',
    difficulty: '困难',
    question: '你面前有两扇门，一扇通向自由，一扇通向死亡。门前各站一个守卫，一个永远说真话，一个永远说谎。你只能向其中一个守卫问一个问题。如何找到通向自由的门？',
    answer: '问任意一个守卫"如果我问另一个守卫哪扇门通向自由，他会指哪扇？"然后走他指的相反的那扇门',
    hints: ['不要问"哪扇门通向自由"，因为你不确定谁是诚实人', '试着设计一个问题，让真假两次传递后必然说谎', '关键在于让两个守卫的特性相互抵消']
  },
  {
    id: 'riddle-9',
    category: '逻辑推理',
    difficulty: '困难',
    question: '有三个箱子，分别标着"苹果""橘子""苹果和橘子"。但所有标签都是错的。你只能从一个箱子里取出一个水果来判断。如何确定三个箱子的正确内容？',
    answer: '从标着"苹果和橘子"的箱子里取一个水果。因为标签都是错的，所以这个箱子一定是纯苹果或纯橘子。取出一个就能知道这个箱子的内容，然后用排除法确定另外两个',
    hints: ['所有标签都是错的，这是最重要的线索', '从混合标签的箱子入手', '这个箱子里一定只有一种水果']
  },
  {
    id: 'riddle-10',
    category: '诗词',
    difficulty: '中等',
    question: '什么花不结果？什么果不开花？什么水不结冰？什么冰不化？',
    answer: '浪花不结果，无花果不开花，薪水不结冰，干冰不化（升华）',
    hints: ['"花"不一定指植物的花', '"果"不一定指植物的果', '"冰"不一定指水结的冰']
  },
  {
    id: 'riddle-11',
    category: '诗词',
    difficulty: '中等',
    question: '"千山鸟飞绝，万径人踪灭"——诗人用极端的孤独写了什么场景？谜底是一个字。',
    answer: '孤',
    hints: ['这首诗是柳宗元的《江雪》', '全诗四句的首字连起来是"千万孤独"', '谜底就在诗中']
  },
  {
    id: 'riddle-12',
    category: '诗词',
    difficulty: '困难',
    question: '诗人写"春蚕到死丝方尽"，表面上写的是蚕，实际上写的是什么？猜一个字。',
    answer: '情',
    hints: ['这是李商隐的诗句', '"丝"谐音"思"', '写的是思念之情']
  },
  {
    id: 'riddle-13',
    category: '科学',
    difficulty: '中等',
    question: '我在地球上重60公斤，在月球上只有10公斤，但我在哪里都一样重。我是什么？',
    answer: '质量',
    hints: ['质量和重量是不同的物理概念', '重量会随引力变化，而这个不会', '它的单位是千克']
  },
  {
    id: 'riddle-14',
    category: '科学',
    difficulty: '困难',
    question: '我比光速慢，但没有我什么都看不见。我能让粒子同时出现在两个地方。我是什么？',
    answer: '观察（或观测/测量）',
    hints: ['与量子力学有关', '双缝实验的关键变量', '薛定谔的猫在被看之前处于叠加态']
  },
  {
    id: 'riddle-15',
    category: '哲学',
    difficulty: '困难',
    question: '我是所有问题的终极答案，但没有人能理解我。在《银河系漫游指南》中，超级计算机花了750万年算出了我。我是什么？',
    answer: '42',
    hints: ['这是一部科幻小说中的梗', '作者道格拉斯·亚当斯创造了我', '我是一个数字']
  },
  {
    id: 'riddle-16',
    category: '字谜',
    difficulty: '中等',
    question: '左边绿，右边红，左右相遇起凉风。绿的喜欢及时雨，红的最怕水来攻。',
    answer: '秋',
    hints: ['左边是"禾"（绿色的庄稼）', '右边是"火"（红色）', '一个季节']
  },
  {
    id: 'riddle-17',
    category: '字谜',
    difficulty: '中等',
    question: '一口咬掉牛尾巴，猜一个字。',
    answer: '告',
    hints: ['"牛"去掉底部一笔', '上面加一个"口"', '常见于"告诉"']
  },
  {
    id: 'riddle-18',
    category: '字谜',
    difficulty: '困难',
    question: '人在草木中，猜一个字。',
    answer: '茶',
    hints: ['上面是草字头', '中间是"人"', '下面是"木"']
  },
  {
    id: 'riddle-19',
    category: '字谜',
    difficulty: '困难',
    question: '三水又三水，三水叠一起，你若猜不出，打你三棍子。',
    answer: '淼',
    hints: ['三个"水"字叠在一起', '形容水很大的样子', '读音同"渺"']
  },
  {
    id: 'riddle-20',
    category: '字谜',
    difficulty: '简单',
    question: '一人一张口，口下长只手，猜一个字。',
    answer: '拿',
    hints: ['上面是"合"（人+一+口）', '下面是"手"', '常见于"拿取"']
  },
  {
    id: 'riddle-21',
    category: '脑筋急转弯',
    difficulty: '中等',
    question: '有一个人被困在密闭房间里，只有一扇门，门外有一只饿狮。房间里有一张桌子。他该怎么逃脱？',
    answer: '停下来，把桌子上的"table"去掉"t"变成"able"——这是个文字游戏，答案是他只需要等狮子睡着再走（或者说这只是个脑筋急转弯，没有标准答案）',
    hints: ['这是一道开放性脑筋急转弯', '狮子不可能一直不睡觉', '密闭房间的定义可能需要重新审视']
  },
  {
    id: 'riddle-22',
    category: '脑筋急转弯',
    difficulty: '简单',
    question: '什么人一年只工作一天？',
    answer: '圣诞老人',
    hints: ['和节日有关', '穿红衣服', '会送礼物']
  },
  {
    id: 'riddle-23',
    category: '脑筋急转弯',
    difficulty: '中等',
    question: '一条河上有座独木桥，只能一个人通过。南边来了一个向南走的，北边来了一个向北走的，他们同时过桥却没有碰撞。为什么？',
    answer: '他们是同一方向的，只是从桥的两端同时上桥而已——但真正的答案是：他们面对着走，走过去之后各自转身就到了对面。或者说：他们本来就在桥的两端，各走各的方向，不会碰撞',
    hints: ['仔细想想他们的行进方向', '独木桥可以同时容纳两个人吗？', '其实他们走的方向不冲突']
  },
  {
    id: 'riddle-24',
    category: '脑筋急转弯',
    difficulty: '中等',
    question: '什么东西你可以在不打破它的情况下把它切成两半，但切完后它仍然是完整的？',
    answer: '水',
    hints: ['它没有固定形状', '分成两份后每份还是同一种物质', '液体']
  },
  {
    id: 'riddle-25',
    category: '脑筋急转弯',
    difficulty: '困难',
    question: '一个人走进酒吧要一杯水，酒保拿出枪对着他。那人说"谢谢"就走了。为什么？',
    answer: '那个人打嗝不止，想喝水止嗝。酒保看出来了，用枪吓他一跳，嗝就止住了',
    hints: ['他要水不是为了解渴', '酒保是在帮他', '惊吓可以治这种症状']
  },
  {
    id: 'riddle-26',
    category: '脑筋急转弯',
    difficulty: '困难',
    question: '一个男人被发现在田野里死了，身边有一个未打开的包裹。周围没有任何人和交通工具的痕迹。他是怎么死的？',
    answer: '降落伞没有打开——那个未打开的包裹就是他的降落伞',
    hints: ['他是从天上来的', '那个"包裹"本应该打开', '极限运动出了事故']
  },
  {
    id: 'riddle-27',
    category: '逻辑推理',
    difficulty: '简单',
    question: '一个农夫要带一只狼、一只羊和一棵白菜过河，船每次只能带一样东西。狼会吃羊，羊会吃白菜。他最少要渡几次河？',
    answer: '7次（带羊过→回→带狼过→带羊回→带白菜过→回→带羊过）',
    hints: ['先带羊过去', '狼和白菜可以单独留在一边', '中间需要把羊带回来一次']
  },
  {
    id: 'riddle-28',
    category: '逻辑推理',
    difficulty: '中等',
    question: '你有8个外观相同的球，其中一个比其他的重。用天平最少称几次能找出它？',
    answer: '2次。分成3、3、2三组。先称3vs3：若平衡，重的在剩下的2个中，再称一次即可；若不平衡，从重的那3个中取2个称，平衡则第3个是重的，不平衡则重的那个就是',
    hints: ['分成三组而不是两组', '第一次称完后可以排除大部分', '每次称量信息量是3种结果']
  },
  {
    id: 'riddle-29',
    category: '逻辑推理',
    difficulty: '中等',
    question: '三个人戴帽子，帽子非黑即白。A能看到B和C的帽子，B能看到C的帽子，C看不到任何人的。A说"我不知道自己什么颜色"，B也说不知道，C却说自己知道了。C的帽子是什么颜色？',
    answer: '白色。因为A看到B和C不是全黑，B看到C不是黑色（否则B就知道自己是白色），所以C推断自己是白色',
    hints: ['从A的话推理：B和C不全是黑色', '从B的话推理：C不是黑色', '排除法']
  },
  {
    id: 'riddle-30',
    category: '逻辑推理',
    difficulty: '困难',
    question: '岛上的人要么只说真话要么只说假话。你遇到A、B、C三人。A说"B和C都是说谎者。"B说"A和C都是说谎者。"C说"A和B都是说谎者。"问：谁在说真话？',
    answer: '没有人说真话——但如果只有两种人，正确答案是：没有答案（这是悖论）。实际解析：若A说真话，则B、C都说谎，那B说"A和C都是说谎者"是假话，意味着A和C不都说谎，但A说真话成立，C确实说谎也成立，所以B的话确实是假话。类似分析后，最多只能有一个人说真话，且答案是A说真话',
    hints: ['如果一个人说真话，他说另外两人都说谎', '试试假设每个人说真话的情况', '逐一验证是否存在矛盾']
  },
  {
    id: 'riddle-31',
    category: '逻辑推理',
    difficulty: '困难',
    question: '100个囚犯排成一列，每人戴黑或白帽子。每个囚犯能看到前面所有人的帽子（看不到自己和后面人的）。从最后一个人开始猜自己帽子的颜色，猜错就处死。他们可以事先商量策略。最多能救几个人？',
    answer: '99人。策略：最后一个人数前面所有人中黑帽子的数量，如果是奇数就说"黑"，偶数就说"白"。他自己的生死不确定，但倒数第二个人可以根据奇偶变化推断自己的帽子颜色，以此类推',
    hints: ['最后一个人可以牺牲自己来传递信息', '他只需要传递一个二进制信息', '利用奇偶性编码']
  },
  {
    id: 'riddle-32',
    category: '诗词',
    difficulty: '简单',
    question: '"墙角数枝梅，凌寒独自开"——诗人借梅花写的是什么品质？',
    answer: '坚韧（或坚强/不屈/傲骨）',
    hints: ['梅花在冬天盛开', '写的不是花本身', '一种面对困境的态度']
  },
  {
    id: 'riddle-33',
    category: '诗词',
    difficulty: '中等',
    question: '"停车坐爱枫林晚，霜叶红于二月花"——诗中的"坐"是什么意思？',
    answer: '因为',
    hints: ['"坐"在这里不是"坐下"', '是一个古汉语虚词', '意思是"由于、因为"']
  },
  {
    id: 'riddle-34',
    category: '诗词',
    difficulty: '困难',
    question: '哪位诗人被称为"诗鬼"？他的名句"黑云压城城欲摧"描写的是什么场景？',
    answer: '李贺，描写的是战争（军队压境）的场景',
    hints: ['这位诗人英年早逝', '诗风诡异浪漫', '与"诗仙""诗圣"齐名']
  },
  {
    id: 'riddle-35',
    category: '诗词',
    difficulty: '困难',
    question: '"众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。"辛弃疾这首词表面上写的是上元节寻人，实际上写的是什么？',
    answer: '孤高不群的品格（或不愿随波逐流的独立人格）',
    hints: ['"那人"不是指具体的某个人', '其他人都去了热闹的地方', '灯火阑珊处是冷清的地方']
  },
  {
    id: 'riddle-36',
    category: '科学',
    difficulty: '简单',
    question: '什么东西可以充满整个房间，却完全不会占用任何空间？',
    answer: '光',
    hints: ['打开开关就有了', '它不是实体物质', '速度极快']
  },
  {
    id: 'riddle-37',
    category: '科学',
    difficulty: '简单',
    question: '你用手碰不到它，用刀切不开它，但它能把你压垮。它是什么？',
    answer: '空气（或大气压）',
    hints: ['无处不在', '有压力但看不见', '你每时每刻都在它里面']
  },
  {
    id: 'riddle-38',
    category: '科学',
    difficulty: '中等',
    question: '我是唯一一种固态密度比液态小的常见物质。我凝固时体积反而变大。我是谁？',
    answer: '水',
    hints: ['冰浮在表面就是因为这个原因', '这种反常膨胀对地球生命至关重要', '冰的密度是0.917 g/cm³']
  },
  {
    id: 'riddle-39',
    category: '科学',
    difficulty: '中等',
    question: '我诞生于恒星内部，在超新星爆发中被抛向宇宙。你现在身体里的每一个原子，曾经都是我的一部分。我是什么？',
    answer: '星尘（或恒星物质）',
    hints: ['卡尔·萨根说过"我们都是星尘"', '人体中的碳、铁等元素来自这里', '比地球更古老']
  },
  {
    id: 'riddle-40',
    category: '科学',
    difficulty: '困难',
    question: '我是一堵墙，但不是实体的墙。宇宙中没有任何力量能穿透我。在我之内是已知的物理定律，在我之外一切都不确定。我是什么？',
    answer: '事件视界（黑洞的边界）',
    hints: ['与黑洞有关', '连光都无法逃脱', '霍金研究过我的量子效应']
  },
  {
    id: 'riddle-41',
    category: '哲学',
    difficulty: '简单',
    question: '如果你把一艘船的零件全部替换一遍，它还是原来那艘船吗？这是哪个著名哲学悖论？',
    answer: '忒修斯之船',
    hints: ['以一位希腊英雄命名', '关于"同一性"的问题', '身份的本质是什么']
  },
  {
    id: 'riddle-42',
    category: '哲学',
    difficulty: '中等',
    question: '"我思故我在"这句话的作者是谁？他用这句话要证明什么？',
    answer: '笛卡尔，证明"自我"的存在（怀疑一切之后，唯一不能怀疑的就是"我在怀疑"这件事本身）',
    hints: ['17世纪法国哲学家', '方法论怀疑的创始人', '拉丁文是Cogito ergo sum']
  },
  {
    id: 'riddle-43',
    category: '哲学',
    difficulty: '中等',
    question: '一个疯子在轨道上绑了五个人，另一条轨道上绑了一个人。火车正冲向五个人，你可以拉动拉杆让火车转向一个人。拉还是不拉？这是哪个思想实验？',
    answer: '电车难题（Trolley Problem）',
    hints: ['关于功利主义与道德义务论的冲突', '菲利帕·福特提出', '没有标准答案']
  },
  {
    id: 'riddle-44',
    category: '哲学',
    difficulty: '困难',
    question: '"存在先于本质"是谁的核心观点？这句话是什么意思？',
    answer: '萨特（存在主义），意思是人先存在，然后通过自己的选择来定义自己的本质——人没有预设的目的或意义',
    hints: ['法国存在主义哲学家', '与"本质先于存在"对立', '强调人的自由与责任']
  },
  {
    id: 'riddle-45',
    category: '哲学',
    difficulty: '困难',
    question: '如果你是一个被关在缸中的大脑，所有感觉都是电脑模拟的，你如何证明自己不是？这是哪个思想实验？',
    answer: '缸中之脑（Brain in a Vat），由希拉里·普特南提出，无法完全证明',
    hints: ['与《黑客帝国》的设定类似', '笛卡尔的"恶魔欺骗"是其前身', '关于认识论的终极怀疑']
  },
  {
    id: 'riddle-46',
    category: '历史',
    difficulty: '简单',
    question: '我是唯一一个在两个不同领域获得诺贝尔奖的人。我是谁？我获得了哪两个奖项？',
    answer: '居里夫人，物理学奖和化学奖',
    hints: ['一位伟大的女性科学家', '研究放射性', '她的女儿也获得了诺贝尔奖']
  },
  {
    id: 'riddle-47',
    category: '历史',
    difficulty: '中等',
    question: '哪位皇帝在位时间最长？他在位期间发生了著名的"九子夺嫡"？',
    answer: '康熙帝（在位61年）',
    hints: ['清朝', '8岁登基', '被后世称为"千古一帝"']
  },
  {
    id: 'riddle-48',
    category: '历史',
    difficulty: '中等',
    question: '"我知道我一无所知"——这句话被谁归功于谁？',
    answer: '柏拉图在对话录中归功于苏格拉底',
    hints: ['古希腊', '一位从不写书的哲学家', '他的学生记录了他的言行']
  },
  {
    id: 'riddle-49',
    category: '历史',
    difficulty: '困难',
    question: '公元79年的一天，一座城市在几个小时内被完全埋葬。1700年后它才被重新发现。这座城市是哪里？毁灭它的是什么？',
    answer: '庞贝城，被维苏威火山爆发掩埋',
    hints: ['位于意大利', '火山灰完美保存了城市原貌', '出土时发现了大量人体铸像']
  },
  {
    id: 'riddle-50',
    category: '历史',
    difficulty: '困难',
    question: '他是中国历史上唯一的女皇帝。她为自己造了一个新字作为名字，意思是"日月当空"。她是谁？那个字怎么写？',
    answer: '武则天，"曌"（zhào）',
    hints: ['唐朝', '明堂是她执政的象征', '她退位后去掉了帝号']
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
