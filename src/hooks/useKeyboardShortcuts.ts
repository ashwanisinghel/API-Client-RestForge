import { useEffect } from 'react';
import { useTabsStore } from '@/stores/tabsStore';

export function useKeyboardShortcuts() {
  const { addTab, tabs, activeTabId, setTabLoading, updateTabResponse } = useTabsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        addTab();
      }

      // Ctrl+W: Close tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        // Close current tab logic would go here
      }

      // Ctrl+Enter: Send request
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Send request logic is handled in RequestPanel
        // This is just a placeholder for the shortcut registration
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addTab, tabs, activeTabId]);
}
