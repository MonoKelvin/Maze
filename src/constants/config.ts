/**
 * 默认配置常量
 */

// 迷宫参数默认值
export const MAZE_DEFAULTS = {
  rows: 15,
  cols: 15,
  speed: 3,
  previewMode: 'quick' as 'quick' | 'full'
} as const;

// 窗口配置
export const WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 900,
  minHeight: 600
} as const;

// 迷宫单元格尺寸配置
export const CELL_SIZE_CONFIG = {
  defaultWidth: 40,
  defaultHeight: 40
} as const;

// 角色配置
export const PLAYER_CONFIG = {
  sizeRatio: 0.4,
  defaultSpeed: 3
} as const;
