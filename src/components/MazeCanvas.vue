<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Maze, CellSize } from '@/types/maze';
import type { Theme } from '@/types/theme';
import { MazeRenderer } from '@/utils/mazeRenderer';
import { usePlayer } from '@/composables/usePlayer';

const playerStore = usePlayer();

interface Props {
  maze: Maze | null;
  cellSize: CellSize;
  theme: Theme;
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement>();



const handleResize = () => {
  if (!canvasRef.value) return;

  const container = canvasRef.value.parentElement;
  if (!container) return;

  const width = container.clientWidth - 40;
  const height = container.clientHeight - 40;

  canvasRef.value.width = width;
  canvasRef.value.height = height;

  requestAnimationFrame(render);
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);

  if (canvasRef.value) {
    handleResize();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const render = () => {
  if (!canvasRef.value || !props.maze) {
    return;
  }

  const ctx = canvasRef.value.getContext('2d', { alpha: false });
  if (!ctx) {
    return;
  }

  ctx.fillStyle = props.theme.background;
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  MazeRenderer.render(
    canvasRef.value,
    props.maze,
    props.cellSize,
    props.theme
  );
};

watch(() => props.maze, () => {
  requestAnimationFrame(render);
}, { immediate: true });

const emit = defineEmits<{
  victory: []
}>();

const checkVictory = () => {
  if (!props.maze || !playerStore.isMoving.value) return;

  const playerGrid = {
    row: playerStore.playerPos.value.gridRow,
    col: playerStore.playerPos.value.gridCol
  };

  if (playerGrid.row === props.maze.exit.row && playerGrid.col === props.maze.exit.col) {
    emit('victory');
  }
};

watch(() => playerStore.playerPos, checkVictory, { deep: true });

watch(() => props.cellSize, () => {
  requestAnimationFrame(render);
});
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
