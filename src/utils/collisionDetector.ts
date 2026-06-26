import { Cell } from '@/types/maze';
import { MovementDirection } from '@/types/player';

export class CollisionDetector {
  static canMove(
    _playerGrid: { row: number; col: number },
    cell: Cell,
    direction: MovementDirection
  ): boolean {
    switch (direction) {
      case MovementDirection.UP:
        return !cell.walls.top;
      case MovementDirection.DOWN:
        return !cell.walls.bottom;
      case MovementDirection.LEFT:
        return !cell.walls.left;
      case MovementDirection.RIGHT:
        return !cell.walls.right;
      default:
        return false;
    }
  }

  static reachedTarget(
    playerGrid: { row: number; col: number },
    targetGrid: { row: number; col: number }
  ): boolean {
    return (
      playerGrid.row === targetGrid.row &&
      playerGrid.col === targetGrid.col
    );
  }

  static getTargetGrid(
    playerGrid: { row: number; col: number },
    direction: MovementDirection
  ): { row: number; col: number } {
    switch (direction) {
      case MovementDirection.UP:
        return { row: playerGrid.row - 1, col: playerGrid.col };
      case MovementDirection.DOWN:
        return { row: playerGrid.row + 1, col: playerGrid.col };
      case MovementDirection.LEFT:
        return { row: playerGrid.row, col: playerGrid.col - 1 };
      case MovementDirection.RIGHT:
        return { row: playerGrid.row, col: playerGrid.col + 1 };
      default:
        return playerGrid;
    }
  }
}
