import { useState, useRef, useEffect } from 'react';
import { Trash2, Check, X, CheckSquare, MoreVertical, Edit, FolderPlus } from 'lucide-react';
import { useHistoryStore } from '@/stores/historyStore';
import { useTabsStore } from '@/stores/tabsStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useToastContext } from '@/contexts/ToastContext';

export default function HistoryManager() {
  const { history, deleteHistoryItem, clearHistory, updateHistoryItem } = useHistoryStore();
  const { addTab } = useTabsStore();
  const { collections, addRequestToCollection } = useCollectionsStore();
  const { showToast } = useToastContext();
  
  // Debug: Log collections
  console.log('HistoryManager - Available collections:', collections);
  
  // Test function to create a collection
  const createTestCollection = () => {
    const { addCollection } = useCollectionsStore.getState();
    addCollection('Test Collection', 'A test collection for debugging');
    console.log('Created test collection');
  };
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleMenuClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === itemId ? null : itemId);
  };

  const handleRename = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Rename clicked for item:', item.id, item.request.name);
    setEditingItem(item.id);
    setEditingName(item.request.name || '');
    setActiveMenu(null);
  };

  const handleSaveRename = (itemId: string) => {
    const item = history.find(h => h.id === itemId);
    if (item) {
      const updatedRequest = { ...item.request, name: editingName.trim() || 'Untitled Request' };
      updateHistoryItem(itemId, { ...item, request: updatedRequest });
    }
    setEditingItem(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingItem(null);
    setEditingName('');
  };

  const handleAddToCollection = (e: React.MouseEvent, item: any, collectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const collection = collections.find(c => c.id === collectionId);
    console.log('Adding request to collection:', {
      collectionId,
      collectionName: collection?.name,
      request: item.request,
      requestDetails: {
        method: item.request.method,
        url: item.request.url,
        name: item.request.name
      }
    });
    
    try {
      addRequestToCollection(collectionId, item.request);
      setActiveMenu(null);
      
      // Show success toast
      if (collection) {
        try {
          showToast(`Added "${item.request.name || 'Untitled Request'}" to "${collection.name}"`, 'success');
        } catch (toastError) {
          console.log('Toast error:', toastError);
          // Fallback: just log success
          console.log(`Successfully added "${item.request.name || 'Untitled Request'}" to "${collection.name}"`);
        }
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this request from history?')) {
      deleteHistoryItem(itemId);
    }
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  // Focus input when editing
  useEffect(() => {
    if (editingItem && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItem]);

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
            <span className={`${
              item.request.method === 'GET' ? 'method-get' :
              item.request.method === 'POST' ? 'method-post' :
              item.request.method === 'PUT' ? 'method-put' :
              item.request.method === 'DELETE' ? 'method-delete' :
              item.request.method === 'PATCH' ? 'method-patch' :
              item.request.method === 'HEAD' ? 'method-head' :
              item.request.method === 'OPTIONS' ? 'method-options' :
              'method-badge bg-muted text-muted-foreground ring-muted-foreground/20'
            }`}>
              {item.request.method}
            </span>
            {item.response && (
              <span className={`text-xs ${
                item.response.status >= 200 && item.response.status < 300 ? 'status-success' :
                item.response.status >= 400 ? 'status-error' :
                'status-warning'
              }`}>
                {item.response.status}
              </span>
            )}
            
            {/* Three-dot menu (only in normal mode) */}
            {!selectionMode && (
              <div className="ml-auto relative" ref={menuRef}>
                <button
                  onClick={(e) => handleMenuClick(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted/50 rounded-md transition-all duration-200"
                  title="More options"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
                
                {/* Dropdown Menu */}
                {activeMenu === item.id && (
                  <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[160px] animate-fade-in">
                    <button
                      onClick={(e) => handleRename(e, item)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Edit className="w-4 h-4" />
                      Rename
                    </button>
                    
                    {collections.length > 0 ? (
                      collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={(e) => handleAddToCollection(e, item, collection.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <FolderPlus className="w-4 h-4" />
                          Add to "{collection.name}"
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No collections available
                      </div>
                    )}
                    
                    <div className="border-t border-border my-1" />
                    
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Request Name/URL */}
          {editingItem === item.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleSaveRename(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveRename(item.id);
                } else if (e.key === 'Escape') {
                  handleCancelRename();
                }
              }}
              className="w-full text-sm font-medium bg-background/50 border border-primary/30 rounded px-2 py-1 mb-1 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              placeholder="Request name"
            />
          ) : (
            <p className="text-sm font-medium truncate mb-1 pr-8">
              {item.request.name || 'Untitled Request'}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground truncate pr-8">
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