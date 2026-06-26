/** 单元格（仅小迷宫用） */
export interface Cell {
  row: number; col: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean; inValidArea: boolean;
}

/** 迷宫参数 */
export interface MazeParams { rows: number; cols: number; entry?: { gridPos?: { row: number; col: number } }; exit?: { gridPos?: { row: number; col: number } }; }

/** 大迷宫用位掩码表示 wall: 1-top 2-right 4-bottom 8-left */
export interface SimpleMaze {
  walls: Uint8Array;
  rows: number; cols: number;
  entry: { row: number; col: number };
  exit: { row: number; col: number };
}

/** 全量迷宫（含 Cell[][]，小迷宫用） */
export interface Maze extends SimpleMaze {
  grid: Cell[][];
}

/** 移动方向 */
export enum Direction { UP = 'up', DOWN = 'down', LEFT = 'left', RIGHT = 'right' }
