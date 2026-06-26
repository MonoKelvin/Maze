<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';
import GameView from '@/views/GameView.vue';

const settings = useSettingsStore();

function applyTheme() {
  const t = settings.themes[settings.theme];
  if (!t) return;
  const r = document.documentElement;
  r.style.setProperty('--bg', t.background);
  r.style.setProperty('--panel-bg', t.panelBg);
  r.style.setProperty('--panel-border', t.panelBorder);
  r.style.setProperty('--wall', t.wallColor);
  r.style.setProperty('--wall-glow', t.wallGlow);
  r.style.setProperty('--player', t.playerColor);
  r.style.setProperty('--player-glow', t.playerGlow);
  r.style.setProperty('--accent', t.accent);
  r.style.setProperty('--accent-soft', t.accentSoft);
  r.style.setProperty('--text-pri', t.text);
  r.style.setProperty('--text-sec', t.textSecondary);
}

onMounted(() => {
  settings.load();
  applyTheme();
});

// 监听主题变化 → 立即刷新所有 CSS 变量
watch(() => settings.theme, applyTheme);
</script>

<template>
  <div id="app" :style="{ background: 'var(--bg)' }">
    <GameView />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-pri, #1a1a1a);
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  font-size: inherit;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

canvas { display: block; }
</style>
