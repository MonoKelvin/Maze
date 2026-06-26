<script setup lang="ts">
import { computed } from 'vue';
import { useMaze } from '@/composables/useMaze';
import { ArrowLeft, ArrowRight, Target } from 'lucide-vue-next';

const mazeStore = useMaze();

const mode = computed(() => mazeStore.mazeParams.value.mode);
const entryType = computed(() => mazeStore.mazeParams.value.entry.type);
const exitType = computed(() => mazeStore.mazeParams.value.exit.type);

const showCustomHint = computed(() => {
  return mode.value !== 'custom' && exitType.value === 'custom';
});

const entryDescription = computed(() => {
  switch (entryType.value) {
    case 'boundary':
      return '随机选择边界位置';
    case 'center':
      return '迷宫中心位置';
    case 'custom':
      return '点击迷宫选择';
    default:
      return '边界位置';
  }
});

const exitDescription = computed(() => {
  switch (exitType.value) {
    case 'boundary':
      return '随机选择边界位置';
    case 'center':
      return '迷宫中心位置';
    case 'custom':
      return '点击迷宫选择';
    default:
      return '边界位置';
  }
});
</script>

<template>
  <div class="entry-exit-hint">
    <div v-if="showCustomHint" class="hint-section">
      <div class="hint-icon">
        <Target :size="24" />
      </div>
      <div class="hint-text">
        点击迷宫任意位置设置出入口
      </div>
    </div>

    <div v-if="mode !== 'custom'" class="location-info">
      <div class="location-item">
        <ArrowLeft :size="14" />
        <div class="location-content">
          <div class="location-label">入口</div>
          <div class="location-desc">{{ entryDescription }}</div>
        </div>
      </div>

      <div class="location-divider" />

      <div class="location-item">
        <div class="location-content">
          <div class="location-label">出口</div>
          <div class="location-desc">{{ exitDescription }}</div>
        </div>
        <ArrowRight :size="14" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-exit-hint {
  padding: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  margin-bottom: 12px;
}

.hint-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(224, 123, 57, 0.1);
  border-radius: 6px;
  border: 1px dashed #E07B39;
  text-align: center;
}

.hint-icon {
  color: #E07B39;
  flex-shrink: 0;
}

.hint-text {
  font-size: 12px;
  color: #E07B39;
  font-weight: 500;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.location-content {
  flex: 1;
}

.location-label {
  font-weight: 600;
  color: var(--theme-primary-text, #2D241D);
  margin-bottom: 2px;
}

.location-desc {
  color: var(--theme-secondary-text, #8B7355);
}

.location-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}
</style>
