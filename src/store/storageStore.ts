import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StorageData } from '@/types/storage';
import { DEFAULT_STORAGE } from '@/types/storage';

/**
 * 存储状态管理
 */
export const useStorageStore = defineStore('storage', () => {
  // 状态
  const storageData = ref<StorageData>(DEFAULT_STORAGE);

  // 加载存储数据
  const loadFromStorage = () => {
    try {
      const settings = (window as any).electronAPI?.loadSettings();
      if (settings?.data) {
        storageData.value = {
          ...storageData.value,
          ...settings.data
        };

        // 更新 mazeParams
        storageData.value.mazeParams = {
          ...storageData.value.mazeParams,
          ...settings.data.mazeParams
        };

        // 更新 settings
        storageData.value.settings = {
          ...storageData.value.settings,
          ...settings.data.settings
        };
      }
    } catch (error) {
      console.error('加载存储数据失败:', error);
    }
  };

  // 保存到存储
  const saveToStorage = () => {
    try {
      const settings = (window as any).electronAPI?.saveSettings;
      if (settings) {
        settings({
          ...storageData.value,
          playerGridPos: storageData.value.playerGridPos,
          stats: storageData.value.stats,
          settings: storageData.value.settings
        });
      }
    } catch (error) {
      console.error('保存存储数据失败:', error);
    }
  };

  // 清空存储
  const clearStorage = () => {
    storageData.value = {
      ...DEFAULT_STORAGE
    };
  };

  // 更新 mazeParams
  const updateMazeParams = (params: Partial<StorageData['mazeParams']>) => {
    storageData.value.mazeParams = {
      ...storageData.value.mazeParams,
      ...params
    };
  };

  // 更新 playerGridPos
  const updatePlayerGridPos = (pos: { row: number; col: number }) => {
    storageData.value.playerGridPos = pos;
  };

  // 更新 stats
  const updateStats = (stats: Partial<StorageData['stats']>) => {
    storageData.value.stats = {
      ...storageData.value.stats,
      ...stats
    };
  };

  // 更新 settings
  const updateSettings = (settings: Partial<StorageData['settings']>) => {
    storageData.value.settings = {
      ...storageData.value.settings,
      ...settings
    };
  };

  return {
    storageData,
    loadFromStorage,
    saveToStorage,
    clearStorage,
    updateMazeParams,
    updatePlayerGridPos,
    updateStats,
    updateSettings
  };
});
