import { useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import Layout from './components/Layout';

function App() {
  const { theme, initSettings } = useSettingsStore();

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return <Layout />;
}

export default App;
