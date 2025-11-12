import { useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTabsStore } from '@/stores/tabsStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useEnvironmentsStore } from '@/stores/environmentsStore';
import Sidebar from './Sidebar';
import RequestPanel from './RequestPanel';
import TabBar from './TabBar';
import ResizablePanels from './ResizablePanels';

export default function Layout() {
  const { theme, setTheme } = useSettingsStore();
  const { tabs, addTab } = useTabsStore();
  const { loadCollections } = useCollectionsStore();
  const { loadHistory } = useHistoryStore();
  const { loadEnvironments } = useEnvironmentsStore();

  useEffect(() => {
    loadCollections();
    loadHistory();
    loadEnvironments();
    
    // Add initial tab if none exist
    if (tabs.length === 0) {
      addTab();
    }
  }, []);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="h-screen bg-background text-foreground">
      <ResizablePanels
        showRightPanel={true}
        defaultLeftWidth={20}
        minLeftWidth={15}
        maxLeftWidth={40}
        leftPanel={
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h1 className="text-xl font-bold">RestForge</h1>
              <button
                onClick={cycleTheme}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Toggle theme"
              >
                {getThemeIcon()}
              </button>
            </div>
            <Sidebar />
          </div>
        }
        rightPanel={
          <div className="flex flex-col h-full">
            <TabBar />
            <RequestPanel />
          </div>
        }
      />
    </div>
  );
}
