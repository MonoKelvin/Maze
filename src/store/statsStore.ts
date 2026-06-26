import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Stats } from '@/types/stats';


/**
 * 统计数据状态管理
 */
export const useStatsStore = defineStore('stats', () => {
  // 状态
  const elapsedTime = ref<number>(0);
  const totalDistance = ref<number>(0);
  const stepCount = ref<number>(0);
  const timerRunning = ref<boolean>(false);
  const timerInterval = ref<number | null>(null);

  // 格式化时间
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 100);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  // 格式化距离
  const formatDistance = (distance: number): string => {
    return distance.toLocaleString();
  };

  // 开始计时
  const startTimer = () => {
    if (timerRunning.value) return;

    timerRunning.value = true;

    timerInterval.value = window.setInterval(() => {
      elapsedTime.value += 100;
    }, 100);
  };

  // 停止计时
  const stopTimer = () => {
    if (!timerRunning.value) return;

    timerRunning.value = false;

    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  // 重置统计
  const resetStats = () => {
    stopTimer();
    elapsedTime.value = 0;
    totalDistance.value = 0;
    stepCount.value = 0;
  };

  // 保存统计
  const saveStats = () => {
    try {
      const settings = (window as any).electronAPI?.loadSettings();
      if (settings?.data) {
        settings.data.stats = {
          elapsed: elapsedTime.value,
          distance: totalDistance.value,
          steps: stepCount.value
        };
        (window as any).electronAPI?.saveSettings(settings.data);
      }
    } catch (error) {
      console.error('保存统计失败:', error);
    }
  };

  // 加载统计
  const loadStats = (stats: Stats) => {
    elapsedTime.value = stats.elapsed;
    totalDistance.value = stats.distance;
    stepCount.value = stats.steps;
  };

  return {
    elapsedTime,
    totalDistance,
    stepCount,
    timerRunning,
    formatTime,
    formatDistance,
    startTimer,
    stopTimer,
    resetStats,
    saveStats,
    loadStats
  };
});
