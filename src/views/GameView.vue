<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useMazeStore } from '@/store/mazeStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStatsStore } from '@/store/statsStore';
import { MazeRenderer } from '@/utils/mazeRenderer';
import { CollisionDetector } from '@/utils/collisionDetector';
import { solveMaze } from '@/utils/mazeSolver';
import { Direction } from '@/types/maze';
import type { SimpleMaze } from '@/types/maze';
import { generateSync, generateAsync } from '@/utils/mazeGenerator';
import type { GenToken } from '@/utils/mazeGenerator';

import WindowTitleBar from '@/components/WindowTitleBar.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import VictoryModal from '@/components/VictoryModal.vue';
import PlayerSelector from '@/components/PlayerSelector.vue';
import NumberInput from '@/components/NumberInput.vue';

import {
  RotateCcw, RefreshCw, Square, Eye, EyeOff,
  Hash, Timer, Footprints, HelpCircle,
  PanelRightClose, Palette, User
} from 'lucide-vue-next';

const mazeStore = useMazeStore();
const playerStore = usePlayerStore();
const settings = useSettingsStore();
const stats = useStatsStore();

const canvas = ref<HTMLCanvasElement>();
const maze = ref<SimpleMaze | null>(null);
const showVictory = ref(false);
const loading = ref(false);
const loadPct = ref(0);
const genToken = ref<GenToken>({ aborted: false });
const showPath = ref(false);
const solutionPath = ref<{ row: number; col: number }[]>([]);

// 玩家网格坐标（动画中这些值是「目标」，只有动画完成才更新）
const playerRow = ref(0);
const playerCol = ref(0);
// 玩家像素坐标（实时插值，用于平滑动画）
const playerPx = ref(0);
const playerPy = ref(0);

// 缩放 & 平移
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const dragging = ref(false);
const dragStart = { x: 0, y: 0 };
const panStart = { x: 0, y: 0 };

// 移动状态机
const heldDir = ref<Direction | null>(null);
const moveBusy = ref(false);
let animFrameId = 0; // 模块级，可被 cancelAnimationFrame 正确取消

const theme = computed(() => settings.themes[settings.theme]);
const panelOpen = ref(true);
const helpOpen = ref(false);

// 面板开关 → 动画结束后重设画布尺寸
watch(panelOpen, async () => {
  await nextTick();
  setTimeout(() => fitCanvas(), 420); // 略大于 CSS transition 400ms
});

// 快捷键菜单项
const shortcuts = [
  { key: '↑ ↓ ← →', desc: '移动角色' },
  { key: 'W A S D', desc: '移动角色' },
  { key: '滚轮', desc: '缩放迷宫' },
  { key: '拖拽', desc: '平移迷宫' },
  { key: 'R', desc: '重置位置' },
  { key: 'G', desc: '重新生成' },
  { key: 'P', desc: '显示/隐藏路径' },
];

// ---- 绘制 ----
function draw() {
  const c = canvas.value, m = maze.value;
  if (!c || !m) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const t = theme.value;
  if (!t) return;

  ctx.fillStyle = t.background;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.save();
  ctx.translate(c.width / 2 + panX.value, c.height / 2 + panY.value);
  ctx.scale(zoom.value, zoom.value);
  ctx.translate(-c.width / 2, -c.height / 2);

  const sz = MazeRenderer.fitSize(m.rows, m.cols, c.width, c.height);
  MazeRenderer.renderWalls(ctx, m.walls, m.rows, m.cols, sz.cs, sz.ox, sz.oy, t);
  if (showPath.value && solutionPath.value.length) {
    MazeRenderer.renderPath(ctx, solutionPath.value, sz.cs, sz.ox, sz.oy, t.accent);
  }
  MazeRenderer.renderPoints(ctx, sz.cs, sz.ox, sz.oy, m.entry, m.exit,
    { row: playerRow.value, col: playerCol.value }, t, playerPx.value, playerPy.value,
    { shape: playerStore.shape, icon: playerStore.icon, image: playerStore.image, size: playerStore.size });
  ctx.restore();
}

// 主题 / 角色外观变化 → 立即重绘
watch(() => [settings.theme, playerStore.shape, playerStore.icon, playerStore.image, playerStore.size], draw);

