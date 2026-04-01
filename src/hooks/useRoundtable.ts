import { useCallback, useRef, useState } from 'react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { THINKERS, getThinkerById } from '@/constants/thinkers';
import { buildRoundtableMessages, buildSummaryMessages } from '@/utils/prompts';
import { streamChat, chat } from '@/services/llmService';
import { LLMConfig } from '@/types';

/**
 * 圆桌讨论核心 hook
 * 管理多轮多人大咖讨论的完整流程
 */
export function useRoundtable() {
  const {
    createSession,
    addMessage,
    updateMessageContent,
    completeSession,
    getActiveSession,
    llmConfig,
  } = useRoundtableStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortRef = useRef(false);

  /**
   * 核心讨论循环 - 提取为独立函数，避免 useCallback 循环依赖
   */
  const runLoop = async (
    sessionId: string,
    thinkerIds: string[],
    rounds: number,
    config: LLMConfig,
  ) => {
    setIsGenerating(true);

    try {
      for (let round = 1; round <= rounds; round++) {
        for (const thinkerId of thinkerIds) {
          if (abortRef.current) break;

          const thinker = getThinkerById(thinkerId);
          if (!thinker) continue;

          const currentSession = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
          if (!currentSession) break;

          const messages = buildRoundtableMessages(thinker, currentSession, THINKERS);

          addMessage(sessionId, {
            role: 'thinker',
            thinkerId,
            content: '',
            round,
          });

          const updatedSession = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
          const lastMsg = updatedSession?.messages[updatedSession.messages.length - 1];
          if (!lastMsg) continue;

          setStreamingMessageId(lastMsg.id);

          let fullContent = '';
          try {
            for await (const token of streamChat(messages, config)) {
              if (abortRef.current) break;
              fullContent += token;
              updateMessageContent(sessionId, lastMsg.id, fullContent);
            }
          } catch (err) {
            if (!fullContent) {
              fullContent = `（生成失败: ${err instanceof Error ? err.message : '未知错误'}）`;
              updateMessageContent(sessionId, lastMsg.id, fullContent);
            }
          }

          setStreamingMessageId(null);
        }
        if (abortRef.current) break;
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  };

  /**
   * 开始圆桌讨论 - 立即返回 sessionId，讨论在后台异步进行
   */
  const startDiscussion = useCallback((
    questionContent: string,
    questionId: string,
    thinkerIds: string[],
    rounds: number = 2,
  ): string => {
    if (!llmConfig) throw new Error('请先配置 API Key');
    if (thinkerIds.length === 0) throw new Error('请至少选择一位大咖');

    abortRef.current = false;

    // 创建会话
    const sessionId = createSession(questionId, thinkerIds, rounds);

    // 添加问题消息
    addMessage(sessionId, {
      role: 'user',
      content: questionContent,
    });

    // 后台运行讨论（不阻塞返回）
    // 捕获当前 config 快照，避免闭包引用后续变化
    const configSnapshot = { ...llmConfig };
    runLoop(sessionId, thinkerIds, rounds, configSnapshot).catch(err => {
      console.error('讨论循环异常:', err);
      setIsGenerating(false);
      setStreamingMessageId(null);
    });

    return sessionId;
  }, [llmConfig, createSession, addMessage, updateMessageContent]);

  /**
   * 用户发言 - 在讨论中插入用户的消息
   */
  const sendUserMessage = useCallback(async (content: string) => {
    const session = getActiveSession();
    if (!session || !llmConfig) return;

    addMessage(session.id, {
      role: 'user',
      content,
    });

    const configSnapshot = { ...llmConfig };
    const maxRound = Math.max(...session.messages.filter(m => m.round).map(m => m.round || 0), 0);
    const nextRound = maxRound + 1;

    setIsGenerating(true);
    try {
      for (const thinkerId of session.thinkers) {
        if (abortRef.current) break;

        const thinker = getThinkerById(thinkerId);
        if (!thinker) continue;

        const currentSession = useRoundtableStore.getState().sessions.find(s => s.id === session.id);
        if (!currentSession) break;

        const messages = buildRoundtableMessages(thinker, currentSession, THINKERS);

        addMessage(session.id, {
          role: 'thinker',
          thinkerId,
          content: '',
          round: nextRound,
        });

        const updatedSession = useRoundtableStore.getState().sessions.find(s => s.id === session.id);
        const lastMsg = updatedSession?.messages[updatedSession.messages.length - 1];
        if (!lastMsg) continue;

        setStreamingMessageId(lastMsg.id);

        let fullContent = '';
        try {
          for await (const token of streamChat(messages, configSnapshot)) {
            if (abortRef.current) break;
            fullContent += token;
            updateMessageContent(session.id, lastMsg.id, fullContent);
          }
        } catch {
          if (!fullContent) {
            updateMessageContent(session.id, lastMsg.id, '（生成失败）');
          }
        }

        setStreamingMessageId(null);
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  }, [getActiveSession, llmConfig, addMessage, updateMessageContent]);

  /**
   * 生成讨论摘要
   */
  const generateSummary = useCallback(async (sessionId: string) => {
    const session = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
    if (!session || !llmConfig) return;

    const messages = buildSummaryMessages(session, THINKERS);
    const summary = await chat(messages, llmConfig);
    completeSession(sessionId, summary);
    return summary;
  }, [llmConfig, completeSession]);

  /**
   * 继续讨论 - 追加一轮
   */
  const continueDiscussion = useCallback(async (sessionId: string) => {
    const session = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
    if (!session || !llmConfig) return;

    const configSnapshot = { ...llmConfig };
    const maxRound = Math.max(...session.messages.filter(m => m.round).map(m => m.round || 0), 0);
    const nextRound = maxRound + 1;

    setIsGenerating(true);
    try {
      for (const thinkerId of session.thinkers) {
        if (abortRef.current) break;

        const thinker = getThinkerById(thinkerId);
        if (!thinker) continue;

        const currentSession = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
        if (!currentSession) break;

        const messages = buildRoundtableMessages(thinker, currentSession, THINKERS);

        addMessage(sessionId, {
          role: 'thinker',
          thinkerId,
          content: '',
          round: nextRound,
        });

        const updatedSession = useRoundtableStore.getState().sessions.find(s => s.id === sessionId);
        const lastMsg = updatedSession?.messages[updatedSession.messages.length - 1];
        if (!lastMsg) continue;

        setStreamingMessageId(lastMsg.id);

        let fullContent = '';
        try {
          for await (const token of streamChat(messages, configSnapshot)) {
            if (abortRef.current) break;
            fullContent += token;
            updateMessageContent(sessionId, lastMsg.id, fullContent);
          }
        } catch {
          if (!fullContent) {
            updateMessageContent(sessionId, lastMsg.id, '（生成失败）');
          }
        }

        setStreamingMessageId(null);
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  }, [llmConfig, addMessage, updateMessageContent]);

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
    setStreamingMessageId(null);
  }, []);

  return {
    startDiscussion,
    sendUserMessage,
    generateSummary,
    continueDiscussion,
    stopGeneration,
    isGenerating,
    streamingMessageId,
  };
}
