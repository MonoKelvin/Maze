import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Maze, MazeParams, EntryPoint } from '@/types/maze';
import { Cell, EntryPointType } from '@/types/maze';
import { generateMaze } from '@/utils/mazeGenerator';
import { DEFAULT_STORAGE } from '@/types/storage';

export const useMazeStore = defineStore('maze', () => {
    const rows = ref<number>(DEFAULT_STORAGE.mazeParams.rows);
    const cols = ref<number>(DEFAULT_STORAGE.mazeParams.cols);
    const seed = ref<number | undefined>(DEFAULT_STORAGE.mazeParams.seed);
    const mode = ref<string>(DEFAULT_STORAGE.mazeParams.mode);
    const previewMode = ref<'quick' | 'full'>('quick');
    const entry = ref<EntryPoint>({
        type: DEFAULT_STORAGE.mazeParams.entryType,
        gridPos: { row: 0, col: 0 },
        isValid: true
    });
    const exitPoint = ref<EntryPoint>({
        type: DEFAULT_STORAGE.mazeParams.exitType as unknown as EntryPointType,
        gridPos: { row: rows.value - 1, col: cols.value - 1 },
        isValid: true
    });
    const grid = ref<Cell[][]>([]);
    const maze = ref<Maze | null>(null);

    const mazeParams = computed<MazeParams>(() => ({
        mode: mode.value as any,
        rows: rows.value,
        cols: cols.value,
        seed: seed.value,
        entry: entry.value,
        exit: exitPoint.value,
        previewMode: previewMode.value
    }));

    const currentMaze = computed(() => maze.value);

    const doGenerateMaze = (): Maze | null => {
        try {
            const params = mazeParams.value;
            const mazeData = generateMaze(params);

            grid.value = mazeData.grid;
            maze.value = mazeData;

            return mazeData;
        } catch (error) {
            console.error('Failed to generate maze:', error);
            return null;
        }
    };

    const setPreviewMode = (newMode: 'quick' | 'full') => {
        previewMode.value = newMode;
    };

    const updateRows = (value: number) => {
        rows.value = value;
        seed.value = undefined;
        exitPoint.value = {
            ...exitPoint.value,
            gridPos: { row: value - 1, col: cols.value - 1 }
        };
    };

    const updateCols = (value: number) => {
        cols.value = value;
        seed.value = undefined;
        exitPoint.value = {
            ...exitPoint.value,
            gridPos: { row: rows.value - 1, col: value - 1 }
        };
    };

    const updateSeed = (value: number | undefined) => {
        seed.value = value;
    };

    const updateMode = (value: string) => {
        mode.value = value;
        seed.value = undefined;
    };

    const updateEntry = (newEntry: EntryPoint) => {
        entry.value = newEntry;
        if (newEntry.gridPos) {
            entry.value.isValid = true;
        }
    };

    const updateExit = (newExit: EntryPoint) => {
        exitPoint.value = newExit;
        if (newExit.gridPos) {
            exitPoint.value.isValid = true;
        }
    };

    const resetMazeParams = () => {
        rows.value = DEFAULT_STORAGE.mazeParams.rows;
        cols.value = DEFAULT_STORAGE.mazeParams.cols;
        seed.value = undefined;
        mode.value = DEFAULT_STORAGE.mazeParams.mode;
        previewMode.value = 'quick';
        entry.value = {
            type: DEFAULT_STORAGE.mazeParams.entryType,
            gridPos: { row: 0, col: 0 },
            isValid: true
        };
        exitPoint.value = {
            type: DEFAULT_STORAGE.mazeParams.exitType as unknown as EntryPointType,
            gridPos: { row: DEFAULT_STORAGE.mazeParams.rows - 1, col: DEFAULT_STORAGE.mazeParams.cols - 1 },
            isValid: true
        };
        grid.value = [];
        maze.value = null;
    };

    return {
        rows,
        cols,
        seed,
        mode,
        previewMode,
        entry,
        exit: exitPoint,
        grid,
        maze,
        mazeParams,
        currentMaze,
        generateMaze: doGenerateMaze,
        setPreviewMode,
        updateRows,
        updateCols,
        updateSeed,
        updateMode,
        updateEntry,
        updateExit,
        resetMazeParams
    };
});