function getCellSize() {
  const m = maze.value; if (!m) return 40;
  const c = canvas.value; if (!c) return 40;
  return MazeRenderer.fitSize(m.rows, m.cols, c.width, c.height).cs;
}

function fitCanvas() {
  const c = canvas.value;
  if (!c) return;
  const p = c.parentElement;
  if (!p) return;
  c.width = p.clientWidth;
  c.height = p.clientHeight;
  draw();
}

// ---- 缩放 ----
function onWheel(e: WheelEvent) {
  if (showVictory.value) return;
  if (!maze.value || loading.value) return;
  e.preventDefault();
  const c = canvas.value!;
  const rect = c.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const cx = c.width / 2;
  const cy = c.height / 2;
  const old = zoom.value;
  // 等比缩放：每档 ±10%，无论当前 zoom 级别变化比例恒定
  const factor = Math.pow(1.1, e.deltaY > 0 ? -1 : 1);
  const nz = Math.max(0.1, Math.min(10, +(old * factor).toFixed(3)));
  const ratio = nz / old;
  panX.value = (mx - cx) * (1 - ratio) + ratio * panX.value;
  panY.value = (my - cy) * (1 - ratio) + ratio * panY.value;
  zoom.value = nz;
  draw();
}

// ---- 拖拽 ----
function onMD(e: MouseEvent) {
  if (showVictory.value) return;
  if (!maze.value || loading.value) return;
  dragging.value = true;
  dragStart.x = e.clientX; dragStart.y = e.clientY;
  panStart.x = panX.value; panStart.y = panY.value;
}
function onMM(e: MouseEvent) {
  if (!dragging.value) return;
  panX.value = panStart.x + (e.clientX - dragStart.x);
  panY.value = panStart.y + (e.clientY - dragStart.y);
  draw();
}
function onMU() { dragging.value = false; }

// ---- 移动逻辑（核心） ----
// 速度映射：1→180ms, 10→30ms
const animDuration = computed(() => Math.round(200 - settings.speed * 19));

/**
 * 立即中止当前动画，将玩家 snap 到「当前格」的像素中心。
 * playerRow/playerCol 是动画的「目标格」，在动画完成前已经写入，
 * 所以 snap 时直接用它们计算即可。
 */
function snapToGrid() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = 0; }
  const cs = getCellSize();
  playerPx.value = playerCol.value * cs + cs / 2;
  playerPy.value = playerRow.value * cs + cs / 2;
  moveBusy.value = false;
}

/**
 * movePlayer — 核心移动函数
 *
 * 流程：
 *  1. 碰撞检测 → 不可移动则直接返回
 *  2. 记录「目标格」到 playerRow/playerCol
 *  3. ease-out 插值动画
 *  4. 动画完成 → 写入 playerStore → 检测胜利 → 检查 heldDir 连走
 *
 * 关键：playerRow/playerCol 在动画开始时就写入目标格，
 * 这样 snapToGrid() 随时调用都能得到正确位置。
 */
function movePlayer(dir: Direction) {
  const m = maze.value;
  if (!m) return;
  const r = playerRow.value, c = playerCol.value;
  if (!CollisionDetector.canMove(m.walls, r, c, m.cols, dir)) return;
  const tgt = CollisionDetector.target(r, c, dir);
  if (!CollisionDetector.inBounds(tgt.row, tgt.col, m.rows, m.cols)) return;
  const exitR = m.exit.row, exitC = m.exit.col; // 捕获，避免闭包内 m 可能为 null

  // 先写入目标格（snap 时用）
  playerRow.value = tgt.row;
  playerCol.value = tgt.col;

  const cs = getCellSize();
  const fromX = playerPx.value;
  const fromY = playerPy.value;
  const toX = tgt.col * cs + cs / 2;
  const toY = tgt.row * cs + cs / 2;
  const start = performance.now();
  const dur = animDuration.value;

  moveBusy.value = true;

  function anim(now: number) {
    const pct = Math.min(1, (now - start) / dur);
    const ease = 1 - (1 - pct) * (1 - pct); // ease-out quad
    playerPx.value = fromX + (toX - fromX) * ease;
    playerPy.value = fromY + (toY - fromY) * ease;
    if (pct < 1) {
      animFrameId = requestAnimationFrame(anim);
    } else {
      // 动画完成
      playerPx.value = toX;
      playerPy.value = toY;
      playerStore.move(dir, tgt.row, tgt.col);
      moveBusy.value = false;

      // 胜利检测
      if (tgt.row === exitR && tgt.col === exitC) {
        stats.stop(); showVictory.value = true;
        heldDir.value = null;
        draw(); return;
      }
      // 连走：如果仍然按住方向键，继续移动
      if (heldDir.value) movePlayer(heldDir.value);
    }
    draw();
  }
  animFrameId = requestAnimationFrame(anim);
}

