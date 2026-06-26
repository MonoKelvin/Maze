# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Maze 是一个基于 **Electron + Vue 3 + TypeScript** 的桌面迷宫游戏应用。使用递归回溯算法生成完美迷宫，支持多种模式、主题和流畅的动画效果。

### 核心技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5.x
- **类型系统**: TypeScript 5.x (严格模式)
- **状态管理**: Pinia 2.x
- **桌面框架**: Electron 30.x
- **UI组件**: PrimeVue 4.x + Lucide Vue
- **测试**: Vitest (单元测试) + Playwright (E2E测试)
- **代码规范**: ESLint + Prettier

---

## 常用开发命令

### 开发相关
```bash
# 启动开发服务器（Vue + Vite）
npm run dev

# Electron开发模式（主进程 + 渲染进程）
npm run electron:dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 启动开发时自动打开DevTools
npm run dev:debug
```

### 代码质量
```bash
# TypeScript类型检查
npm run type-check

# ESLint检查和自动修复
npm run lint

# Prettier格式化代码
npm run format

# 运行单元测试
npm run test:unit

# 运行E2E测试
npm run test:e2e

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 构建发布
```bash
# 打包Windows应用（NSIS安装程序）
npm run package

# 打包Windows MSI安装程序（使用electron-builder）
# package.json中的build配置支持NSIS和MSI
```

---

## 项目架构

### 整体架构模式

项目采用 **MVC + 工厂模式 + 观察者模式 + 策略模式**：

```
┌─────────────────────────────────────────────────────────┐
│                    App.vue (视图层)                      │
│                  控制面板 + 迷宫画布                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Pinia Stores (状态层)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ mazeStore    │  │playerStore   │  │statsStore    │  │
│  │              │  │              │  │              │  │
│  │迷宫生成      │  │角色移动      │  │统计信息      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Game Engine (引擎层)                        │
│                  MazeGameEngine类                         │
│  - 游戏循环控制                                           │
│  - 状态管理                                               │
│  - 事件系统                                               │
│  - 胜利检测                                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Utility Classes (工具层)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │MazeGenerator │  │CollisionDet. │  │MazeRenderer  │  │
│  │              │  │              │  │              │  │
│  │迷宫生成算法  │  │碰撞检测      │  │Canvas渲染    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 目录结构

```
Maze/
├── electron/                    # Electron主进程
│   ├── main.ts                  # 主进程入口
│   └── preload.ts               # 预加载脚本（安全IPC）
│
├── src/                         # Vue应用代码
│   ├── components/              # Vue组件
│   │   ├── MazeCanvas.vue       # 迷宫画布组件
│   │   ├── ControlPanel.vue     # 控制面板
│   │   ├── StatusDisplay.vue    # 状态显示
│   │   └── ...                  # 其他UI组件
│   │
│   ├── views/                   # 页面视图
│   │   └── GameView.vue         # 游戏主视图
│   │
│   ├── store/                   # Pinia状态管理
│   │   ├── mazeStore.ts         # 迷宫状态
│   │   ├── playerStore.ts       # 玩家状态
│   │   ├── statsStore.ts        # 统计状态
│   │   ├── settingsStore.ts     # 设置状态
│   │   └── storageStore.ts      # 存储管理
│   │
│   ├── engine/                  # 游戏引擎
│   │   └── mazeGameEngine.ts    # 核心游戏引擎
│   │
│   ├── utils/                   # 工具类
│   │   ├── mazeGenerator.ts     # 迷宫生成器
│   │   ├── collisionDetector.ts # 碰撞检测器
│   │   ├── mazeRenderer.ts      # 迷宫渲染器
│   │   ├── inputController.ts   # 输入控制
│   │   └── animationUtils.ts    # 动画工具
│   │
│   ├── types/                   # TypeScript类型定义
│   │   ├── maze.ts              # 迷宫相关类型
│   │   ├── player.ts            # 玩家相关类型
│   │   ├── theme.ts             # 主题类型
│   │   ├── stats.ts             # 统计类型
│   │   ├── storage.ts           # 存储类型
│   │   └── index.ts             # 统一导出
│   │
│   ├── constants/               # 常量配置
│   │   ├── config.ts            # 配置常量
│   │   ├── themes.ts            # 主题定义
│   │   └── index.ts             # 统一导出
│   │
│   ├── composables/             # 组合式函数
│   │   ├── useMaze.ts           # 迷宫相关逻辑
│   │   ├── usePlayer.ts         # 玩家相关逻辑
│   │   └── useAnimation.ts      # 动画逻辑
│   │
│   ├── assets/                  # 资源文件
│   │   ├── styles/
│   │   │   ├── global.css       # 全局样式
│   │   │   ├── theme.css        # 主题样式
│   │   │   └── components.css   # 组件样式
│   │   └── images/icons/
│   │
│   ├── App.vue                  # 根组件
│   └── main.ts                  # Vue入口文件
│
├── tests/                       # 测试文件
│   ├── unit/                    # 单元测试
│   │   ├── mazeGenerator.spec.ts
│   │   ├── collisionDetector.spec.ts
│   │   └── animationUtils.spec.ts
│   ├── e2e/                     # 端到端测试
│   │   └── gameFlow.spec.ts
│   └── setup.ts                 # 测试配置
│
├── package.json                 # 项目配置
├── vite.config.ts               # Vite配置
├── tsconfig.json                # TypeScript配置
├── vitest.config.ts             # Vitest配置
├── electron-builder.json        # Electron打包配置
├── .eslintrc.cjs                # ESLint配置
├── .prettierrc.json             # Prettier配置
└── CLAUDE.md                    # 本文件
```

