/**
 * 迷宫生成器 — 位掩码 Uint8Array，支持异步 + 取消 + 出入口配置
 * 尺寸范围 1~1000
 */

import type { SimpleMaze } from '@/types/maze';

const W = { T: 1, R: 2, B: 4, L: 8, V: 16 };

export interface GenToken { aborted: boolean }

function pickEntryExit(rows: number, cols: number) {
  const entry = { row: Math.floor(Math.random() * rows), col: 0 };
  let exit = { row: Math.floor(Math.random() * rows), col: cols - 1 };
  if (entry.row === exit.row) exit = { ...exit, row: (exit.row + 1) % rows };
  return { entry, exit };
}

export function generateSync(rows: number, cols: number, token?: GenToken): SimpleMaze {
  const R = clamp(rows), C = clamp(cols);
  const walls = new Uint8Array(R * C);
  walls.fill(W.T | W.R | W.B | W.L);
  walls[0] |= W.V;
  const stack: number[] = [0];
  while (stack.length) {
    if (token?.aborted) return null as any;
    const cur = stack[stack.length - 1];
    const r = Math.floor(cur / C), c = cur % C;
    const nbrs: number[] = [];
    if (r > 0)        { const n = cur - C; if (!(walls[n] & W.V)) nbrs.push(n); }
    if (r < R - 1)    { const n = cur + C; if (!(walls[n] & W.V)) nbrs.push(n); }
    if (c > 0)        { const n = cur - 1; if (!(walls[n] & W.V)) nbrs.push(n); }
    if (c < C - 1)    { const n = cur + 1; if (!(walls[n] & W.V)) nbrs.push(n); }
    if (nbrs.length) {
      const n = nbrs[Math.random() * nbrs.length | 0];
      const nr = Math.floor(n / C), nc = n % C;
      if (nr === r - 1) { walls[cur] &= ~W.T; walls[n] &= ~W.B; }
      else if (nr === r + 1) { walls[cur] &= ~W.B; walls[n] &= ~W.T; }
      else if (nc === c - 1) { walls[cur] &= ~W.L; walls[n] &= ~W.R; }
      else if (nc === c + 1) { walls[cur] &= ~W.R; walls[n] &= ~W.L; }
      walls[n] |= W.V; stack.push(n);
    } else stack.pop();
  }
  const ee = pickEntryExit(R, C);
  return { walls, rows: R, cols: C, entry: ee.entry, exit: ee.exit };
}

export function generateAsync(
  rows: number, cols: number,
  onProgress?: (pct: number) => void,
  token?: GenToken
): Promise<SimpleMaze> {
  return new Promise(resolve => {
    const R = clamp(rows), C = clamp(cols), total = R * C;
    const walls = new Uint8Array(total);
    walls.fill(W.T | W.R | W.B | W.L);
    walls[0] |= W.V;
    const stack: number[] = [0];
    let visited = 1;
    function tick() {
      if (token?.aborted) { resolve(null as any); return; }
      const t0 = performance.now();
      while (stack.length && performance.now() - t0 < 12) {
        const cur = stack[stack.length - 1];
        const r = Math.floor(cur / C), c = cur % C;
        const nbrs: number[] = [];
        if (r > 0)        { const n = cur - C; if (!(walls[n] & W.V)) nbrs.push(n); }
        if (r < R - 1)    { const n = cur + C; if (!(walls[n] & W.V)) nbrs.push(n); }
        if (c > 0)        { const n = cur - 1; if (!(walls[n] & W.V)) nbrs.push(n); }
        if (c < C - 1)    { const n = cur + 1; if (!(walls[n] & W.V)) nbrs.push(n); }
        if (nbrs.length) {
          const n = nbrs[Math.random() * nbrs.length | 0];
          const nr = Math.floor(n / C), nc = n % C;
          if (nr === r - 1) { walls[cur] &= ~W.T; walls[n] &= ~W.B; }
          else if (nr === r + 1) { walls[cur] &= ~W.B; walls[n] &= ~W.T; }
          else if (nc === c - 1) { walls[cur] &= ~W.L; walls[n] &= ~W.R; }
          else if (nc === c + 1) { walls[cur] &= ~W.R; walls[n] &= ~W.L; }
          walls[n] |= W.V; stack.push(n); visited++;
        } else stack.pop();
      }
      onProgress?.(Math.min(Math.round(visited / total * 100), 100));
      if (stack.length) setTimeout(tick, 0);
      else { const ee = pickEntryExit(R, C); resolve({ walls, rows: R, cols: C, entry: ee.entry, exit: ee.exit }); }
    }
    tick();
  });
}

function clamp(v: number) { return Math.max(1, Math.min(1000, Math.round(v))); }
