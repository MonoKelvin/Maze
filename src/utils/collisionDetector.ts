/**
 * 碰撞检测器 - 负责处理角色移动的碰撞检测
 * 使用面向对象设计
 */

import { Cell } from '@/types/maze';
import { MovementDirection } from '@/types/player';

/**
 * 玩家网格位置
 */
export interface PlayerGridPosition {
  row: number;
  col: number;
}

/**
 * 碰撞检测器
 */
export class CollisionDetector {
  /**
   * 检测移动方向是否有墙壁阻挡
   */
  canMove(
    playerGrid: PlayerGridPosition,
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

  /**
   * 检测玩家是否到达目标单元格
   */
  reachedTarget(
    playerGrid: PlayerGridPosition,
    targetGrid: PlayerGridPosition
  ): boolean {
    return (
      playerGrid.row === targetGrid.row &&
      playerGrid.col === targetGrid.col
    );
  }

  /**
   * 获取移动后的网格坐标
   */
  getTargetGrid(
    playerGrid: PlayerGridPosition,
    direction: MovementDirection
  ): PlayerGridPosition {
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

  /**
   * 检测边界
   */
  isInsideBounds(
    grid: Cell[][],
    row: number,
    col: number
  ): boolean {
    return (
      row >= 0 &&
      row < grid.length &&
      col >= 0 &&
      col < grid[0].length
    );
  }
}
