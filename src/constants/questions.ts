import { Question } from '@/types';
import { EXTENDED_QUESTIONS } from './extendedQuestions';
import { EXTENDED_SCENARIO_QUESTIONS } from './extendedScenarioQuestions';

/**
 * 问题库（原有25个）
 */
export const ORIGINAL_QUESTIONS: Question[] = [
  // 假设思维类
  {
    id: 'hypothesis-001',
    category: { primary: 'thinking', secondary: 'hypothesis' },
    content: '如果金钱不是问题，你现在会在做什么？',
    difficulty: 2,
    tags: ['假设', '价值观', '梦想'],
    createdAt: new Date('2024-01-01'),
    answerCount: 324,
  },
  {
    id: 'hypothesis-002',
    category: { primary: 'thinking', secondary: 'hypothesis' },
    content: '如果今天是你生命的最后一天，你会做什么？',
    difficulty: 3,
    tags: ['假设', '生死', '优先级'],
    createdAt: new Date('2024-01-01'),
    answerCount: 256,
  },
  {
    id: 'hypothesis-003',
    category: { primary: 'thinking', secondary: 'hypothesis' },
    content: '如果外星人明天降临，你会向它们展示什么？',
    difficulty: 4,
    tags: ['假设', '身份', '文化'],
    createdAt: new Date('2024-01-01'),
    answerCount: 189,
  },
  {
    id: 'hypothesis-004',
    category: { primary: 'thinking', secondary: 'hypothesis' },
    content: '如果你能和历史上的任何人对话，你会选谁？',
    difficulty: 2,
    tags: ['假设', '历史', '智慧'],
    createdAt: new Date('2024-01-01'),
    answerCount: 312,
  },
  {
    id: 'hypothesis-005',
    category: { primary: 'thinking', secondary: 'hypothesis' },
    content: '如果你可以拥有一项超能力，会是什么？',
    difficulty: 1,
    tags: ['假设', '能力', '欲望'],
    createdAt: new Date('2024-01-01'),
    answerCount: 456,
  },

  // 逆向思考类
  {
    id: 'reverse-001',
    category: { primary: 'thinking', secondary: 'reverse' },
    content: '如何故意毁掉你的人际关系？',
    difficulty: 3,
    tags: ['逆向', '关系', '反思'],
    createdAt: new Date('2024-01-01'),
    answerCount: 198,
  },
  {
    id: 'reverse-002',
    category: { primary: 'thinking', secondary: 'reverse' },
    content: '如何故意让一个项目失败？',
    difficulty: 3,
    tags: ['逆向', '项目管理', '反思'],
    createdAt: new Date('2024-01-01'),
    answerCount: 145,
  },
  {
    id: 'reverse-003',
    category: { primary: 'thinking', secondary: 'reverse' },
    content: '如何故意毁掉你的健康？',
    difficulty: 2,
    tags: ['逆向', '健康', '反思'],
    createdAt: new Date('2024-01-01'),
    answerCount: 234,
  },
  {
    id: 'reverse-004',
    category: { primary: 'thinking', secondary: 'reverse' },
    content: '如何故意失去朋友？',
    difficulty: 3,
    tags: ['逆向', '友谊', '反思'],
    createdAt: new Date('2024-01-01'),
    answerCount: 167,
  },
  {
    id: 'reverse-005',
    category: { primary: 'thinking', secondary: 'reverse' },
    content: '如何故意浪费时间？',
    difficulty: 2,
    tags: ['逆向', '时间管理', '反思'],
    createdAt: new Date('2024-01-01'),
    answerCount: 289,
  },

  // 联想创意类
  {
    id: 'creative-001',
    category: { primary: 'thinking', secondary: 'creative' },
    content: '咖啡 + 书店 = ？',
    difficulty: 2,
    tags: ['联想', '创意', '组合'],
    createdAt: new Date('2024-01-01'),
    answerCount: 412,
  },
  {
    id: 'creative-002',
    category: { primary: 'thinking', secondary: 'creative' },
    content: '音乐 + 建筑 = ？',
    difficulty: 3,
    tags: ['联想', '艺术', '跨界'],
    createdAt: new Date('2024-01-01'),
    answerCount: 234,
  },
  {
    id: 'creative-003',
    category: { primary: 'thinking', secondary: 'creative' },
    content: '失败 + 成功 = ？',
    difficulty: 3,
    tags: ['联想', '辩证', '成长'],
    createdAt: new Date('2024-01-01'),
    answerCount: 356,
  },
  {
    id: 'creative-004',
    category: { primary: 'thinking', secondary: 'creative' },
    content: '寂静 + 喧嚣 = ？',
    difficulty: 3,
    tags: ['联想', '对比', '生活'],
    createdAt: new Date('2024-01-01'),
    answerCount: 178,
  },
  {
    id: 'creative-005',
    category: { primary: 'thinking', secondary: 'creative' },
    content: '传统 + 现代 = ？',
    difficulty: 3,
    tags: ['联想', '文化', '创新'],
    createdAt: new Date('2024-01-01'),
    answerCount: 267,
  },

  // 自我反思类
  {
    id: 'reflection-001',
    category: { primary: 'thinking', secondary: 'reflection' },
    content: '你最近一次感到骄傲是什么时候？',
    difficulty: 2,
    tags: ['反思', '成就', '自我'],
    createdAt: new Date('2024-01-01'),
    answerCount: 389,
  },
  {
    id: 'reflection-002',
    category: { primary: 'thinking', secondary: 'reflection' },
    content: '你最害怕别人发现你的什么特质？',
    difficulty: 4,
    tags: ['反思', '脆弱', '真实'],
    createdAt: new Date('2024-01-01'),
    answerCount: 156,
  },
  {
    id: 'reflection-003',
    category: { primary: 'thinking', secondary: 'reflection' },
    content: '什么事让你觉得"这才是真正的我"？',
    difficulty: 3,
    tags: ['反思', '身份', '真实'],
    createdAt: new Date('2024-01-01'),
    answerCount: 245,
  },
  {
    id: 'reflection-004',
    category: { primary: 'thinking', secondary: 'reflection' },
    content: '你在哪方面最不愿意妥协？',
    difficulty: 3,
    tags: ['反思', '价值观', '原则'],
    createdAt: new Date('2024-01-01'),
    answerCount: 267,
  },
  {
    id: 'reflection-005',
    category: { primary: 'thinking', secondary: 'reflection' },
    content: '你最珍惜自己的哪一点？',
    difficulty: 2,
    tags: ['反思', '优点', '自爱'],
    createdAt: new Date('2024-01-01'),
    answerCount: 334,
  },

  // 未来设想类
  {
    id: 'future-001',
    category: { primary: 'thinking', secondary: 'future' },
    content: '10年后你希望自己有什么改变？',
    difficulty: 3,
    tags: ['未来', '愿景', '规划'],
    createdAt: new Date('2024-01-01'),
    answerCount: 378,
  },
  {
    id: 'future-002',
    category: { primary: 'thinking', secondary: 'future' },
    content: '如果你能给5年后的自己一句话，会是什么？',
    difficulty: 2,
    tags: ['未来', '对话', '智慧'],
    createdAt: new Date('2024-01-01'),
    answerCount: 423,
  },
  {
    id: 'future-003',
    category: { primary: 'thinking', secondary: 'future' },
    content: '理想情况下，5年后的你在做什么？',
    difficulty: 3,
    tags: ['未来', '职业', '生活'],
    createdAt: new Date('2024-01-01'),
    answerCount: 356,
  },
  {
    id: 'future-004',
    category: { primary: 'thinking', secondary: 'future' },
    content: '你希望别人如何记住你？',
    difficulty: 4,
    tags: ['未来', '遗产', '影响'],
    createdAt: new Date('2024-01-01'),
    answerCount: 234,
  },
  {
    id: 'future-005',
    category: { primary: 'thinking', secondary: 'future' },
    content: '你最想完成的一件大事是什么？',
    difficulty: 3,
    tags: ['未来', '目标', '成就'],
    createdAt: new Date('2024-01-01'),
    answerCount: 289,
  },
];

/**
 * 所有问题（175个）
 * 合并原有问题、思维维度扩展问题和生活场景扩展问题
 */
export const QUESTIONS: Question[] = [
  ...ORIGINAL_QUESTIONS,
  ...EXTENDED_QUESTIONS,
  ...EXTENDED_SCENARIO_QUESTIONS,
];

/**
 * 随机获取问题
 */
export function getRandomQuestion(category?: string): Question {
  let filteredQuestions = QUESTIONS;

  if (category) {
    filteredQuestions = QUESTIONS.filter(
      (q) => q.category.secondary === category
    );
  }

  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  return filteredQuestions[randomIndex];
}

/**
 * 根据ID获取问题
 */
export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
