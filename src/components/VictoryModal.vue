<script setup lang="ts">
import { Trophy, Timer, Footprints, ArrowRight } from 'lucide-vue-next';

defineProps<{ time: number; steps: number }>();
const emit = defineEmits<{ restart: []; close: [] }>();

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
</script>

<template>
  <div class="vm" @click.self="emit('close')">
    <div class="vm-card">

      <!-- 奖杯图标 -->
      <div class="vm-icon">
        <Trophy :size="28" />
      </div>

      <h2 class="vm-title">恭喜通关！</h2>
      <p class="vm-sub">你成功走出了迷宫</p>

      <!-- 统计数据 -->
      <div class="vm-stats">
        <div class="vm-stat">
          <Timer :size="15" class="vm-stat-icon" />
          <span class="vm-stat-l">用时</span>
          <span class="vm-stat-v">{{ fmt(time) }}</span>
        </div>
        <div class="vm-stat">
          <Footprints :size="15" class="vm-stat-icon" />
          <span class="vm-stat-l">步数</span>
          <span class="vm-stat-v">{{ steps.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 操作 -->
      <div class="vm-actions">
        <button class="vm-btn vm-btn--pri" @click="emit('restart')">
          再来一局 <ArrowRight :size="14" />
        </button>
        <button class="vm-btn" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vm {
  position:fixed; inset:0; z-index:1000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.40);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  animation:vm-fade .2s ease;
}
@keyframes vm-fade { from{opacity:0} to{opacity:1} }

.vm-card {
  width:360px; max-width:92vw;
  background:var(--panel-bg);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border-radius:18px;
  padding:36px 32px 28px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.16),
    0 4px 16px rgba(0,0,0,0.06),
    0 0 0 1px var(--panel-border);
  display:flex; flex-direction:column; align-items:center; gap:14px;
  animation:vm-pop .35s cubic-bezier(.16,1,.3,1);
}
@keyframes vm-pop {
  from{transform:scale(.92) translateY(10px);opacity:0}
  to{transform:scale(1) translateY(0);opacity:1}
}

/* Icon */
.vm-icon {
  width:64px; height:64px;
  display:flex; align-items:center; justify-content:center;
  border-radius:16px;
  background: var(--accent);
  color:#fff;
  box-shadow:0 8px 24px var(--accent-soft);
  margin-bottom:2px;
}

.vm-title {
  font-size:20px; font-weight:700;
  color:var(--text-pri);
  letter-spacing:-.3px;
}
.vm-sub {
  font-size:13px; color:var(--text-sec); opacity:0.8;
  margin-top:-6px;
}

/* Stats */
.vm-stats {
  display:flex; gap:10px; width:100%;
}
.vm-stat {
  flex:1;
  display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:14px 10px;
  background:rgba(128,128,128,0.06);
  border-radius:12px;
  border:1px solid rgba(128,128,128,0.06);
}
.vm-stat-icon { color:var(--accent); opacity:0.6; }
.vm-stat-l {
  font-size:10px; font-weight:500;
  color:var(--text-sec); opacity:0.75;
  text-transform:uppercase; letter-spacing:.8px;
}
.vm-stat-v {
  font-size:20px; font-weight:700;
  color:var(--text-pri);
  font-family:'JetBrains Mono',monospace;
  letter-spacing:-.5px;
}

/* Actions */
.vm-actions { display:flex; gap:8px; width:100%; margin-top:4px; }
.vm-btn {
  flex:1; padding:11px 0;
  border-radius:10px;
  font-size:13px; font-weight:500;
  display:inline-flex; align-items:center; justify-content:center; gap:5px;
  background:rgba(128,128,128,0.10);
  color:var(--text-pri);
  transition:all 0.15s ease;
}
.vm-btn:hover { background:rgba(128,128,128,0.18); }
.vm-btn--pri {
  background:var(--accent);
  color:#fff;
  box-shadow:0 2px 10px var(--accent-soft);
}
.vm-btn--pri:hover {
  filter:brightness(1.10);
  box-shadow:0 4px 16px var(--accent-soft);
}
</style>
