/**
 * 迷宫游戏引擎 - 封装完整的游戏逻辑
 * 包括游戏循环、状态管理、胜利检测等
 */

import type { Maze, CellSize, PlayerGridPosition } from '@/types/maze';
import type { Theme } from '@/types/theme';
import { MovementDirection } from '@/types/player';
import type { Stats } from '@/types/stats';
import { CollisionDetector, PlayerGridPosition as PGP } from '@/utils/collisionDetector';
import { usePlayerStore } from '@/store/playerStore';
import { useStatsStore } from '@/store/statsStore';
import { useMazeStore } from '@/store/mazeStore';

/**
 * 游戏引擎配置
 */
interface GameEngineConfig {
  /** 移动速度（逻辑单位/秒） */
  speed?: number;
  /** 角色半径比例 */
  playerRadiusRatio?: number;
  /** 单元格像素大小 */
  cellSize?: number;
}

/**
 * 游戏引擎事件
 */
export type GameEngineEvent = {
  type: 'victory' | 'move' | 'stop' | 'error';
  data?: any;
};

/**
 * 迷宫游戏引擎
 */
export class MazeGameEngine {
  /** 游戏状态 */
  private gameState = {
    isRunning: false,
    isGameOver: false,
    elapsedTime: 0,
    totalDistance: 0,
    stepCount: 0
  };

  /** 游戏循环帧ID */
  private animationFrameId: number | null = null;

  /** 上一帧时间 */
  private lastFrameTime = 0;

  /** 累积帧时间 */
  private accumulatedDelta = 0;

  /** 游戏配置 */
  private config: Required<GameEngineConfig>;

  /** 事件监听器 */
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(config: GameEngineConfig = {}) {
    this.config = {
      speed: 3,
      playerRadiusRatio: 0.25,
      cellSize: 40,
      ...config
    };
  }

  /**
   * 初始化游戏
   */
  initialize(
    maze: Maze,
    startCell: PlayerGridPosition,
    theme: Theme
  ): void {
    this.gameState.isRunning = true;
    this.gameState.isGameOver = false;
    this.gameState.elapsedTime = 0;
    this.gameState.totalDistance = 0;
    this.gameState.stepCount = 0;

    const playerStore = usePlayerStore();
    const statsStore = useStatsStore();

    // 设置玩家位置
    playerStore.setPosition(startCell.row, startCell.col);

    // 初始化统计
    statsStore.resetStats();
    statsStore.startTimer();

    this.lastFrameTime = performance.now();
    this.accumulatedDelta = 0;

    // 开始游戏循环
    this.startGameLoop();
  }

  /**
   * 开始游戏循环
   */
  private startGameLoop(): void {
    if (this.animationFrameId) {
      return;
    }

    this.gameState.isRunning = true;
    this.gameLoop();
  }

