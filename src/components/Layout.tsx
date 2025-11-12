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
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      <ResizablePanels
        showRightPanel={true}
        defaultLeftWidth={20}
        minLeftWidth={15}
        maxLeftWidth={40}
        leftPanel={
          <div className="flex flex-col h-full glass-effect">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-background/80 to-muted/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">RF</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  RestForge
                </h1>
              </div>
              <button
                onClick={cycleTheme}
                className="p-2.5 hover:bg-muted/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
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