// ---- 键盘 ----
const pressed = new Set<string>();

function onKD(e: KeyboardEvent) {
  // 全局快捷键（不受 victory 限制）
  if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); resetPos(); return; }
  if (e.code === 'KeyG' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); generate(); return; }
  if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); togglePath(); return; }

  if (showVictory.value) return; // 通关后禁止移动操作
  if (pressed.has(e.code)) return;
  pressed.add(e.code);
  let dir: Direction | null = null;
  switch (e.code) {
    case 'ArrowUp': case 'KeyW': dir = Direction.UP; break;
    case 'ArrowDown': case 'KeyS': dir = Direction.DOWN; break;
    case 'ArrowLeft': case 'KeyA': dir = Direction.LEFT; break;
    case 'ArrowRight': case 'KeyD': dir = Direction.RIGHT; break;
    default: return;
  }
  e.preventDefault();
  heldDir.value = dir;
  if (moveBusy.value) {
    // 正在移动中按了新方向 → snap 到目标格，立即尝试新方向
    snapToGrid();
  }
  movePlayer(dir);
}

function onKU(e: KeyboardEvent) {
  pressed.delete(e.code);
  let dir: Direction | null = null;
  switch (e.code) {
    case 'ArrowUp': case 'KeyW': dir = Direction.UP; break;
    case 'ArrowDown': case 'KeyS': dir = Direction.DOWN; break;
    case 'ArrowLeft': case 'KeyA': dir = Direction.LEFT; break;
    case 'ArrowRight': case 'KeyD': dir = Direction.RIGHT; break;
  }
  // 松开的键恰好是当前方向 → 清除 heldDir，然后从剩余按住的键中找下一个方向
  if (dir === heldDir.value) {
    heldDir.value = null;
    const next = [...pressed].map(c => {
      switch (c) {
        case 'ArrowUp': case 'KeyW': return Direction.UP;
        case 'ArrowDown': case 'KeyS': return Direction.DOWN;
        case 'ArrowLeft': case 'KeyA': return Direction.LEFT;
        case 'ArrowRight': case 'KeyD': return Direction.RIGHT;
      }
      return null;
    }).find(d => d !== null) ?? null;
    heldDir.value = next;
    // 如果不在动画中且还有按住的方向，立即移动
    if (next && !moveBusy.value) movePlayer(next);
  }
}

// ---- 生成 ----
async function generate() {
  if (loading.value) return;
  genToken.value.aborted = true;
  const token: GenToken = { aborted: false };
  genToken.value = token;
  loading.value = true;
  loadPct.value = 0;
  const rows = mazeStore.rows, cols = mazeStore.cols;

  try {
    let data: SimpleMaze | null;
    if (rows * cols <= 10000) data = generateSync(rows, cols, token);
    else data = await generateAsync(rows, cols, p => { loadPct.value = Math.min(p, 100); }, token);
    if (!data || token.aborted) { loading.value = false; return; }

    maze.value = data;
    solutionPath.value = solveMaze(data.walls, data.rows, data.cols, data.entry, data.exit);
    showPath.value = false;
    zoom.value = 1; panX.value = 0; panY.value = 0;
    heldDir.value = null; moveBusy.value = false; pressed.clear();
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = 0; }

    const cs = MazeRenderer.fitSize(data.rows, data.cols, canvas.value?.width || 800, canvas.value?.height || 600).cs;
    playerRow.value = data.entry.row; playerCol.value = data.entry.col;
    playerPx.value = data.entry.col * cs + cs / 2;
    playerPy.value = data.entry.row * cs + cs / 2;
    playerStore.reset(data.entry.row, data.entry.col);
    stats.reset(); stats.start();
    showVictory.value = false;
    loading.value = false; loadPct.value = 0;
    await new Promise(r => setTimeout(r, 16));
    fitCanvas();
  } catch (e) { console.error(e); loading.value = false; loadPct.value = 0; }
}

