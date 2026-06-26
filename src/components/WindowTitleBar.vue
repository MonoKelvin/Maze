<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Minus, Square, Maximize2, X } from 'lucide-vue-next';
import { useThemeStore } from '@/store/settingsStore';
import type { Theme } from '@/types/theme';

const themeStore = useThemeStore();

const theme = computed<Theme>(() => {
  return themeStore.themes[themeStore.currentTheme];
});

const windowState = ref<'normal' | 'maximized'>('normal');

const handleMinimize = async () => {
  await (window as any).electronAPI?.minimizeWindow();
};

const handleMaximize = async () => {
  await (window as any).electronAPI?.maximizeWindow();
  windowState.value = windowState.value === 'normal' ? 'maximized' : 'normal';
};

const handleClose = async () => {
  await (window as any).electronAPI?.closeWindow();
};

const handleDoubleClick = async () => {
  await handleMaximize();
};

const fetchWindowState = async () => {
  const state = await (window as any).electronAPI?.getWindowState();
  if (state === 'maximized') {
    windowState.value = 'maximized';
  }
};

onMounted(() => {
  fetchWindowState();
});
</script>

<template>
  <div
    class="window-title-bar"
    @dblclick="handleDoubleClick"
    :style="{
      backgroundColor: theme.panelBackground,
      borderBottom: `1px solid ${theme.accentColor}15`
    }"
  >
    <div class="title-bar-left">
      <div class="app-icon">
        <span class="icon-symbol">🌀</span>
      </div>
      <div class="app-title">迷宫</div>
    </div>

    <div class="window-controls">
      <button
        class="control-button minimize"
        @click="handleMinimize"
        :style="{ color: theme.primaryText }"
      >
        <Minus :size="14" />
      </button>
      <button
        class="control-button maximize"
        @click="handleMaximize"
        :style="{ color: theme.primaryText }"
      >
        <Square v-if="windowState === 'normal'" :size="14" />
        <Maximize2 v-else :size="14" />
      </button>
      <button
        class="control-button close"
        @click="handleClose"
        :style="{ color: theme.primaryText }"
      >
        <X :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.window-title-bar {
  height: var(--title-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: var(--space-3);
  padding-right: 0;
  user-select: none;
  flex-shrink: 0;
  -webkit-app-region: drag;
  transition: background-color var(--transition-normal);
}

.window-title-bar:hover {
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.app-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-symbol {
  font-size: 18px;
}

.app-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
}

.window-controls {
  display: flex;
  gap: 0;
  -webkit-app-region: no-drag;
}

.control-button {
  width: 46px;
  height: var(--title-bar-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 0;
}

.control-button:hover {
  background: rgba(0, 0, 0, 0.08);
}

.control-button.close:hover {
  background: #E81123;
}

.control-button.close:hover svg {
  color: white;
}
</style>
