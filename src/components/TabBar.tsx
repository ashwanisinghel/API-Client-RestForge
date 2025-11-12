import { Plus, X } from 'lucide-react';
import { useTabsStore } from '@/stores/tabsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function TabBar() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabsStore();

  useKeyboardShortcuts();

  return (
    <div className="flex items-center border-b border-border bg-muted/30">
      <div className="flex-1 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer min-w-[150px] max-w-[200px] ${
              activeTabId === tab.id
                ? 'bg-background'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span
              className={`flex-1 truncate text-sm ${
                tab.isLoading ? 'opacity-50' : ''
              }`}
            >
              {tab.request.name || 'Untitled'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addTab()}
        className="p-2 hover:bg-muted transition-colors"
        title="New tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
