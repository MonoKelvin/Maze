/**
 * 迷宫渲染器 - 负责绘制迷宫墙壁、入口、出口和玩家
 * 使用面向对象设计，增强可维护性和扩展性
 */

import type { Maze, CellSize } from '@/types/maze';
import type { Theme } from '@/types/theme';

/**
 * 迷宫渲染器
 */
export class MazeRenderer {
    /** 渲染配置 */
    private config = {
        wallWidth: 2,
        wallColor: '',
        glowBlur: 5,
        glowColor: '',
        entryRadiusRatio: 0.3,
        exitRadiusRatio: 0.3,
        playerRadiusRatio: 0.25,
        playerGlowBlur: 10
    };

    constructor() {
        this.applyTheme();
    }

    /**
     * 应用主题配置
     */
    private applyTheme(): void {
        this.config.wallColor = ''; // 将在渲染时动态获取
        this.config.glowColor = '';
    }

    /**
     * 更新主题
     */
    updateTheme(theme: Theme): void {
        this.config.glowColor = theme.wallGlow;
    }

    /**
     * 渲染迷宫主函数
     */
    render(
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

        // 更新配置
        this.config.wallColor = theme.wallColor;
        this.config.glowColor = theme.wallGlow;

        // 渲染各个元素
        this.renderWalls(ctx, maze, cellSize);
        this.renderEntry(ctx, maze.entry.row, maze.entry.col, cellSize, theme);
        this.renderExit(ctx, maze.exit.row, maze.exit.col, cellSize, theme);
    }

    /**
     * 渲染墙壁
     */
    private renderWalls(
        ctx: CanvasRenderingContext2D,
        maze: Maze,
        cellSize: CellSize
    ): void {
        const { wallWidth, wallColor, glowBlur, glowColor } = this.config;
        const startX = cellSize.offsetX;
        const startY = cellSize.offsetY;
        const cols = maze.grid[0].length;
        const rows = maze.grid.length;

        // 设置样式
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = wallWidth;
        ctx.lineCap = 'round';
        ctx.shadowBlur = glowBlur;
        ctx.shadowColor = glowColor;

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

        // 重置阴影
        ctx.shadowBlur = 0;
    }

    /**
     * 渲染入口标记
     */
    private renderEntry(
        ctx: CanvasRenderingContext2D,
        row: number,
        col: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const x = cellSize.offsetX + col * cellSize.width + cellSize.width / 2;
        const y = cellSize.offsetY + row * cellSize.height + cellSize.height / 2;
        const radius = cellSize.width * this.config.entryRadiusRatio;

        ctx.fillStyle = theme.entryGlow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 添加入口图标（简单的箭头）
        this.renderEntryIcon(ctx, x, y, cellSize, theme);
    }

    /**
     * 渲染入口图标
     */
    private renderEntryIcon(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const size = Math.min(cellSize.width, cellSize.height) * 0.3;
        ctx.strokeStyle = theme.primaryText;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y + size / 2);
        ctx.lineTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.stroke();
    }

    /**
     * 渲染出口标记
     */
    private renderExit(
        ctx: CanvasRenderingContext2D,
        row: number,
        col: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const x = cellSize.offsetX + col * cellSize.width + cellSize.width / 2;
        const y = cellSize.offsetY + row * cellSize.height + cellSize.height / 2;
        const radius = cellSize.width * this.config.exitRadiusRatio;

        ctx.fillStyle = theme.exitGlow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 添加出口图标（简单的目标标记）
        this.renderExitIcon(ctx, x, y, cellSize, theme);
    }

    /**
     * 渲染出口图标
     */
    private renderExitIcon(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const size = Math.min(cellSize.width, cellSize.height) * 0.3;
        ctx.strokeStyle = theme.primaryText;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.6, y);
        ctx.lineTo(x, y + size * 0.6);
        ctx.lineTo(x - size * 0.6, y);
        ctx.closePath();
        ctx.stroke();

        // 中心点
        ctx.fillStyle = theme.primaryText;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染玩家（发光效果）
     */
    renderPlayer(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        cellSize: CellSize,
        theme: Theme
    ): void {
        const centerX = cellSize.offsetX + x + cellSize.width / 2;
        const centerY = cellSize.offsetY + y + cellSize.height / 2;
        const radius = cellSize.width * this.config.playerRadiusRatio;

        // 发光效果
        ctx.shadowBlur = this.config.playerGlowBlur;
        ctx.shadowColor = theme.playerGlow;
        ctx.fillStyle = theme.playerColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /**
     * 渲染网格辅助线（调试用）
     */
    renderGrid(
        ctx: CanvasRenderingContext2D,
        maze: Maze,
        cellSize: CellSize,
        theme: Theme
    ): void {
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;

        for (let row = 0; row <= maze.grid.length; row++) {
            const y = cellSize.offsetY + row * cellSize.height;
            ctx.beginPath();
            ctx.moveTo(cellSize.offsetX, y);
            ctx.lineTo(cellSize.offsetX + maze.grid[0].length * cellSize.width, y);
            ctx.stroke();
        }

        for (let col = 0; col <= maze.grid[0].length; col++) {
            const x = cellSize.offsetX + col * cellSize.width;
            ctx.beginPath();
            ctx.moveTo(x, cellSize.offsetY);
            ctx.lineTo(x, cellSize.offsetY + maze.grid.length * cellSize.height);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }
}
