<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore';

defineProps<{ time: number; steps: number }>();
const emit = defineEmits<{ restart: []; close: [] }>();
const settings = useSettingsStore();

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
</script>

<template>
  <div class="modal" @click.self="emit('close')">
    <div class="card">
      <div class="icon" :style="{ background: settings.themes[settings.theme].accent + '15' }">
        <span style="font-size:40px">🏆</span>
      </div>
      <h2>恭喜通关！</h2>
      <p class="sub">你成功走出了迷宫</p>
      <div class="stats">
        <div class="item"><span class="l">用时</span><span class="v">{{ fmt(time) }}</span></div>
        <div class="item"><span class="l">步数</span><span class="v">{{ steps.toLocaleString() }}</span></div>
      </div>
      <div class="actions">
        <button class="btn primary" @click="emit('restart')">再来一局</button>
        <button class="btn" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); backdrop-filter:blur(8px); z-index:1000; }
.card { background:#fff; border-radius:16px; padding:32px; width:340px; max-width:90vw; display:flex; flex-direction:column; align-items:center; gap:12px; box-shadow:0 24px 80px rgba(0,0,0,0.2); animation:pop .25s ease; }
.icon { width:72px; height:72px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
h2 { font-size:22px; font-weight:700; color:#1a1a1a; margin:0; }
.sub { font-size:13px; color:#888; margin:0; }
.stats { display:flex; gap:12px; width:100%; }
.item { flex:1; display:flex; flex-direction:column; gap:2px; padding:12px; background:#f5f5f5; border-radius:10px; text-align:center; }
.l { font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; }
.v { font-size:20px; font-weight:700; color:#1a1a1a; font-family:'JetBrains Mono', monospace; }
.actions { display:flex; gap:8px; width:100%; }
.btn { flex:1; padding:10px; border:none; border-radius:8px; font-size:13px; font-weight:500; }
.btn:hover { background:#eee; }
.btn.primary { background:var(--accent,#E07B39); color:#fff; }
.btn.primary:hover { filter:brightness(1.1); }
@keyframes pop { from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }
</style>
