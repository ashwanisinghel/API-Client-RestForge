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
      <div className="flex border-b border-border/50 bg-muted/10">
        <button
          onClick={() => setView('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
            view === 'history'
              ? 'text-primary bg-background/60'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/30'
          }`}
        >
          <History className="w-4 h-4" />
          History
          {view === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setView('collections')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
            view === 'collections'
              ? 'text-primary bg-background/60'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/30'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Collections
          {view === 'collections' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
          )}
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
              className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 border-2 border-dashed border-primary/30 hover:border-primary/50 mt-4"
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
