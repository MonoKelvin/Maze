import { Direction } from '@/types/maze';
import { W_TOP, W_RIGHT, W_BOTTOM, W_LEFT } from './mazeWalls';

/** 直接从位掩码检测碰撞 */
export class CollisionDetector {
  static canMove(walls: Uint8Array, row: number, col: number, C: number, dir: Direction): boolean {
    const w = walls[row * C + col];
    switch (dir) {
      case Direction.UP: return !(w & W_TOP);
      case Direction.DOWN: return !(w & W_BOTTOM);
      case Direction.LEFT: return !(w & W_LEFT);
      case Direction.RIGHT: return !(w & W_RIGHT);
    }
  }

  static target(row: number, col: number, dir: Direction) {
    switch (dir) {
      case Direction.UP: return { row: row - 1, col };
      case Direction.DOWN: return { row: row + 1, col };
      case Direction.LEFT: return { row, col: col - 1 };
      case Direction.RIGHT: return { row, col: col + 1 };
    }
  }

  static inBounds(row: number, col: number, rows: number, cols: number) {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }
}
