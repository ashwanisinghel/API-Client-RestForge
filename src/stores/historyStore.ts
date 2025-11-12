import { create } from 'zustand';
import { RequestHistoryItem } from '@/types';

interface HistoryState {
  history: RequestHistoryItem[];
  addHistoryItem: (item: RequestHistoryItem) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  loadHistory: () => Promise<void>;
  saveHistory: () => Promise<void>;
}

const HISTORY_KEY = 'restforge_history';
const MAX_HISTORY_ITEMS = 100;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],

  addHistoryItem: (item) => {
    set((state) => {
      const newHistory = [item, ...state.history];
      // Keep only last MAX_HISTORY_ITEMS
      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory.splice(MAX_HISTORY_ITEMS);
      }
      return { history: newHistory };
    });
    get().saveHistory();
  },

  clearHistory: () => {
    set({ history: [] });
    get().saveHistory();
  },

  deleteHistoryItem: (id) => {
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    }));
    get().saveHistory();
  },

  loadHistory: async () => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as RequestHistoryItem[];
        set({ history });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  saveHistory: async () => {
    try {
      const { history } = get();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  },
}));
