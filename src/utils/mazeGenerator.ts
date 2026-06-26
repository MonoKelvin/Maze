/**
 * 迷宫生成器 - 基于回溯算法的迷宫生成
 * 使用位掩码表示墙壁状态，支持种子化随机
 */

import type { Cell, Maze, MazeParams } from '@/types/maze';

/** 方向定义 */
type Direction = 'N' | 'E' | 'S' | 'W';

/** 方向偏移量 */
const OFFSET: Record<Direction, [number, number]> = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0]
};

/** 方向列表 */
const DIRS: Direction[] = ['N', 'E', 'S', 'W'];

/**
 * 简单的可种子化伪随机数生成器（Mulberry32）
 */
class SeededRNG {
    private state: number;

    constructor(seed?: number) {
        this.state = (seed ?? Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        if (this.state === 0) this.state = 0x9e3779b9;
    }

    /** 0~1 */
    next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** 0~n-1 */
    int(n: number): number {
        return Math.floor(this.next() * n);
    }

    /** 从数组随机挑选 */
    pick<T>(arr: readonly T[]): T {
        return arr[this.int(arr.length)];
    }
}

/**
 * 创建空的网格（所有墙壁完整）
 */
function createGrid(rows: number, cols: number): Cell[][] {
    const grid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                row: r,
                col: c,
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false,
                inValidArea: true
            });
        }
        grid.push(row);
    }
    return grid;
}

/**
 * 获取未访问的邻居单元格
 */
function getUnvisitedNeighbors(
    grid: Cell[][],
    row: number,
    col: number,
    rows: number,
    cols: number
): Cell[] {
    const neighbors: Cell[] = [];

    for (const d of DIRS) {
        const [dc, dr] = OFFSET[d];
        const nr = row + dr;
        const nc = col + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc].visited) continue;

        neighbors.push(grid[nr][nc]);
    }

    return neighbors;
}

/**
 * 移除两个相邻单元格之间的墙壁
 */
function removeWall(_grid: Cell[][], from: Cell, to: Cell): void {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    if (rowDiff === -1) { // 北
        from.walls.top = false;
        to.walls.bottom = false;
    } else if (rowDiff === 1) { // 南
        from.walls.bottom = false;
        to.walls.top = false;
    } else if (colDiff === -1) { // 西
        from.walls.left = false;
        to.walls.right = false;
    } else if (colDiff === 1) { // 东
        from.walls.right = false;
        to.walls.left = false;
    }
}

/**
 * 使用递归回溯算法（DFS）生成迷宫
 */
function carveMazeDFS(grid: Cell[][], rows: number, cols: number, rng: SeededRNG): void {
    const stack: Cell[] = [];
    const startCell = grid[0][0];

    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(grid, current.row, current.col, rows, cols);

        if (neighbors.length > 0) {
            // 随机选择一个邻居
            const next = rng.pick(neighbors);

            // 移除墙壁
            removeWall(grid, current, next);

            // 标记并入栈
            next.visited = true;
            stack.push(next);
        } else {
            // 回溯
            stack.pop();
        }
    }
}

/**
 * 生成迷宫主函数
 */
export function generateMaze(params: MazeParams): Maze {
    const { rows, cols, seed, entry, exit } = params;

    // 参数验证
    const validRows = Math.max(1, Math.min(100, rows));
    const validCols = Math.max(1, Math.min(100, cols));

    // 创建网格
    const grid = createGrid(validRows, validCols);

    // 创建随机数生成器
    const rng = new SeededRNG(seed);

    // 生成迷宫
    carveMazeDFS(grid, validRows, validCols, rng);

    // 确定入口和出口位置
    const entryRow = entry?.gridPos?.row ?? 0;
    const entryCol = entry?.gridPos?.col ?? 0;
    const exitRow = exit?.gridPos?.row ?? (validRows - 1);
    const exitCol = exit?.gridPos?.col ?? (validCols - 1);

    // 验证位置范围
    const validEntryRow = Math.max(0, Math.min(validRows - 1, entryRow));
    const validEntryCol = Math.max(0, Math.min(validCols - 1, entryCol));
    const validExitRow = Math.max(0, Math.min(validRows - 1, exitRow));
    const validExitCol = Math.max(0, Math.min(validCols - 1, exitCol));

    // 标记入口和出口
    grid[validEntryRow][validEntryCol].entry = true;
    grid[validExitRow][validExitCol].exit = true;

    return {
        grid,
        entry: { row: validEntryRow, col: validEntryCol },
        exit: { row: validExitRow, col: validExitCol },
        params: {
            ...params,
            rows: validRows,
            cols: validCols
        }
    };
}
