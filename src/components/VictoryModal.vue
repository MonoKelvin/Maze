<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useStatsStore } from '@/store/statsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useMaze } from '@/composables/useMaze';
import { usePlayer } from '@/composables/usePlayer';
import { Trophy, CheckCircle2, Clock, Footprints, Ruler, RefreshCw } from 'lucide-vue-next';
import type { Theme } from '@/types/theme';

const statsStore = useStatsStore();
const mazeStore = useMaze();
const { playerPos, isMoving } = usePlayer();

const theme = computed<Theme>(() => {
  const settingsStore = useSettingsStore();
  return settingsStore.themes[settingsStore.currentTheme];
});

const victoryMessage = computed(() => {
  const min = Math.floor(statsStore.elapsedTime / 60000);
  const sec = Math.floor((statsStore.elapsedTime % 60000) / 1000);
  const ms = Math.floor((statsStore.elapsedTime % 1000) / 100);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
});

const stats = computed(() => ({
  time: statsStore.formatTime(statsStore.elapsedTime),
  steps: statsStore.stepCount,
  distance: statsStore.formatDistance(statsStore.totalDistance)
}));

const checkVictory = () => {
  const maze = mazeStore.currentMaze.value;
  if (!maze || !isMoving.value) return;
  if (playerPos.value.gridRow === maze.exit.row && playerPos.value.gridCol === maze.exit.col) {
    emit('victory');
  }
};

watch([playerPos], checkVictory);

const emit = defineEmits<{
  close: []
  restart: []
  victory: []
}>();

onMounted(() => {
  checkVictory();
});
</script>

<template>
  <div class="victory-modal" @click.self="emit('close')">
    <div class="victory-content">
      <div class="victory-header">
        <div class="trophy-icon" :style="{ background: theme.accentColor + '15' }">
          <Trophy :size="56" :color="theme.accentColor" />
        </div>
        <h2 class="victory-title">恭喜获胜！</h2>
        <p class="victory-subtitle">你成功走出了迷宫</p>
      </div>

      <div class="victory-stats">
        <div class="stat-item">
          <div class="stat-icon" :style="{ color: theme.accentColor }">
            <Clock :size="20" />
          </div>
          <div class="stat-info">
            <span class="stat-label">用时</span>
            <span class="stat-value">{{ stats.time }}</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon" :style="{ color: theme.playerGlow }">
            <Footprints :size="20" />
          </div>
          <div class="stat-info">
            <span class="stat-label">步数</span>
            <span class="stat-value">{{ stats.steps }}</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon" :style="{ color: theme.wallGlow }">
            <Ruler :size="20" />
          </div>
          <div class="stat-info">
            <span class="stat-label">总距离</span>
            <span class="stat-value">{{ stats.distance }}</span>
          </div>
        </div>
      </div>

      <div class="victory-timer" :style="{ background: theme.accentColor + '08' }">
        <div class="timer-value">{{ victoryMessage }}</div>
        <div class="timer-label">完成时间</div>
      </div>

      <div class="victory-actions">
        <button class="victory-btn primary" @click="emit('restart')">
          <RefreshCw :size="16" />
          <span>再来一局</span>
        </button>
        <button class="victory-btn secondary" @click="emit('close')">
          <CheckCircle2 :size="16" />
          <span>保存并退出</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.victory-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.victory-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 380px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp var(--transition-slow);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.victory-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.trophy-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  animation: scaleIn var(--transition-slow);
}

.victory-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-primary-text);
  margin: 0;
}

.victory-subtitle {
  font-size: var(--font-size-sm);
  color: var(--theme-secondary-text);
  margin: 0;
}

.victory-stats {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--space-5);
  padding: var(--space-1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--theme-secondary-text);
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.victory-timer {
  text-align: center;
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  border-radius: var(--radius-md);
}

.timer-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-accent-color);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  margin-bottom: var(--space-1);
}

.timer-label {
  font-size: var(--font-size-xs);
  color: var(--theme-secondary-text);
  letter-spacing: 0.5px;
}

.victory-actions {
  display: flex;
  gap: var(--space-3);
}

.victory-btn {
  flex: 1;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.victory-btn.primary {
  background: var(--theme-accent-color);
  color: white;
}

.victory-btn.primary:hover {
  background: #D4682E;
  box-shadow: 0 4px 12px rgba(224, 123, 57, 0.3);
}

.victory-btn.secondary {
  background: rgba(0, 0, 0, 0.03);
  color: var(--theme-primary-text);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.victory-btn.secondary:hover {
  background: rgba(0, 0, 0, 0.06);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