  /**
   * 游戏循环
   */
  private gameLoop(currentTime: number = performance.now()): void {
    if (!this.gameState.isRunning) {
      return;
    }

    if (currentTime === 0) {
      currentTime = performance.now();
    }

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 限制最大帧间隔，防止切换标签页后的大跳跃
    if (deltaTime > 100) {
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }

    this.accumulatedDelta += deltaTime;
    this.gameState.elapsedTime = Date.now() - new Date(); // 更新计时

    // 每次移动
    this.gameStep();

    // 继续循环
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * 游戏步骤处理
   */
  private gameStep(): void {
    const playerStore = usePlayerStore();
    const mazeStore = useMazeStore();
    const statsStore = useStatsStore();

    if (!this.gameState.isRunning || this.gameState.isGameOver) {
      return;
    }

    // 检查是否到达出口
    if (this.checkVictory()) {
      return;
    }

    // 移动玩家
    if (this.gameState.isMoving) {
      this.updatePlayerPosition();
    }

    // 计算并更新统计
    this.updateStats();

    // 检查是否到达目标
    if (this.checkVictory()) {
      return;
    }
  }

  /**
   * 移动玩家位置
   */
  private updatePlayerPosition(): void {
    const playerStore = usePlayerStore();
    const mazeStore = useMazeStore();
    const collisionDetector = new CollisionDetector();

    if (!mazeStore.maze || !mazeStore.maze.grid) {
      return;
    }

    const playerGrid = {
      row: playerStore.gridRow.value,
      col: playerStore.gridCol.value
    };

    const currentCell = mazeStore.maze.grid[playerGrid.row][playerGrid.col];

    // 获取移动后的目标位置
    const targetGrid = collisionDetector.getTargetGrid(playerGrid, playerStore.direction.value!);

    // 检查是否可以移动
    if (!collisionDetector.isInsideBounds(mazeStore.maze.grid, targetGrid.row, targetGrid.col)) {
      playerStore.stopAnimation();
      return;
    }

    const targetCell = mazeStore.maze.grid[targetGrid.row][targetGrid.col];

    if (!collisionDetector.canMove(playerGrid, targetCell, playerStore.direction.value!)) {
      playerStore.stopAnimation();
      return;
    }

    // 计算像素距离
    const pixelSize = this.config.cellSize;
    const distance = Math.sqrt(
      Math.pow(targetGrid.col * pixelSize - playerGrid.col * pixelSize, 2) +
      Math.pow(targetGrid.row * pixelSize - playerGrid.row * pixelSize, 2)
    );

    // 检查是否接近目标
    if (distance < 2) {
      // 到达目标单元格
      playerStore.setPosition(targetGrid.row, targetGrid.col);
      playerStore.stopAnimation();

      // 更新统计
      this.gameState.stepCount++;
      this.gameState.totalDistance += distance;

      return;
    }

    // 移动到目标位置
    const speedPerPixel = (this.config.speed * pixelSize) / 1000;
    const dx = (targetGrid.col * pixelSize) - playerStore.playerPos.value.x;
    const dy = (targetGrid.row * pixelSize) - playerStore.playerPos.value.y;
    const moveDistance = Math.sqrt(dx * dx + dy * dy);

    if (moveDistance <= speedPerPixel) {
      // 完成这一步
      playerStore.setPosition(targetGrid.row, targetGrid.col);
      playerStore.stopAnimation();
      this.gameState.stepCount++;
      this.gameState.totalDistance += distance;
    } else {
      // 移动部分距离
      const moveX = (dx / moveDistance) * speedPerPixel;
      const moveY = (dy / moveDistance) * speedPerPixel;
      playerStore.playerPos.value.x += moveX;
      playerStore.playerPos.value.y += moveY;
    }
  }

  /**
   * 更新统计
   */
  private updateStats(): void {
    const playerStore = usePlayerStore();
    const statsStore = useStatsStore();

    // 更新步数
    if (playerStore.stepCount.value !== this.gameState.stepCount) {
      statsStore.stepCount = this.gameState.stepCount;
    }

    // 更新总距离
    if (Math.abs(playerStore.totalDistance.value - this.gameState.totalDistance) > 1) {
      statsStore.totalDistance = this.gameState.totalDistance;
    }
  }

  /**
   * 检查是否胜利
   */
  private checkVictory(): boolean {
    const playerStore = usePlayerStore();
    const mazeStore = useMazeStore();

    if (!mazeStore.maze) {
      return false;
    }

    const playerGrid: PlayerGridPosition = {
      row: playerStore.gridRow.value,
      col: playerStore.gridCol.value
    };

    if (playerGrid.row === mazeStore.maze.exit.row && playerGrid.col === mazeStore.maze.exit.col) {
      this.handleVictory();
      return true;
    }

    return false;
  }

  /**
   * 处理胜利
   */
  private handleVictory(): void {
    this.gameState.isRunning = false;
    this.gameState.isGameOver = true;

    const playerStore = usePlayerStore();
    const statsStore = useStatsStore();

    // 停止计时
    statsStore.stopTimer();

    // 派发胜利事件
    this.emit('victory', {
      elapsed: statsStore.elapsedTime.value,
      distance: statsStore.totalDistance.value,
      steps: statsStore.stepCount.value
    });
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    this.gameState.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 继续游戏
   */
  resume(): void {
    if (!this.gameState.isRunning) {
      this.gameState.isRunning = true;
      this.lastFrameTime = performance.now();
      this.startGameLoop();
    }
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.pause();

    const playerStore = usePlayerStore();
    const statsStore = useStatsStore();

    playerStore.resetPlayer();
    statsStore.resetStats();
  }

  /**
   * 获取游戏状态
   */
  getState(): {
    isRunning: boolean;
    isGameOver: boolean;
    elapsedTime: number;
    totalDistance: number;
    stepCount: number;
  } {
    return {
      isRunning: this.gameState.isRunning,
      isGameOver: this.gameState.isGameOver,
      elapsedTime: this.gameState.elapsedTime,
      totalDistance: this.gameState.totalDistance,
      stepCount: this.gameState.stepCount
    };
  }

  /**
   * 添加事件监听器
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 派发事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.pause();
    this.eventListeners.clear();
  }
}