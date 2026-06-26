<script setup lang="ts">
import { X, Github, Heart, ExternalLink } from 'lucide-vue-next';

const emit = defineEmits<{ close: [] }>();

const APP_NAME = 'Maze';
const APP_VERSION = '1.1.0';
const APP_DESC = '一款极简、高级的桌面迷宫游戏，基于 Electron + Vue 3 + TypeScript 构建，支持多种主题与流畅交互体验。';
const APP_AUTHOR = 'MonoKelvin';
const APP_LICENSE = 'MIT';
const APP_REPO = 'https://github.com/MonoKelvin/Maze';
</script>

<template>
  <div class="amo" @click.self="emit('close')">
    <div class="amo-card">
      <button class="amo-close" @click="emit('close')"><X :size="16" /></button>

      <!-- Logo -->
      <div class="amo-logo">
        <span class="amo-m">M</span>
      </div>

      <div class="amo-meta">
        <h2 class="amo-name">{{ APP_NAME }}</h2>
        <span class="amo-ver">v{{ APP_VERSION }}</span>
      </div>

      <p class="amo-desc">{{ APP_DESC }}</p>

      <!-- 信息列表 -->
      <div class="amo-info">
        <div class="amo-row">
          <span class="amo-label">作者</span>
          <span class="amo-value">{{ APP_AUTHOR }}</span>
        </div>
        <div class="amo-row">
          <span class="amo-label">许可</span>
          <span class="amo-value">{{ APP_LICENSE }}</span>
        </div>
        <div class="amo-row">
          <span class="amo-label">仓库</span>
          <a :href="APP_REPO" class="amo-link" target="_blank" @click.stop>
            <Github :size="13" /> GitHub
            <ExternalLink :size="10" class="amo-ext" />
          </a>
        </div>
      </div>

      <div class="amo-foot">
        <Heart :size="11" class="amo-heart" />
        <span>Crafted with care</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amo {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: amo-fade 0.2s ease;
}
@keyframes amo-fade { from { opacity: 0; } to { opacity: 1; } }

.amo-card {
  position: relative;
  width: 380px; max-width: 92vw;
  background: var(--panel-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 18px;
  padding: 36px 32px 28px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.16),
    0 4px 16px rgba(0,0,0,0.06),
    0 0 0 1px var(--panel-border);
  animation: amo-pop 0.25s cubic-bezier(0.16,1,0.3,1);
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
@keyframes amo-pop {
  from { transform: scale(0.94) translateY(8px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

.amo-close {
  position: absolute; top: 12px; right: 12px;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  color: var(--text-sec);
  opacity: 0.55;
  transition: all 0.15s ease;
}
.amo-close:hover { opacity: 1; background: rgba(128,128,128,0.10); }

/* Logo */
.amo-logo {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px var(--accent-soft);
}
.amo-m {
  font-size: 28px; font-weight: 800; color: #fff;
  letter-spacing: -1px;
  line-height: 1;
}

.amo-meta {
  display: flex; align-items: baseline; gap: 8px;
}
.amo-name {
  font-size: 20px; font-weight: 700;
  color: var(--text-pri);
  letter-spacing: -0.3px;
}
.amo-ver {
  font-size: 12px; font-weight: 500;
  color: var(--text-sec);
  background: rgba(128,128,128,0.10);
  padding: 2px 8px; border-radius: 10px;
}

.amo-desc {
  font-size: 13px; line-height: 1.65;
  color: var(--text-sec);
  opacity: 0.85;
  text-align: center;
  max-width: 320px;
}

/* Info */
.amo-info {
  width: 100%;
  display: flex; flex-direction: column;
  background: rgba(128,128,128,0.05);
  border-radius: 12px;
  padding: 4px 0;
}
.amo-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
}
.amo-row + .amo-row { border-top: 1px solid rgba(128,128,128,0.08); }
.amo-label {
  font-size: 12px; color: var(--text-sec); opacity: 0.8;
}
.amo-value {
  font-size: 13px; font-weight: 500; color: var(--text-pri);
}
.amo-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  transition: opacity 0.15s;
}
.amo-link:hover { opacity: 0.75; }
.amo-ext { opacity: 0.5; }

/* Footer */
.amo-foot {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--text-sec); opacity: 0.55;
}
.amo-heart { color: #ef4444; }
</style>
