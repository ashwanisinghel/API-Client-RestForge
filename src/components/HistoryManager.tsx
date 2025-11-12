import { useState } from 'react';
import { Trash2, Check, X, CheckSquare } from 'lucide-react';
import { useHistoryStore } from '@/stores/historyStore';
import { useTabsStore } from '@/stores/tabsStore';

export default function HistoryManager() {
  const { history, deleteHistoryItem, clearHistory } = useHistoryStore();
  const { addTab } = useTabsStore();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleHistoryClick = (itemId: string) => {
    if (selectionMode) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      setSelectedItems(newSelected);
    } else {
      const item = history.find((h) => h.id === itemId);
      if (item) {
        addTab(item.request);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    const count = selectedItems.size;
    if (confirm(`Delete ${count} selected request${count !== 1 ? 's' : ''} from history?`)) {
      selectedItems.forEach(id => deleteHistoryItem(id));
      setSelectedItems(new Set());
      setSelectionMode(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === history.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(history.map(item => item.id)));
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      clearHistory();
      setSelectedItems(new Set());
      setSelectionMode(false);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  };

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4 text-center">
        No history yet
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with Controls */}
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {selectionMode ? (
            `${selectedItems.size} of ${history.length} selected`
          ) : (
            `${history.length} request${history.length !== 1 ? 's' : ''}`
          )}
        </span>
        
        <div className="flex items-center gap-1">
          {selectionMode ? (
            <>
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                title={selectedItems.size === history.length ? 'Deselect all' : 'Select all'}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
              <button
                onClick={exitSelectionMode}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                title="Cancel selection"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectionMode(true)}
                className="px-2 py-1 text-xs hover:bg-muted rounded-md transition-colors"
                title="Select multiple items"
              >
                Select
              </button>
              <button
                onClick={handleClearAll}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Items */}
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => handleHistoryClick(item.id)}
          className={`group p-3 rounded-md cursor-pointer transition-colors relative ${
            selectionMode
              ? selectedItems.has(item.id)
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                : 'hover:bg-muted border border-transparent'
              : 'hover:bg-muted'
          }`}
        >
          {/* Selection Checkbox */}
          {selectionMode && (
            <div className="absolute top-2 right-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedItems.has(item.id)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-muted-foreground'
              }`}>
                {selectedItems.has(item.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          )}

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
            
            {/* Individual Delete Button (only in normal mode) */}
            {!selectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this request from history?')) {
                    deleteHistoryItem(item.id);
                  }
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                title="Delete from history"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
          
          <p className={`text-sm truncate mb-1 ${selectionMode ? 'pr-8' : 'pr-8'}`}>
            {item.request.url || 'No URL'}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}