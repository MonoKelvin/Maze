<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useStatsStore } from '@/store/statsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useMaze } from '@/composables/useMaze';
import { usePlayer } from '@/composables/usePlayer';
import { Trophy, CheckCircle2, Clock, Footprints, Ruler, RefreshCw, X } from 'lucide-vue-next';
import type { Theme } from '@/types/theme';

const statsStore = useStatsStore();
const mazeStore = useMaze();
const { playerPos, isMoving } = usePlayer();
const show = ref(true);

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

const close = () => {
  show.value = false;
  setTimeout(() => emit('close'), 300);
};

const restart = () => {
  emit('restart');
};

onMounted(() => {
  checkVictory();
});
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="victory-modal" @click.self="close">
      <div class="victory-content">
        <button class="close-btn" @click="close">
          <X :size="20" />
        </button>

        <div class="victory-header">
          <div class="trophy-icon" :style="{ background: theme.accentColor + '15' }">
            <Trophy :size="64" :color="theme.accentColor" />
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
          <button class="victory-btn primary" @click="restart">
            <RefreshCw :size="16" />
            <span>再来一局</span>
          </button>
          <button class="victory-btn secondary" @click="close">
            <CheckCircle2 :size="16" />
            <span>保存并退出</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.victory-content {
  position: relative;
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 420px;
  width: 90%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  animation: slideUp var(--transition-slow);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.close-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--theme-secondary-text);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(1.05);
}

.victory-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.trophy-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  animation: scaleIn var(--transition-slow);
}

.victory-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-primary-text);
  margin: 0;
  text-align: center;
}

.victory-subtitle {
  font-size: var(--font-size-base);
  color: var(--theme-secondary-text);
  margin: 0;
  text-align: center;
}

.victory-stats {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--space-6);
  padding: var(--space-1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 40px;
  height: 40px;
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
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.victory-timer {
  text-align: center;
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  border-radius: var(--radius-md);
  border: 2px solid rgba(0, 0, 0, 0.03);
}

.timer-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-accent-color);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  margin-bottom: var(--space-1);
  letter-spacing: 1px;
}

.timer-label {
  font-size: var(--font-size-xs);
  color: var(--theme-secondary-text);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.victory-actions {
  display: flex;
  gap: var(--space-3);
}

.victory-btn {
  flex: 1;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.victory-btn.primary {
  background: var(--theme-accent-color);
  color: white;
}

.victory-btn.primary:hover {
  background: #D4682E;
  box-shadow: 0 6px 16px rgba(224, 123, 57, 0.35);
  transform: translateY(-1px);
}

.victory-btn.secondary {
  background: rgba(0, 0, 0, 0.04);
  color: var(--theme-primary-text);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.victory-btn.secondary:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