function cancelGen() { genToken.value.aborted = true; loading.value = false; loadPct.value = 0; }
function togglePath() { showPath.value = !showPath.value; draw(); }

function setRows(v: number) { mazeStore.setRows(v); }
function setCols(v: number) { mazeStore.setCols(v); }

function resetPos() {
  const m = maze.value; if (!m) return;
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = 0; }
  const cs = getCellSize();
  playerRow.value = m.entry.row; playerCol.value = m.entry.col;
  playerPx.value = m.entry.col * cs + cs / 2;
  playerPy.value = m.entry.row * cs + cs / 2;
  playerStore.reset(m.entry.row, m.entry.col);
  heldDir.value = null; moveBusy.value = false; pressed.clear();
  stats.reset(); stats.start(); draw();
}

onMounted(() => {
  playerStore.load();
  fitCanvas();
  generate();
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('keydown', onKD);
  window.addEventListener('keyup', onKU);
});
onUnmounted(() => {
  genToken.value.aborted = true;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', fitCanvas);
  window.removeEventListener('keydown', onKD);
  window.removeEventListener('keyup', onKU);
});
</script>

<template>
  <div class="gv">
    <WindowTitleBar />
    <div class="gv-body">

      <!-- === 迷宫画布 === -->
      <div class="gv-maze">
        <canvas ref="canvas" v-show="!loading"
          @wheel.prevent="onWheel" @mousedown="onMD"
          @mousemove="onMM" @mouseup="onMU" @mouseleave="onMU"
          :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
        ></canvas>

        <!-- 加载 -->
        <div v-if="loading" class="gv-load">
          <div class="gv-load-ring"></div>
          <div class="gv-load-track"><div class="gv-load-bar" :style="{ width: loadPct + '%' }"></div></div>
          <span class="gv-load-pct">{{ loadPct }}%</span>
          <button class="gv-load-cancel" @click="cancelGen"><Square :size="11" /> 取消</button>
        </div>

        <!-- 左上角帮助按钮 -->
        <div class="gv-help" @mouseenter="helpOpen = true" @mouseleave="helpOpen = false">
          <button class="gv-help-btn" title="快捷键">
            <HelpCircle :size="16" />
          </button>
          <Transition name="gv-help-fade">
            <div v-if="helpOpen" class="gv-help-menu">
              <div class="gv-help-item" v-for="s in shortcuts" :key="s.key">
                <kbd class="gv-help-key">{{ s.key }}</kbd>
                <span class="gv-help-desc">{{ s.desc }}</span>
              </div>
              <div class="gv-help-foot">
                <span class="gv-help-badge">{{ maze?.rows ?? '-' }} × {{ maze?.cols ?? '-' }}</span>
                <span class="gv-help-badge">{{ Math.round(zoom * 100) }}%</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- === 右侧悬浮面板 === -->
        <div class="gv-panel" :class="{ 'gv-panel--closed': !panelOpen }">
          <!-- 固定头部 -->
          <div class="gv-pn-head">
            <span class="gv-pn-title">统计</span>
            <button class="gv-toggle" @click="panelOpen = false" title="收起">
              <PanelRightClose :size="14" />
            </button>
          </div>

          <!-- 可滚动内容区 -->
          <div class="gv-pn-body">
            <!-- 状态卡片 -->
            <div class="gv-stats">
              <div class="gv-stat">
                <div class="gv-stat-icon"><Timer :size="13" /></div>
                <div class="gv-stat-body">
                  <span class="gv-stat-label">用时</span>
                  <span class="gv-stat-val">{{ stats.formatTime(stats.elapsed) }}</span>
                </div>
              </div>
              <div class="gv-stat">
                <div class="gv-stat-icon"><Footprints :size="13" /></div>
                <div class="gv-stat-body">
                  <span class="gv-stat-label">步数</span>
                  <span class="gv-stat-val">{{ playerStore.stepCount.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- 尺寸 -->
            <div class="gv-sec">
              <div class="gv-sec-hd"><Hash :size="12" /> 尺寸</div>
              <div class="gv-dims">
                <div class="gv-dim">
                  <span class="gv-dim-lbl">行</span>
                  <input type="range" min="1" max="200" step="1"
                    :value="mazeStore.rows" @input="setRows(parseInt(($event.target as HTMLInputElement).value))" />
                  <NumberInput :modelValue="mazeStore.rows" :min="1" :max="200" @update:modelValue="setRows" />
                </div>
                <div class="gv-dim">
                  <span class="gv-dim-lbl">列</span>
                  <input type="range" min="1" max="200" step="1"
                    :value="mazeStore.cols" @input="setCols(parseInt(($event.target as HTMLInputElement).value))" />
                  <NumberInput :modelValue="mazeStore.cols" :min="1" :max="200" @update:modelValue="setCols" />
                </div>
              </div>
            </div>

            <!-- 角色 -->
            <div class="gv-sec">
              <div class="gv-sec-hd"><User :size="12" /> 角色</div>
              <PlayerSelector />
            </div>

            <!-- 操作 -->
            <div class="gv-sec gv-acts">
              <button class="gv-btn gv-btn--pri" :disabled="loading" @click="generate">
                <RefreshCw :size="13" /> {{ loading ? '生成中…' : '重新生成' }}
              </button>
              <button class="gv-btn" :disabled="loading || !maze" @click="resetPos">
                <RotateCcw :size="13" /> 重置位置
              </button>
              <button v-if="maze" class="gv-btn" :class="{ 'gv-btn--on': showPath }" @click="togglePath">
                <Eye v-if="!showPath" :size="13" /><EyeOff v-else :size="13" />
                {{ showPath ? '隐藏路径' : '显示路径' }}
              </button>
            </div>

            <!-- 主题 -->
            <div class="gv-sec">
              <div class="gv-sec-hd"><Palette :size="12" /> 主题</div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>

      <!-- === 收起态：悬浮展开按钮 === -->
      <button class="gv-fab" :class="{ 'gv-fab--show': !panelOpen }" @click="panelOpen = true" title="展开面板">
        <PanelRightClose :size="16" class="gv-fab-icon" />
      </button>
    </div>

    <VictoryModal v-if="showVictory" :time="stats.elapsed" :steps="playerStore.stepCount"
      @restart="generate" @reset="resetPos(); showVictory = false" @close="showVictory = false" />
  </div>
</template>

<style scoped>
/* === 整体 === */
.gv { display:flex; flex-direction:column; height:100%; width:100%; }
.gv-body { flex:1; min-height:0; display:flex; flex-direction:row; overflow:hidden; position:relative; }

/* === 迷宫区 === */
.gv-maze {
  flex:1; min-width:0; position:relative;
  display:flex; align-items:center; justify-content:center;
  padding:12px;
  box-sizing:border-box;
}
.gv-maze canvas { width:100%; height:100%; border-radius:12px; user-select:none; }

/* === 左上角帮助按钮 === */
.gv-help {
  position:absolute; top:16px; left:16px; z-index:20;
}
.gv-help-btn {
  width:32px; height:32px;
  display:flex; align-items:center; justify-content:center;
  border-radius:10px;
  background:var(--panel-bg);
  backdrop-filter:blur(20px) saturate(1.3);
  -webkit-backdrop-filter:blur(20px) saturate(1.3);
  border:1px solid var(--panel-border);
  color:var(--text-sec); opacity:0.6;
  box-shadow:0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.03);
  cursor:pointer; transition:all 0.2s ease;
}
.gv-help-btn:hover { opacity:1; color:var(--accent); }

/* 快捷键菜单 */
.gv-help-menu {
  position:absolute; top:38px; left:0;
  min-width:190px;
  background:var(--panel-bg);
  backdrop-filter:blur(28px) saturate(1.4);
  -webkit-backdrop-filter:blur(28px) saturate(1.4);
  border:1px solid var(--panel-border);
  border-radius:12px;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.18),
    0 6px 20px rgba(0,0,0,0.08),
    0 0 0 1px rgba(255,255,255,0.04);
  padding:6px;
  display:flex; flex-direction:column; gap:2px;
}
.gv-help-item {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:6px 10px;
  border-radius:6px;
}
.gv-help-item:hover { background:rgba(128,128,128,0.06); }
.gv-help-key {
  font-size:10px; font-weight:600; color:var(--text-sec); opacity:0.7;
  font-family:'JetBrains Mono','SF Mono',monospace;
  background:rgba(128,128,128,0.08);
  border:1px solid rgba(128,128,128,0.10);
  padding:2px 6px; border-radius:4px;
  white-space:nowrap;
}
.gv-help-desc {
  font-size:10px; font-weight:500; color:var(--text-pri); opacity:0.8;
  text-align:right; white-space:nowrap;
}
.gv-help-foot {
  display:flex; align-items:center; justify-content:center; gap:8px;
  margin-top:4px; padding:6px 10px 4px 10px;
  border-top:1px solid rgba(128,128,128,0.06);
}
.gv-help-badge {
  font-size:9px; font-weight:600; color:var(--text-sec); opacity:0.55;
  font-family:'JetBrains Mono','SF Mono',monospace;
}