---

## 核心模块详解

### 1. 游戏引擎

**位置**: `src/engine/mazeGameEngine.ts`

**职责**:
- 管理游戏循环（使用 `requestAnimationFrame`）
- 协调各个Store的状态
- 处理玩家移动和碰撞检测
- 统计数据更新
- 胜利检测和事件派发

**关键方法**:
```typescript
// 初始化游戏
initialize(maze: Maze, startCell: PlayerGridPosition, theme: Theme)

// 游戏循环
private gameLoop(currentTime: number)

// 移动玩家
private updatePlayerPosition()

// 检查胜利
private checkVictory(): boolean

// 事件系统
on(event: string, callback: Function)
off(event: string, callback: Function)
```

**重要提示**:
- 游戏引擎独立于Vue组件运行，负责核心游戏逻辑
- 通过Pinia Store与Vue层通信
- 使用 `requestAnimationFrame` 实现60fps流畅动画
- 事件系统用于解耦各模块

### 2. 状态管理

项目使用 **Pinia** 进行状态管理，每个Store职责单一：

#### mazeStore
- **职责**: 迷宫生成、参数管理
- **关键字段**:
  - `maze`: 当前迷宫数据
  - `mazeParams`: 迷宫参数（rows, cols, seed, mode等）
  - `entry/exit`: 入口出口配置
  - `previewMode`: 预览模式
- **关键方法**:
  - `generateMaze()`: 生成迷宫
  - `updateRows()/updateCols()`: 更新尺寸
  - `updateSeed()`: 更新种子
  - `resetMazeParams()`: 重置参数

#### playerStore
- **职责**: 玩家位置、移动动画
- **关键字段**:
  - `playerPos`: 像素坐标 {x, y}
  - `gridRow/gridCol`: 网格坐标
  - `isMoving`: 是否正在移动
  - `direction`: 移动方向
  - `stepCount`: 已走步数
- **关键方法**:
  - `movePlayer(direction)`: 移动玩家
  - `startAnimation()`: 启动动画
  - `stopAnimation()`: 停止动画
  - `resetPlayer()`: 重置玩家

#### statsStore
- **职责**: 统计数据（时间、距离、步数）
- **关键字段**:
  - `elapsedTime`: 已用时间
  - `totalDistance`: 总行走距离
  - `stepCount`: 步数
- **关键方法**:
  - `startTimer()`: 开始计时
  - `stopTimer()`: 停止计时
  - `resetStats()`: 重置统计

#### storageStore
- **职责**: 状态持久化
- **使用**: Electron Store (electron-store)
- **保存时机**: 每次 `movePlayer` 成功后

### 3. 迷宫生成器

**位置**: `src/utils/mazeGenerator.ts`

**工厂模式设计**:
```typescript
// 使用工厂模式获取生成器
const generator = MazeGeneratorFactory.getGenerator('recursive-backtracker')
const maze = generator.generate(params)
```

**支持算法**:
- `recursive-backtracker`: 递归回溯算法（默认，保证完美迷宫）
- 其他算法可扩展实现

**模式支持**:
- **正方形模式**: 标准网格结构
- **圆形模式**: 网格布局 + 裁剪圆形区域
- **自定义图形**: 预留接口（未来功能）

### 4. 碰撞检测

**位置**: `src/utils/collisionDetector.ts`

**核心逻辑**: 基于网格的精确碰撞检测

```typescript
// 检查是否可以移动
canMove(
  playerGrid: {row, col},
  cell: Cell,
  direction: MovementDirection
): boolean
```

