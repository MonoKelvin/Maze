<script setup lang="ts">
import { useStatsStore } from '@/store/statsStore';

const stats = useStatsStore();
</script>

<template>
  <div class="status-display">
    <div class="item">
      <span class="l">用时</span>
      <span class="v">{{ stats.formatTime(stats.elapsed) }}</span>
    </div>
    <div class="item">
      <span class="l">步数</span>
      <span class="v">{{ 0 }}</span>
    </div>
  </div>
</template>

<style scoped>
.status-display { display: flex; gap: 8px; }
.item { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; background: rgba(0,0,0,0.02); border-radius: 8px; }
.l { font-size: 10px; color: var(--text-sec); }
.v { font-size: 18px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
</style>
