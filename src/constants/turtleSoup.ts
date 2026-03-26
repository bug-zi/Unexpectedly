/**
 * 海龟汤谜题数据
 */

export interface TurtleSoupPuzzle {
  id: string;
  title: string;
  difficulty: '简单' | '中等' | '困难';
  category: string;
  scenario: string; // 汤面 - 给玩家的情境
  truth: string; // 汤底 - 真相
  hints: string[]; // 提示
}

export const turtleSoupPuzzles: TurtleSoupPuzzle[] = [
  {
    id: 'soup-1',
    title: '海边的脚步声',
    difficulty: '简单',
    category: '推理',
    scenario: '一个人在海边散步，听到身后有脚步声。他回头看了看，却什么也没看到。第二天，他死了。',
    truth: '这个人是盲人。他听到的脚步声是涨潮的声音，但他以为有人跟踪他。因为害怕，他慌乱中走向大海深处，被淹死了。',
    hints: [
      '这个人的感官有什么特殊之处？',
      '脚步声真的是脚步声吗？',
      '大海和声音有什么关系？'
    ]
  },
  {
    id: 'soup-2',
    title: '最后一餐',
    difficulty: '中等',
    category: '悬疑',
    scenario: '一个男人在餐厅点了份海鸥汤。喝了一口后，他突然大哭起来，然后自杀了。',
    truth: '这个男人小时候曾和父亲遭遇海难，漂流在荒岛上。父亲为了救他，给他煮了"海鸥汤"（实际上是用父亲的肉煮的）。获救后，母亲告诉他那是海鸥汤。现在他终于尝到了真正的海鸥汤的味道，意识到当年喝的是什么，崩溃自杀。',
    hints: [
      '这汤和他以前喝的汤有什么不同？',
      '以前那汤是谁做的？',
      '荒岛上发生了什么？'
    ]
  },
  {
    id: 'soup-3',
    title: '电梯里的体重秤',
    difficulty: '简单',
    category: '日常',
    scenario: '一个人每天早上乘电梯上班，体重秤显示60kg。有一天他穿着同样的衣服，体重秤却显示70kg。他并没有变胖。',
    truth: '这个人在电梯里搬运了重物（比如家具、设备等），所以总重量增加了。',
    hints: [
      '体重秤测量的是什么？',
      '电梯里还有其他东西吗？',
      '他那天的工作有什么不同吗？'
    ]
  },
  {
    id: 'soup-4',
    title: '深夜的敲门声',
    difficulty: '中等',
    category: '恐怖',
    scenario: '一个人独自住在14楼。深夜，他听到敲门声，但通过猫眼看不到人。打开门后，没有人。第二天他发现自己差点死了。',
    truth: '这个人住在14楼，但那天电梯坏了，有人从楼梯走上来，因为太累，趴在门上喘息。猫眼看不到是因为人蹲着或趴着。第二天发现电梯井里有人掉下去了，差点砸到楼下的住户，而这栋楼的结构有问题——如果那人真的在门外，可能会...',
    hints: [
      '14楼意味着什么？',
      '猫眼的局限性是什么？',
      '电梯和楼梯有什么关系？'
    ]
  },
  {
    id: 'soup-5',
    title: '图书馆的书',
    difficulty: '困难',
    category: '悬疑',
    scenario: '一个人在图书馆借了一本书，翻开第100页，突然脸色苍白，立即还了书，匆忙离开图书馆。',
    truth: '这本书的每一页都有读者留下的笔记。在第100页，他看到了自己的笔迹，但他从未借过这本书。笔记的内容是他即将要做的可怕的事情，或者是他内心最深的秘密。他意识到有人在监视他。',
    hints: [
      '这本书有什么特别？',
      '他看到了什么让他害怕？',
      '笔记和笔迹说明了什么？'
    ]
  },
  {
    id: 'soup-6',
    title: '火车上的对话',
    difficulty: '中等',
    category: '推理',
    scenario: '在火车上，A问B："你去哪里？"B说："我去前面那站。"A说："哦，那你不用去了。"B听完立即跳车了。',
    truth: 'A是火车司机，他刚得知前面那站发生了严重事故（比如山体滑坡、火车相撞等），火车无法安全到达那里。B听到后意识到自己要去的目的地已经毁了，或者他原本就是要在那站自杀，听到消息后情绪失控跳车。',
    hints: [
      'A的身份是什么？',
      '前面那站发生了什么？',
      'B为什么立即跳车？'
    ]
  },
  {
    id: 'soup-7',
    title: '深夜的灯光',
    difficulty: '简单',
    category: '日常',
    scenario: '一个人每晚都看到对面楼有灯光在闪烁。有一天，灯光不再闪烁了，他立即报了警。',
    truth: '那个灯光是求救信号（SOS或其他摩斯密码）。灯光不再闪烁说明发送信号的人已经失去了意识或遇到了更危险的情况。',
    hints: [
      '闪烁的灯光可能是什么？',
      '停止闪烁意味着什么？',
      '为什么需要报警？'
    ]
  },
  {
    id: 'soup-8',
    title: '沙漠中的一瓶水',
    difficulty: '困难',
    category: '生存',
    scenario: '两个人在沙漠中行走，只有一瓶水。A说："把这瓶水给幸存者吧。"B听了之后，杀了A，喝了水，然后继续走。最后，B获救了，但他后悔了。',
    truth: 'A是医生，他知道这瓶水被污染了。他说"给幸存者"的意思是——我们两个都活不了，但如果只有一个人喝，那个人也会死（因为水被污染）。B误解了A的意思，杀了A并喝了水。后来B发现水确实被污染了，但他免疫力强活了下来，而A本可以和他一起活下来的。',
    hints: [
      '水的状态如何？',
      'A为什么那样说？',
      'B为什么后悔？'
    ]
  },
  {
    id: 'soup-9',
    title: '雨天的伞',
    difficulty: '中等',
    category: '日常',
    scenario: '下雨天，一个人撑着伞走在街上。突然，他的伞被别人抢走了。他不但不生气，反而笑了。',
    truth: '这个人其实是小偷，他偷了那把伞。伞的主人（被抢的人）追上来把伞抢回去了。他笑是因为——他原本的目标不是伞，而是趁混乱偷走了伞主人的钱包。',
    hints: [
      '伞真正的主人是谁？',
      '为什么被抢反而不生气？',
      '他的真正目的是什么？'
    ]
  },
  {
    id: 'soup-10',
    title: '床底的日记',
    difficulty: '困难',
    category: '恐怖',
    scenario: '一个人搬进新房子，在床底发现一本日记。日记写着："第一天，他搬进来了。第二天，他发现了这本日记。第三天..." 他看到这里，立即搬走了。',
    truth: '日记是上一个房客（或者之前的某个住户）写的。日记的内容是实时更新的——"第三天，他发现了这本日记"意味着写日记的人正在某个地方观察他。更可怕的是，日记可能是从床底下、通风管道等隐蔽的地方写的，说明写日记的人还在这个房子里。',
    hints: [
      '日记是谁写的？',
      '日记的时间线说明了什么？',
      '写日记的人现在在哪里？'
    ]
  }
];

export function getRandomPuzzle(): TurtleSoupPuzzle {
  const randomIndex = Math.floor(Math.random() * turtleSoupPuzzles.length);
  return turtleSoupPuzzles[randomIndex];
}

export function getPuzzleById(id: string): TurtleSoupPuzzle | undefined {
  return turtleSoupPuzzles.find(puzzle => puzzle.id === id);
}

export function getPuzzlesByDifficulty(difficulty: TurtleSoupPuzzle['difficulty']): TurtleSoupPuzzle[] {
  return turtleSoupPuzzles.filter(puzzle => puzzle.difficulty === difficulty);
}
