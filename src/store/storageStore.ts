import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StorageData } from '@/types/storage';
import { DEFAULT_STORAGE } from '@/types/storage';
import type { Maze, CellSize } from '@/types/maze';
import type { Theme } from '@/types/theme';
import type { PlayerGridPosition } from '@/types/player';

/**
 * 存储状态管理
 */
export const useStorageStore = defineStore('storage', () => {
  // 状态
  const storageData = ref<StorageData>(DEFAULT_STORAGE);
  const cellSize = ref<CellSize>(DEFAULT_STORAGE.cellSize || { width: 40, height: 40, offsetX: 0, offsetY: 0 });
  const theme = ref<Theme>(DEFAULT_STORAGE.theme || DEFAULT_STORAGE.settings.theme as Theme);

  /** 是否已初始化 */
  const initialized = ref<boolean>(false);

  /**
   * 初始化并加载存储数据
   */
  const initialize = () => {
    if (initialized.value) {
      return;
    }

    loadFromStorage();
    initialized.value = true;
  };

  /**
   * 加载存储数据
   */
  const loadFromStorage = () => {
    try {
      // 首先尝试从localStorage加载
      const localStorageData = localStorage.getItem('maze-storage');
      if (localStorageData) {
        try {
          const data = JSON.parse(localStorageData);
          if (data && typeof data === 'object') {
            storageData.value = {
              ...storageData.value,
              ...data,
              mazeParams: {
                ...storageData.value.mazeParams,
                ...data.mazeParams
              },
              stats: {
                ...storageData.value.stats,
                ...data.stats
              },
              settings: {
                ...storageData.value.settings,
                ...data.settings
              }
            };
            return;
          }
        } catch (error) {
          console.error('解析localStorage数据失败:', error);
        }
      }

      // 如果localStorage不可用，尝试从electron API加载
      const settings = (window as any).electronAPI?.loadSettings;
      if (settings) {
        const electronSettings = settings();
        if (electronSettings?.data) {
          storageData.value = {
            ...storageData.value,
            ...electronSettings.data,
            mazeParams: {
              ...storageData.value.mazeParams,
              ...electronSettings.data.mazeParams
            },
            stats: {
              ...storageData.value.stats,
              ...electronSettings.data.stats
            },
            settings: {
              ...storageData.value.settings,
              ...electronSettings.data.settings
            }
          };
          return;
        }
      }
    } catch (error) {
      console.error('加载存储数据失败:', error);
    }
  };

  /**
   * 保存到存储
   */
  const saveToStorage = () => {
    try {
      // 保存到localStorage
      localStorage.setItem('maze-storage', JSON.stringify(storageData.value));

      // 同时保存到electron API
      const saveSettings = (window as any).electronAPI?.saveSettings;
      if (saveSettings) {
        saveSettings({
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

  /**
   * 清空存储
   */
  const clearStorage = () => {
    storageData.value = {
      ...DEFAULT_STORAGE
    };
    localStorage.removeItem('maze-storage');
    initialized.value = false;
  };

  /**
   * 保存迷宫参数
   */
  const saveMazeParams = (params: Partial<StorageData['mazeParams']>) => {
    storageData.value.mazeParams = {
      ...storageData.value.mazeParams,
      ...params
    };
    saveToStorage();
  };

  /**
   * 保存玩家位置
   */
  const savePlayerGridPos = (pos: { row: number; col: number }) => {
    storageData.value.playerGridPos = pos;
    saveToStorage();
  };

  /**
   * 保存统计数据
   */
  const saveStats = (stats: Partial<StorageData['stats']>) => {
    storageData.value.stats = {
      ...storageData.value.stats,
      ...stats
    };
    saveToStorage();
  };

  /**
   * 保存设置
   */
  const saveSettings = (settings: Partial<StorageData['settings']>) => {
    storageData.value.settings = {
      ...storageData.value.settings,
      ...settings
    };
    saveToStorage();
  };

  /**
   * 保存完整游戏状态
   */
  const saveGameState = (
    maze: Maze | null,
    playerGridPos: { row: number; col: number },
    cellSize: CellSize,
    theme: Theme
  ) => {
    storageData.value.mazeParams = {
      ...storageData.value.mazeParams,
      mode: maze?.params.mode || DEFAULT_STORAGE.mazeParams.mode,
      rows: maze?.params.rows || DEFAULT_STORAGE.mazeParams.rows,
      cols: maze?.params.cols || DEFAULT_STORAGE.mazeParams.cols,
      seed: maze?.params.seed,
      entryType: maze?.params.entry.type as any,
      exitType: maze?.params.exit.type as any
    };

    storageData.value.playerGridPos = playerGridPos;
    storageData.value.cellSize = cellSize;
    storageData.value.theme = theme;

    saveToStorage();
  };

  /**
   * 恢复游戏状态
   */
  const restoreGameState = (): {
    maze: Maze | null;
    playerGridPos: { row: number; col: number };
    cellSize: CellSize;
    theme: Theme;
  } | null => {
    if (!initialized.value) {
      return null;
    }

    return {
      maze: null, // 需要重新生成
      playerGridPos: storageData.value.playerGridPos,
      cellSize: cellSize.value,
      theme: theme.value
    };
  };

  return {
    storageData,
    initialized,
    initialize,
    loadFromStorage,
    saveToStorage,
    clearStorage,
    saveMazeParams,
    savePlayerGridPos,
    saveStats,
    saveSettings,
    saveGameState,
    restoreGameState
  };
});
