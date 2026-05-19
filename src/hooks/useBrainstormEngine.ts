/**
 * 灵感风暴引擎 - 核心自动化循环控制器
 */

import { useCallback, useRef } from 'react';
import { useBrainstormStore } from '@/stores/brainstormStore';
import { useDiffuserStore } from '@/stores/diffuserStore';
import { useDiffuserAI } from '@/hooks/useDiffuserAI';
import { useBrainstormAI } from '@/hooks/useBrainstormAI';
import { generateId } from '@/utils/diffuserLayout';
import { calcRadialPositions } from '@/utils/diffuserLayout';
import { selectDiverseWords, selectCollisionGroups, makeCollisionKey, selectSeedFromCollection } from '@/utils/brainstormLayout';
import type { BrainstormIdea, BrainstormPhase } from '@/types/brainstorm';
import type { DiffuserWord } from '@/types/diffuser';

/** 暂停/中止信号 */
interface PauseSignal {
  paused: boolean;
  aborted: boolean;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 带重试的调用 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  signal: PauseSignal
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new Error('aborted');
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries || signal.aborted) throw err;
      await delay(1000 * (attempt + 1));
    }
  }
  throw new Error('unreachable');
}

export function useBrainstormEngine() {
  const brainstormStore = useBrainstormStore();
  const phase = useBrainstormStore((s) => s.phase);
  const currentRound = useBrainstormStore((s) => s.currentRound);
  const totalRounds = useBrainstormStore((s) => s.totalRounds);
  const topicInput = useBrainstormStore((s) => s.topicInput);
  const lessonsLearned = useBrainstormStore((s) => s.lessonsLearned);
  const collectionBox = useBrainstormStore((s) => s.collectionBox);
  const rounds = useBrainstormStore((s) => s.rounds);
  const collidedKeys = useBrainstormStore((s) => s.collidedKeys);

  const { generateWords } = useDiffuserAI({ count: 8 });
  const { generateWords: generateMore } = useDiffuserAI({ count: 4 });
  const ai = useBrainstormAI();

  const signalRef = useRef<PauseSignal>({ paused: false, aborted: false });
  const runningRef = useRef(false);

  /** 检查暂停/中止 */
  function checkSignal(): boolean {
    if (signalRef.current.aborted) return true;
    if (signalRef.current.paused) {
      return new Promise<boolean>((resolve) => {
        const check = setInterval(() => {
          if (!signalRef.current.paused || signalRef.current.aborted) {
            clearInterval(check);
            resolve(signalRef.current.aborted);
          }
        }, 200);
      }) as unknown as boolean;
    }
    return false;
  }

  /** 完整一轮 */
  const runRound = useCallback(
    async (roundNum: number, seedOverride?: string) => {
      const bs = useBrainstormStore.getState();
      if (signalRef.current.aborted) return;

      // === SEEDING ===
      bs.setPhase('seeding');
      let seedWord = seedOverride || bs.topicInput;

      if (!seedWord) {
        // 让AI生成一个随机种子词
        bs.addLog('seeding', 'AI 正在生成种子词...');
        const words = await generateWords('随机有趣名词', []);
        if (words.length > 0) {
          seedWord = words[0].word;
        } else {
          seedWord = '灵感';
        }
      }

      bs.addLog('seeding', `种子词：${seedWord}`);
      bs.startRound(seedWord);

      // 在画布上创建根节点
      const ds = useDiffuserStore.getState();
      const rootId = ds.addRootNode(seedWord);

      if (signalRef.current.aborted) return;

      // === EXPANDING ===
      bs.setPhase('expanding');
      bs.addLog('expanding', '扩展第1层词语...');

      // 第1层：8个词
      const allExistingWords = useDiffuserStore.getState().nodes.map((n) => n.word);
      const layer1 = await withRetry(
        () => generateWords(seedWord, allExistingWords),
        1,
        signalRef.current
      );
      const unique1 = layer1.filter(
        (w) => !useDiffuserStore.getState().nodes.some((n) => n.word === w.word)
      );

      if (unique1.length > 0) {
        useDiffuserStore.getState().addChildNodes(rootId, unique1);
      }

      if (signalRef.current.aborted) return;
      await delay(300);

      // 第2层：选3个不同relation的词，各扩展4个
      const diverse = selectDiverseWords(unique1, 3);
      const allExpandedWords: string[] = [seedWord, ...unique1.map((w) => w.word)];

      for (const word of diverse) {
        if (signalRef.current.aborted) return;

        bs.addLog('expanding', `扩展「${word.word}」...`);
        // 找到对应的节点ID
        const wordNode = useDiffuserStore.getState().nodes.find(
          (n) => n.word === word.word && n.parentId === rootId
        );
        if (!wordNode) continue;

        const currentAllWords = useDiffuserStore.getState().nodes.map((n) => n.word);
        const layer2 = await withRetry(
          () => generateMore(word.word, currentAllWords),
          1,
          signalRef.current
        );
        const unique2 = layer2.filter(
          (w) => !useDiffuserStore.getState().nodes.some((n) => n.word === w.word)
        );

        if (unique2.length > 0) {
          useDiffuserStore.getState().addChildNodes(wordNode.id, unique2);
          allExpandedWords.push(...unique2.map((w) => w.word));
        }

        await delay(200);
      }

      // 记录扩展词
      useBrainstormStore.getState().setRoundExpandedWords(allExpandedWords);
      bs.addLog('expanding', `共扩展 ${allExpandedWords.length} 个词语`);

      if (signalRef.current.aborted) return;

      // === COLLIDING ===
      bs.setPhase('colliding');
      const existingCollisions = new Set(useBrainstormStore.getState().collidedKeys);
      const currentNodes = useDiffuserStore.getState().nodes
        .filter((n) => n.word !== seedWord)
        .map((n) => n.word);
      const collisionGroups = selectCollisionGroups(currentNodes, existingCollisions, 4);

      bs.addLog('colliding', `规划 ${collisionGroups.length} 组碰撞`);

      const collisionResults: Array<{
        words: string[];
        ideas: BrainstormIdea[];
      }> = [];

      for (const group of collisionGroups) {
        if (signalRef.current.aborted) return;

        bs.addLog('colliding', `碰撞：${group.join(' × ')}`);

        // 记录碰撞key
        const key = makeCollisionKey(group);
        useBrainstormStore.getState().addCollidedKey(key);

        const reactionResults = await withRetry(
          () => {
            const bsNow = useBrainstormStore.getState();
            return ai.generateMultiReaction(
              group,
              bsNow.lessonsLearned,
              {
                liked: bsNow.collectionBox.map((i) => i.ideaText),
                disliked: bsNow.discardPile.map((i) => i.ideaText),
              }
            );
          },
          1,
          signalRef.current
        );

        // 转换为 BrainstormIdea（先不评分）
        const ideas: BrainstormIdea[] = reactionResults.map((r) => ({
          id: r.id,
          sourceWords: group,
          ideaText: r.content,
          type: r.type,
          scores: { innovation: 0, feasibility: 0, practicality: 0, fun: 0, average: 0, weightedAverage: 0 },
          reasoning: '',
          qualified: false,
          roundNumber: roundNum,
          createdAt: new Date().toISOString(),
        }));

        collisionResults.push({ words: group, ideas });

        // 在画布上添加碰撞记录（复用现有reaction机制）
        const firstNodeId = useDiffuserStore.getState().nodes.find(
          (n) => n.word === group[0]
        )?.id;
        const secondNodeId = useDiffuserStore.getState().nodes.find(
          (n) => n.word === group[1]
        )?.id;

        if (firstNodeId && secondNodeId) {
          useDiffuserStore.getState().addReaction({
            id: generateId('rxn'),
            sourceWordA: group[0],
            sourceWordB: group[1],
            nodeIdA: firstNodeId,
            nodeIdB: secondNodeId,
            results: reactionResults,
            createdAt: new Date().toISOString(),
          });
        }

        await delay(200);
      }

      if (signalRef.current.aborted) return;

      // === SCORING (Two-Phase) ===
      bs.setPhase('scoring');
      const qualifiedIdeas: Array<BrainstormIdea & { scores: { average: number } }> = [];
      const discardedIdeas: Array<BrainstormIdea & { scores: { average: number }; reasoning: string }> = [];
      const currentRoundQualifiedTexts: string[] = [];

      // 防重复：取历史收纳盒中最高分的5条
      const recentHistory = [...useBrainstormStore.getState().collectionBox]
        .sort((a, b) => b.scores.average - a.scores.average)
        .slice(0, 5)
        .map((i) => i.ideaText);

      for (const collision of collisionResults) {
        for (const idea of collision.ideas) {
          if (signalRef.current.aborted) return;

          // --- Phase 1: 快筛门 ---
          bs.addLog('scoring', `快筛中...`);
          const gateResult = await withRetry(
            () => ai.quickGateIdea(idea.ideaText, idea.sourceWords),
            1,
            signalRef.current
          );

          if (gateResult && !gateResult.pass) {
            const gateIdea: BrainstormIdea = {
              ...idea,
              scores: {
                innovation: gateResult.innovation,
                feasibility: 0,
                practicality: 0,
                fun: gateResult.fun,
                average: 0,
                weightedAverage: 0,
              },
              reasoning: '快速筛选未通过（创新性或趣味性不足）',
              qualified: false,
            };
            bs.addIdeaToDiscard(gateIdea);
            discardedIdeas.push(gateIdea as typeof gateIdea & { scores: { average: number }; reasoning: string });
            bs.addLog('scoring', `✗ 快筛丢弃 ${idea.ideaText.slice(0, 20)}...`);
            await delay(50);
            continue;
          }

          // --- Phase 2: 深度加权评分 ---
          bs.addLog('scoring', `深度评分中...`);
          const antiDupContext = [...recentHistory, ...currentRoundQualifiedTexts.slice(-3)].slice(0, 8);
          const scoreResult = await withRetry(
            () => ai.scoreIdea(idea.ideaText, idea.sourceWords, antiDupContext),
            1,
            signalRef.current
          );

          if (scoreResult) {
            const scoredIdea: BrainstormIdea = {
              ...idea,
              scores: {
                innovation: scoreResult.innovation,
                feasibility: scoreResult.feasibility,
                practicality: scoreResult.practicality,
                fun: scoreResult.fun,
                average: scoreResult.average,
                weightedAverage: scoreResult.weightedAverage,
              },
              reasoning: scoreResult.reasoning,
              qualified: scoreResult.qualified,
            };

            if (scoreResult.qualified) {
              bs.addToShowcase(scoredIdea);
              qualifiedIdeas.push(scoredIdea as typeof scoredIdea & { scores: { average: number } });
              currentRoundQualifiedTexts.push(idea.ideaText);
              bs.addLog('scoring', `✓ 入展 [加权${scoreResult.weightedAverage.toFixed(1)}分] ${idea.ideaText.slice(0, 20)}...`);
            } else {
              bs.addIdeaToDiscard(scoredIdea);
              discardedIdeas.push(scoredIdea as typeof scoredIdea & { scores: { average: number }; reasoning: string });
              bs.addLog('scoring', `✗ 丢弃 [加权${scoreResult.weightedAverage.toFixed(1)}分] ${idea.ideaText.slice(0, 20)}...`);
            }
          }

          await delay(100);
        }
      }

      if (signalRef.current.aborted) return;

      // === REVIEWING ===
      bs.setPhase('reviewing');
      bs.addLog('reviewing', '复盘总结中...');

      const reviewData = {
        seedWord,
        expandedWords: allExpandedWords,
        qualifiedIdeas: qualifiedIdeas.map((i) => ({
          ideaText: i.ideaText,
          scores: { average: i.scores.average },
        })),
        discardedIdeas: discardedIdeas.map((i) => ({
          ideaText: i.ideaText,
          scores: { average: i.scores.average },
          reasoning: i.reasoning,
          userDiscardReason: (i as any).userDiscardReason,
        })),
      };

      const review = await withRetry(
        () => ai.reviewRound(reviewData, useBrainstormStore.getState().lessonsLearned),
        1,
        signalRef.current
      );

      if (review) {
        useBrainstormStore.getState().setRoundReview(review);
        if (review.lessons.length > 0) {
          useBrainstormStore.getState().addLessons(review.lessons);
        }
        bs.addLog('reviewing', `经验总结：${review.lessons.slice(0, 2).join('；')}`);
      }

      bs.addLog('reviewing', `第 ${roundNum} 轮完成，本轮入选 ${qualifiedIdeas.length} 个点子`);
    },
    [generateWords, generateMore, ai]
  );

  /** 启动完整会话 */
  const start = useCallback(
    async (topic?: string, rounds?: number) => {
      if (runningRef.current) return;
      runningRef.current = true;
      signalRef.current = { paused: false, aborted: false };

      const bs = useBrainstormStore.getState();
      bs.startSession(topic, rounds);

      if (!ai.isConfigured) {
        bs.setError('请先配置 AI 模型');
        runningRef.current = false;
        return;
      }

      // 清空画布
      useDiffuserStore.getState().clearCanvas();

      const totalRounds = rounds ?? bs.totalRounds;

      for (let round = 1; round <= totalRounds; round++) {
        if (signalRef.current.aborted) break;

        // 等待暂停解除
        while (signalRef.current.paused && !signalRef.current.aborted) {
          await delay(300);
        }
        if (signalRef.current.aborted) break;

        // 确定种子词
        let seedOverride: string | undefined;
        if (round > 1) {
          const currentState = useBrainstormStore.getState();
          // 从上一轮最高分点子提取种子
          const topIdea = [...currentState.collectionBox].sort(
            (a, b) => b.scores.average - a.scores.average
          )[0];

          if (topIdea) {
            const keywords = await ai.extractSeedKeywords(topIdea.ideaText);
            seedOverride = selectSeedFromCollection(currentState.collectionBox, keywords);
          }

          const lastRound = currentState.rounds[currentState.rounds.length - 1];
          if (!seedOverride && lastRound?.review?.suggestedSeedWord) {
            seedOverride = lastRound.review.suggestedSeedWord;
          }
        }

        try {
          await runRound(round, seedOverride);
        } catch (err: unknown) {
          if (String(err) === 'Error: aborted') break;
          const bsState = useBrainstormStore.getState();
          bsState.setError(`第 ${round} 轮执行失败：${err}`);
          break;
        }
      }

      const finalState = useBrainstormStore.getState();
      if (finalState.phase !== 'error') {
        finalState.setPhase('completed');
        finalState.addLog('completed', `全部完成！共收集 ${finalState.collectionBox.length} 个点子`);
      }

      runningRef.current = false;
    },
    [ai, runRound]
  );

  const pause = useCallback(() => {
    signalRef.current.paused = true;
    useBrainstormStore.getState().pauseSession();
  }, []);

  const resume = useCallback(() => {
    signalRef.current.paused = false;
    useBrainstormStore.getState().resumeSession();
  }, []);

  const restart = useCallback(() => {
    signalRef.current.aborted = true;
    runningRef.current = false;
    useBrainstormStore.getState().resetSession();
    useDiffuserStore.getState().clearCanvas();
  }, []);

  return {
    start,
    pause,
    resume,
    restart,
    phase,
    currentRound,
    totalRounds,
    isActive: phase !== 'idle' && phase !== 'completed' && phase !== 'error',
    isConfigured: ai.isConfigured,
  };
}
