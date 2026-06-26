/**
 * 迷宫渲染器 - 负责绘制迷宫墙壁、入口、出口和玩家
 */

import type { Maze, CellSize } from '@/types/maze';
import type { Theme } from '@/types/theme';

/**
 * 迷宫渲染器
 */
export class MazeRenderer {
    /**
     * 渲染迷宫主函数
     */
    static render(
        canvas: HTMLCanvasElement,
        maze: Maze,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // 清空画布
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 渲染墙壁
        this.renderWalls(ctx, maze, cellSize, theme);

        // 渲染入口
        this.renderEntry(ctx, maze.entry.row, maze.entry.col, cellSize, theme);

        // 渲染出口
        this.renderExit(ctx, maze.exit.row, maze.exit.col, cellSize, theme);
    }

    /**
     * 渲染墙壁
     */
    private static renderWalls(
        ctx: CanvasRenderingContext2D,
        maze: Maze,
        cellSize: CellSize,
        theme: Theme
    ): void {
        ctx.strokeStyle = theme.wallColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const startX = cellSize.offsetX;
        const startY = cellSize.offsetY;
        const cols = maze.grid[0].length;
        const rows = maze.grid.length;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * cellSize.width;
                const y = startY + row * cellSize.height;
                const cell = maze.grid[row][col];

                if (cell.walls.top) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + cellSize.width, y);
                    ctx.stroke();
                }
                if (cell.walls.right) {
                    ctx.beginPath();
                    ctx.moveTo(x + cellSize.width, y);
                    ctx.lineTo(x + cellSize.width, y + cellSize.height);
                    ctx.stroke();
                }
                if (cell.walls.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + cellSize.height);
                    ctx.lineTo(x + cellSize.width, y + cellSize.height);
                    ctx.stroke();
                }
                if (cell.walls.left) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + cellSize.height);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * 渲染入口标记
     */
    private static renderEntry(
        ctx: CanvasRenderingContext2D,
        row: number,
        col: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const x = cellSize.offsetX + col * cellSize.width + cellSize.width / 2;
        const y = cellSize.offsetY + row * cellSize.height + cellSize.height / 2;

        ctx.fillStyle = theme.entryGlow;
        ctx.beginPath();
        ctx.arc(x, y, cellSize.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染出口标记
     */
    private static renderExit(
        ctx: CanvasRenderingContext2D,
        row: number,
        col: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const x = cellSize.offsetX + col * cellSize.width + cellSize.width / 2;
        const y = cellSize.offsetY + row * cellSize.height + cellSize.height / 2;

        ctx.fillStyle = theme.exitGlow;
        ctx.beginPath();
        ctx.arc(x, y, cellSize.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染玩家（发光效果）
     */
    static renderPlayer(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const centerX = cellSize.offsetX + x + cellSize.width / 2;
        const centerY = cellSize.offsetY + y + cellSize.height / 2;

        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.playerGlow;
        ctx.fillStyle = theme.playerColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize.width * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
