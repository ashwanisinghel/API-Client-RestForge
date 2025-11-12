import { useState } from 'react';
import { History, FolderOpen, Plus } from 'lucide-react';
import { useCollectionsStore } from '@/stores/collectionsStore';
import HistoryManager from './HistoryManager';

type SidebarView = 'history' | 'collections';

export default function Sidebar() {
  const [view, setView] = useState<SidebarView>('history');
  const { collections, addCollection } = useCollectionsStore();

  const handleNewCollection = () => {
    const name = prompt('Collection name:');
    if (name) {
      addCollection(name);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* View Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setView('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm ${
            view === 'history'
              ? 'bg-background border-b-2 border-primary'
              : 'hover:bg-muted'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
        <button
          onClick={() => setView('collections')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm ${
            view === 'collections'
              ? 'bg-background border-b-2 border-primary'
              : 'hover:bg-muted'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Collections
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {view === 'history' ? (
          <HistoryManager />
        ) : (
          <div className="space-y-1">
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No collections yet
              </p>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className="p-3 hover:bg-muted rounded-md"
                >
                  <p className="font-medium">{collection.name}</p>
                  {collection.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {collection.description}
                    </p>
                  )}
                </div>
              ))
            )}
            <button
              onClick={handleNewCollection}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
