import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Direction } from '@/types/maze';

export const usePlayerStore = defineStore('player', () => {
  const gridRow = ref(0);
  const gridCol = ref(0);
  const stepCount = ref(0);
  const dir = ref<Direction | null>(null);

  const pos = computed(() => ({ row: gridRow.value, col: gridCol.value }));

  const reset = (row = 0, col = 0) => {
    gridRow.value = row;
    gridCol.value = col;
    stepCount.value = 0;
    dir.value = null;
  };

  const move = (direction: Direction, row: number, col: number) => {
    gridRow.value = row;
    gridCol.value = col;
    stepCount.value++;
    dir.value = direction;
  };

  return { gridRow, gridCol, stepCount, dir, pos, reset, move };
});
