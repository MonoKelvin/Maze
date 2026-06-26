<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { MazeRenderer } from '@/utils/mazeRenderer';
import type { CellSize, Maze } from '@/types/maze';
import type { Theme } from '@/types/theme';
import { RefreshCw, RotateCcw, Settings } from 'lucide-vue-next';

const props = defineProps<{
  maze: Maze | null;
  cellSize: CellSize;
  theme: Theme;
}>();

const canvasRef = ref<HTMLCanvasElement>();
const renderer = new MazeRenderer();

const render = () => {
  if (!canvasRef.value || !props.maze) {
    return;
  }

  renderer.updateTheme(props.theme);
  renderer.render(
    canvasRef.value,
    props.maze,
    props.cellSize,
    props.theme
  );
};

const handleResize = () => {
  render();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  render();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => [props.maze, props.cellSize, props.theme], render, { deep: true, immediate: true });
</script>

<template>
  <div class="maze-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.maze-canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

canvas {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  max-height: 100%;
}
</style>
