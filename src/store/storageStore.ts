import { defineStore } from 'pinia';
import { ref } from 'vue';

const KEY = 'maze_save';

interface SaveData {
  rows: number;
  cols: number;
  entryRow: number;
  entryCol: number;
  exitRow: number;
  exitCol: number;
  playerRow: number;
  playerCol: number;
  elapsed: number;
  steps: number;
}

export const useStorageStore = defineStore('storage', () => {
  const data = ref<SaveData | null>(null);

  const save = (d: SaveData) => {
    data.value = d;
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
  };

  const load = (): SaveData | null => {
    if (data.value) return data.value;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { data.value = JSON.parse(raw); return data.value; }
    } catch {}
    return null;
  };

  const clear = () => {
    data.value = null;
    localStorage.removeItem(KEY);
  };

  return { data, save, load, clear };
});
