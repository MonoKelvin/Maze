<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';
import GameView from '@/views/GameView.vue';

const settings = useSettingsStore();

// 主题应用
function applyTheme() {
  const t = settings.themes[settings.theme];
  if (!t) return;
  const root = document.documentElement;
  root.style.setProperty('--bg', t.background);
  root.style.setProperty('--panel-bg', t.panelBg);
  root.style.setProperty('--wall', t.wallColor);
  root.style.setProperty('--wall-glow', t.wallGlow);
  root.style.setProperty('--player', t.playerColor);
  root.style.setProperty('--player-glow', t.playerGlow);
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--text-pri', t.text);
  root.style.setProperty('--text-sec', t.textSecondary);
}

onMounted(() => {
  settings.load();
  applyTheme();
});
</script>

<template>
  <div id="app" :style="{ background: 'var(--bg)' }">
    <GameView />
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Inter', -apple-system, 'SF Pro', sans-serif; -webkit-font-smoothing: antialiased; }
button { font-family: inherit; cursor: pointer; }
</style>
