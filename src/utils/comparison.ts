import { Answer } from '@/types';
import { differenceInDays, subDays } from 'date-fns';

/**
 * 查找7天前可以对比的回答
 */
export function findSevenDayComparisons(answers: Answer[]): Array<{
  oldAnswer: Answer;
  newAnswer: Answer;
}> {
  const comparisons: Array<{ oldAnswer: Answer; newAnswer: Answer }> = [];

  // 按问题ID分组
  const answersByQuestionId: Record<string, Answer[]> = {};

  answers.forEach((answer) => {
    if (!answersByQuestionId[answer.questionId]) {
      answersByQuestionId[answer.questionId] = [];
    }
    answersByQuestionId[answer.questionId].push(answer);
  });

  // 对每个问题的回答按时间排序
  Object.entries(answersByQuestionId).forEach(([questionId, questionAnswers]) => {
    if (questionAnswers.length < 2) return;

    // 按时间升序排序
    questionAnswers.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 查找相隔约7天的答案对
    for (let i = 0; i < questionAnswers.length - 1; i++) {
      const oldAnswer = questionAnswers[i];
      const newAnswer = questionAnswers[i + 1];

      const daysDiff = differenceInDays(
        new Date(newAnswer.createdAt),
        new Date(oldAnswer.createdAt)
      );

      // 6-8天之间都认为是7天对比
      if (daysDiff >= 6 && daysDiff <= 8) {
        comparisons.push({ oldAnswer, newAnswer });
        break; // 每个问题只找一对
      }
    }
  });

  return comparisons;
}

/**
 * 检查是否有7天前的回答需要提醒
 */
export function checkSevenDayReminders(answers: Answer[]): Answer[] {
  const sevenDaysAgo = subDays(new Date(), 7);
  const reminders: Answer[] = [];

  // 查找7天前的回答
  const oldAnswers = answers.filter((answer) => {
    const answerDate = new Date(answer.createdAt);
    return answerDate <= sevenDaysAgo;
  });

  // 检查这些问题是否有最近的回答
  oldAnswers.forEach((oldAnswer) => {
    const hasRecentAnswer = answers.some((answer) => {
      if (answer.questionId !== oldAnswer.questionId) return false;

      const answerDate = new Date(answer.createdAt);
      const daysFromOld = differenceInDays(new Date(), new Date(oldAnswer.createdAt));

      return daysFromOld >= 6 && daysFromOld <= 8;
    });

    if (!hasRecentAnswer) {
      reminders.push(oldAnswer);
    }
  });

  return reminders;
}

/**
 * 计算连续打卡天数
 */
export function calculateStreak(answers: Answer[]): number {
  if (answers.length === 0) return 0;

  // 按日期降序排序
  const sortedAnswers = [...answers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 检查最近是否有连续的答案
  for (let i = 0; i < sortedAnswers.length; i++) {
    const answerDate = new Date(sortedAnswers[i].createdAt);
    answerDate.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(today, answerDate);

    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
