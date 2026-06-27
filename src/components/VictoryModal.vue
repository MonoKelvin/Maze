<script setup lang="ts">
import { Trophy, Timer, Footprints, ArrowRight, RotateCcw, X } from 'lucide-vue-next';

defineProps<{ time: number; steps: number }>();
const emit = defineEmits<{ restart: []; reset: []; close: [] }>();

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
</script>

<template>
  <div class="vm">
    <div class="vm-card" @click.stop>
      <!-- 右上角关闭 -->
      <button class="vm-close" @click="emit('close')" title="关闭"><X :size="16" /></button>

      <!-- 奖杯 -->
      <div class="vm-icon"><Trophy :size="28" /></div>

      <!-- 标题 + 庆祝图标 -->
      <div class="vm-title-row">
        <h2 class="vm-title">恭喜通关！</h2><span class="vm-cele">🎉</span>
      </div>
      <p class="vm-sub">你成功走出了迷宫 ✨</p>

      <!-- 统计 -->
      <div class="vm-stats">
        <div class="vm-stat">
          <Timer :size="14" class="vm-stat-icon" />
          <span class="vm-stat-l">用时</span>
          <span class="vm-stat-v">{{ fmt(time) }}</span>
        </div>
        <div class="vm-stat">
          <Footprints :size="14" class="vm-stat-icon" />
          <span class="vm-stat-l">步数</span>
          <span class="vm-stat-v">{{ steps.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 操作 -->
      <div class="vm-actions">
        <button class="vm-btn vm-btn--sec" @click="emit('reset')">
          <RotateCcw :size="14" /> 重新开始
        </button>
        <button class="vm-btn vm-btn--pri" @click="emit('restart')">
          再来一局 <ArrowRight :size="14" class="vm-arrow" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vm {
  position:fixed; inset:0; z-index:1000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.35);
  animation:vm-fade .25s ease;
}
@keyframes vm-fade { from{opacity:0} to{opacity:1} }

.vm-card {
  position:relative; z-index:1;
  width:380px; max-width:92vw;
  background:color-mix(in srgb, var(--bg) 95%, white 5%);
  backdrop-filter:blur(32px) saturate(1.3);
  -webkit-backdrop-filter:blur(32px) saturate(1.3);
  border-radius:18px;
  padding:36px 32px 24px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.18),
    0 4px 16px rgba(0,0,0,0.08),
    0 0 0 1px var(--panel-border);
  display:flex; flex-direction:column; align-items:center; gap:14px;
  animation:vm-pop .4s cubic-bezier(.16,1,.3,1);
}
@keyframes vm-pop {
  from{transform:scale(.88) translateY(16px);opacity:0}
  to{transform:scale(1) translateY(0);opacity:1}
}

/* 关闭按钮 */
.vm-close {
  position:absolute; top:12px; right:12px;
  width:28px; height:28px;
  display:flex; align-items:center; justify-content:center;
  border-radius:7px; color:var(--text-sec);
  opacity:0.45; transition:all 0.15s ease; z-index:2;
}
.vm-close:hover { opacity:1; background:rgba(128,128,128,0.10); }

.vm-icon {
  width:64px; height:64px;
  display:flex; align-items:center; justify-content:center;
  border-radius:16px;
  background:var(--accent); color:#fff;
  box-shadow:0 8px 24px var(--accent-soft);
}

.vm-title-row {
  position:relative; width:100%; height:28px;
  display:flex; justify-content:center; align-items:center;
}
.vm-title {
  font-size:20px; font-weight:700; color:var(--text-pri); letter-spacing:-.3px;
  text-align:center;
}
.vm-cele {
  font-size:22px;
  margin-left:8px;
  animation:vm-cele-bounce 1.4s ease-in-out infinite;
}
@keyframes vm-cele-bounce {
  0%, 100% { transform:translateY(0) scale(1) rotate(0deg); }
  25% { transform:translateY(-3px) scale(1.08) rotate(-5deg); }
  75% { transform:translateY(-2px) scale(1.05) rotate(5deg); }
}
.vm-sub {
  font-size:13px; color:var(--text-sec); opacity:0.8; margin-top:-6px;
}

.vm-stats {
  display:flex; gap:10px; width:100%;
}
.vm-stat {
  flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:12px 10px;
  background:rgba(128,128,128,0.06); border-radius:10px;
  border:1px solid rgba(128,128,128,0.06);
}
.vm-stat-icon { color:var(--accent); opacity:0.6; }
.vm-stat-l {
  font-size:9px; font-weight:500; color:var(--text-sec); opacity:0.7;
  text-transform:uppercase; letter-spacing:.8px;
}
.vm-stat-v {
  font-size:20px; font-weight:700; color:var(--text-pri);
  font-family:'JetBrains Mono',monospace; letter-spacing:-.5px;
}

.vm-actions {
  display:flex; gap:8px; width:100%; margin-top:2px;
}
.vm-btn {
  flex:1; padding:10px 0;
  border-radius:9px; font-size:12px; font-weight:500;
  display:inline-flex; align-items:center; justify-content:center; gap:5px;
  transition:all 0.15s ease;
}
.vm-btn--sec {
  background:rgba(128,128,128,0.08); color:var(--text-pri);
}
.vm-btn--sec:hover { background:rgba(128,128,128,0.14); }

.vm-btn--pri {
  background:var(--accent); color:#fff;
  box-shadow:0 2px 10px var(--accent-soft);
}
.vm-btn--pri:hover {
  filter:brightness(1.1);
  box-shadow:0 4px 16px var(--accent-soft);
}
.vm-arrow { transition:transform 0.2s ease; }
.vm-btn--pri:hover .vm-arrow { transform:translateX(3px); }
</style>
