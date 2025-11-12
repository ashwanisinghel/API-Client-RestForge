import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useTabsStore } from '@/stores/tabsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function TabBar() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab, updateTabRequest } = useTabsStore();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleDoubleClick = (tab: any) => {
    setEditingTabId(tab.id);
    setEditingName(tab.request.name || '');
  };

  const handleSaveName = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      updateTabRequest(tabId, { ...tab.request, name: editingName.trim() || 'Untitled Request' });
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleSaveName(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingName('');
    }
  };

  return (
    <div className="flex items-center border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
      <div className="flex-1 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-5 py-3 border-r border-border/30 cursor-pointer min-w-[160px] max-w-[220px] transition-all duration-200 relative ${
              activeTabId === tab.id
                ? 'bg-background/80 shadow-sm'
                : 'hover:bg-background/40'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleSaveName(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                className="flex-1 bg-background/50 border border-primary/30 rounded px-2 py-1 outline-none text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="Tab name"
              />
            ) : (
              <span
                className={`flex-1 truncate text-sm font-medium ${
                  tab.isLoading ? 'opacity-50' : ''
                } ${activeTabId === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}
                onDoubleClick={() => handleDoubleClick(tab)}
                title="Double-click to edit"
              >
                {tab.request.name || 'Untitled Request'}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted/50 rounded-md transition-all duration-200 hover:scale-110"
            >
              <X className="w-3 h-3" />
            </button>
            {activeTabId === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => addTab()}
        className="p-3 hover:bg-background/40 transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg mx-2"
        title="New tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
