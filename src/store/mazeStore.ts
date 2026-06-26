import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMazeStore = defineStore('maze', () => {
  const rows = ref(20);
  const cols = ref(20);
  const setRows = (v: number) => { rows.value = Math.max(1, Math.min(1000, Math.round(v))); };
  const setCols = (v: number) => { cols.value = Math.max(1, Math.min(1000, Math.round(v))); };
  return { rows, cols, setRows, setCols };
});
