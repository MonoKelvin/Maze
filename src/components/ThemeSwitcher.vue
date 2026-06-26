<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeName } from '@/types/theme';

const emit = defineEmits<{ change: [t: ThemeName] }>();
const settings = useSettingsStore();

const themes: { name: ThemeName; label: string; color: string }[] = [
  { name: 'warm', label: '暖色', color: '#E07B39' },
  { name: 'ocean', label: '海洋', color: '#0EA5E9' },
  { name: 'forest', label: '森林', color: '#22C55E' },
  { name: 'purple', label: '紫色', color: '#A855F7' }
];

const pick = (name: ThemeName) => {
  settings.setTheme(name);
  emit('change', name);
};
</script>

<template>
  <div class="theme-switcher">
    <div class="sec-title">主题</div>
    <div class="options">
      <button v-for="t in themes" :key="t.name"
        class="dot"
        :class="{ active: settings.theme === t.name }"
        :style="{ background: t.color }"
        :title="t.label"
        @click="pick(t.name)"
      />
    </div>
  </div>
</template>

<style scoped>
.theme-switcher { display: flex; flex-direction: column; gap: 8px; }
.sec-title { font-size: 10px; font-weight: 600; color: var(--text-sec); text-transform: uppercase; letter-spacing: 1.2px; }
.options { display: flex; gap: 8px; }
.dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
}
.dot:hover { transform: scale(1.15); }
.dot.active { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
</style>
