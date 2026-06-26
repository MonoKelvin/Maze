/**
 * 墙壁方向
 */
export enum WallDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

/**
 * 单元格类型
 */
export interface Cell {
  row: number;
  col: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  inValidArea: boolean;
  entry?: boolean;
  exit?: boolean;
}

/**
 * 迷宫模式
 */
export enum MazeMode {
  /** 正方形模式 */
  SQUARE = 'square',
  /** 圆形模式 */
  CIRCLE = 'circle',
  /** 自定义图形模式（预留） */
  CUSTOM = 'custom'
}

/**
 * 入口位置类型
 */
export enum EntryPointType {
  /** 边界随机位置 */
  BOUNDARY = 'boundary',
  /** 中心位置 */
  CENTER = 'center',
  /** 自定义点击位置 */
  CUSTOM = 'custom'
}

/**
 * 出口位置类型
 */
export enum ExitPointType {
  /** 边界随机位置（不与入口重叠） */
  BOUNDARY = 'boundary',
  /** 中心位置 */
  CENTER = 'center',
  /** 自定义点击位置 */
  CUSTOM = 'custom'
}

/**
 * 出入口配置
 */
export interface EntryPoint {
  /** 位置类型 */
  type: EntryPointType;
  /** 网格坐标（type 为 CUSTOM 时无效） */
  gridPos?: { row: number; col: number };
  /** 像素坐标（type 为 CUSTOM 时使用） */
  pixelPos?: { x: number; y: number };
  /** 用户点击位置（用于 CUSTOM 模式） */
  clickPos?: { x: number; y: number };
  /** 是否有效（由验证函数计算） */
  isValid: boolean;
}

/**
 * 迷宫参数
 */
export interface MazeParams {
  /** 迷宫模式 */
  mode: MazeMode;
  /** 行数（正方形和圆形模式） */
  rows: number;
  /** 列数（正方形和圆形模式） */
  cols: number;
  /** 随机种子 */
  seed?: number;
  /** 入口配置 */
  entry: EntryPoint;
  /** 出口配置 */
  exit: EntryPoint;
  /** 预览模式：快速预览（不生成数据）还是完整预览 */
  previewMode: 'quick' | 'full';
}

/**
 * 迷宫类型
 */
export interface Maze {
  /** 迷宫网格 */
  grid: Cell[][];
  /** 入口网格坐标 */
  entry: { row: number; col: number };
  /** 出口网格坐标 */
  exit: { row: number; col: number };
  /** 迷宫参数 */
  params: MazeParams;
}

/**
 * 单元格尺寸
 */
export interface CellSize {
  /** 单元格宽度（像素） */
  width: number;
  /** 单元格高度（像素） */
  height: number;
  /** 偏移量（画布居中） */
  offsetX: number;
  offsetY: number;
}

/**
 * 圆形迷宫配置
 */
export interface CircleMazeConfig {
  /** 圆心坐标（相对于迷宫左上角） */
  center: { x: number; y: number };
  /** 半径（单元格数量） */
  radius: number;
}

/**
 * 预览数据
 */
export interface PreviewData {
  /** 是否有迷宫数据 */
  hasGrid: boolean;
  /** 迷宫网格（仅完整预览） */
  grid?: Cell[][];
  /** 入口位置 */
  entry: { row: number; col: number };
  /** 出口位置 */
  exit: { row: number; col: number };
  /** 角色位置 */
  player: { x: number; y: number };
}
