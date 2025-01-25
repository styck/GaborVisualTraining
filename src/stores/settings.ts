import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_VERSION = 1; // 添加版本号
const STORAGE_KEY = 'training-settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(DEFAULT_SETTINGS);

  function updateSettings(newSettings: Partial<Settings>) {
    settings.value = {
      ...settings.value,
      ...newSettings
    };
    saveSettings();
  }

  function resetSection(section: keyof Settings) {
    settings.value = {
      ...settings.value,
      [section]: DEFAULT_SETTINGS[section]
    };
    saveSettings();
  }

  function resetAll() {
    settings.value = DEFAULT_SETTINGS;
    saveSettings();
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SETTINGS_VERSION,
      settings: settings.value
    }));
  }

  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // 检查版本号
        if (!parsed.version || parsed.version < SETTINGS_VERSION) {
          // 如果是旧版本或没有版本号，重置设置
          console.log('Settings version mismatch, resetting to defaults');
          localStorage.removeItem(STORAGE_KEY);
          settings.value = DEFAULT_SETTINGS;
        } else {
          // 合并设置，确保所有必需的字段都存在
          settings.value = {
            ...DEFAULT_SETTINGS,
            ...parsed.settings
          };
        }
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
        settings.value = DEFAULT_SETTINGS;
      }
    } else {
      settings.value = DEFAULT_SETTINGS;
    }
  }

  // 初始化时加载设置
  loadSettings();

  return {
    settings,
    updateSettings,
    resetSection,
    resetAll,
    saveSettings,
    loadSettings
  };
}); 