import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStatsStore = defineStore('stats', () => {
  const elapsed = ref(0);
  const running = ref(false);
  let timer: any = null;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const start = () => {
    if (running.value) return;
    elapsed.value = 0;
    running.value = true;
    timer = setInterval(() => { elapsed.value += 100; }, 100);
  };

  const stop = () => {
    running.value = false;
    if (timer) { clearInterval(timer); timer = null; }
  };

  const reset = () => { stop(); elapsed.value = 0; };

  return { elapsed, running, formatTime, start, stop, reset };
});
