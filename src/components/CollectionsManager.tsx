import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  MoreVertical,
  FolderOpen,
  Copy
} from 'lucide-react';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useTabsStore } from '@/stores/tabsStore';

export default function CollectionsManager() {
  const { 
    collections, 
    addCollection, 
    deleteCollection, 
    updateCollection,
    removeRequestFromCollection,
    updateRequestInCollection
  } = useCollectionsStore();
  const { addTab } = useTabsStore();
  
  // Debug: Log collections when they change
  console.log('Collections updated:', collections);
  
  // Auto-expand collections that have requests
  useEffect(() => {
    const collectionsWithRequests = collections
      .filter(c => c.requests.length > 0)
      .map(c => c.id);
    
    if (collectionsWithRequests.length > 0) {
      setExpandedCollections(prev => {
        const newExpanded = new Set(prev);
        collectionsWithRequests.forEach(id => newExpanded.add(id));
        return newExpanded;
      });
    }
  }, [collections]);
  
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNewCollection = () => {
    const name = prompt('Collection name:');
    if (name?.trim()) {
      const description = prompt('Collection description (optional):');
      addCollection(name.trim(), description?.trim());
    }
  };

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const handleEditCollection = (collection: any) => {
    setEditingCollection(collection.id);
    setEditingName(collection.name);
    setActiveMenu(null);
  };

  const handleEditRequest = (collectionId: string, request: any) => {
    setEditingRequest(`${collectionId}-${request.id}`);
    setEditingName(request.name || 'Untitled Request');
    setActiveMenu(null);
  };

  const handleSaveCollectionName = (collectionId: string) => {
    if (editingName.trim()) {
      updateCollection(collectionId, { name: editingName.trim() });
    }
    setEditingCollection(null);
    setEditingName('');
  };

  const handleSaveRequestName = (collectionId: string, requestId: string) => {
    if (editingName.trim()) {
      updateRequestInCollection(collectionId, requestId, { name: editingName.trim() });
    }
    setEditingRequest(null);
    setEditingName('');
  };

  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    if (confirm(`Delete collection "${collectionName}"? This will remove all requests in this collection.`)) {
      deleteCollection(collectionId);
    }
    setActiveMenu(null);
  };

  const handleDeleteRequest = (collectionId: string, requestId: string, requestName: string) => {
    if (confirm(`Delete request "${requestName}" from collection?`)) {
      removeRequestFromCollection(collectionId, requestId);
    }
    setActiveMenu(null);
  };

  const handleRunRequest = (request: any) => {
    addTab(request);
    setActiveMenu(null);
  };

  const handleDuplicateRequest = (collectionId: string, request: any) => {
    const duplicatedRequest = {
      ...request,
      name: `${request.name || 'Untitled Request'} (Copy)`,
      id: crypto.randomUUID()
    };
    // Add to same collection
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      updateCollection(collectionId, {
        requests: [...collection.requests, duplicatedRequest]
      });
    }
    setActiveMenu(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setEditingCollection(null);
      setEditingRequest(null);
      setEditingName('');
    }
  };

  // Focus input when editing
  useEffect(() => {
    if ((editingCollection || editingRequest) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCollection, editingRequest]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.menu-container')) {
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

  if (collections.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground p-4 text-center">
          No collections yet
        </p>
        <button
          onClick={handleNewCollection}
          className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 border-2 border-dashed border-primary/30 hover:border-primary/50"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleNewCollection}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          title="New Collection"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Collections */}
      {collections.map((collection) => (
        <div key={collection.id} className="space-y-1">
          {/* Collection Header */}
          <div className="group flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors">
            <button
              onClick={() => toggleCollection(collection.id)}
              className="p-1 hover:bg-muted/50 rounded-md transition-colors"
            >
              {expandedCollections.has(collection.id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            
            <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
            
            {editingCollection === collection.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleSaveCollectionName(collection.id)}
                onKeyDown={(e) => handleKeyDown(e, () => handleSaveCollectionName(collection.id))}
                className="flex-1 text-sm font-medium bg-background/50 border border-primary/30 rounded px-2 py-1 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            ) : (
              <span 
                className="flex-1 text-sm font-medium truncate cursor-pointer"
                onClick={() => toggleCollection(collection.id)}
              >
                {collection.name}
              </span>
            )}
            
            <span className="text-xs text-muted-foreground">
              {collection.requests.length}
            </span>
            
            {/* Collection Menu */}
            <div className="relative menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === `collection-${collection.id}` ? null : `collection-${collection.id}`);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted/50 rounded-md transition-all duration-200"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              
              {activeMenu === `collection-${collection.id}` && (
                <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[140px] animate-fade-in">
                  <button
                    onClick={() => handleEditCollection(collection)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <Edit className="w-4 h-4" />
                    Rename
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Collection Description */}
          {expandedCollections.has(collection.id) && collection.description && (
            <div className="ml-6 px-2 py-1">
              <p className="text-xs text-muted-foreground">{collection.description}</p>
            </div>
          )}

          {/* Requests */}
          {expandedCollections.has(collection.id) && (
            <div className="ml-6 space-y-1">
              {collection.requests.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-2">No requests in this collection</p>
              ) : (
                collection.requests.map((request) => (
                  <div
                    key={request.id}
                    className="group flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                    onClick={() => handleRunRequest(request)}
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      request.method === 'GET' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      request.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      request.method === 'PUT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      request.method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      request.method === 'PATCH' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {request.method}
                    </span>
                    
                    {editingRequest === `${collection.id}-${request.id}` ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRequestName(collection.id, request.id)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleSaveRequestName(collection.id, request.id))}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-sm bg-background/50 border border-primary/30 rounded px-2 py-1 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                      />
                    ) : (
                      <span className="flex-1 text-sm truncate">
                        {request.name || 'Untitled Request'}
                      </span>
                    )}
                    
                    {/* Request Menu */}
                    <div className="relative menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === `request-${request.id}` ? null : `request-${request.id}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted/50 rounded-md transition-all duration-200"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                      
                      {activeMenu === `request-${request.id}` && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[140px] animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunRequest(request);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Play className="w-4 h-4" />
                            Run Request
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRequest(collection.id, request);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateRequest(collection.id, request);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(collection.id, request.id, request.name || 'Untitled Request');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}