import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '@/utils/collisionDetector';
import type { Cell, MovementDirection } from '@/types/maze';

describe('CollisionDetector', () => {
  describe('canMove', () => {
    it('应该允许向空旷方向移动', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: true,
        walls: { top: false, right: false, bottom: false, left: false }
      };

      expect(CollisionDetector.canMove(cell, 'right')).toBe(true);
      expect(CollisionDetector.canMove(cell, 'down')).toBe(true);
      expect(CollisionDetector.canMove(cell, 'up')).toBe(false); // 越界
      expect(CollisionDetector.canMove(cell, 'left')).toBe(false); // 越界
    });

    it('应该阻止有墙壁的方向移动', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: true,
        walls: { top: true, right: false, bottom: false, left: false }
      };

      expect(CollisionDetector.canMove(cell, 'right')).toBe(true);
      expect(CollisionDetector.canMove(cell, 'up')).toBe(false);
    });

    it('应该阻止所有墙壁阻挡的方向', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: true,
        walls: { top: true, right: true, bottom: false, left: true }
      };

      expect(CollisionDetector.canMove(cell, 'up')).toBe(false);
      expect(CollisionDetector.canMove(cell, 'right')).toBe(false);
      expect(CollisionDetector.canMove(cell, 'left')).toBe(false);
      expect(CollisionDetector.canMove(cell, 'down')).toBe(true);
    });

    it('应该阻止越界移动', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: true,
        walls: { top: false, right: false, bottom: false, left: false }
      };

      expect(CollisionDetector.canMove(cell, 'up')).toBe(false);
      expect(CollisionDetector.canMove(cell, 'left')).toBe(false);
    });

    it('应该正确处理所有墙壁方向', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: true,
        walls: { top: true, right: true, bottom: false, left: true }
      };

      const directions: MovementDirection[] = ['up', 'right', 'down', 'left'];
      directions.forEach(dir => {
        if (dir === 'down') {
          expect(CollisionDetector.canMove(cell, dir)).toBe(true);
        } else {
          expect(CollisionDetector.canMove(cell, dir)).toBe(false);
        }
      });
    });

    it('应该正确处理空网格情况', () => {
      const cell: Cell = {
        row: 0,
        col: 0,
        visited: false,
        walls: { top: false, right: false, bottom: false, left: false }
      };

      // 即使未访问，也应该允许移动
      expect(CollisionDetector.canMove(cell, 'right')).toBe(true);
      expect(CollisionDetector.canMove(cell, 'down')).toBe(true);
    });
  });

  describe('reachedTarget', () => {
    it('应该在到达目标格子时返回true', () => {
      const playerGrid = { row: 0, col: 0 };
      const targetGrid = { row: 0, col: 0 };

      expect(CollisionDetector.reachedTarget(playerGrid, targetGrid)).toBe(true);
    });

    it('应该在未到达目标格子时返回false', () => {
      const playerGrid = { row: 0, col: 0 };
      const targetGrid = { row: 5, col: 5 };

      expect(CollisionDetector.reachedTarget(playerGrid, targetGrid)).toBe(false);
    });

    it('应该在部分到达目标时返回false', () => {
      const playerGrid = { row: 0, col: 0 };
      const targetGrid = { row: 2, col: 2 };

      expect(CollisionDetector.reachedTarget(playerGrid, targetGrid)).toBe(false);
    });

    it('应该处理不同的目标位置', () => {
      const playerGrid = { row: 3, col: 3 };

      const testCases = [
        { target: { row: 3, col: 3 }, expected: true },
        { target: { row: 0, col: 0 }, expected: false },
        { target: { row: 10, col: 10 }, expected: false },
        { target: { row: 5, col: 0 }, expected: false }
      ];

      testCases.forEach(({ target, expected }) => {
        expect(CollisionDetector.reachedTarget(playerGrid, target)).toBe(expected);
      });
    });
  });

  describe('getTargetGrid', () => {
    it('应该返回正确的上目标', () => {
      const currentGrid = { row: 5, col: 5 };
      const targetGrid = CollisionDetector.getTargetGrid(currentGrid, 'up');

      expect(targetGrid).toEqual({ row: 4, col: 5 });
    });

    it('应该返回正确的下目标', () => {
      const currentGrid = { row: 5, col: 5 };
      const targetGrid = CollisionDetector.getTargetGrid(currentGrid, 'down');

      expect(targetGrid).toEqual({ row: 6, col: 5 });
    });

    it('应该返回正确的左目标', () => {
      const currentGrid = { row: 5, col: 5 };
      const targetGrid = CollisionDetector.getTargetGrid(currentGrid, 'left');

      expect(targetGrid).toEqual({ row: 5, col: 4 });
    });

    it('应该返回正确的右目标', () => {
      const currentGrid = { row: 5, col: 5 };
      const targetGrid = CollisionDetector.getTargetGrid(currentGrid, 'right');

      expect(targetGrid).toEqual({ row: 5, col: 6 });
    });

    it('应该阻止越界移动', () => {
      const currentGrid = { row: 0, col: 0 };

      // 从 (0,0) 向上移动应该返回 undefined
      expect(CollisionDetector.getTargetGrid(currentGrid, 'up')).toBeUndefined();
    });
  });

  describe('迷宫可达性验证', () => {
    it('应该验证起点和终点是否连通', () => {
      // 创建一个简单的 3x3 迷宫
      const maze = [
        [
          { row: 0, col: 0, visited: true, walls: { top: true, right: false, bottom: false, left: true } },
          { row: 0, col: 1, visited: true, walls: { top: true, right: false, bottom: true, left: false } },
          { row: 0, col: 2, visited: true, walls: { top: true, right: true, bottom: false, left: false } }
        ],
        [
          { row: 1, col: 0, visited: true, walls: { top: false, right: false, bottom: true, left: true } },
          { row: 1, col: 1, visited: true, walls: { top: false, right: false, bottom: true, left: false } },
          { row: 1, col: 2, visited: true, walls: { top: false, right: true, bottom: true, left: false } }
        ],
        [
          { row: 2, col: 0, visited: true, walls: { top: false, right: false, bottom: true, left: true } },
          { row: 2, col: 1, visited: true, walls: { top: false, right: false, bottom: true, left: false } },
          { row: 2, col: 2, visited: true, walls: { top: false, right: true, bottom: true, left: false } }
        ]
      ];

      const startCell = maze[0][0];
      const endCell = maze[2][2];

      // 起点 (0,0) 应该能到达终点 (2,2)
      const canReachEnd = CollisionDetector.canReach(startCell, endCell);
      expect(canReachEnd).toBe(true);
    });

    it('应该验证不可达路径', () => {
      // 创建一个被墙壁分隔的迷宫
      const maze = [
        [
          { row: 0, col: 0, visited: true, walls: { top: true, right: false, bottom: true, left: true } },
          { row: 0, col: 1, visited: true, walls: { top: true, right: true, bottom: true, left: false } }
        ],
        [
          { row: 1, col: 1, visited: true, walls: { top: true, right: true, bottom: false, left: false } }
        ]
      ];

      const startCell = maze[0][0];
      const endCell = maze[1][1];

      // 起点 (0,0) 不应该能到达终点 (1,1)
      const canReachEnd = CollisionDetector.canReach(startCell, endCell);
      expect(canReachEnd).toBe(false);
    });
  });
});
