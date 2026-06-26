import { MazeMode, EntryPointType, ExitPointType } from './maze';
import { ThemeName } from './theme';

export interface StorageData {
  mazeParams: {
    mode: MazeMode;
    rows: number;
    cols: number;
    seed?: number;
    entryType: EntryPointType;
    exitType: ExitPointType;
  };
  playerGridPos: {
    row: number;
    col: number;
  };
  stats: {
    elapsed: number;
    distance: number;
    steps: number;
  };
  settings: {
    speed: number;
    theme: ThemeName;
    entryCustomPos?: { x: number; y: number };
    exitCustomPos?: { x: number; y: number };
  };
}

export const DEFAULT_STORAGE: StorageData = {
  mazeParams: {
    mode: MazeMode.SQUARE,
    rows: 15,
    cols: 15,
    entryType: EntryPointType.BOUNDARY,
    exitType: ExitPointType.BOUNDARY
  },
  playerGridPos: {
    row: 0,
    col: 0
  },
  stats: {
    elapsed: 0,
    distance: 0,
    steps: 0
  },
  settings: {
    speed: 3,
    theme: 'warm'
  }
};
