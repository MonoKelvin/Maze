/**
 * 迷宫渲染器 — 合并连续墙段 + roundRect + lineCap/lineJoin 圆角
 */

import type { Theme } from '@/types/theme';
import { W_TOP, W_RIGHT, W_BOTTOM, W_LEFT } from './mazeWalls';

export class MazeRenderer {
  /** 计算适配尺寸 */
  static fitSize(R: number, C: number, cw: number, ch: number, pad = 16) {
    const cs = Math.max(1, Math.min(Math.floor((cw - pad * 2) / C), Math.floor((ch - pad * 2) / R), 60));
    return { cs, ox: Math.floor((cw - C * cs) / 2), oy: Math.floor((ch - R * cs) / 2) };
  }

  /**
   * 动态线宽：随 cellSize 线性增长，但设上下限
   *   cs=1~5   → lw≈1.0         大迷宫细线不重叠
   *   cs=10    → lw≈1.6
   *   cs=20    → lw≈3.2
   *   cs=30+   → lw≈4.0         小迷宫粗线有质感
   */
  private static wallWidth(cs: number): number {
    return Math.max(1.0, Math.min(cs * 0.16, 4.0));
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
    const lw = this.wallWidth(cs);

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
    ctx.lineWidth = Math.max(1.0, cs * 0.25);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.35;
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
    playerPy?: number,
    opts?: {
      shape?: string;
      icon?: string;
      image?: string;
      size?: number;
    }
  ) {
    const lw = this.wallWidth(cs);
    // 出入口光晕半径 = 略小于半格宽，保证不会超出墙壁
    const r = Math.max(2, (cs - lw) * 0.38);
    const atEntry = player && player.row === entry.row && player.col === entry.col;

    // 入口光晕（玩家在入口时隐藏）
    if (!atEntry) {
      ctx.fillStyle = theme.entryGlow;
      ctx.beginPath(); ctx.arc(ox + entry.col * cs + cs / 2, oy + entry.row * cs + cs / 2, r, 0, Math.PI * 2); ctx.fill();
    }

    // 出口光晕
    ctx.fillStyle = theme.exitGlow;
    ctx.beginPath(); ctx.arc(ox + exit.col * cs + cs / 2, oy + exit.row * cs + cs / 2, r, 0, Math.PI * 2); ctx.fill();

    if (!player) return;

    const px = playerPx !== undefined ? ox + playerPx : ox + player.col * cs + cs / 2;
    const py = playerPy !== undefined ? oy + playerPy : oy + player.row * cs + cs / 2;
    const sizeRatio = opts?.size ?? 0.6;
    const pr = Math.max(2, (cs - lw) * sizeRatio * 0.5);
    const g = cs < 6 ? 0 : Math.min(8, cs / 3);

    // 阴影
    ctx.shadowBlur = g;
    ctx.shadowColor = theme.playerGlow;
    ctx.fillStyle = theme.playerColor;

    if (opts?.image) {
      // 图片模式
      this.drawImagePlayer(ctx, opts.image, px, py, pr);
    } else if (opts?.icon) {
      // 图标（emoji）模式
      ctx.shadowBlur = 0;
      ctx.font = `${Math.round(pr * 1.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.icon, px, py + 1);
    } else {
      // 形状模式
      const shape = opts?.shape ?? 'circle';
      this.drawShape(ctx, shape, px, py, pr, theme.playerColor);
    }

    ctx.shadowBlur = 0;
  }

  /** 绘制自定义形状 */
  private static drawShape(
    ctx: CanvasRenderingContext2D,
    shape: string,
    x: number, y: number, r: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();

    switch (shape) {
      case 'square':
        ctx.rect(x - r, y - r, r * 2, r * 2);
        break;

      case 'diamond':
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        break;

      case 'star': {
        const inner = r * 0.45;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? r : inner;
          const angle = (Math.PI / 2) + (i * Math.PI / 5);
          const px = x - radius * Math.cos(angle);
          const py = y - radius * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      }

      case 'heart': {
        const topY = y - r * 0.4;
        ctx.moveTo(x, y + r);
        ctx.bezierCurveTo(x - r * 1.2, y - r * 0.2, x - r * 0.6, topY - r * 0.6, x, topY + r * 0.2);
        ctx.bezierCurveTo(x + r * 0.6, topY - r * 0.6, x + r * 1.2, y - r * 0.2, x, y + r);
        ctx.closePath();
        break;
      }

      default: // circle
        ctx.arc(x, y, r, 0, Math.PI * 2);
        break;
    }

    ctx.fill();
  }

  /** 绘制图片玩家 */
  private static drawImagePlayer(
    ctx: CanvasRenderingContext2D,
    src: string,
    x: number, y: number, r: number
  ) {
    // 缓存图片
    if (!MazeRenderer._imgCache) MazeRenderer._imgCache = new Map();
    let img = MazeRenderer._imgCache.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      MazeRenderer._imgCache.set(src, img);
    }
    if (!img.complete || !img.naturalWidth) return; // 未加载完则跳过

    const size = r * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - r, y - r, size, size);
    ctx.restore();
  }

  private static _imgCache?: Map<string, HTMLImageElement>;
}
