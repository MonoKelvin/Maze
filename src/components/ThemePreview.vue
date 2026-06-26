<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeName } from '@/types/theme';

const settingsStore = useSettingsStore();

// 主题列表
const themes: Array<{ name: ThemeName; label: string }> = [
  { name: 'warm', label: '暖色' },
  { name: 'ocean', label: '海洋' },
  { name: 'forest', label: '森林' },
  { name: 'purple', label: '紫色' }
];

// 当前主题
const currentTheme = computed(() => settingsStore.currentTheme);

// 获取主题颜色
const getThemeColor = (themeName: string): string => {
  const colors: Record<string, string> = {
    warm: '#F5F2EA',
    ocean: '#F0F9FF',
    forest: '#F0FDF4',
    purple: '#FAF5FF'
  };
  return colors[themeName] || colors.warm;
};

// 切换主题
const changeTheme = (themeName: ThemeName) => {
  settingsStore.updateSettings({ theme: themeName });
};
</script>

<template>
  <div class="theme-preview">
    <div class="preview-label">主题预览</div>
    <div class="theme-cards">
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-card"
        :class="{ active: currentTheme === theme.name }"
        @click="changeTheme(theme.name)"
      >
        <div class="theme-card-background" :style="{ backgroundColor: getThemeColor(theme.name) }">
          <div class="theme-card-content">
            <div class="theme-card-icon">🎨</div>
            <div class="theme-card-label">{{ theme.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-preview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-primary-text, #2D241D);
  margin-bottom: 12px;
}

.theme-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.theme-card {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.theme-card:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-card.active {
  border-color: var(--theme-accent-color, #E07B39);
  box-shadow: 0 0 0 4px rgba(224, 123, 57, 0.2);
}

.theme-card-background {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.theme-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.theme-card-icon {
  font-size: 16px;
}

.theme-card-label {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
}
</style>
