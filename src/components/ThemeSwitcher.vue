<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeName } from '@/types/theme';

const emit = defineEmits<{ change: [t: ThemeName] }>();
const settings = useSettingsStore();

const themes: { name: ThemeName; label: string; color: string }[] = [
  { name: 'dark', label: '深色', color: '#5B8DBE' },
  { name: 'warm', label: '暖色', color: '#C8906A' },
  { name: 'ocean', label: '海洋', color: '#6BA3BE' },
  { name: 'forest', label: '森林', color: '#6BAF7A' },
  { name: 'purple', label: '紫色', color: '#9B7EC8' },
];

const open = ref(false);
const dropUp = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const currentTheme = computed(() => themes.find(t => t.name === settings.theme) || themes[0]);

function select(name: ThemeName) {
  settings.setTheme(name);
  emit('change', name);
  open.value = false;
}

function toggle() {
  if (!open.value) {
    // 打开前检测位置
    const el = rootEl.value;
    if (el) {
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      dropUp.value = spaceBelow < 220; // 下方空间不足则上弹
    }
  }
  open.value = !open.value;
}

function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick));
</script>

<template>
  <div class="ts" ref="rootEl">
    <button class="ts-trigger" @click="toggle">
      <span class="ts-dot" :style="{ background: currentTheme.color }"></span>
      <span class="ts-label">{{ currentTheme.label }}</span>
      <svg class="ts-chevron" :class="{ 'ts-chevron--open': open }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <Transition :name="dropUp ? 'ts-drop-up' : 'ts-drop'">
      <div v-if="open" class="ts-panel" :class="{ 'ts-panel--up': dropUp }">
        <button
          v-for="t in themes" :key="t.name"
          class="ts-option"
          :class="{ 'ts-option--active': t.name === settings.theme }"
          @click="select(t.name)"
        >
          <span class="ts-dot" :style="{ background: t.color }"></span>
          <span class="ts-opt-label">{{ t.label }}</span>
          <svg v-if="t.name === settings.theme" class="ts-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ts { position:relative; width:100%; }

.ts-trigger {
  width:100%; display:flex; align-items:center; gap:6px;
  padding:7px 10px; border-radius:7px;
  border:1px solid rgba(128,128,128,0.10);
  background:rgba(128,128,128,0.04);
  transition:all 0.15s ease;
  cursor:pointer; min-height:34px; outline:none;
  font-size:11px; font-weight:500; color:var(--text-pri);
}
.ts-trigger:hover { background:rgba(128,128,128,0.08); border-color:rgba(128,128,128,0.14); }
.ts-trigger:focus-visible { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-soft); }

.ts-label { flex:1; text-align:left; }

.ts-chevron {
  opacity:0.5; transition:all 0.2s ease; flex-shrink:0;
}
.ts-trigger:hover .ts-chevron { opacity:1; }
.ts-chevron--open { transform:rotate(180deg); }

/* 下拉面板 — 默认向下 */
.ts-panel {
  position:absolute; top:100%; left:0; right:0;
  margin-top:3px; z-index:100;
  border-radius:7px;
  border:1px solid var(--panel-border);
  background: var(--bg);
  box-shadow:0 8px 32px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.10);
  padding:2px;
  display:flex; flex-direction:column; gap:1px;
  transform-origin:top center;
}
/* 上弹模式 */
.ts-panel--up {
  top:auto; bottom:100%;
  margin-top:0; margin-bottom:4px;
  transform-origin:bottom center;
}

/* 向下弹出动画 */
.ts-drop-enter-active { animation:ts-drop-in 0.2s cubic-bezier(0.16,1,0.3,1); }
.ts-drop-leave-active { animation:ts-drop-in 0.15s ease reverse; }
@keyframes ts-drop-in {
  from { opacity:0; transform:scaleY(0.92) translateY(-6px); }
  to   { opacity:1; transform:scaleY(1) translateY(0); }
}

/* 向上弹出动画 */
.ts-drop-up-enter-active { animation:ts-drop-up-in 0.2s cubic-bezier(0.16,1,0.3,1); }
.ts-drop-up-leave-active { animation:ts-drop-up-in 0.15s ease reverse; }
@keyframes ts-drop-up-in {
  from { opacity:0; transform:scaleY(0.92) translateY(6px); }
  to   { opacity:1; transform:scaleY(1) translateY(0); }
}

.ts-option {
  display:flex; align-items:center; gap:6px;
  padding:5px 7px; border-radius:5px;
  cursor:pointer; transition:all 0.12s ease;
  font-size:11px; color:var(--text-pri);
  border:none; background:transparent; outline:none;
  width:100%; text-align:left;
}
.ts-option:hover { background:rgba(128,128,128,0.10); }
.ts-option--active { background:var(--accent-soft); color:var(--accent); font-weight:600; }

.ts-check { margin-left:auto; color:var(--accent); flex-shrink:0; }

.ts-dot {
  width:12px; height:12px; border-radius:50%;
  flex-shrink:0; box-shadow:0 0 0 2px rgba(128,128,128,0.06);
}

.ts-opt-label { font-weight:500; }
</style>
