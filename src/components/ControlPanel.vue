<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useMaze } from '@/composables/useMaze';
import { usePlayer } from '@/composables/usePlayer';
import { useStatsStore } from '@/store/statsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStorageStore } from '@/store/storageStore';
import { MovementDirection } from '@/types/player';
import { RefreshCw, RotateCcw, Settings, ArrowLeft, ArrowRight } from 'lucide-vue-next';
import CustomSelect from './CustomSelect.vue';

const modeOptions = [
  { value: 'square', label: '正方形' },
  { value: 'circle', label: '圆形' },
  { value: 'custom', label: '自定义' },
];

const mazeStore = useMaze();
const playerStore = usePlayer();
const statsStore = useStatsStore();
const settingsStore = useSettingsStore();
const storageStore = useStorageStore();

const rows = ref<number>(mazeStore.mazeParams.value.rows);
const cols = ref<number>(mazeStore.mazeParams.value.cols);
const seed = ref<number | undefined>(mazeStore.mazeParams.value.seed);
const mode = ref<string>(mazeStore.mazeParams.value.mode);
const entryType = ref<string>(mazeStore.mazeParams.value.entry.type);
const exitType = ref<string>(mazeStore.mazeParams.value.exit.type);
const previewMode = ref<'quick' | 'full'>(mazeStore.mazeParams.value.previewMode);

const updateMazeParams = () => {
  mazeStore.updateRows(rows.value);
  mazeStore.updateCols(cols.value);
  mazeStore.updateSeed(seed.value);
  mazeStore.updateMode(mode.value);
  mazeStore.updateEntry({ type: entryType.value as any, gridPos: { row: 0, col: 0 }, isValid: true });
  mazeStore.updateExit({ type: exitType.value as any, gridPos: { row: rows.value - 1, col: cols.value - 1 }, isValid: true });
};

const regenerateMaze = () => {
  updateMazeParams();
  const mazeData = mazeStore.generateMaze();

  if (mazeData) {
    playerStore.resetPlayer();
    playerStore.setPosition(mazeData.entry.row, mazeData.entry.col);
    statsStore.resetStats();
    statsStore.startTimer();
    storageStore.saveToStorage();
  }
};

const generateMaze = () => {
  regenerateMaze();
};

const resetGame = () => {
  regenerateMaze();
};

const resetSettings = () => {
  settingsStore.resetSettings();
  nextTick(() => {
    rows.value = mazeStore.mazeParams.value.rows;
    cols.value = mazeStore.mazeParams.value.cols;
    seed.value = mazeStore.mazeParams.value.seed;
    mode.value = mazeStore.mazeParams.value.mode;
    entryType.value = mazeStore.mazeParams.value.entry.type;
    exitType.value = mazeStore.mazeParams.value.exit.type;
    regenerateMaze();
  });
  storageStore.saveToStorage();
};

const togglePreviewMode = () => {
  const newMode = previewMode.value === 'quick' ? 'full' : 'quick';
  previewMode.value = newMode;
  mazeStore.setPreviewMode(newMode);
};

const handleKeyDown = (event: KeyboardEvent) => {
  const directionMap: Record<string, MovementDirection> = {
    ArrowUp: MovementDirection.UP,
    ArrowDown: MovementDirection.DOWN,
    ArrowLeft: MovementDirection.LEFT,
    ArrowRight: MovementDirection.RIGHT
  };

  const direction = directionMap[event.key];
  if (direction) {
    event.preventDefault();
    playerStore.movePlayer(direction);
  }
};

watch([rows, cols, mode, entryType, exitType], () => {
  regenerateMaze();
});

