import { useState } from 'react';
import { History, FolderOpen } from 'lucide-react';
import HistoryManager from './HistoryManager';
import CollectionsManager from './CollectionsManager';

type SidebarView = 'history' | 'collections';

export default function Sidebar() {
  const [view, setView] = useState<SidebarView>('history');

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
          <CollectionsManager />
        )}
      </div>
    </div>
  );
}
