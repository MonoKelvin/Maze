<script setup lang="ts">
import { computed } from 'vue';
import { useStatsStore } from '@/store/statsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Clock, Footprints, Ruler } from 'lucide-vue-next';

const statsStore = useStatsStore();
const settingsStore = useSettingsStore();

const themeColors = computed(() => {
  const theme = settingsStore.themes[settingsStore.currentTheme];
  return {
    accent: theme.accentColor,
    player: theme.playerGlow,
    wall: theme.wallGlow
  };
});

const formatTime = computed(() => {
  return statsStore.formatTime(statsStore.elapsedTime);
});

const formatDistance = computed(() => {
  return statsStore.formatDistance(statsStore.totalDistance);
});

const formatSteps = computed(() => {
  return statsStore.stepCount.toLocaleString();
});
</script>

<template>
  <div class="status-display">
    <div class="status-item">
      <div class="status-icon" :style="{ color: themeColors.accent }">
        <Clock :size="18" />
      </div>
      <div class="status-info">
        <span class="status-label">时间</span>
        <span class="status-value">{{ formatTime }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon" :style="{ color: themeColors.player }">
        <Footprints :size="18" />
      </div>
      <div class="status-info">
        <span class="status-label">步数</span>
        <span class="status-value">{{ formatSteps }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon" :style="{ color: themeColors.wall }">
        <Ruler :size="18" />
      </div>
      <div class="status-info">
        <span class="status-label">长度</span>
        <span class="status-value">{{ formatDistance }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.status-item:last-child {
  border-bottom: none;
}

.status-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--theme-secondary-text);
  letter-spacing: 0.3px;
}

.status-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
</style>
