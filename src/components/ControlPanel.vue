<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMaze } from '@/composables/useMaze';
import { usePlayer } from '@/composables/usePlayer';
import { useStatsStore } from '@/store/statsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStorageStore } from '@/store/storageStore';
import { MazeRenderer } from '@/utils/mazeRenderer';
import type { CellSize, Maze } from '@/types/maze';
import type { Theme } from '@/types/theme';
import { RefreshCw, RotateCcw, Settings } from 'lucide-vue-next';

const mazeStore = useMaze();
const playerStore = usePlayer();
const statsStore = useStatsStore();
const settingsStore = useSettingsStore();
const storageStore = useStorageStore();

const maze = ref<Maze | null>(null);
const cellSize = ref<CellSize>({
  width: 40,
  height: 40,
  offsetX: 0,
  offsetY: 0
});

const showPreviewHint = ref<boolean>(true);

const currentTheme = computed<Theme>(() => {
  return settingsStore.themes[settingsStore.currentTheme];
});

const renderMaze = () => {
  if (!maze.value) {
    return;
  }

  const canvas = document.querySelector('canvas');
  if (!canvas) {
    return;
  }

  const renderer = new MazeRenderer();
  renderer.updateTheme(currentTheme.value);
  renderer.render(
    canvas as HTMLCanvasElement,
    maze.value,
    cellSize.value,
    currentTheme.value
  );

  // 渲染玩家
  if (playerStore.playerPos.value.x !== undefined && playerStore.playerPos.value.y !== undefined) {
    renderer.renderPlayer(
      canvas.getContext('2d')!,
      playerStore.playerPos.value.x,
      playerStore.playerPos.value.y,
      cellSize.value,
      currentTheme.value
    );
  }
};

const handleGenerate = () => {
  const mazeData = mazeStore.generateMaze();
  if (mazeData) {
    maze.value = mazeData;
    playerStore.resetPlayer();
    playerStore.setPosition(mazeData.entry.row, mazeData.entry.col);
    statsStore.resetStats();
    statsStore.startTimer();
    showPreviewHint.value = true;
  }
};

const handleReset = () => {
  handleGenerate();
};

const handleSettings = () => {
  settingsStore.resetSettings();
  const mazeData = mazeStore.generateMaze();
  if (mazeData) {
    maze.value = mazeData;
    playerStore.resetPlayer();
    playerStore.setPosition(mazeData.entry.row, mazeData.entry.col);
    statsStore.resetStats();
    statsStore.startTimer();
  }
  storageStore.saveToStorage();
};
</script>

<template>
  <div class="control-panel">
    <div class="panel-section">
      <div class="section-header">
        <div class="section-dot"></div>
        <span class="section-title">状态</span>
      </div>
      <div class="status-wrapper">
        <div class="stat-item">
          <div class="stat-icon">
            <Settings :size="16" />
          </div>
          <div class="stat-info">
            <span class="stat-label">用时</span>
            <span class="stat-value">{{ statsStore.formatTime(statsStore.elapsedTime) }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <RefreshCw :size="16" />
          </div>
          <div class="stat-info">
            <span class="stat-label">步数</span>
            <span class="stat-value">{{ statsStore.stepCount }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <Settings :size="16" />
          </div>
          <div class="stat-info">
            <span class="stat-label">总距离</span>
            <span class="stat-value">{{ statsStore.formatDistance(statsStore.totalDistance) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-header">
        <div class="section-dot"></div>
        <span class="section-title">迷宫设置</span>
      </div>

      <div class="settings-content">
        <div class="setting-row">
          <label class="setting-label">迷宫大小</label>
          <div class="setting-control">
            <div class="slider-wrapper">
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                class="setting-slider"
                @input="mazeStore.updateRows(mazeStore.rows)"
              />
              <span class="slider-value">{{ mazeStore.rows }} × {{ mazeStore.cols }}</span>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">速度</label>
          <div class="setting-control">
            <div class="slider-wrapper">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="setting-slider"
                @input="playerStore.updateSpeed(playerStore.speed)"
              />
              <span class="slider-value">{{ playerStore.speed }}</span>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">预览模式</label>
          <div class="setting-control">
            <div class="mode-toggle-group">
              <button
                class="mode-toggle"
                :class="{ active: mazeStore.previewMode === 'quick' }"
                @click="mazeStore.setPreviewMode('quick')"
              >
                快速预览
              </button>
              <button
                class="mode-toggle"
                :class="{ active: mazeStore.previewMode === 'full' }"
                @click="mazeStore.setPreviewMode('full')"
              >
                完整生成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-section actions-section">
      <button class="action-btn primary" @click="handleGenerate">
        <RefreshCw :size="16" />
        <span>重新生成</span>
      </button>
      <button class="action-btn secondary" @click="handleReset">
        <RotateCcw :size="16" />
        <span>重置游戏</span>
      </button>
      <button class="action-btn secondary" @click="handleSettings">
        <Settings :size="16" />
        <span>重置设置</span>
      </button>
    </div>

    <div v-if="showPreviewHint && mazeStore.previewMode === 'quick'" class="hint-bar">
      <span class="hint-text">参数调整时显示快速预览 | 完整模式生成完整迷宫</span>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  width: var(--panel-width);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  height: 100%;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(var(--blur-xl));
  -webkit-backdrop-filter: blur(var(--blur-xl));
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.control-panel::-webkit-scrollbar {
  width: 4px;
}

.control-panel::-webkit-scrollbar-track {
  background: transparent;
}

.control-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section-dot {
  width: 6px;
  height: 6px;
  background: var(--theme-accent-color);
  border-radius: var(--radius-full);
}

.section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-secondary-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  width: 32px;
  height: 32px;
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
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.setting-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--theme-secondary-text);
  letter-spacing: 0.3px;
  min-width: 70px;
  flex-shrink: 0;
}

.setting-control {
  flex: 1;
  min-width: 0;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.setting-slider {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-full);
  appearance: none;
  cursor: pointer;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--theme-accent-color);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.setting-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.setting-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--theme-accent-color);
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
}

.slider-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-primary-text);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  min-width: 50px;
  text-align: right;
}

.mode-toggle-group {
  display: flex;
  gap: var(--space-2);
}

.mode-toggle {
  flex: 1;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--theme-secondary-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-toggle:hover {
  border-color: var(--theme-accent-color);
  background: rgba(255, 255, 255, 0.8);
}

.mode-toggle.active {
  background: var(--theme-accent-color);
  border-color: var(--theme-accent-color);
  color: white;
}

.actions-section {
  gap: var(--space-2);
}

.action-btn {
  width: 100%;
  height: 36px;
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

.action-btn.primary {
  background: var(--theme-accent-color);
  color: white;
}

.action-btn.primary:hover {
  background: #D4682E;
  box-shadow: 0 4px 12px rgba(224, 123, 57, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.6);
  color: var(--theme-primary-text);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: var(--theme-accent-color);
}

.hint-bar {
  margin-top: auto;
  padding: var(--space-3) var(--space-4);
  background: rgba(224, 123, 57, 0.06);
  border-radius: var(--radius-sm);
  text-align: center;
}

.hint-text {
  font-size: var(--font-size-xs);
  color: var(--theme-secondary-text);
}
</style>
