/**
 * 猜数字游戏逻辑
 */

export interface GuessResult {
  guess: string;
  a: number; // 数字和位置都对
  b: number; // 数字对但位置不对
  isCorrect: boolean;
}

/**
 * 生成一个不重复数字的四位数字字符串
 */
export function generateSecretNumber(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const secret: string[] = [];

  // 第一位不能是0
  const firstDigitIndex = Math.floor(Math.random() * 9) + 1;
  secret.push(digits[firstDigitIndex]);

  // 从剩余数字中选择三位
  const remainingDigits = digits.filter((_, index) => index !== firstDigitIndex);

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * remainingDigits.length);
    secret.push(remainingDigits[randomIndex]);
    remainingDigits.splice(randomIndex, 1);
  }

  return secret.join('');
}

/**
 * 验证猜测是否有效
 * 必须是四位数字，且数字不能重复
 */
export function isValidGuess(guess: string): boolean {
  // 检查长度
  if (guess.length !== 4) {
    return false;
  }

  // 检查是否都是数字
  if (!/^\d+$/.test(guess)) {
    return false;
  }

  // 检查是否有重复数字
  const uniqueDigits = new Set(guess.split(''));
  if (uniqueDigits.size !== 4) {
    return false;
  }

  return true;
}

/**
 * 比较猜测和答案，返回 AxB 结果
 * A: 数字和位置都对
 * B: 数字对但位置不对
 */
export function compareGuess(guess: string, secret: string): GuessResult {
  if (!isValidGuess(guess)) {
    return {
      guess,
      a: 0,
      b: 0,
      isCorrect: false
    };
  }

  let a = 0;
  let b = 0;

  for (let i = 0; i < 4; i++) {
    const guessDigit = guess[i];
    const secretDigit = secret[i];

    if (guessDigit === secretDigit) {
      // 数字和位置都对
      a++;
    } else if (secret.includes(guessDigit)) {
      // 数字对但位置不对
      b++;
    }
  }

  return {
    guess,
    a,
    b,
    isCorrect: a === 4
  };
}

/**
 * 格式化结果字符串
 */
export function formatGuessResult(result: GuessResult): string {
  if (result.isCorrect) {
    return '4A0B - 恭喜你猜对了！';
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
  history: GuessResult[]
): string {
  // 这里可以添加更复杂的逻辑来生成建议
  // 目前返回一个随机的有效猜测
  let guess: string;
  do {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    guess = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      guess += digits[randomIndex];
      digits.splice(randomIndex, 1);
    }
  } while (history.some(h => h.guess === guess) || !isValidGuess(guess));

  return guess;
}

/**
 * 分析猜测历史，提供策略建议
 */
export function analyzeGuessHistory(history: GuessResult[]): string {
  if (history.length === 0) {
    return '开始猜测吧！记得数字不能重复。';
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
    for (let i = 0; i < 4; i++) {
      allDigits.add(result.guess[i]);
    }
  });

  // 找出在正确位置上的数字
  history.forEach(result => {
    if (result.a > 0) {
      // 这些数字可能对
      for (let i = 0; i < 4; i++) {
        if (!wrongPositionDigits.has(result.guess[i])) {
          correctDigits.add(result.guess[i]);
        }
      }
    }
    if (result.b > 0) {
      // 这些数字对但位置不对
      for (let i = 0; i < 4; i++) {
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
