import { useCallback, useRef, useState } from 'react';
import { useDebateStore } from '@/stores/debateStore';
import { buildTopicGenerationMessages, buildOpponentMessages, buildJudgeMessages } from '@/utils/debatePrompts';
import { streamChat, chat } from '@/services/llmService';
import { DebateStance, JudgeResult, LLMConfig } from '@/types';

/**
 * 辩论堂核心 hook
 * 管理辩论的完整流程：生成辩题 → 选择立场 → 辩论 → 评委评价
 */
export function useDebate() {
  const {
    createSession,
    addMessage,
    updateMessageContent,
    completeSession,
    getActiveSession,
    llmConfig,
  } = useDebateStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortRef = useRef(false);

  /**
   * 生成辩题
   */
  const generateTopic = useCallback(async (): Promise<string> => {
    if (!llmConfig) throw new Error('请先配置 API Key');

    abortRef.current = false;
    setIsGeneratingTopic(true);

    try {
      const messages = buildTopicGenerationMessages();
      const configSnapshot: LLMConfig = { ...llmConfig };
      const topic = await chat(messages, configSnapshot);
      return topic.trim();
    } finally {
      setIsGeneratingTopic(false);
    }
  }, [llmConfig]);

  /**
   * 开始辩论 - 创建会话
   */
  const startDebate = useCallback((topic: string, userStance: DebateStance): string => {
    if (!llmConfig) throw new Error('请先配置 API Key');

    abortRef.current = false;
    const sessionId = createSession(topic, userStance);
    return sessionId;
  }, [llmConfig, createSession]);

  /**
   * 发送用户消息并触发AI对手回复
   */
  const sendUserMessage = useCallback(async (content: string) => {
    const session = getActiveSession();
    if (!session || !llmConfig) return;

    const userStance = session.userStance;

    // 添加用户消息
    addMessage(session.id, {
      role: 'user',
      stance: userStance,
      content,
    });

    // 触发AI对手回复
    const configSnapshot: LLMConfig = { ...llmConfig };
    const opponentStance: DebateStance = userStance === 'pro' ? 'con' : 'pro';

    setIsGenerating(true);

    // 获取最新session状态用于构建消息
    const currentSession = useDebateStore.getState().sessions.find(s => s.id === session.id);
    if (!currentSession) {
      setIsGenerating(false);
      return;
    }

    const messages = buildOpponentMessages(currentSession);

    // 添加空的对手消息占位
    addMessage(session.id, {
      role: 'opponent',
      stance: opponentStance,
      content: '',
    });

    const updatedSession = useDebateStore.getState().sessions.find(s => s.id === session.id);
    const lastMsg = updatedSession?.messages[updatedSession.messages.length - 1];
    if (!lastMsg) {
      setIsGenerating(false);
      return;
    }

    setStreamingMessageId(lastMsg.id);

    let fullContent = '';
    try {
      for await (const token of streamChat(messages, configSnapshot)) {
        if (abortRef.current) break;
        fullContent += token;
        updateMessageContent(session.id, lastMsg.id, fullContent);
      }
    } catch (err) {
      if (!fullContent) {
        fullContent = `（生成失败: ${err instanceof Error ? err.message : '未知错误'}）`;
        updateMessageContent(session.id, lastMsg.id, fullContent);
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  }, [getActiveSession, llmConfig, addMessage, updateMessageContent]);

  /**
   * 请求评委评价
   */
  const requestJudge = useCallback(async (): Promise<JudgeResult | null> => {
    const session = getActiveSession();
    if (!session || !llmConfig) return null;

    setIsGenerating(true);

    try {
      const messages = buildJudgeMessages(session);
      const configSnapshot: LLMConfig = { ...llmConfig };
      const responseText = await chat(messages, configSnapshot);

      // 解析JSON结果
      let judgeResult: JudgeResult;
      try {
        // 尝试直接解析
        judgeResult = JSON.parse(responseText);
      } catch {
        // 尝试提取JSON块
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          judgeResult = JSON.parse(jsonMatch[0]);
        } else {
          // 降级处理
          judgeResult = {
            summary: responseText.slice(0, 200),
            userScore: 7,
            opponentScore: 7,
            userStrengths: ['论点表达清晰'],
            userWeaknesses: ['可进一步丰富论据'],
            keyClashes: ['核心观点的交锋'],
            winner: 'draw' as const,
            advice: '继续保持思辨精神',
          };
        }
      }

      completeSession(session.id, judgeResult);
      return judgeResult;
    } catch (err) {
      console.error('评委评价失败:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [getActiveSession, llmConfig, completeSession]);

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
    setStreamingMessageId(null);
  }, []);

  return {
    generateTopic,
    startDebate,
    sendUserMessage,
    requestJudge,
    stopGeneration,
    isGenerating,
    isGeneratingTopic,
    streamingMessageId,
  };
}
