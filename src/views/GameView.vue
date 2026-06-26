<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useThemeStore } from '@/store/settingsStore';
import { useMaze } from '@/composables/useMaze';
import { usePlayer } from '@/composables/usePlayer';
import { useStatsStore } from '@/store/statsStore';
import MazeCanvas from '@/components/MazeCanvas.vue';
import ControlPanel from '@/components/ControlPanel.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import VictoryModal from '@/components/VictoryModal.vue';
import WindowTitleBar from '@/components/WindowTitleBar.vue';
import type { CellSize } from '@/types/maze';
import type { Theme } from '@/types/theme';

const themeStore = useThemeStore();
const mazeStore = useMaze();
const playerStore = usePlayer();
const statsStore = useStatsStore();

const maze = ref<any>(null);
const cellSize = ref<CellSize>({
  width: 40,
  height: 40,
  offsetX: 0,
  offsetY: 0
});

const showVictoryModal = ref<boolean>(false);

const currentTheme = computed<Theme>(() => {
  return themeStore.themes[themeStore.currentTheme];
});

const mazeCanvasSize = computed(() => {
  if (!maze.value) return { width: 400, height: 400 };
  const maxRows = maze.value.params.rows;
  const maxCols = maze.value.params.cols;
  return {
    width: maxCols * 40,
    height: maxRows * 40
  };
});

const renderMaze = () => {
  maze.value = mazeStore.currentMaze;
  if (maze.value) {
    const { width, height } = mazeCanvasSize.value;
    cellSize.value = {
      width: 40,
      height: 40,
      offsetX: (width - maze.value.params.cols * 40) / 2,
      offsetY: (height - maze.value.params.rows * 40) / 2
    };
  }
};

const handleResize = () => {
  renderMaze();
};

onMounted(() => {
  generateNewGame();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => mazeStore.currentMaze, renderMaze);

const handleVictory = () => {
  showVictoryModal.value = true;
  statsStore.stopTimer();
};

const handleRestart = () => {
  showVictoryModal.value = false;
  generateNewGame();
};

const generateNewGame = () => {
  const mazeData = mazeStore.generateMaze();
  if (mazeData) {
    playerStore.resetPlayer();
    playerStore.setPosition(mazeData.entry.row, mazeData.entry.col);
    statsStore.resetStats();
    statsStore.startTimer();
    statsStore.saveStats();
  }
};

const handleCloseModal = () => {
  showVictoryModal.value = false;
};
</script>

<template>
  <div class="game-view">
    <WindowTitleBar />

    <div class="game-container">
      <div class="maze-area" :style="{ backgroundColor: currentTheme.background }">
        <MazeCanvas
          v-if="maze"
          :maze="maze"
          :cell-size="cellSize"
          :theme="currentTheme"
          @victory="handleVictory"
        />
      </div>

      <div class="control-panel-wrapper">
        <div class="theme-section">
          <ThemeSwitcher />
        </div>
        <ControlPanel />
      </div>
    </div>

    <VictoryModal
      v-if="showVictoryModal"
      @close="handleCloseModal"
      @restart="handleRestart"
    />
  </div>
</template>

<style scoped>
.game-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.maze-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  transition: background-color var(--transition-slow);
}

.control-panel-wrapper {
  display: flex;
  flex-direction: column;
  width: var(--panel-width);
  height: 100%;
  border-left: 1px solid var(--theme-border-color);
}

.theme-section {
  padding: var(--space-4);
  padding-bottom: 0;
}
</style>
