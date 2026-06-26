/**
 * 输入控制器 - 负责处理键盘输入
 * 使用面向对象设计
 */

import { MovementDirection } from '@/types/player';

/**
 * 方向映射配置
 */
interface DirectionMapping {
  [key: string]: MovementDirection;
}

/**
 * 输入控制器
 */
export class InputController {
  /** 键盘映射表 */
  private keyMapping: DirectionMapping = {
    ArrowUp: MovementDirection.UP,
    ArrowDown: MovementDirection.DOWN,
    ArrowLeft: MovementDirection.LEFT,
    ArrowRight: MovementDirection.RIGHT,
    w: MovementDirection.UP,
    W: MovementDirection.UP,
    s: MovementDirection.DOWN,
    S: MovementDirection.DOWN,
    a: MovementDirection.LEFT,
    A: MovementDirection.LEFT,
    d: MovementDirection.RIGHT,
    D: MovementDirection.RIGHT,
    ArrowUpLeft: MovementDirection.UP,
    ArrowUpRight: MovementDirection.UP,
    ArrowDownLeft: MovementDirection.DOWN,
    ArrowDownRight: MovementDirection.DOWN,
    q: MovementDirection.LEFT,
    Q: MovementDirection.LEFT,
    e: MovementDirection.RIGHT,
    E: MovementDirection.RIGHT
  };

  /** 按键状态 */
  private keyStates: Map<string, boolean> = new Map();

  /** 移动事件监听器 */
  private moveListeners: Set<(direction: MovementDirection) => void> = new Set();

  /** 启动事件监听 */
  constructor() {
    this.attachEventListeners();
  }

  /**
   * 附加事件监听器
   */
  private attachEventListeners(): void {
    window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    window.addEventListener('keyup', (event) => this.handleKeyUp(event));
  }

  /**
   * 处理按键按下
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const direction = this.keyMapping[event.key];
    if (direction) {
      event.preventDefault();
      this.keyStates.set(event.key, true);
      this.emitMove(direction);
    }
  }

  /**
   * 处理按键释放
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keyStates.set(event.key, false);
  }

  /**
   * 检查按键是否按下
   */
  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key) || false;
  }

  /**
   * 获取所有按下的方向键
   */
  getActiveDirections(): MovementDirection[] {
    const directions: MovementDirection[] = [];
    for (const [key, state] of this.keyStates) {
      if (state) {
        const direction = this.keyMapping[key];
        if (direction && !directions.includes(direction)) {
          directions.push(direction);
        }
      }
    }
    return directions;
  }

  /**
   * 派发移动事件
   */
  private emitMove(direction: MovementDirection): void {
    for (const listener of this.moveListeners) {
      listener(direction);
    }
  }

  /**
   * 注册移动事件监听器
   */
  onMove(callback: (direction: MovementDirection) => void): void {
    this.moveListeners.add(callback);
  }

  /**
   * 移除移动事件监听器
   */
  offMove(callback: (direction: MovementDirection) => void): void {
    this.moveListeners.delete(callback);
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.moveListeners.clear();
    window.removeEventListener('keydown', (event) => this.handleKeyDown(event));
    window.removeEventListener('keyup', (event) => this.handleKeyUp(event));
  }
}