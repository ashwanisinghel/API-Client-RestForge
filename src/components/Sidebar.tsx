import { useState } from 'react';
import { History, FolderOpen, Plus, Settings } from 'lucide-react';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useTabsStore } from '@/stores/tabsStore';
import { formatTime } from '@/utils/requestUtils';

type SidebarView = 'history' | 'collections';

export default function Sidebar() {
  const [view, setView] = useState<SidebarView>('history');
  const { collections, addCollection } = useCollectionsStore();
  const { history } = useHistoryStore();
  const { addTab } = useTabsStore();

  const handleHistoryClick = (itemId: string) => {
    const item = history.find((h) => h.id === itemId);
    if (item) {
      addTab(item.request);
    }
  };

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
          <div className="space-y-1">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No history yet
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item.id)}
                  className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      item.request.method === 'GET' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      item.request.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      item.request.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      item.request.method === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.request.method}
                    </span>
                    {item.response && (
                      <span className="text-xs text-muted-foreground">
                        {item.response.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate mb-1">{item.request.url || 'No URL'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
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
