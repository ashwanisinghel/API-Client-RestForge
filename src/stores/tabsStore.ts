import { create } from 'zustand';
import { Tab, RequestConfig, ResponseData } from '@/types';
import { createEmptyRequest } from '@/utils/requestUtils';

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (request?: RequestConfig) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabRequest: (tabId: string, request: RequestConfig) => void;
  updateTabResponse: (tabId: string, response: ResponseData | undefined) => void;
  setTabLoading: (tabId: string, isLoading: boolean) => void;
  duplicateTab: (tabId: string) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (request) => {
    const newTab: Tab = {
      id: crypto.randomUUID(),
      request: request || createEmptyRequest(),
      isLoading: false,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (tabId) => {
    set((state) => {
      const tabs = state.tabs.filter((tab) => tab.id !== tabId);
      let activeTabId = state.activeTabId;

      // If closing active tab, select another tab
      if (activeTabId === tabId && tabs.length > 0) {
        const closedIndex = state.tabs.findIndex((tab) => tab.id === tabId);
        const newIndex = Math.max(0, closedIndex - 1);
        activeTabId = tabs[newIndex]?.id || null;
      } else if (tabs.length === 0) {
        activeTabId = null;
      }

      return { tabs, activeTabId };
    });
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  updateTabRequest: (tabId, request) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, request } : tab
      ),
    }));
  },

  updateTabResponse: (tabId, response) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, response } : tab
      ),
    }));
  },

  setTabLoading: (tabId, isLoading) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, isLoading } : tab
      ),
    }));
  },

  duplicateTab: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (tab) {
      const newTab: Tab = {
        id: crypto.randomUUID(),
        request: { ...tab.request, id: crypto.randomUUID() },
        response: tab.response,
        isLoading: false,
      };
      set((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      }));
    }
  },
}));
