import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DebateMessage, DebateSession, DebateStance, DebateStatus, JudgeResult, LLMConfig } from '@/types';

/**
 * 辩论堂状态管理
 * 独立于 appStore 和 roundtableStore，不影响现有功能
 */

interface DebateState {
  sessions: DebateSession[];
  activeSessionId: string | null;
  llmConfig: LLMConfig | null;

  // 会话管理
  createSession: (topic: string, userStance: DebateStance) => string;
  addMessage: (sessionId: string, message: Omit<DebateMessage, 'id' | 'createdAt'>) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  updateSessionStatus: (sessionId: string, status: DebateStatus) => void;
  completeSession: (sessionId: string, judgeResult: JudgeResult) => void;
  setActiveSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;

  // LLM 配置
  setLLMConfig: (config: LLMConfig) => void;
  clearLLMConfig: () => void;

  // 获取器
  getActiveSession: () => DebateSession | undefined;
}

export const useDebateStore = create<DebateState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      llmConfig: null,

      createSession: (topic, userStance) => {
        const id = `debate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session: DebateSession = {
          id,
          userId: 'local-user',
          topic,
          userStance,
          messages: [],
          status: 'debating',
          createdAt: new Date(),
        };

        set(state => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));

        return id;
      },

      addMessage: (sessionId, messageData) => {
        const message: DebateMessage = {
          ...messageData,
          id: `dmsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message] }
              : s
          ),
        }));
      },

      updateMessageContent: (sessionId, messageId, content) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : s
          ),
        }));
      },

      updateSessionStatus: (sessionId, status) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, status } : s
          ),
        }));
      },

      completeSession: (sessionId, judgeResult) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, status: 'judged' as const, judgeResult, completedAt: new Date() }
              : s
          ),
        }));
      },

      setActiveSession: sessionId => set({ activeSessionId: sessionId }),

      deleteSession: sessionId =>
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
        })),

      setLLMConfig: config => set({ llmConfig: config }),
      clearLLMConfig: () => set({ llmConfig: null }),

      getActiveSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.activeSessionId);
      },
    }),
    {
      name: 'wwx-debate',
      partialize: state => ({
        sessions: state.sessions,
        llmConfig: state.llmConfig ? {
          provider: state.llmConfig.provider,
          apiKey: state.llmConfig.apiKey,
          model: state.llmConfig.model,
          baseUrl: state.llmConfig.baseUrl,
        } : null,
      }),
    }
  )
);
