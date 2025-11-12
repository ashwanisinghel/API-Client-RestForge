import { create } from 'zustand';
import { Collection } from '@/types';

interface CollectionsState {
  collections: Collection[];
  addCollection: (name: string, description?: string) => void;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  addRequestToCollection: (collectionId: string, request: any) => void;
  removeRequestFromCollection: (collectionId: string, requestId: string) => void;
  updateRequestInCollection: (collectionId: string, requestId: string, updates: any) => void;
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
    console.log('Store: Adding request to collection', { collectionId, request });
    
    const collection = get().collections.find(c => c.id === collectionId);
    if (!collection) {
      console.error('Collection not found:', collectionId);
      return;
    }
    
    // Create a new request with a unique ID
    const newRequest = { ...request, id: crypto.randomUUID() };
    console.log('Store: Created new request with ID:', newRequest.id);
    
    set((state) => {
      const updatedCollections = state.collections.map((c) =>
        c.id === collectionId 
          ? { ...c, requests: [...c.requests, newRequest] }
          : c
      );
      
      console.log('Store: Updated collections after add:', updatedCollections);
      const targetCollection = updatedCollections.find(c => c.id === collectionId);
      console.log('Store: Target collection now has', targetCollection?.requests.length, 'requests');
      
      return { collections: updatedCollections };
    });
    
    // Zustand's set is synchronous, so we can save immediately
    get().saveCollections();
    
    // Verify the save
    const savedState = get();
    const verifyCollection = savedState.collections.find(c => c.id === collectionId);
    console.log('Store: Verification - collection has', verifyCollection?.requests.length, 'requests');
  },

  removeRequestFromCollection: (collectionId, requestId) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId 
          ? { ...c, requests: c.requests.filter(r => r.id !== requestId) }
          : c
      ),
    }));
    get().saveCollections();
  },

  updateRequestInCollection: (collectionId, requestId, updates) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId 
          ? { 
              ...c, 
              requests: c.requests.map(r => 
                r.id === requestId ? { ...r, ...updates } : r
              ) 
            }
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
      console.log('Store: Saving collections to localStorage:', collections);
      const serialized = JSON.stringify(collections);
      localStorage.setItem(COLLECTIONS_KEY, serialized);
      console.log('Store: Collections saved successfully');
      
      // Verify the save
      const verification = localStorage.getItem(COLLECTIONS_KEY);
      if (verification) {
        const parsed = JSON.parse(verification);
        console.log('Store: Verified saved collections:', parsed);
      }
    } catch (error) {
      console.error('Failed to save collections:', error);
    }
  },
}));
