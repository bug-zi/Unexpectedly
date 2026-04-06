/**
 * 文笔挑战页面 - 给出一句话，续写后文
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PenTool, RotateCw, Save, Eye, EyeOff } from 'lucide-react';
import { setUserData, getUserData, getUserDataSync } from '@/utils/userStorage';
import { updateDailyTaskProgress } from '@/utils/taskManager';
import { usePageSEO } from '@/hooks/usePageSEO';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

// 文笔挑战题目库（100题）
const writingPrompts = [
  {
    id: 1,
    prompt: "那天早上，我推开窗户，发现整个城市都消失了，只剩下...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 2,
    prompt: "他说那句话时，眼神里藏着某种我从未见过的情绪，让我突然意识到...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 3,
    prompt: "这本泛黄的日记本最后一页写着：如果你看到了这行字，那么...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 4,
    prompt: "时间倒流回十年前的那个夏天，空气中弥漫着...",
    category: "怀旧",
    difficulty: "中等",
  },
  {
    id: 5,
    prompt: "那扇门后传来的声音很熟悉，但又说不出在哪里听过，直到...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 6,
    prompt: "当时钟敲响第十二下时，镜子里的倒影突然...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 7,
    prompt: "她从未想过，一次偶然的选择会让她的人生轨迹彻底改变，从那天起...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 8,
    prompt: "那条从未有人走过的小路尽头，矗立着...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 9,
    prompt: "如果当初我没有登上那趟列车，也许现在...",
    category: "人生",
    difficulty: "困难",
  },
  {
    id: 10,
    prompt: "暴雨夜，陌生人敲响了我的门，浑身湿透的他只说了一句话：...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 11,
    prompt: "那把钥匙在我家传了三代，没人知道它能打开什么，直到今天我...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 12,
    prompt: "当我睁开眼，发现自己躺在一个完全陌生的地方，周围是...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 13,
    prompt: "他的最后一封信里写着：原谅我的不辞而别，因为...",
    category: "情感",
    difficulty: "中等",
  },
  {
    id: 14,
    prompt: "那个梦太真实了，真实到醒来后我发现在枕头下竟然有...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 15,
    prompt: "所有人都说那地方去不得，但我还是去了，因为我...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 16,
    prompt: "那个总是出现在我梦境中的人，今天竟然真的出现了，就在...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 17,
    prompt: "当年我们立下的约定，我竟然还记得，于是...",
    category: "情感",
    difficulty: "简单",
  },
  {
    id: 18,
    prompt: "那个被遗忘在角落的旧箱子里，藏着一个改变一切的秘密...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 19,
    prompt: "如果人生可以重来，我会选择不一样的路，但现在...",
    category: "人生",
    difficulty: "中等",
  },
  {
    id: 20,
    prompt: "那天，我遇见了十年前的自己，他/她对我说...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 21,
    prompt: "老屋阁楼上落满灰尘的相册里，有一张不属于这个年代的照片...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 22,
    prompt: "电话响了，来电显示是我的号码，接通后听到的却是一个陌生人的声音...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 23,
    prompt: "她离开那天，在门框上刻了一行小字，十年后我才读懂...",
    category: "情感",
    difficulty: "中等",
  },
  {
    id: 24,
    prompt: "地图上那个叫「无名镇」的地方，导航显示距离我只有三百米...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 25,
    prompt: "如果所有动物突然都能开口说话，这个世界会变成什么样...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 26,
    prompt: "母亲一直保守着一个秘密，直到她在病床上握住我的手说...",
    category: "情感",
    difficulty: "困难",
  },
  {
    id: 27,
    prompt: "街角那家从不开门的古董店，今天却灯火通明，橱窗里摆着...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 28,
    prompt: "翻看旧手机里的备忘录，发现了一段我完全不记得写下的文字...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 29,
    prompt: "在那片只有月光照亮的森林深处，有一棵会唱歌的树...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 30,
    prompt: "爷爷留下的那块怀表，每当午夜十二点就会倒转，直到有一天...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 31,
    prompt: "毕业那天，班主任递给我一封信，说这是十年前他写给未来的...",
    category: "怀旧",
    difficulty: "简单",
  },
  {
    id: 32,
    prompt: "那座桥有个传说——午夜走过的人，会看见自己最想见的人...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 33,
    prompt: "搬进新家第一天，邻居老太太拉着我说：这间房子以前住着一个和你同名的人...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 34,
    prompt: "如果有一天大海变成了一面巨大的镜子，映照出的会是什么...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 35,
    prompt: "图书馆最里面的那排书架尽头，有一本没有名字的书，翻开第一页...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 36,
    prompt: "在地铁站等车时，对面站着一个和我穿一模一样衣服、长相也相同的人...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 37,
    prompt: "小时候最喜欢的那个游乐场，废弃多年后又重新亮起了灯...",
    category: "怀旧",
    difficulty: "中等",
  },
  {
    id: 38,
    prompt: "如果世界上所有谎言都会在说出口的瞬间变成蓝色的烟雾...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 39,
    prompt: "深夜加班回家，电梯停在不存在的第十八层，门开了...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 40,
    prompt: "外婆的菜谱本里夹着一张车票，目的地是一个地图上找不到的地方...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 41,
    prompt: "假如能和已故的一个人共进一顿晚餐，我会选谁，聊些什么...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 42,
    prompt: "那天下着大雪，路边有个卖火柴的老人，他递给我一盒说：这火柴能点燃回忆...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 43,
    prompt: "在旧书摊淘到一本书，扉页上写着我自己的名字和明天的日期...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 44,
    prompt: "爬到山顶的那一刻，我看到了一个完全不同的世界在云层之上...",
    category: "探险",
    difficulty: "简单",
  },
  {
    id: 45,
    prompt: "他们说，深夜的末班公交车上，永远会多出一个乘客...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 46,
    prompt: "那年冬天的初雪，你第一次牵起我的手，掌心的温度...",
    category: "情感",
    difficulty: "简单",
  },
  {
    id: 47,
    prompt: "我在旧衣服口袋里摸到一张纸条，上面画着一张地图和一行字：相信你自己...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 48,
    prompt: "假如每个人头顶都悬浮着一个倒计时器，显示着剩余寿命...",
    category: "人生",
    difficulty: "中等",
  },
  {
    id: 49,
    prompt: "深夜的便利店只有我一个顾客，收银员突然问我：你还是第一次来吧...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 50,
    prompt: "如果能把人生中最后悔的一件事改掉，代价是忘记最幸福的记忆...",
    category: "人生",
    difficulty: "困难",
  },
  {
    id: 51,
    prompt: "雨后的小路上出现了一串光脚的脚印，但周围没有任何人...",
    category: "悬疑",
    difficulty: "简单",
  },
  {
    id: 52,
    prompt: "那扇从外面锁着的门里面，传来一个孩子的笑声，可这栋楼已经荒废了十年...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 53,
    prompt: "如果能把一朵云摘下来，它摸上去会是什么感觉...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 54,
    prompt: "爷爷常说屋后的那口井通向另一个世界，我从来不信，直到那天...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 55,
    prompt: "整理旧物时翻到小学的同学录，最后一条留言让我愣住了...",
    category: "怀旧",
    difficulty: "简单",
  },
  {
    id: 56,
    prompt: "深夜，手机收到一条来自已故好友的信息，内容只有三个字...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 57,
    prompt: "假如你能在梦中学会任何一项技能，醒来后仍会保留...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 58,
    prompt: "第一次看到大海的那个夏天，浪花卷来了一个漂流瓶，里面装着...",
    category: "探险",
    difficulty: "简单",
  },
  {
    id: 59,
    prompt: "他每天都在同一个路口等我，风雨无阻，但我从未和他交谈过，直到...",
    category: "情感",
    difficulty: "中等",
  },
  {
    id: 60,
    prompt: "博物馆里那幅画中人的眼睛，似乎一直在跟着我移动...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 61,
    prompt: "据说每个人都会遇到三次改变命运的瞬间，我的第一次是...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 62,
    prompt: "深夜独自走夜路，身后传来脚步声，回头却空无一人，再转回来...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 63,
    prompt: "在那座被遗弃的灯塔里，我发现了一本航海日志，最后一页写着...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 64,
    prompt: "如果月亮突然消失了，海洋、潮汐、人们的心情会怎样...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 65,
    prompt: "和最好的朋友绝交五年后，收到了一封没有署名的婚礼请柬...",
    category: "情感",
    difficulty: "困难",
  },
  {
    id: 66,
    prompt: "旧校服口袋里找到一张电影票，日期是明天，但这部电影早已停映...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 67,
    prompt: "那片向日葵花海中央有一把空椅子，上面刻着我的名字...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 68,
    prompt: "阳光穿过树叶的缝隙，在地面拼出了一行字...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 69,
    prompt: "在古堡地下室的墙上发现一串数字，破译后指向一个坐标...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 70,
    prompt: "多年后再回到故乡，老街已经面目全非，唯一没变的是...",
    category: "怀旧",
    difficulty: "简单",
  },
  {
    id: 71,
    prompt: "如果世界上只剩最后一种颜色可以选择，你会留下什么颜色...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 72,
    prompt: "公交车上，身边的老太太突然对我说：你长得好像我年轻时的自己...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 73,
    prompt: "独自旅行的第三天，我在异国街头遇到一个能叫出我名字的陌生人...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 74,
    prompt: "如果把所有遗憾都种进土里，会长出什么样的花...",
    category: "情感",
    difficulty: "简单",
  },
  {
    id: 75,
    prompt: "打开冰箱，发现里面的食物都被整齐排列成了一个箭头，指向...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 76,
    prompt: "传说山顶的寺庙里住着一个不老僧人，他已经等了千年，只为了...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 77,
    prompt: "在海底沉船的船长室里，桌上的茶杯还是温热的...",
    category: "探险",
    difficulty: "中等",
  },
  {
    id: 78,
    prompt: "如果有机会给十年后的自己发一条消息，只有十个字...",
    category: "人生",
    difficulty: "简单",
  },
  {
    id: 79,
    prompt: "她每天经过的那面墙上贴满了寻人启事，但寻找的人全叫同一个名字...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 80,
    prompt: "闭上眼睛许愿，睁开眼时世界变成了黑白色，只有一样东西还有颜色...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 81,
    prompt: "山谷里回荡着一首歌谣，但附近的村民说那里已经百年无人居住...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 82,
    prompt: "停电的夜晚，用手电筒照向窗外，对面楼里有个人在向我挥手...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 83,
    prompt: "如果能够回到过去改变一件事，但不能让任何人知道...",
    category: "人生",
    difficulty: "中等",
  },
  {
    id: 84,
    prompt: "他说等攒够了星星就来看我，那天夜空果然暗了...",
    category: "情感",
    difficulty: "困难",
  },
  {
    id: 85,
    prompt: "清晨的菜市场，所有鱼摊上的鱼都朝着同一个方向...",
    category: "悬疑",
    difficulty: "简单",
  },
  {
    id: 86,
    prompt: "传说在日食的那一刻，两个平行世界会短暂重叠...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 87,
    prompt: "爷爷的烟斗里飘出的烟圈形成了某种图案，他看了一眼就哭了...",
    category: "怀旧",
    difficulty: "中等",
  },
  {
    id: 88,
    prompt: "在沙漠深处找到一口井，井水映出的不是我的倒影，而是...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 89,
    prompt: "假如文字有重量，一本书就能压垮一座城市...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 90,
    prompt: "打开电子邮箱，收到了一封来自2050年的邮件，主题是...",
    category: "奇幻",
    difficulty: "中等",
  },
  {
    id: 91,
    prompt: "每当下雨天，街角就会多出一个卖伞的人，但从来没有人买过...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 92,
    prompt: "如果所有失去的东西都会在某个角落静静等待主人...",
    category: "奇幻",
    difficulty: "简单",
  },
  {
    id: 93,
    prompt: "废弃工厂的墙上画着一扇门，有人发现那扇门竟然可以推开...",
    category: "探险",
    difficulty: "困难",
  },
  {
    id: 94,
    prompt: "分别时她说：等花开了我就回来。第二年春天，那棵枯树...",
    category: "情感",
    difficulty: "中等",
  },
  {
    id: 95,
    prompt: "如果每个人身上都有一根线连接着命中注定的那个人...",
    category: "情感",
    difficulty: "简单",
  },
  {
    id: 96,
    prompt: "深夜的收音机突然切换到一个从未听过的频道，主持人正在念我的名字...",
    category: "悬疑",
    difficulty: "困难",
  },
  {
    id: 97,
    prompt: "如果记忆可以像照片一样冲洗出来挂在墙上...",
    category: "怀旧",
    difficulty: "中等",
  },
  {
    id: 98,
    prompt: "在极光之下许愿的人，愿望会在第二天变成现实，但代价是...",
    category: "奇幻",
    difficulty: "困难",
  },
  {
    id: 99,
    prompt: "每年生日都会收到一束匿名花，今年花里夹了一张字条，上面写着...",
    category: "悬疑",
    difficulty: "中等",
  },
  {
    id: 100,
    prompt: "如果这世界是一本书，而你是唯一知道翻页方法的读者...",
    category: "奇幻",
    difficulty: "困难",
  },
];

export function WritingChallengePage() {
  const navigate = useNavigate();
  const [currentPrompt, setCurrentPrompt] = useState(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);
  const [userWriting, setUserWriting] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedWorks, setSavedWorks] = useState<any[]>([]);

  // 从 localStorage 加载保存的作品
  useEffect(() => {
    const saved = getUserDataSync<any[]>('writing-challenge-works', []);
    setSavedWorks(saved);
  }, []);

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 已更新
      setTimeout(() => {
        const saved = getUserDataSync<any[]>('writing-challenge-works', []);
        setSavedWorks(saved);
      }, 100);
    };

    window.addEventListener('user-data-changed', handleDataChange);
    window.addEventListener('user-logged-out', handleDataChange);
    window.addEventListener('user-logged-in', handleDataChange);

    return () => {
      window.removeEventListener('user-data-changed', handleDataChange);
      window.removeEventListener('user-logged-out', handleDataChange);
      window.removeEventListener('user-logged-in', handleDataChange);
    };
  }, []);

  // 从未完成的题目中随机选一个
  const getRandomUnfinishedPrompt = (excludeId?: number) => {
    const completedIds = new Set(savedWorks.map((w: any) => w.promptId));
    const unfinished = writingPrompts.filter(p => !completedIds.has(p.id) && p.id !== excludeId);
    if (unfinished.length === 0) {
      // 所有题目都完成了，从全部题目中随机（排除当前）
      const candidates = writingPrompts.filter(p => p.id !== excludeId);
      return candidates[Math.floor(Math.random() * candidates.length)] || writingPrompts[0];
    }
    return unfinished[Math.floor(Math.random() * unfinished.length)];
  };

  // 切换到下一个题目
  const handleNextPrompt = () => {
    setIsRotating(true);
    setTimeout(() => {
      const next = getRandomUnfinishedPrompt(currentPrompt.id);
      setCurrentPrompt(next);
      setUserWriting(''); // 清空用户输入
      setShowPreview(false);
      setIsRotating(false);
    }, 300);
  };

  // 保存当前作品
  const handleSave = () => {
    if (!userWriting.trim()) {
      return;
    }

    const newWork = {
      id: Date.now(),
      promptId: currentPrompt.id,
      prompt: currentPrompt.prompt,
      content: userWriting,
      category: currentPrompt.category,
      difficulty: currentPrompt.difficulty,
      createdAt: new Date().toISOString(),
    };

    const updatedWorks = [newWork, ...savedWorks];
    setSavedWorks(updatedWorks);
    setUserData('writing-challenge-works', updatedWorks);

    // 更新每日任务进度（写作创作）
    updateDailyTaskProgress('daily-writing', 1);

    alert('作品已保存！');
  };

  // 获取难度颜色
  const getDifficultyColor = (_difficulty: string) => {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  // 获取类别颜色
  const getCategoryColor = (_category: string) => {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg-picture/bg-wirting.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/writing')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: customEasing.unexpected }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                文笔挑战
              </h1>
            </motion.div>
            <div className="flex items-center gap-2">
              {savedWorks.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* TODO: 显示保存的作品列表 */}}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Save size={16} />
                  <span>{savedWorks.length}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEasing.elastic }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              文笔挑战
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              发挥想象力，续写精彩故事
            </p>
          </motion.div>

          {/* 题目卡片 */}
          <motion.div
            key={currentPrompt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-200 dark:border-blue-800"
          >
            {/* 题目标签 */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentPrompt.category)}`}>
                {currentPrompt.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentPrompt.difficulty)}`}>
                {currentPrompt.difficulty}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                题目 {currentPrompt.id} / {writingPrompts.length}
              </span>
            </div>

            {/* 题目内容 */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <PenTool size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    "{currentPrompt.prompt}"
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                <RotateCw size={18} className={isRotating ? 'animate-spin' : ''} />
                <span>换一题</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 写作区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                你的续写
              </h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPreview ? '编辑' : '预览'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-md hover:shadow-lg"
                  disabled={!userWriting.trim()}
                >
                  <Save size={16} />
                  <span>保存</span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[300px] p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                >
                  {userWriting ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {userWriting}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                      还没有内容，开始写作吧！
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <textarea
                    value={userWriting}
                    onChange={(e) => setUserWriting(e.target.value)}
                    placeholder="在这里续写故事...发挥你的想象力，让故事继续下去..."
                    className="w-full min-h-[300px] p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all resize-none text-gray-800 dark:text-gray-200 text-lg leading-relaxed placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>字数: {userWriting.length}</span>
                    <span>建议字数: 100-500字</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 提示信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>写作提示：</strong>尽情发挥想象力，让故事朝着意想不到的方向发展。没有标准答案，你的创意就是最好的答案！
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
