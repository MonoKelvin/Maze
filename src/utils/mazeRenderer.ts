/**
 * 迷宫渲染器 — 合并连续墙段 + roundRect + lineCap/lineJoin 圆角
 */

import type { Theme } from '@/types/theme';
import { W_TOP, W_RIGHT, W_BOTTOM, W_LEFT } from './mazeWalls';

export class MazeRenderer {
  /** 计算适配尺寸 */
  static fitSize(R: number, C: number, cw: number, ch: number, pad = 16) {
    const cs = Math.max(2, Math.min(Math.floor((cw - pad * 2) / C), Math.floor((ch - pad * 2) / R), 40));
    return { cs, ox: Math.floor((cw - C * cs) / 2), oy: Math.floor((ch - R * cs) / 2) };
  }

  /**
   * 绘制墙壁
   *
   * 策略：
   *   水平墙和竖墙分别扫描合并，每条连续墙段只画一条线段。
   *   lineCap:'round' → 端点半圆
   *   lineJoin:'round' → 转角处圆弧
   *
   * 端点（墙的尽头）：半圆帽盖
   * 转角（水平 + 竖墙交汇）：两条线的半圆重叠，视觉上自然形成圆角
   */
  static renderWalls(
    ctx: CanvasRenderingContext2D,
    walls: Uint8Array, R: number, C: number,
    cs: number, ox: number, oy: number,
    theme: Theme
  ) {
    const lw = Math.max(2, Math.ceil(cs / 20));

    ctx.strokeStyle = theme.wallColor;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    // ── 水平墙段：每行扫描，合并连续的上墙或下墙 ──
    for (let row = 0; row < R; row++) {
      // 上墙（W_TOP）
      let segStart = -1;
      for (let col = 0; col < C; col++) {
        if (walls[row * C + col] & W_TOP) {
          if (segStart < 0) segStart = col;
        } else {
          if (segStart >= 0) {
            ctx.moveTo(ox + segStart * cs, oy + row * cs);
            ctx.lineTo(ox + col * cs, oy + row * cs);
            segStart = -1;
          }
        }
      }
      if (segStart >= 0) {
        ctx.moveTo(ox + segStart * cs, oy + row * cs);
        ctx.lineTo(ox + C * cs, oy + row * cs);
      }
      // 下墙（W_BOTTOM）
      segStart = -1;
      for (let col = 0; col < C; col++) {
        if (walls[row * C + col] & W_BOTTOM) {
          if (segStart < 0) segStart = col;
        } else {
          if (segStart >= 0) {
            ctx.moveTo(ox + segStart * cs, oy + (row + 1) * cs);
            ctx.lineTo(ox + col * cs, oy + (row + 1) * cs);
            segStart = -1;
          }
        }
      }
      if (segStart >= 0) {
        ctx.moveTo(ox + segStart * cs, oy + (row + 1) * cs);
        ctx.lineTo(ox + C * cs, oy + (row + 1) * cs);
      }
    }

    // ── 竖直墙段：每列扫描，合并连续的左墙或右墙 ──
    for (let col = 0; col < C; col++) {
      // 左墙（W_LEFT）
      let segStart = -1;
      for (let row = 0; row < R; row++) {
        if (walls[row * C + col] & W_LEFT) {
          if (segStart < 0) segStart = row;
        } else {
          if (segStart >= 0) {
            ctx.moveTo(ox + col * cs, oy + segStart * cs);
            ctx.lineTo(ox + col * cs, oy + row * cs);
            segStart = -1;
          }
        }
      }
      if (segStart >= 0) {
        ctx.moveTo(ox + col * cs, oy + segStart * cs);
        ctx.lineTo(ox + col * cs, oy + R * cs);
      }
      // 右墙（W_RIGHT）
      segStart = -1;
      for (let row = 0; row < R; row++) {
        if (walls[row * C + col] & W_RIGHT) {
          if (segStart < 0) segStart = row;
        } else {
          if (segStart >= 0) {
            ctx.moveTo(ox + (col + 1) * cs, oy + segStart * cs);
            ctx.lineTo(ox + (col + 1) * cs, oy + row * cs);
            segStart = -1;
          }
        }
      }
      if (segStart >= 0) {
        ctx.moveTo(ox + (col + 1) * cs, oy + segStart * cs);
        ctx.lineTo(ox + (col + 1) * cs, oy + R * cs);
      }
    }

    ctx.stroke();
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
