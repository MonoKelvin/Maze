/**
 * 迷宫求解器 — BFS 找最短路径
 */

import { W_TOP, W_RIGHT, W_BOTTOM, W_LEFT } from './mazeWalls';

const DIRS = [
  [-1, 0, W_TOP],    // 上
  [1, 0, W_BOTTOM],  // 下
  [0, -1, W_LEFT],   // 左
  [0, 1, W_RIGHT]    // 右
] as const;

/** BFS 求解迷宫，返回从入口到出口的路径坐标数组 */
export function solveMaze(
  walls: Uint8Array, rows: number, cols: number,
  entry: { row: number; col: number },
  exit: { row: number; col: number }
): { row: number; col: number }[] {
  if (entry.row === exit.row && entry.col === exit.col) return [entry];

  const visited = new Uint8Array(rows * cols);
  const prev = new Int32Array(rows * cols).fill(-1);
  const queue: number[] = [];
  const start = entry.row * cols + entry.col;
  const end = exit.row * cols + exit.col;

  visited[start] = 1;
  queue.push(start);

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const r = Math.floor(cur / cols), c = cur % cols;
    const w = walls[cur];

    for (const [dr, dc, wallBit] of DIRS) {
      if (w & wallBit) continue; // 有墙，不通
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const ni = nr * cols + nc;
      if (visited[ni]) continue;
      visited[ni] = 1;
      prev[ni] = cur;
      if (ni === end) {
        // 回溯路径
        const path: { row: number; col: number }[] = [];
        let p = ni;
        while (p !== -1) {
          path.push({ row: Math.floor(p / cols), col: p % cols });
          p = prev[p];
        }
        return path.reverse();
      }
      queue.push(ni);
    }
  }
  return []; // 无路径（不应发生）
}