watch(seed, (newSeed) => {
  if (newSeed !== undefined) {
    regenerateMaze();
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  regenerateMaze();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

</script>

<template>
  <div class="control-panel">
    <div class="panel-section">
      <div class="section-header">
        <div class="section-dot"></div>
        <span class="section-title">状态</span>
      </div>
      <div class="status-wrapper">
        <StatusDisplay />
      </div>
    </div>

    <div class="panel-section">
      <div class="section-header">
        <div class="section-dot"></div>
        <span class="section-title">迷宫设置</span>
      </div>

      <div class="settings-content">
        <div class="setting-row">
          <label class="setting-label">模式</label>
          <div class="setting-control">
            <CustomSelect v-model="mode" :options="modeOptions" />
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">行数</label>
          <div class="setting-control">
            <div class="slider-wrapper">
              <input
                v-model.number="rows"
                type="range"
                min="5"
                max="50"
                step="1"
                class="setting-slider"
              />
              <span class="slider-value">{{ rows }}</span>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">列数</label>
          <div class="setting-control">
            <div class="slider-wrapper">
              <input
                v-model.number="cols"
                type="range"
                min="5"
                max="50"
                step="1"
                class="setting-slider"
              />
              <span class="slider-value">{{ cols }}</span>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">种子</label>
          <div class="setting-control">
            <div class="number-input-wrapper">
              <input
                v-model.number="seed"
                type="number"
                placeholder="随机"
                class="setting-input"
              />
              <div class="number-arrows">
                <button class="arrow-up" @click.stop="seed = (seed || 0) + 1">▲</button>
                <button class="arrow-down" @click.stop="seed = Math.max(0, (seed || 0) - 1)">▼</button>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">出入口</label>
          <div class="setting-control">
            <div class="entry-exit-group">
              <button
                class="type-toggle"
                :class="{ active: entryType === 'boundary' }"
                @click="entryType = 'boundary'"
              >
                <ArrowLeft :size="14" />
                <span>入口</span>
              </button>
              <button
                class="type-toggle"
                :class="{ active: exitType === 'boundary' }"
                @click="exitType = 'boundary'"
              >
                <span>出口</span>
                <ArrowRight :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-label">预览模式</label>
          <div class="setting-control">
            <button
              class="mode-toggle"
              :class="{ active: previewMode === 'full' }"
              @click="togglePreviewMode"
            >
              {{ previewMode === 'quick' ? '快速' : '完整' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-section actions-section">
      <button class="action-btn primary" @click="generateMaze">
        <RefreshCw :size="16" />
        <span>重新生成</span>
      </button>
      <button class="action-btn secondary" @click="resetGame">
        <RotateCcw :size="16" />
        <span>重置游戏</span>
      </button>
      <button class="action-btn secondary" @click="resetSettings">
        <Settings :size="16" />
        <span>重置设置</span>
      </button>
    </div>

    <div class="hint-bar">
      <span class="hint-text">按方向键移动角色</span>
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
  min-width: 60px;
  flex-shrink: 0;
}

.setting-control {
  flex: 1;
  min-width: 0;
}

.select-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.setting-select {
  width: 100%;
  height: 32px;
  padding: 0 var(--space-3);
  padding-right: 36px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--theme-primary-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
}

.setting-select:hover {
  border-color: var(--theme-accent-color);
}

.setting-select:focus {
  outline: none;
  border-color: var(--theme-accent-color);
  box-shadow: 0 0 0 2px var(--theme-accent-light);
}

.select-arrow {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--theme-secondary-text);
  pointer-events: none;
}

.number-input-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.setting-input {
  width: 100%;
  height: 32px;
  padding: 0 var(--space-3);
  padding-right: 32px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--theme-primary-text);
  transition: all var(--transition-fast);
  -moz-appearance: textfield;
}

.setting-input::-webkit-outer-spin-button,
.setting-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.setting-input:hover {
  border-color: var(--theme-accent-color);
}

.setting-input:focus {
  outline: none;
  border-color: var(--theme-accent-color);
  box-shadow: 0 0 0 2px var(--theme-accent-light);
}

.setting-input::placeholder {
  color: var(--theme-secondary-text);
  opacity: 0.5;
}

.number-arrows {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 28px;
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.number-arrows button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 8px;
  color: var(--theme-secondary-text);
  transition: all var(--transition-fast);
}

.number-arrows button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--theme-accent-color);
}

.number-arrows .arrow-up {
  border-radius: 0 var(--radius-sm) 0 0;
}

.number-arrows .arrow-down {
  border-radius: 0 0 var(--radius-sm) 0;
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
  min-width: 28px;
  text-align: right;
}

.entry-exit-group {
  display: flex;
  gap: var(--space-2);
}

.type-toggle {
  flex: 1;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: 0 var(--space-3);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--theme-secondary-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-toggle:hover {
  border-color: var(--theme-accent-color);
  background: rgba(255, 255, 255, 0.8);
}

.type-toggle.active {
  background: var(--theme-accent-color);
  border-color: var(--theme-accent-color);
  color: white;
}

.mode-toggle {
  height: 32px;
  padding: 0 var(--space-4);
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
