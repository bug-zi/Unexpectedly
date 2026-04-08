/**
 * 猜数字游戏逻辑
 * 支持三种难度模式：
 * - easy（简单）：4位数字，各位不同
 * - medium（中等）：4位数字，允许重复
 * - hard（困难）：5位数字，各位不同
 */

export type GuessNumberMode = 'easy' | 'medium' | 'hard';

export interface GuessNumberModeConfig {
  mode: GuessNumberMode;
  digits: number;
  allowRepeat: boolean;
  label: string;
  difficulty: string;
}

export const GUESS_NUMBER_MODES: Record<GuessNumberMode, GuessNumberModeConfig> = {
  easy: {
    mode: 'easy',
    digits: 4,
    allowRepeat: false,
    label: '4位不重复数字',
    difficulty: '简单',
  },
  medium: {
    mode: 'medium',
    digits: 4,
    allowRepeat: true,
    label: '4位可重复数字',
    difficulty: '中等',
  },
  hard: {
    mode: 'hard',
    digits: 5,
    allowRepeat: false,
    label: '5位不重复数字',
    difficulty: '困难',
  },
};

export interface GuessResult {
  guess: string;
  a: number; // 数字和位置都对
  b: number; // 数字对但位置不对
  isCorrect: boolean;
}

/**
 * 根据模式生成神秘数字
 */
export function generateSecretNumber(mode: GuessNumberMode = 'easy'): string {
  const config = GUESS_NUMBER_MODES[mode];
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const secret: string[] = [];

  if (config.allowRepeat) {
    // 允许重复：每位随机选择，第一位不能是0
    const nonZeroDigits = digits.filter(d => d !== '0');
    secret.push(nonZeroDigits[Math.floor(Math.random() * nonZeroDigits.length)]);
    for (let i = 1; i < config.digits; i++) {
      secret.push(digits[Math.floor(Math.random() * digits.length)]);
    }
  } else {
    // 不允许重复
    // 第一位不能是0
    const nonZeroDigits = digits.filter(d => d !== '0');
    const firstIndex = Math.floor(Math.random() * nonZeroDigits.length);
    secret.push(nonZeroDigits[firstIndex]);

    // 从剩余数字中选择
    const remainingDigits = digits.filter(d => d !== nonZeroDigits[firstIndex]);

    for (let i = 1; i < config.digits; i++) {
      const randomIndex = Math.floor(Math.random() * remainingDigits.length);
      secret.push(remainingDigits[randomIndex]);
      remainingDigits.splice(randomIndex, 1);
    }
  }

  return secret.join('');
}

/**
 * 根据模式验证猜测是否有效
 */
export function isValidGuess(guess: string, mode: GuessNumberMode = 'easy'): boolean {
  const config = GUESS_NUMBER_MODES[mode];

  // 检查长度
  if (guess.length !== config.digits) {
    return false;
  }

  // 检查是否都是数字
  if (!/^\d+$/.test(guess)) {
    return false;
  }

  // 如果不允许重复，检查是否有重复数字
  if (!config.allowRepeat) {
    const uniqueDigits = new Set(guess.split(''));
    if (uniqueDigits.size !== config.digits) {
      return false;
    }
  }

  return true;
}

/**
 * 比较猜测和答案，返回 AxB 结果
 * A: 数字和位置都对
 * B: 数字对但位置不对
 */
export function compareGuess(guess: string, secret: string, mode: GuessNumberMode = 'easy'): GuessResult {
  const config = GUESS_NUMBER_MODES[mode];

  if (!isValidGuess(guess, mode)) {
    return {
      guess,
      a: 0,
      b: 0,
      isCorrect: false
    };
  }

  let a = 0;
  let b = 0;

  for (let i = 0; i < config.digits; i++) {
    const guessDigit = guess[i];
    const secretDigit = secret[i];

    if (guessDigit === secretDigit) {
      a++;
    } else if (secret.includes(guessDigit)) {
      b++;
    }
  }

  return {
    guess,
    a,
    b,
    isCorrect: a === config.digits
  };
}

