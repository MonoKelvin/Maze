import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ThemeName } from '@/types/theme';
import { DEFAULT_THEME, THEMES } from '@/constants/themes';

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeName>(DEFAULT_THEME);
  const speed = ref(5);

  // 持久化
  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem('maze_settings') || '{}');
      if (d.theme && d.theme in THEMES) theme.value = d.theme;
      if (d.speed) speed.value = d.speed;
    } catch {}
  };
  const save = () => {
    localStorage.setItem('maze_settings', JSON.stringify({ theme: theme.value, speed: speed.value }));
  };

  const setTheme = (t: ThemeName) => { theme.value = t; save(); };
  const setSpeed = (s: number) => { speed.value = Math.max(1, Math.min(10, s)); save(); };
  const reset = () => { theme.value = DEFAULT_THEME; speed.value = 5; save(); };

  return { speed, theme, themes: THEMES, load, save, setTheme, setSpeed, reset };
});
