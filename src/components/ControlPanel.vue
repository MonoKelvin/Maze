<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore';
import { useStatsStore } from '@/store/statsStore';

const emit = defineEmits<{ generate: [] }>();
const settings = useSettingsStore();
const stats = useStatsStore();
</script>

<template>
  <div class="panel-inner">
    <div class="section">
      <div class="sec-title">状态</div>
      <div class="stats">
        <div class="stat">
          <span class="stat-l">用时</span>
          <span class="stat-v">{{ stats.formatTime(stats.elapsed) }}</span>
        </div>
        <div class="stat">
          <span class="stat-l">步数</span>
          <span class="stat-v">{{ 0 }}</span>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="sec-title">速度</div>
      <div class="size-row">
        <input type="range" min="1" max="10" step="1" class="slider"
          :value="settings.speed" @input="settings.setSpeed(Number(($event.target as HTMLInputElement).value))" />
        <span class="val">{{ settings.speed }}</span>
      </div>
    </div>
    <div class="section">
      <button class="btn primary" @click="emit('generate')">🔄 重新生成</button>
    </div>
  </div>
</template>

<style scoped>
.panel-inner { display: flex; flex-direction: column; gap: 16px; }
.section { display: flex; flex-direction: column; gap: 8px; }
.sec-title { font-size: 10px; font-weight: 600; color: var(--text-sec); text-transform: uppercase; letter-spacing: 1.2px; }
.stats { display: flex; gap: 8px; }
.stat { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; background: rgba(0,0,0,0.02); border-radius: 8px; }
.stat-l { font-size: 10px; color: var(--text-sec); }
.stat-v { font-size: 18px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
.size-row { display: flex; align-items: center; gap: 10px; }
.slider { flex: 1; height: 4px; appearance: none; background: rgba(0,0,0,0.08); border-radius: 4px; outline: none; }
.slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); cursor: pointer; }
.val { min-width: 60px; text-align: right; font-size: 13px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; }
.btn { width: 100%; padding: 10px 0; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.15s; background: rgba(0,0,0,0.04); color: var(--text); }
.btn:hover { background: rgba(0,0,0,0.08); }
.btn.primary { background: var(--accent); color: #fff; }
.btn.primary:hover { filter: brightness(1.1); }
</style>