/**
 * 格式化结果字符串
 */
export function formatGuessResult(result: GuessResult, mode: GuessNumberMode = 'easy'): string {
  const config = GUESS_NUMBER_MODES[mode];

  if (result.isCorrect) {
    return `${config.digits}A0B - 恭喜你猜对了！`;
  }

  if (result.a === 0 && result.b === 0) {
    return '0A0B - 没有任何数字匹配';
  }

  return `${result.a}A${result.b}B`;
}

/**
 * 获取提示信息
 */
export function getHint(result: GuessResult): string {
  if (result.isCorrect) {
    return '太棒了！你成功猜出了答案！';
  }

  if (result.a === 0 && result.b === 0) {
    return '提示：这次猜测中的数字都不在答案中，试试其他数字吧！';
  }

  if (result.a > 0 && result.b > 0) {
    const total = result.a + result.b;
    return `提示：你有 ${total} 个数字是对的，其中有 ${result.b} 个数字的位置需要调整`;
  }

  if (result.a > 0) {
    return `提示：你有 ${result.a} 个数字的位置完全正确！`;
  }

  if (result.b > 0) {
    return `提示：你有 ${result.b} 个数字是对的，但位置需要调整！`;
  }

  return '继续加油！仔细思考数字的组合。';
}

/**
 * 生成建议的猜测（用于AI辅助）
 */
export function generateSuggestedGuess(
  history: GuessResult[],
  mode: GuessNumberMode = 'easy'
): string {
  const config = GUESS_NUMBER_MODES[mode];
  let guess: string;
  do {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    guess = '';
    for (let i = 0; i < config.digits; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      guess += digits[randomIndex];
      if (!config.allowRepeat) {
        digits.splice(randomIndex, 1);
      }
    }
  } while (history.some(h => h.guess === guess) || !isValidGuess(guess, mode));

  return guess;
}

/**
 * 分析猜测历史，提供策略建议
 */
export function analyzeGuessHistory(history: GuessResult[], mode: GuessNumberMode = 'easy'): string {
  const config = GUESS_NUMBER_MODES[mode];

  if (history.length === 0) {
    return config.allowRepeat
      ? '开始猜测吧！注意数字可以重复。'
      : '开始猜测吧！记得数字不能重复。';
  }

  const latest = history[history.length - 1];

  if (latest.isCorrect) {
    return `恭喜！你用了 ${history.length} 次猜测就成功了！`;
  }

  // 分析出现过的数字
  const allDigits = new Set<string>();
  const correctDigits = new Set<string>();
  const wrongPositionDigits = new Set<string>();

  history.forEach(result => {
    for (let i = 0; i < config.digits; i++) {
      allDigits.add(result.guess[i]);
    }
  });

  history.forEach(result => {
    if (result.a > 0) {
      for (let i = 0; i < config.digits; i++) {
        if (!wrongPositionDigits.has(result.guess[i])) {
          correctDigits.add(result.guess[i]);
        }
      }
    }
    if (result.b > 0) {
      for (let i = 0; i < config.digits; i++) {
        wrongPositionDigits.add(result.guess[i]);
      }
    }
  });

  let advice = '';

  if (latest.a === 0 && latest.b === 0) {
    advice = '这个猜测中没有任何数字是对的，尝试完全不同的数字组合。';
  } else if (latest.a > 0 && latest.b > 0) {
    advice = `有 ${latest.a} 个数字位置完全正确，另外 ${latest.b} 个数字对但位置需要调整。`;
  } else if (latest.a > 0) {
    advice = `有 ${latest.a} 个数字位置完全正确，保持这些数字，调整其他数字的位置。`;
  } else if (latest.b > 0) {
    advice = `有 ${latest.b} 个数字是对的但位置不对，尝试调整它们的位置。`;
  }

  return advice;
}
