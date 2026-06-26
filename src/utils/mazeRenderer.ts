/**
 * 迷宫渲染器 — 使用 fillRect 绘制墙壁（无阴影、无重叠转角）
 */

import type { Theme } from '@/types/theme';
import { W_TOP, W_RIGHT, W_BOTTOM, W_LEFT } from './mazeWalls';

export class MazeRenderer {
  /** 计算适配尺寸 */
  static fitSize(R: number, C: number, cw: number, ch: number, pad = 16) {
    const cs = Math.max(2, Math.min(Math.floor((cw - pad * 2) / C), Math.floor((ch - pad * 2) / R), 40));
    return { cs, ox: Math.floor((cw - C * cs) / 2), oy: Math.floor((ch - R * cs) / 2) };
  }

  /** 绘制墙壁 — fillRect 方式，无阴影无转角重叠 */
  static renderWalls(
    ctx: CanvasRenderingContext2D,
    walls: Uint8Array, R: number, C: number,
    cs: number, ox: number, oy: number,
    theme: Theme
  ) {
    const lw = Math.max(1, Math.ceil(cs / 20));
    ctx.fillStyle = theme.wallColor;

    // 用 fillRect 绘制每条墙壁，转角自然衔接
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const w = walls[r * C + c];
        if (w & W_TOP)    ctx.fillRect(ox + c * cs, oy + r * cs, cs, lw);
        if (w & W_BOTTOM) ctx.fillRect(ox + c * cs, oy + (r + 1) * cs - lw, cs, lw);
        if (w & W_LEFT)   ctx.fillRect(ox + c * cs, oy + r * cs, lw, cs);
        if (w & W_RIGHT)  ctx.fillRect(ox + (c + 1) * cs - lw, oy + r * cs, lw, cs);
      }
    }
  }

  /** 绘制求解路径 */
  static renderPath(
    ctx: CanvasRenderingContext2D,
    path: { row: number; col: number }[],
    cs: number, ox: number, oy: number,
    color: string
  ) {
    if (!path.length) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, cs * 0.4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const px = ox + path[i].col * cs + cs / 2;
      const py = oy + path[i].row * cs + cs / 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /** 绘制出入口 + 玩家 */
  static renderPoints(
    ctx: CanvasRenderingContext2D,
    cs: number, ox: number, oy: number,
    entry: { row: number; col: number },
    exit: { row: number; col: number },
    player: { row: number; col: number } | undefined,
    theme: Theme,
    playerPx?: number,
    playerPy?: number
  ) {
    const r = cs < 4 ? 1.5 : cs * 0.3;
    const g = cs < 4 ? 0 : Math.min(6, cs / 4);

    ctx.fillStyle = theme.entryGlow;
    ctx.beginPath(); ctx.arc(ox + entry.col * cs + cs / 2, oy + entry.row * cs + cs / 2, r * 1.3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = theme.exitGlow;
    ctx.beginPath(); ctx.arc(ox + exit.col * cs + cs / 2, oy + exit.row * cs + cs / 2, r * 1.3, 0, Math.PI * 2); ctx.fill();

    if (player) {
      const px = playerPx !== undefined ? ox + playerPx : ox + player.col * cs + cs / 2;
      const py = playerPy !== undefined ? oy + playerPy : oy + player.row * cs + cs / 2;
      ctx.shadowBlur = g; ctx.shadowColor = theme.playerGlow;
      ctx.fillStyle = theme.playerColor;
      ctx.beginPath(); ctx.arc(px, py, Math.max(2, cs * 0.35), 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}
