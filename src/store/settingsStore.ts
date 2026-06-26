import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ThemeName } from '@/types/theme';
import { DEFAULT_STORAGE } from '@/types/storage';
import { DEFAULT_THEME, THEMES } from '@/constants/themes';

export const useSettingsStore = defineStore('settings', () => {
    // 状态
    const currentTheme = ref<ThemeName>(DEFAULT_THEME);
    const speed = ref<number>(DEFAULT_STORAGE.settings.speed);
    const entryType = ref<string>(DEFAULT_STORAGE.mazeParams.entryType);
    const exitType = ref<string>(DEFAULT_STORAGE.mazeParams.exitType);

    // 加载设置
    const loadSettings = () => {
        try {
            const settings = (window as any).electronAPI?.loadSettings();
            if (settings?.data) {
                currentTheme.value = settings.data.theme || DEFAULT_THEME;
                speed.value = settings.data.speed || DEFAULT_STORAGE.settings.speed;
                entryType.value = settings.data.entryType || DEFAULT_STORAGE.mazeParams.entryType;
                exitType.value = settings.data.exitType || DEFAULT_STORAGE.mazeParams.exitType;
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    };

    // 保存设置
    const saveSettings = () => {
        try {
            const settings = {
                theme: currentTheme.value,
                speed: speed.value,
                entryType: entryType.value,
                exitType: exitType.value
            };
            (window as any).electronAPI?.saveSettings(settings);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    };

    // 更新设置
    const updateSettings = (newSettings: Partial<{ theme: ThemeName; speed: number; entryType: string; exitType: string }>) => {
        if (newSettings.theme !== undefined) {
            currentTheme.value = newSettings.theme;
        }
        if (newSettings.speed !== undefined) {
            speed.value = newSettings.speed;
        }
        if (newSettings.entryType !== undefined) {
            entryType.value = newSettings.entryType;
        }
        if (newSettings.exitType !== undefined) {
            exitType.value = newSettings.exitType;
        }
        saveSettings();
    };

    // 重置设置
    const resetSettings = () => {
        currentTheme.value = DEFAULT_THEME;
        speed.value = DEFAULT_STORAGE.settings.speed;
        entryType.value = DEFAULT_STORAGE.mazeParams.entryType;
        exitType.value = DEFAULT_STORAGE.mazeParams.exitType;
        saveSettings();
    };

    return {
        currentTheme,
        speed,
        entryType,
        exitType,
        themes: THEMES,
        loadSettings,
        saveSettings,
        updateSettings,
        resetSettings
    };
});

export const useThemeStore = useSettingsStore;
