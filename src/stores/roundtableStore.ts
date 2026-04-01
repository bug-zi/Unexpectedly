import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoundtableMessage, RoundtableSession, LLMConfig } from '@/types';

/**
 * 圆桌会话状态管理
 * 独立于 appStore，不影响现有功能
 */

interface RoundtableState {
  sessions: RoundtableSession[];
  activeSessionId: string | null;
  llmConfig: LLMConfig | null;

  // 会话管理
  createSession: (questionId: string, thinkerIds: string[], rounds: number) => string;
  addMessage: (sessionId: string, message: Omit<RoundtableMessage, 'id' | 'createdAt'>) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  removeMessagesFrom: (sessionId: string, messageId: string) => void;
  completeSession: (sessionId: string, summary: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;

  // LLM 配置
  setLLMConfig: (config: LLMConfig) => void;
  clearLLMConfig: () => void;

  // 获取器
  getActiveSession: () => RoundtableSession | undefined;
  getSessionsForQuestion: (questionId: string) => RoundtableSession[];
}

export const useRoundtableStore = create<RoundtableState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      llmConfig: null,

      createSession: (questionId, thinkerIds, rounds) => {
        const id = `rt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session: RoundtableSession = {
          id,
          questionId,
          userId: 'local-user',
          thinkers: thinkerIds,
          messages: [],
          rounds,
          status: 'active',
          createdAt: new Date(),
        };

        set(state => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));

        return id;
      },

      addMessage: (sessionId, messageData) => {
        const message: RoundtableMessage = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

      removeMessagesFrom: (sessionId, messageId) => {
        set(state => ({
          sessions: state.sessions.map(s => {
            if (s.id !== sessionId) return s;
            const idx = s.messages.findIndex(m => m.id === messageId);
            if (idx === -1) return s;
            return { ...s, messages: s.messages.slice(0, idx) };
          }),
        }));
      },

      completeSession: (sessionId, summary) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, summary, status: 'completed' as const, completedAt: new Date() }
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

      getSessionsForQuestion: questionId => {
        return get().sessions.filter(s => s.questionId === questionId);
      },
    }),
    {
      name: 'wwx-roundtable',
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
