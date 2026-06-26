<script setup lang="ts">
import { onMounted } from 'vue';
import { useThemeStore } from './store/settingsStore';
import { THEMES } from './constants/themes';
import GameView from './views/GameView.vue';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadSettings();
});

const currentThemeStyle = () => {
  const theme = THEMES[themeStore.currentTheme];
  return theme ? theme.background : '#F5F2EA';
};
</script>

<template>
  <div id="app" :style="{ backgroundColor: currentThemeStyle() }">
    <GameView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
