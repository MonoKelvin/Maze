/**
 * 玩家类型
 */
export interface Player {
  /** 玩家当前像素坐标 */
  x: number;
  y: number;
  /** 玩家当前所在网格坐标 */
  gridRow: number;
  gridCol: number;
  /** 目标像素坐标 */
  targetX: number;
  targetY: number;
  /** 是否正在移动 */
  isMoving: boolean;
  /** 移动方向 */
  direction: MovementDirection | null;
  /** 移动动画帧 ID */
  animationFrameId: number | null;
}

/**
 * 移动方向
 */
export enum MovementDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

/**
 * 玩家配置
 */
export interface PlayerConfig {
  /** 角色大小（占单元格的比例） */
  sizeRatio: number;
  /** 角色颜色 */
  color: string;
  /** 角色发光颜色 */
  glowColor: string;
  /** 移动速度（逻辑单位/秒） */
  speed: number;
}
