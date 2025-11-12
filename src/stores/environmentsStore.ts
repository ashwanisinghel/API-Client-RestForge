import { create } from 'zustand';
import { Environment } from '@/types';

interface EnvironmentsState {
  environments: Environment[];
  addEnvironment: (name: string) => void;
  deleteEnvironment: (id: string) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  loadEnvironments: () => Promise<void>;
  saveEnvironments: () => Promise<void>;
}

const ENVIRONMENTS_KEY = 'restforge_environments';

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
  environments: [],

  addEnvironment: (name) => {
    const newEnvironment: Environment = {
      id: crypto.randomUUID(),
      name,
      variables: [],
    };
    set((state) => ({
      environments: [...state.environments, newEnvironment],
    }));
    get().saveEnvironments();
  },

  deleteEnvironment: (id) => {
    set((state) => ({
      environments: state.environments.filter((e) => e.id !== id),
    }));
    get().saveEnvironments();
  },

  updateEnvironment: (id, updates) => {
    set((state) => ({
      environments: state.environments.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
    get().saveEnvironments();
  },

  loadEnvironments: async () => {
    try {
      const stored = localStorage.getItem(ENVIRONMENTS_KEY);
      if (stored) {
        const environments = JSON.parse(stored) as Environment[];
        set({ environments });
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  },

  saveEnvironments: async () => {
    try {
      const { environments } = get();
      localStorage.setItem(ENVIRONMENTS_KEY, JSON.stringify(environments));
    } catch (error) {
      console.error('Failed to save environments:', error);
    }
  },
}));
