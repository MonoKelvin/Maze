<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeName } from '@/types/theme';

const settingsStore = useSettingsStore();

const themes: Array<{ name: ThemeName; label: string; color: string }> = [
  { name: 'warm', label: '暖色', color: '#F5F2EA' },
  { name: 'ocean', label: '海洋', color: '#F0F9FF' },
  { name: 'forest', label: '森林', color: '#F0FDF4' },
  { name: 'purple', label: '紫色', color: '#FAF5FF' }
];

const currentTheme = computed(() => settingsStore.currentTheme);

const changeTheme = (themeName: ThemeName) => {
  settingsStore.updateSettings({ theme: themeName });
};
</script>

<template>
  <div class="theme-switcher">
    <div class="theme-header">
      <div class="section-dot"></div>
      <span class="section-title">主题</span>
    </div>
    <div class="theme-options">
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-option"
        :class="{ active: currentTheme === theme.name }"
        :style="{ backgroundColor: theme.color }"
        @click="changeTheme(theme.name)"
      >
        <span class="theme-label">{{ theme.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-switcher {
  padding: var(--space-4) 0;
}

.theme-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.section-dot {
  width: 6px;
  height: 6px;
  background: var(--theme-accent-color);
  border-radius: var(--radius-full);
}

.section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-secondary-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.theme-options {
  display: flex;
  gap: var(--space-2);
}

.theme-option {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.theme-option:hover {
  transform: scale(1.05);
}

.theme-option.active {
  border-color: var(--theme-accent-color);
}

.theme-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--theme-primary-text);
}
</style>
