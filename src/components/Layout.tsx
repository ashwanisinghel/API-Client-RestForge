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
import Logo from './Logo';
import { ToastProvider } from '@/contexts/ToastContext';

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
    <ToastProvider>
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
          <Logo size="md" showText={true} />
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">API Platform Tool</span>
            <button
              onClick={cycleTheme}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Toggle theme"
            >
              {getThemeIcon()}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanels
            showRightPanel={true}
            defaultLeftWidth={20}
            minLeftWidth={15}
            maxLeftWidth={40}
            leftPanel={
              <div className="flex flex-col h-full">
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

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>RestForge</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ for developers</span>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