**移动方向映射**:
- UP → 检查 `cell.walls.top`
- DOWN → 检查 `cell.walls.bottom`
- LEFT → 检查 `cell.walls.left`
- RIGHT → 检查 `cell.walls.right`

### 5. 迷宫渲染

**位置**: `src/utils/mazeRenderer.ts`

**Canvas渲染**:
- 使用 2D Canvas API
- 60fps流畅动画
- 支持主题系统（4种主题：暗色、蓝色、紫色、绿色）

**渲染流程**:
1. 清空画布
2. 渲染背景
3. 渲染墙壁（带发光效果）
4. 渲染入口/出口标识
5. 渲染角色

---

## 类型系统

### 核心类型定义

所有类型定义在 `src/types/` 目录：

```typescript
// src/types/maze.ts
export enum MazeMode { SQUARE, CIRCLE, CUSTOM }
export enum EntryPointType { BOUNDARY, CENTER, CUSTOM }
export enum ExitPointType { BOUNDARY, CENTER, CUSTOM }
export interface Cell { row, col, walls, visited, inValidArea }
export interface Maze { grid, entry, exit, params }

// src/types/player.ts
export enum MovementDirection { UP, DOWN, LEFT, RIGHT }
export interface Player { x, y, gridRow, gridCol, targetX, targetY, isMoving }

// src/types/theme.ts
export type ThemeName = 'dark' | 'blue' | 'purple' | 'green'
export interface Theme { background, wallColor, wallGlow, playerColor, ... }

// src/types/stats.ts
export interface Stats { elapsed, totalDistance, stepCount }
```

### 类型安全原则

- **严格模式**: TypeScript开启严格模式（`noEmit: true`, `strict: true`）
- **集中定义**: 所有类型在 `src/types/` 统一定义
- **统一导出**: `src/types/index.ts` 统一导出所有类型
- **避免any**: 尽量使用具体类型，避免使用 `any`

---

## 主题系统

### 主题配置

位置: `src/constants/themes.ts`

**4种主题**:
1. **dark**: 暗色主题（默认）- 紫色/蓝色发光
2. **blue**: 蓝色主题 - 蓝色发光
3. **purple**: 紫色主题 - 紫色发光
4. **green**: 绿色主题 - 绿色发光

**主题特性**:
- 统一的CSS变量命名（`--bg-color`, `--wall-color`等）
- 主题切换时无需重新加载，动态切换CSS变量
- 支持自定义扩展新主题

### 使用方式

```vue
<script setup lang="ts">
import { useThemeStore } from '@/store/themeStore'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)
</script>

<template>
  <div :style="{ color: currentTheme.primaryText }">
    当前主题: {{ currentTheme.name }}
  </div>
</template>
```

---

## 开发规范

### 代码组织

1. **单文件职责单一**: 每个文件只做一件事
2. **函数命名**: 使用动词开头（`generateMaze`, `updateRows`, `startTimer`）
3. **常量定义**: 所有常量放在 `constants/` 目录
4. **类型定义**: 所有类型放在 `types/` 目录
5. **组合式函数**: 复用逻辑放在 `composables/`

