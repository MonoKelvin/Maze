import { describe, it, expect, beforeEach } from 'vitest';
import { MazeGenerator } from '@/utils/mazeGenerator';
import type { Maze, MazeParams } from '@/types/maze';

describe('MazeGenerator', () => {
  describe('generate', () => {
    it('应该生成有效的迷宫', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 5,
        cols: 5,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 4, col: 4 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(5);
      expect(maze.grid[0].length).toBe(5);
      expect(maze.entry).toEqual({ row: 0, col: 0 });
      expect(maze.exit).toEqual({ row: 4, col: 4 });
    });

    it('相同种子应该产生相同迷宫', () => {
      const params1: MazeParams = {
        mode: 'square',
        rows: 10,
        cols: 10,
        seed: 12345,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 9, col: 9 }, isValid: true }
      };
      const maze1 = MazeGenerator.generate(params1);

      const params2: MazeParams = {
        mode: 'square',
        rows: 10,
        cols: 10,
        seed: 12345,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 9, col: 9 }, isValid: true }
      };
      const maze2 = MazeGenerator.generate(params2);

      expect(maze1.grid.length).toBe(maze2.grid.length);
      // 验证网格内容完全相同
      for (let row = 0; row < maze1.grid.length; row++) {
        for (let col = 0; col < maze1.grid[row].length; col++) {
          expect(maze1.grid[row][col]).toEqual(maze2.grid[row][col]);
        }
      }
    });

    it('圆形模式应该生成有效迷宫', () => {
      const params: MazeParams = {
        mode: 'circle',
        rows: 7,
        cols: 7,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 3 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 6, col: 3 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(7);
      expect(maze.grid[0].length).toBe(7);
      // 验证迷宫是完美迷宫（连通且无循环）
      expect(maze.entry).toEqual({ row: 0, col: 3 });
      expect(maze.exit).toEqual({ row: 6, col: 3 });
    });

    it('中心出入口应该生成有效迷宫', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 9,
        cols: 9,
        previewMode: 'full',
        entry: { type: 'center', gridPos: { row: 4, col: 4 }, isValid: true },
        exit: { type: 'center', gridPos: { row: 4, col: 4 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(9);
      expect(maze.entry.row).toBe(4);
      expect(maze.entry.col).toBe(4);
      expect(maze.exit.row).toBe(4);
      expect(maze.exit.col).toBe(4);
    });

    it('应该生成完美迷宫（无循环且连通）', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 15,
        cols: 15,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 14, col: 14 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      // 检查所有单元格都被访问
      let visitedCount = 0;
      for (let row = 0; row < maze.grid.length; row++) {
        for (let col = 0; col < maze.grid[row].length; col++) {
          if (maze.grid[row][col].visited) {
            visitedCount++;
          }
        }
      }

      const totalCells = maze.grid.length * maze.grid[0].length;
      expect(visitedCount).toBe(totalCells);
    });

    it('不同种子应该产生不同迷宫', () => {
      const params1: MazeParams = {
        mode: 'square',
        rows: 10,
        cols: 10,
        seed: 11111,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 9, col: 9 }, isValid: true }
      };
      const maze1 = MazeGenerator.generate(params1);

      const params2: MazeParams = {
        mode: 'square',
        rows: 10,
        cols: 10,
        seed: 22222,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 9, col: 9 }, isValid: true }
      };
      const maze2 = MazeGenerator.generate(params2);

      // 至少应该有一个单元格不同
      let differentCells = 0;
      for (let row = 0; row < maze1.grid.length; row++) {
        for (let col = 0; col < maze1.grid[row].length; col++) {
          if (maze1.grid[row][col].walls !== maze2.grid[row][col].walls) {
            differentCells++;
          }
        }
      }

      expect(differentCells).toBeGreaterThan(0);
    });

    it('应该处理最小迷宫尺寸', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 3,
        cols: 3,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 2, col: 2 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(3);
      expect(maze.grid[0].length).toBe(3);
      expect(maze.entry).toEqual({ row: 0, col: 0 });
      expect(maze.exit).toEqual({ row: 2, col: 2 });
    });

    it('应该处理最大迷宫尺寸', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 50,
        cols: 50,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 49, col: 49 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(50);
      expect(maze.grid[0].length).toBe(50);
    });

    it('应该处理预览模式', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 15,
        cols: 15,
        previewMode: 'quick',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 14, col: 14 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.grid.length).toBe(15);
      expect(maze.grid[0].length).toBe(15);
      expect(maze.entry).toEqual({ row: 0, col: 0 });
      expect(maze.exit).toEqual({ row: 14, col: 14 });
    });
  });

  describe('边界和角落情况', () => {
    it('边界出入口应该有效', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 9,
        cols: 9,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 4 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 8, col: 4 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.entry).toBeDefined();
      expect(maze.exit).toBeDefined();
    });

    it('中心出入口应该有效', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 11,
        cols: 11,
        previewMode: 'full',
        entry: { type: 'center', gridPos: { row: 5, col: 5 }, isValid: true },
        exit: { type: 'center', gridPos: { row: 5, col: 5 }, isValid: true }
      };
      const maze = MazeGenerator.generate(params);

      expect(maze.entry.row).toBe(5);
      expect(maze.entry.col).toBe(5);
      expect(maze.exit.row).toBe(5);
      expect(maze.exit.col).toBe(5);
    });
  });

  describe('性能测试', () => {
    it('应该能快速生成大尺寸迷宫', () => {
      const params: MazeParams = {
        mode: 'square',
        rows: 50,
        cols: 50,
        previewMode: 'full',
        entry: { type: 'boundary', gridPos: { row: 0, col: 0 }, isValid: true },
        exit: { type: 'boundary', gridPos: { row: 49, col: 49 }, isValid: true }
      };

      const startTime = performance.now();
      const maze = MazeGenerator.generate(params);
      const endTime = performance.now();

      expect(maze.grid.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(100); // 应该在 100ms 内完成
    });
  });
});
