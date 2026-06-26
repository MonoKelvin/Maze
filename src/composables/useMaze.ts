import { computed } from 'vue';
import { useMazeStore } from '@/store/mazeStore';

export function useMaze() {
  const mazeStore = useMazeStore();

  const currentMaze = computed(() => mazeStore.maze);

  const mazeParams = computed(() => mazeStore.mazeParams);

  const hasMaze = computed(() => mazeStore.maze !== null);

  const generateMaze = () => {
    return mazeStore.generateMaze();
  };

  const setPreviewMode = (mode: 'quick' | 'full') => {
    mazeStore.setPreviewMode(mode);
  };

  const updateRows = (value: number) => {
    mazeStore.updateRows(value);
  };

  const updateCols = (value: number) => {
    mazeStore.updateCols(value);
  };

  const updateSeed = (value: number | undefined) => {
    mazeStore.updateSeed(value);
  };

  const updateMode = (value: string) => {
    mazeStore.updateMode(value);
  };

  const updateEntry = (entry: any) => {
    mazeStore.updateEntry(entry);
  };

  const updateExit = (exit: any) => {
    mazeStore.updateExit(exit);
  };

  const resetMazeParams = () => {
    mazeStore.resetMazeParams();
  };

  return {
    currentMaze,
    mazeParams,
    hasMaze,
    generateMaze,
    setPreviewMode,
    updateRows,
    updateCols,
    updateSeed,
    updateMode,
    updateEntry,
    updateExit,
    resetMazeParams
  };
}