### Git提交规范

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建工具、配置更新
```

### TypeScript最佳实践

- ✅ 使用具体类型而非 `any`
- ✅ 优先使用 `enum` 而非字符串字面量
- ✅ 使用 `interface` 定义对象结构
- ✅ 使用 `type` 定义联合类型和元组
- ✅ 使用 `readonly` 保护不可变数据
- ✅ 使用 `strict: true` 模式

### Vue 3最佳实践

- ✅ 使用 Composition API（`<script setup>`）
- ✅ 使用 `ref` 和 `computed` 进行状态管理
- ✅ 使用 Pinia Store 管理全局状态
- ✅ 使用 `<script setup lang="ts">` 添加类型
- ✅ 使用 `defineProps` 和 `defineEmits` 定义组件接口

---

## 测试策略

### 单元测试

**测试框架**: Vitest
**测试文件**: `tests/unit/*.spec.ts`

**测试覆盖范围**:
- 迷宫生成器（各种参数、种子）
- 碰撞检测器（所有方向）
- 动画工具（时间计算、插值）

**运行测试**:
```bash
npm run test:unit
```

### E2E测试

**测试框架**: Playwright
**测试文件**: `tests/e2e/*.spec.ts`

**测试场景**:
- 游戏流程（生成迷宫、移动、胜利）
- 状态保存和恢复
- UI交互

**运行测试**:
```bash
npm run test:e2e
```

---

## Electron集成

### 主进程

**位置**: `electron/main.ts`

**职责**:
- 创建无边框窗口
- 配置 `nodeIntegration: false`, `contextIsolation: true`
- 处理系统托盘（可选）
- 文件系统操作（可选）

### 预加载脚本

**位置**: `electron/preload.ts`

**职责**:
- 使用 `contextBridge` 安全暴露API
- 防止渲染进程直接访问Node.js API
- 提供 `electronAPI` 对象

**暴露的API**:
```typescript
electronAPI.saveSettings(data)
electronAPI.loadSettings()
electronAPI.closeWindow()
electronAPI.minimizeWindow()
electronAPI.maximizeWindow()
electronAPI.showNotification(title, body)
```

### 渲染进程

- 直接与 Electron API 交互（通过 `window.electronAPI`）
- Vue应用运行在渲染进程中
- 使用 Vite进行开发构建

---

## 性能优化

### 关键优化点

1. **游戏循环优化**
   - 使用 `requestAnimationFrame` 实现60fps
   - 限制最大帧间隔（100ms）防止切换标签页后的跳跃
   - 使用累积时间增量更新游戏状态

2. **Canvas渲染优化**
   - 避免频繁重绘，只在状态变化时渲染
   - 使用 `requestAnimationFrame` 批量渲染
   - 限制画布分辨率，避免过大尺寸

3. **状态管理优化**
   - 使用 `computed` 缓存计算结果
   - 避免不必要的状态更新
   - 合理使用 `watchEffect` 和 `watch`

4. **迷宫生成优化**
   - 递归回溯算法时间复杂度 O(rows × cols)
   - 使用栈代替递归避免栈溢出
   - 快速预览模式不生成迷宫数据

---

## 常见问题和解决方案

### 问题1: 玩家移动不流畅

**原因**: 动画帧率不稳定或碰撞检测过于频繁

**解决方案**:
- 确保 `requestAnimationFrame` 正确使用
- 在动画循环中使用累积时间增量
- 优化碰撞检测逻辑

### 问题2: 迷宫生成速度慢

**原因**: 迷宫尺寸过大或算法效率低

**解决方案**:
- 减小迷宫尺寸
- 优化递归回溯算法（使用栈代替递归）
- 预览模式不生成迷宫数据

### 问题3: 类型错误

**原因**: TypeScript类型定义不完整或类型推断失败

**解决方案**:
- 检查 `src/types/` 中的类型定义
- 添加显式类型注解
- 使用 `as` 进行类型断言（谨慎使用）

### 问题4: 状态保存失败

**原因**: Electron Store配置错误或路径问题

**解决方案**:
- 检查 `src/store/storageStore.ts` 配置
- 确保在主进程和渲染进程之间正确通信
- 使用 `contextBridge` 安全暴露API

---

## 扩展开发

### 添加新的迷宫算法

1. 在 `src/utils/mazeGenerator.ts` 中实现算法类
2. 在 `MazeGeneratorFactory` 中注册新算法
3. 在 `src/constants/index.ts` 中更新算法列表
4. 编写单元测试

### 添加新的主题

1. 在 `src/constants/themes.ts` 中添加主题配置
2. 在 `src/store/settingsStore.ts` 中添加主题选项
3. 更新UI组件支持新主题
4. 更新文档

### 添加新的UI组件

1. 在 `src/components/` 中创建组件文件
2. 定义 `Props` 和 `Emits`
3. 使用 `<script setup lang="ts">` 添加类型
4. 在 `App.vue` 或其他组件中使用
5. 编写单元测试

---

## 相关文档

- **详细设计文档**: `doc/详细设计文档.md` - 完整的技术设计规范
- **初始需求文档**: `doc/初始需求.md` - 功能需求说明
- **README.md**: `README.md` - 项目介绍和快速开始指南

---

## 版本信息

- **当前版本**: 1.1.0
- **最后更新**: 2026-06-26
- **主要更新**: 支持圆形迷宫、出入口自定义、快速预览等

---

## 注意事项

1. **严格遵循类型定义**: 所有代码必须符合 `src/types/` 中的类型定义
2. **不要硬编码**: 避免魔法数字，使用常量或配置
3. **保持模块化**: 每个函数和类职责单一
4. **编写测试**: 修改核心逻辑时必须编写或更新测试
5. **代码复用**: 相似代码提取为组合式函数或工具类
6. **事件系统**: 使用游戏引擎的事件系统进行模块间通信，避免直接依赖
7. **主题一致性**: 所有UI组件必须支持主题切换
8. **性能敏感**: 游戏循环、渲染、迷宫生成等核心逻辑必须优化