/* 菜单过渡动画 */
.gv-help-fade-enter-active { animation:gv-help-in 0.2s cubic-bezier(0.16,1,0.3,1); }
.gv-help-fade-leave-active { animation:gv-help-in 0.15s ease reverse; }
@keyframes gv-help-in {
  from { opacity:0; transform:translateY(-6px) scale(0.96); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}

/* === 加载 === */
.gv-load { display:flex; flex-direction:column; align-items:center; gap:12px; }
.gv-load-ring {
  width:28px; height:28px;
  border:2.5px solid rgba(128,128,128,0.15);
  border-top-color:var(--accent); border-radius:50%;
  animation:gv-spin .7s linear infinite;
}
@keyframes gv-spin { to { transform:rotate(360deg); } }
.gv-load-track { width:160px; height:3px; background:rgba(128,128,128,0.12); border-radius:4px; overflow:hidden; }
.gv-load-bar { height:100%; background:var(--accent); border-radius:4px; transition:width .15s ease; }
.gv-load-pct { font-size:12px; font-weight:600; color:var(--text-sec); font-family:'JetBrains Mono',monospace; }
.gv-load-cancel {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 14px; border-radius:7px; font-size:11px; font-weight:500;
  color:#fff; background:rgba(220,60,60,0.75); transition:all 0.15s;
}
.gv-load-cancel:hover { background:rgba(220,60,60,0.92); }

/* === 右侧悬浮面板 === */
.gv-panel {
  width:190px; min-width:190px; max-width:190px; flex-shrink:0;
  margin:12px 12px 12px 0;
  background:var(--panel-bg);
  backdrop-filter:blur(24px) saturate(1.3);
  -webkit-backdrop-filter:blur(24px) saturate(1.3);
  border:1px solid var(--panel-border);
  border-radius:14px;
  box-shadow:
    0 16px 48px rgba(0,0,0,0.12),
    0 4px 16px rgba(0,0,0,0.06),
    0 0 0 1px rgba(255,255,255,0.04);
  display:flex; flex-direction:column;
  overflow:hidden;
  opacity:1;
  transition:
    min-width 0.4s cubic-bezier(0.16,1,0.3,1),
    max-width 0.4s cubic-bezier(0.16,1,0.3,1),
    opacity 0.3s ease,
    margin 0.4s cubic-bezier(0.16,1,0.3,1),
    border-width 0.3s ease;
}
.gv-panel--closed {
  min-width:0; max-width:0; width:0;
  margin-right:0;
  opacity:0;
  border-width:0;
  pointer-events:none;
}

/* 固定头部 */
.gv-pn-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 10px 4px 10px;
  flex-shrink:0;
}
.gv-pn-title {
  font-size:10px; font-weight:700; color:var(--text-sec); opacity:0.65;
  text-transform:uppercase; letter-spacing:1.5px;
}

