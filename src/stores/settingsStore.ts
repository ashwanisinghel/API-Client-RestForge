import { create } from 'zustand';
import { AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  setTheme: (theme: AppSettings['theme']) => void;
  setActiveEnvironment: (envId: string | undefined) => void;
  setSslVerifyDefault: (verify: boolean) => void;
  setFollowRedirectsDefault: (follow: boolean) => void;
  initSettings: () => void;
  saveSettings: () => void;
}

const SETTINGS_KEY = 'restforge_settings';

const defaultSettings: AppSettings = {
  theme: 'system',
  sslVerifyDefault: true,
  followRedirectsDefault: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,

  setTheme: (theme) => {
    set({ theme });
    get().saveSettings();
  },

  setActiveEnvironment: (envId) => {
    set({ activeEnvironment: envId });
    get().saveSettings();
  },

  setSslVerifyDefault: (verify) => {
    set({ sslVerifyDefault: verify });
    get().saveSettings();
  },

  setFollowRedirectsDefault: (follow) => {
    set({ followRedirectsDefault: follow });
    get().saveSettings();
  },

  initSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored) as AppSettings;
        set(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: () => {
    try {
      const { theme, activeEnvironment, sslVerifyDefault, followRedirectsDefault } = get();
      const settings: AppSettings = {
        theme,
        activeEnvironment,
        sslVerifyDefault,
        followRedirectsDefault,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
