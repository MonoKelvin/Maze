<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { MazeRenderer } from '@/utils/mazeRenderer';
import type { Theme } from '@/types/theme';
import type { SimpleMaze } from '@/types/maze';

const props = defineProps<{
  maze: SimpleMaze | null;
  theme: Theme;
  playerGrid: { row: number; col: number };
}>();

const cvs = ref<HTMLCanvasElement>();

function draw() {
  if (!cvs.value || !props.maze) return;
  const ctx = cvs.value.getContext('2d');
  if (!ctx) return;
  const m = props.maze;
  const sz = MazeRenderer.fitSize(m.rows, m.cols, cvs.value.width, cvs.value.height);
  MazeRenderer.renderWalls(ctx, m.walls, m.rows, m.cols, sz.cs, sz.ox, sz.oy, props.theme);
  MazeRenderer.renderPoints(ctx, sz.cs, sz.ox, sz.oy, m.entry, m.exit, props.playerGrid, props.theme);
}

function resize() {
  if (!cvs.value) return;
  const p = cvs.value.parentElement;
  if (!p) return;
  cvs.value.width = p.clientWidth;
  cvs.value.height = p.clientHeight;
  draw();
}

onMounted(() => { resize(); window.addEventListener('resize', resize); });
onUnmounted(() => { window.removeEventListener('resize', resize); });
watch(() => [props.maze, props.theme, props.playerGrid], draw, { deep: true });
</script>

<template>
  <div class="cc"><canvas ref="cvs"></canvas></div>
</template>

<style scoped>
.cc { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
canvas { width:100% !important; height:100% !important; border-radius:10px; }
</style>