/* 折叠按钮 */
.gv-toggle {
  width:24px; height:24px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px; color:var(--text-sec); opacity:0.45;
  transition:all 0.15s ease; flex-shrink:0;
}
.gv-toggle:hover { opacity:1; background:rgba(128,128,128,0.10); }

/* 悬浮展开按钮 */
.gv-fab {
  position:absolute; top:12px; right:12px; z-index:10;
  width:38px; height:38px;
  display:flex; align-items:center; justify-content:center;
  border-radius:12px;
  background:var(--panel-bg);
  backdrop-filter:blur(24px) saturate(1.3);
  -webkit-backdrop-filter:blur(24px) saturate(1.3);
  border:1px solid var(--panel-border);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.10),
    0 2px 8px rgba(0,0,0,0.04);
  color:var(--text-sec);
  opacity:0; pointer-events:none; transform:scale(0.85);
  transition:
    opacity 0.3s cubic-bezier(0.16,1,0.3,1),
    transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
.gv-fab--show {
  opacity:1; pointer-events:auto; transform:scale(1);
}
.gv-fab:hover {
  background:rgba(128,128,128,0.10);
  color:var(--text-pri);
  box-shadow:0 12px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06);
}
.gv-fab-icon { transform:rotate(180deg); }

/* 可滚动内容区 */
.gv-pn-body {
  display:flex; flex-direction:column; gap:18px;
  padding:8px 10px 10px 10px;
  overflow-y:auto; overflow-x:hidden; flex:1; min-height:0;
}
.gv-pn-body::-webkit-scrollbar { width:3px; }
.gv-pn-body::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.15); border-radius:3px; }

