import { create } from 'zustand';
import { Collection } from '@/types';

interface CollectionsState {
  collections: Collection[];
  addCollection: (name: string, description?: string) => void;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  addRequestToCollection: (collectionId: string, request: any) => void;
  loadCollections: () => Promise<void>;
  saveCollections: () => Promise<void>;
}

const COLLECTIONS_KEY = 'restforge_collections';

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],

  addCollection: (name, description) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description,
      requests: [],
      folders: [],
    };
    set((state) => ({
      collections: [...state.collections, newCollection],
    }));
    get().saveCollections();
  },

  deleteCollection: (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
    get().saveCollections();
  },

  updateCollection: (id, updates) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().saveCollections();
  },

  addRequestToCollection: (collectionId, request) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId 
          ? { ...c, requests: [...c.requests, { ...request, id: crypto.randomUUID() }] }
          : c
      ),
    }));
    get().saveCollections();
  },

  loadCollections: async () => {
    try {
      const stored = localStorage.getItem(COLLECTIONS_KEY);
      if (stored) {
        const collections = JSON.parse(stored) as Collection[];
        set({ collections });
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  },

  saveCollections: async () => {
    try {
      const { collections } = get();
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Failed to save collections:', error);
    }
  },
}));
