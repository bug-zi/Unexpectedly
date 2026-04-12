/**
 * 灵感源泉 - 状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DepthLevel } from '@/constants/inspirationDomains';

export interface InspirationItem {
  id: string;
  domainId: string;
  subcategoryId: string;
  depth: DepthLevel;
  content: string;
  isFavorite: boolean;
  createdAt: string;
}

const MAX_HISTORY = 100;

interface InspirationState {
  history: InspirationItem[];

  addToHistory: (item: Omit<InspirationItem, 'id' | 'createdAt'>) => string;
  toggleFavorite: (id: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryForDomain: (domainId: string) => InspirationItem[];
  getFavorites: () => InspirationItem[];
  getRecentItems: (count: number) => InspirationItem[];
}

export const useInspirationStore = create<InspirationState>()(
  persist(
    (set, get) => ({
      history: [],

      addToHistory: (item) => {
        const id = `ins-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newItem: InspirationItem = {
          ...item,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updated = [newItem, ...state.history];
          return { history: updated.slice(0, MAX_HISTORY) };
        });

        return id;
      },

      toggleFavorite: (id) => {
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
        }));
      },

      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => set({ history: [] }),

      getHistoryForDomain: (domainId) => {
        return get().history.filter((item) => item.domainId === domainId);
      },

      getFavorites: () => {
        return get().history.filter((item) => item.isFavorite);
      },

      getRecentItems: (count) => {
        return get().history.slice(0, count);
      },
    }),
    {
      name: 'wwx-inspiration',
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