/* === 区块 === */
.gv-sec { display:flex; flex-direction:column; gap:7px; }
.gv-sec-hd {
  font-size:10px; font-weight:700; color:var(--text-sec); opacity:0.7;
  text-transform:uppercase; letter-spacing:1.2px;
  display:flex; align-items:center; gap:5px;
}

/* === 状态卡片 === */
.gv-stats { display:flex; flex-direction:column; gap:6px; }
.gv-stat {
  display:flex; align-items:center; gap:8px;
  padding:8px 10px; background:rgba(128,128,128,0.05);
  border-radius:8px; border:1px solid rgba(128,128,128,0.05);
  transition:all 0.15s;
}
.gv-stat:hover { background:rgba(128,128,128,0.08); }
.gv-stat-icon {
  width:28px; height:28px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px; background:var(--accent-soft); color:var(--accent); flex-shrink:0;
}
.gv-stat-body { display:flex; flex-direction:column; gap:0; }
.gv-stat-label { font-size:9px; font-weight:600; color:var(--text-sec); opacity:0.7; }
.gv-stat-val {
  font-size:15px; font-weight:700; color:var(--text-pri);
  font-family:'JetBrains Mono','SF Mono',monospace;
  letter-spacing:-.4px; line-height:1.2;
}

/* === 尺寸 === */
.gv-dims { display:flex; flex-direction:column; gap:5px; }
.gv-dim { display:flex; align-items:center; gap:4px; }
.gv-dim-lbl {
  width:12px; font-size:10px; font-weight:600;
  color:var(--text-sec); opacity:0.75; flex-shrink:0; text-align:center;
}
.gv-dim input[type="range"] {
  flex:1; height:4px; min-width:0;
  -webkit-appearance:none; appearance:none;
  background:rgba(128,128,128,0.15); border-radius:4px; outline:none; margin:0;
}
.gv-dim input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none;
  width:12px; height:12px; border-radius:50%;
  background:var(--accent); cursor:pointer;
  box-shadow:0 1px 4px var(--accent-soft);
}
.gv-dim input[type="range"]:disabled { opacity:.3; }

/* === 按钮 === */
.gv-acts { gap:5px !important; }
.gv-btn {
  width:100%; padding:7px 0;
  border-radius:7px; font-size:11px; font-weight:500;
  display:inline-flex; align-items:center; justify-content:center; gap:5px;
  background:rgba(128,128,128,0.07); color:var(--text-pri);
  transition:all 0.15s ease; border:1px solid transparent;
}
.gv-btn:disabled { opacity:.3; cursor:default; }
.gv-btn:not(:disabled):hover { background:rgba(128,128,128,0.13); }
.gv-btn--pri {
  background:var(--accent) !important; color:#fff !important;
  box-shadow:0 2px 8px var(--accent-soft); border-color:transparent !important;
}
.gv-btn--pri:not(:disabled):hover { filter:brightness(1.08); box-shadow:0 4px 14px var(--accent-soft); }
.gv-btn--on { background:var(--accent); color:#fff; border-color:transparent; }
</style>
